import { GameState, PlayerState, CardInstance } from '../types';
import { GameStateManager } from '../GameState';

export interface BotDecision {
  action: 'DRAW' | 'PLAY_CARD' | 'INSERT_DEFUSE' | 'NOPE' | 'PASS_NOPE' | 'GIVE_FAVOR' | 'PICK_DISCARD';
  cardUids?: string[];
  targetPlayerId?: string;
  targetCardDefId?: string;
  insertIndex?: number;
  pickDiscardUid?: string;
}

export class ProbabilityBot {
  /**
   * Tính toán xác suất rút phải Mèo Nổ
   */
  static calculateExplosionProbability(state: GameState): number {
    if (state.drawPile.length === 0) return 0;
    
    // Đếm số Mèo Nổ còn lại trong xấp rút
    const kittensInDeck = state.drawPile.filter(c => c.defId === 'exploding_kitten').length;
    return kittensInDeck / state.drawPile.length;
  }

  /**
   * Đưa ra quyết định cho Bot trong lượt của mình hoặc khi có sự kiện cần phản ứng
   */
  static makeDecision(state: GameState, botId: string): BotDecision {
    const bot = state.players.find(p => p.id === botId);
    if (!bot || !bot.isAlive) {
      return { action: 'PASS_NOPE' };
    }

    // 1. Nếu đang cần đặt lại Mèo Nổ sau khi Defuse
    if (state.pendingAction && state.pendingAction.type === 'DEFUSE_INSERTION' && state.pendingAction.initiatorId === botId) {
      // Chiến thuật: 60% đặt ngay trên cùng để hại người kế tiếp, 40% đặt ngẫu nhiên hoặc vị trí 1
      const rand = Math.random();
      let insertIndex = 0;
      if (rand < 0.6) {
        insertIndex = 0; // Đỉnh xấp bài
      } else if (rand < 0.85 && state.drawPile.length > 1) {
        insertIndex = 1; // Vị trí thứ 2
      } else {
        insertIndex = Math.floor(Math.random() * (state.drawPile.length + 1));
      }
      return { action: 'INSERT_DEFUSE', insertIndex };
    }

    // 2. Nếu đang trong cửa sổ NOPE
    if (state.pendingAction && state.pendingAction.type === 'NOPE_WINDOW') {
      const isVictim = state.pendingAction.targetPlayerId === botId;
      const nopeCard = bot.hand.find(c => c.defId === 'nope');

      // Nếu Bot là nạn nhân của Tấn công / Xin xỏ / Cướp bài và có lá Nope, đánh Nope ngay!
      if (isVictim && nopeCard && state.pendingAction.nopeCount % 2 === 0) {
        return { action: 'NOPE', cardUids: [nopeCard.uid] };
      }

      // Nếu hành động đe dọa lớn (người khác đánh Attack đơn lẻ) và xác suất nổ cao, bot cũng có thể Nope
      if (state.pendingAction.cardsPlayed.length === 1 && state.pendingAction.cardsPlayed[0]?.defId === 'attack' && nopeCard && Math.random() < 0.5) {
        return { action: 'NOPE', cardUids: [nopeCard.uid] };
      }

      return { action: 'PASS_NOPE' };
    }

    // 3. Nếu Bot bị ép đưa bài cho Favor
    if (state.pendingAction && state.pendingAction.type === 'FAVOR_GIVE_CARD' && state.pendingAction.targetPlayerId === botId) {
      // Đưa lá bài ít giá trị nhất (ưu tiên lá mèo lẻ, hoặc bài thường, KHÔNG đưa Defuse nếu có lá khác)
      const nonDefuseCards = bot.hand.filter(c => c.defId !== 'defuse');
      const cardToGive = nonDefuseCards.length > 0 ? nonDefuseCards[0] : bot.hand[0];
      return { action: 'GIVE_FAVOR', cardUids: [cardToGive.uid] };
    }

    // 4. Nếu Bot được chọn bài từ Discard Pile (Combo 5 lá)
    if (state.pendingAction && state.pendingAction.type === 'COMBO_FIVE_CHOOSE_DISCARD' && state.pendingAction.initiatorId === botId) {
      // Ưu tiên chọn Defuse hoặc Attack/Skip
      const defuseInDiscard = state.discardPile.find(c => c.defId === 'defuse');
      if (defuseInDiscard) {
        return { action: 'PICK_DISCARD', pickDiscardUid: defuseInDiscard.uid };
      }
      const attackInDiscard = state.discardPile.find(c => c.defId === 'attack' || c.defId === 'skip');
      if (attackInDiscard) {
        return { action: 'PICK_DISCARD', pickDiscardUid: attackInDiscard.uid };
      }
      return { action: 'PICK_DISCARD', pickDiscardUid: state.discardPile[0]?.uid };
    }

    // Nếu không phải lượt của Bot, không làm gì cả
    if (state.players[state.currentPlayerIndex]?.id !== botId) {
      return { action: 'PASS_NOPE' };
    }

    // 5. Trong lượt chính của Bot:
    const prob = this.calculateExplosionProbability(state);
    const hasDefuse = bot.hand.some(c => c.defId === 'defuse');
    const opponents = state.players.filter(p => p.isAlive && p.id !== botId);
    // Chọn đối thủ có nhiều bài nhất làm mục tiêu
    const primeTarget = opponents.sort((a, b) => b.hand.length - a.hand.length)[0];

    // Nhóm các lá bài trên tay theo defId để tìm combo
    const cardsByDef: Record<string, CardInstance[]> = {};
    for (const card of bot.hand) {
      cardsByDef[card.defId] = cardsByDef[card.defId] || [];
      cardsByDef[card.defId].push(card);
    }

    // a. Nếu có Combo 3 lá -> Đòi Defuse từ đối thủ mạnh nhất
    for (const [defId, cards] of Object.entries(cardsByDef)) {
      if (cards.length >= 3 && defId !== 'defuse' && primeTarget) {
        return {
          action: 'PLAY_CARD',
          cardUids: cards.slice(0, 3).map(c => c.uid),
          targetPlayerId: primeTarget.id,
          targetCardDefId: 'defuse'
        };
      }
    }

    // b. Nếu có Combo 2 lá và xác suất nổ cao hoặc bot chưa có defuse -> Cướp bài
    if ((prob > 0.2 || !hasDefuse) && primeTarget) {
      for (const [defId, cards] of Object.entries(cardsByDef)) {
        if (cards.length >= 2 && defId !== 'defuse') {
          return {
            action: 'PLAY_CARD',
            cardUids: cards.slice(0, 2).map(c => c.uid),
            targetPlayerId: primeTarget.id
          };
        }
      }
    }

    // c. Nếu có lá See the Future và chưa xem
    const seeFutureCard = bot.hand.find(c => c.defId === 'see_the_future');
    if (seeFutureCard && prob > 0.15) {
      return { action: 'PLAY_CARD', cardUids: [seeFutureCard.uid] };
    }

    // d. Nếu xác suất nguy hiểm cao (prob > 0.2) hoặc lượt dồn:
    if (prob > 0.2 || bot.turnsToTake > 1) {
      // Ưu tiên Skip
      const skipCard = bot.hand.find(c => c.defId === 'skip');
      if (skipCard) {
        return { action: 'PLAY_CARD', cardUids: [skipCard.uid] };
      }

      // Ưu tiên Attack
      const attackCard = bot.hand.find(c => c.defId === 'attack');
      if (attackCard) {
        return { action: 'PLAY_CARD', cardUids: [attackCard.uid] };
      }

      // Ưu tiên Shuffle
      const shuffleCard = bot.hand.find(c => c.defId === 'shuffle');
      if (shuffleCard && prob > 0.3) {
        return { action: 'PLAY_CARD', cardUids: [shuffleCard.uid] };
      }
    }

    // e. Nếu có Favor và đối thủ có bài
    const favorCard = bot.hand.find(c => c.defId === 'favor');
    if (favorCard && primeTarget && primeTarget.hand.length > 0 && Math.random() < 0.7) {
      return {
        action: 'PLAY_CARD',
        cardUids: [favorCard.uid],
        targetPlayerId: primeTarget.id
      };
    }

    // f. Quyết định rút bài để kết thúc lượt
    return { action: 'DRAW' };
  }
}


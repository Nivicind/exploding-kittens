import { GameState, PlayerState, CardInstance } from '../types';
import { GameStateManager } from '../GameState';

export interface BotDecision {
  action: 
    | 'DRAW' 
    | 'PLAY_CARD' 
    | 'INSERT_DEFUSE' 
    | 'INSERT_IMPLODING'
    | 'NOPE' 
    | 'PASS_NOPE' 
    | 'GIVE_FAVOR' 
    | 'PICK_DISCARD'
    | 'REORDER_ALTER_FUTURE'
    | 'SELECT_TARGETED_ATTACK';
  cardUids?: string[];
  targetPlayerId?: string;
  targetCardDefId?: string;
  insertIndex?: number;
  pickDiscardUid?: string;
  alterCardUids?: string[];
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

    // 1.1 Nếu đang cần đặt lại Mèo Tự Nổ (Imploding Kitten)
    if (state.pendingAction && state.pendingAction.type === 'IMPLODING_INSERTION' && state.pendingAction.initiatorId === botId) {
      // Đặt lên đỉnh 60% để bẫy người kế tiếp, 40% đặt vị trí thứ 2
      const insertIndex = Math.random() < 0.6 ? 0 : 1;
      return { action: 'INSERT_IMPLODING', insertIndex };
    }

    // 1.2 Nếu đang cần sắp xếp lại bài trong Alter the Future
    if (state.pendingAction && state.pendingAction.type === 'ALTER_THE_FUTURE' && state.pendingAction.initiatorId === botId) {
      const cards = [...(state.alterCards?.cards || state.drawPile.slice(0, 3))];
      // Đẩy bom (Mèo Nổ hoặc Mèo Tự Nổ ngửa mặt) ra xa vị trí 0
      cards.sort((a, b) => {
        const isDangerA = a.defId === 'exploding_kitten' || (a.defId === 'imploding_kitten' && a.isFaceUp);
        const isDangerB = b.defId === 'exploding_kitten' || (b.defId === 'imploding_kitten' && b.isFaceUp);
        if (isDangerA && !isDangerB) return 1;
        if (!isDangerA && isDangerB) return -1;
        return 0;
      });
      return { action: 'REORDER_ALTER_FUTURE', alterCardUids: cards.map(c => c.uid) };
    }

    // 1.3 Nếu đang cần chọn mục tiêu cho Targeted Attack
    if (state.pendingAction && state.pendingAction.type === 'TARGETED_ATTACK_CHOOSE_PLAYER' && state.pendingAction.initiatorId === botId) {
      const opponents = state.players.filter(p => p.isAlive && p.id !== botId);
      const primeTarget = opponents.sort((a, b) => b.hand.length - a.hand.length)[0];
      return { action: 'SELECT_TARGETED_ATTACK', targetPlayerId: primeTarget?.id || opponents[0]?.id };
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
      // Đưa lá bài ít giá trị nhất (tránh đưa Defuse, và TRÁNH đưa Streaking Kitten nếu đang ôm bom)
      const hasBombInHand = bot.hand.some(c => c.defId === 'exploding_kitten');
      const safeCards = bot.hand.filter(c => c.defId !== 'defuse' && (!hasBombInHand || c.defId !== 'streaking_kitten'));
      const cardToGive = safeCards.length > 0 ? safeCards[0] : bot.hand[0];
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
    if (bot.isBlind) {
      // Khi bị mù bài, Bot có 40% cơ hội đánh mò 1 lá bài, hoặc chọn bốc bài an toàn để giải nguyền
      if (Math.random() < 0.4 && bot.hand.length > 0) {
        const randCard = bot.hand[Math.floor(Math.random() * bot.hand.length)];
        return { action: 'PLAY_CARD', cardUids: [randCard.uid] };
      }
      return { action: 'DRAW' };
    }

    const isTopMortalDanger = state.drawPile.length > 0 && 
      state.drawPile[0]?.defId === 'imploding_kitten' && 
      state.drawPile[0]?.isFaceUp === true;

    const prob = isTopMortalDanger ? 1.0 : this.calculateExplosionProbability(state);
    const hasDefuse = bot.hand.some(c => c.defId === 'defuse');
    const opponents = state.players.filter(p => p.isAlive && p.id !== botId);
    // Chọn đối thủ có nhiều bài nhất làm mục tiêu
    const primeTarget = opponents.sort((a, b) => b.hand.length - a.hand.length)[0];

    // NẾU TRÊN ĐỈNH LÀ MÈO TỰ NỔ NGỬA MẶT: BẰNG MỌI GIÁ PHẢI NÉ!
    if (isTopMortalDanger) {
      const superSkip = bot.hand.find(c => c.defId === 'super_skip');
      if (superSkip) return { action: 'PLAY_CARD', cardUids: [superSkip.uid] };

      const swapTopBottom = bot.hand.find(c => c.defId === 'swap_top_bottom');
      if (swapTopBottom) return { action: 'PLAY_CARD', cardUids: [swapTopBottom.uid] };

      const bottomDrawCard = bot.hand.find(c => c.defId === 'draw_from_bottom');
      if (bottomDrawCard) return { action: 'PLAY_CARD', cardUids: [bottomDrawCard.uid] };

      const skipCard = bot.hand.find(c => c.defId === 'skip');
      if (skipCard) return { action: 'PLAY_CARD', cardUids: [skipCard.uid] };

      const reverseCard = bot.hand.find(c => c.defId === 'reverse');
      if (reverseCard) return { action: 'PLAY_CARD', cardUids: [reverseCard.uid] };

      const targetedAttackCard = bot.hand.find(c => c.defId === 'targeted_attack');
      if (targetedAttackCard && primeTarget) {
        return { action: 'PLAY_CARD', cardUids: [targetedAttackCard.uid], targetPlayerId: primeTarget.id };
      }

      const attackCard = bot.hand.find(c => c.defId === 'attack');
      if (attackCard) return { action: 'PLAY_CARD', cardUids: [attackCard.uid] };

      const alterCard = bot.hand.find(c => c.defId === 'alter_the_future' || c.defId === 'alter_the_future_5x');
      if (alterCard) return { action: 'PLAY_CARD', cardUids: [alterCard.uid] };

      const shuffleCard = bot.hand.find(c => c.defId === 'shuffle');
      if (shuffleCard) return { action: 'PLAY_CARD', cardUids: [shuffleCard.uid] };
    }

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

      // Kiểm tra combo 2 lá với Feral Cat
      const feralCard = bot.hand.find(c => c.defId === 'feral_cat');
      if (feralCard) {
        const catCard = bot.hand.find(c => c.uid !== feralCard.uid && c.defId.startsWith('cat_'));
        if (catCard) {
          return {
            action: 'PLAY_CARD',
            cardUids: [feralCard.uid, catCard.uid],
            targetPlayerId: primeTarget.id
          };
        }
      }
    }

    // c. Nếu có lá Alter the Future hoặc See the Future (3X hoặc 5X)
    const alter5x = bot.hand.find(c => c.defId === 'alter_the_future_5x');
    if (alter5x && prob > 0.1) {
      return { action: 'PLAY_CARD', cardUids: [alter5x.uid] };
    }
    const alterCard = bot.hand.find(c => c.defId === 'alter_the_future');
    if (alterCard && prob > 0.1) {
      return { action: 'PLAY_CARD', cardUids: [alterCard.uid] };
    }

    const seeFuture5x = bot.hand.find(c => c.defId === 'see_the_future_5x');
    if (seeFuture5x && prob > 0.15) {
      return { action: 'PLAY_CARD', cardUids: [seeFuture5x.uid] };
    }
    const seeFutureCard = bot.hand.find(c => c.defId === 'see_the_future');
    if (seeFutureCard && prob > 0.15) {
      return { action: 'PLAY_CARD', cardUids: [seeFutureCard.uid] };
    }

    // d. Nếu xác suất nguy hiểm cao (prob > 0.2) hoặc lượt dồn:
    if (prob > 0.2 || bot.turnsToTake > 1) {
      // Ưu tiên Super Skip nếu bị dồn nhiều lượt
      if (bot.turnsToTake > 1) {
        const superSkip = bot.hand.find(c => c.defId === 'super_skip');
        if (superSkip) return { action: 'PLAY_CARD', cardUids: [superSkip.uid] };
      }

      // Ưu tiên Targeted Attack
      const targetedAttack = bot.hand.find(c => c.defId === 'targeted_attack');
      if (targetedAttack && primeTarget) {
        return { action: 'PLAY_CARD', cardUids: [targetedAttack.uid], targetPlayerId: primeTarget.id };
      }

      // Ưu tiên Skip / Super Skip
      const superSkip = bot.hand.find(c => c.defId === 'super_skip');
      if (superSkip) return { action: 'PLAY_CARD', cardUids: [superSkip.uid] };

      const skipCard = bot.hand.find(c => c.defId === 'skip');
      if (skipCard) {
        return { action: 'PLAY_CARD', cardUids: [skipCard.uid] };
      }

      // Ưu tiên Reverse
      const reverseCard = bot.hand.find(c => c.defId === 'reverse');
      if (reverseCard) {
        return { action: 'PLAY_CARD', cardUids: [reverseCard.uid] };
      }

      // Ưu tiên Swap Top & Bottom nếu nguy hiểm
      const swapCard = bot.hand.find(c => c.defId === 'swap_top_bottom');
      if (swapCard && prob > 0.3) {
        return { action: 'PLAY_CARD', cardUids: [swapCard.uid] };
      }

      // Ưu tiên Draw from Bottom
      const bottomDrawCard = bot.hand.find(c => c.defId === 'draw_from_bottom');
      if (bottomDrawCard) {
        return { action: 'PLAY_CARD', cardUids: [bottomDrawCard.uid] };
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

    // e. Nếu có Curse of Cat Butt -> nguyền đối thủ mạnh nhất
    const curseCard = bot.hand.find(c => c.defId === 'curse_of_cat_butt');
    if (curseCard && primeTarget && !primeTarget.isBlind && Math.random() < 0.6) {
      return {
        action: 'PLAY_CARD',
        cardUids: [curseCard.uid],
        targetPlayerId: primeTarget.id
      };
    }

    // f. Nếu có Mark -> đánh dấu đối thủ có nhiều bài
    const markCard = bot.hand.find(c => c.defId === 'mark');
    if (markCard && primeTarget && primeTarget.hand.length > 0 && Math.random() < 0.6) {
      return {
        action: 'PLAY_CARD',
        cardUids: [markCard.uid],
        targetPlayerId: primeTarget.id
      };
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


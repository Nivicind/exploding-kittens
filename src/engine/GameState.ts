import { 
  GameState, 
  PlayerState, 
  CardInstance, 
  CustomDeckConfig, 
  GameLogEntry, 
  PendingAction,
  GameSettings
} from './types';
import { CardRegistry } from './CardRegistry';
import { TurnManager } from './TurnManager';

export class GameStateManager {
  /**
   * Tạo một ID ngẫu nhiên cho log hoặc instance
   */
  static generateId(prefix: string = 'id'): string {
    return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
  }

  /**
   * Thêm log vào trận đấu
   */
  static addLog(
    state: GameState, 
    message: string, 
    type: GameLogEntry['type'] = 'info', 
    playerId?: string
  ): void {
    const entry: GameLogEntry = {
      id: this.generateId('log'),
      timestamp: Date.now(),
      message,
      type,
      playerId
    };
    state.logs.push(entry);
    // Giữ tối đa 100 logs gần nhất
    if (state.logs.length > 100) {
      state.logs.shift();
    }
  }

  /**
   * Khởi tạo trận đấu mới
   */
  static createGame(
    playerInfos: { id: string; name: string; isBot: boolean }[],
    config?: CustomDeckConfig,
    activeExpansions: string[] = ['base'],
    settings?: GameSettings
  ): GameState {
    const numPlayers = playerInfos.length;
    if (numPlayers < 2 || numPlayers > 10) {
      throw new Error('Số người chơi phải từ 2 đến 10 người.');
    }

    // 1. Tạo danh sách người chơi
    const players: PlayerState[] = playerInfos.map(info => ({
      id: info.id,
      name: info.name,
      isBot: info.isBot,
      isAlive: true,
      hand: [],
      turnsToTake: 1
    }));

    // 2. Xác định cấu hình bài
    const finalExpansions = config?.activeExpansions ?? activeExpansions;
    const hasImploding = finalExpansions.includes('imploding');

    // Quy tắc: 2-5 người: 7 lá thường/người; 6-10 người: 4 lá thường/người
    const handSize = config?.handSize ?? (numPlayers <= 5 ? 7 : 4);
    const defuseInDeck = config?.defuseInDeck ?? 2;

    // Tổng số bom gây chết BẮT BUỘC phải cố định = numPlayers - 1 để ván đấu luôn còn đúng 1 người chiến thắng
    const totalBombs = Math.max(1, numPlayers - 1);
    let implodingKittensCount = 0;
    if (hasImploding) {
      if (config?.implodingKittensCount !== undefined) {
        implodingKittensCount = Math.max(0, Math.min(totalBombs, config.implodingKittensCount));
      } else {
        implodingKittensCount = Math.min(1, totalBombs);
      }
    }
    const explodingKittensCount = totalBombs - implodingKittensCount;

    // 3. Chuẩn bị bài thường và Defuse
    const allDefs = CardRegistry.getAllCards(finalExpansions);
    
    // Đưa 1 lá Defuse cho mỗi người chơi
    for (const player of players) {
      player.hand.push({
        uid: this.generateId('card_defuse'),
        defId: 'defuse'
      });
    }

    // Chuẩn bị kho bài thường (không bao gồm Mèo nổ và Defuse)
    let regularCards: CardInstance[] = [];
    for (const def of allDefs) {
      if (def.type === 'KITTEN' || def.type === 'DEFUSE') continue;

      let count = def.defaultCount;
      if (config?.cardCounts && config.cardCounts[def.id] !== undefined) {
        count = config.cardCounts[def.id];
      }

      for (let i = 0; i < count; i++) {
        regularCards.push({
          uid: this.generateId(`card_${def.id}`),
          defId: def.id
        });
      }
    }

    // Xáo bài thường để chia
    this.shuffleArray(regularCards);

    // Chia bài thường cho từng người chơi
    for (let c = 0; c < handSize; c++) {
      for (const player of players) {
        if (regularCards.length > 0) {
          player.hand.push(regularCards.pop()!);
        }
      }
    }

    // 4. Tạo xấp bài rút (Draw Pile):
    // Gồm bài thường còn lại + Mèo Nổ + Mèo Tự Nổ + Defuse dư
    const drawPile: CardInstance[] = [...regularCards];

    // Thêm Mèo Nổ (Exploding Kittens)
    for (let i = 0; i < explodingKittensCount; i++) {
      drawPile.push({
        uid: this.generateId('card_exploding_kitten'),
        defId: 'exploding_kitten'
      });
    }

    // Thêm Mèo Tự Nổ (Imploding Kittens, ban đầu úp mặt isFaceUp: false)
    for (let i = 0; i < implodingKittensCount; i++) {
      drawPile.push({
        uid: this.generateId('card_imploding_kitten'),
        defId: 'imploding_kitten',
        isFaceUp: false
      });
    }

    // Thêm Defuse dư vào xấp rút
    for (let i = 0; i < defuseInDeck; i++) {
      drawPile.push({
        uid: this.generateId('card_extra_defuse'),
        defId: 'defuse'
      });
    }

    // Xáo trộn toàn bộ xấp bài rút
    this.shuffleArray(drawPile);

    // 5. Chọn ngẫu nhiên người đi đầu tiên
    const firstPlayerIndex = Math.floor(Math.random() * numPlayers);

    const state: GameState = {
      id: this.generateId('game'),
      status: 'playing',
      players,
      drawPile,
      discardPile: [],
      currentPlayerIndex: firstPlayerIndex,
      turnDirection: 1,
      pendingAction: null,
      winnerId: null,
      logs: [],
      activeExpansions: finalExpansions,
      deckConfig: config,
      settings: settings || { nopeTimeoutSec: 5, botDelaySec: 2 },
      peekCards: null,
      alterCards: null
    };

    this.addLog(state, `Trận đấu bắt đầu với ${numPlayers} người chơi! ${players[firstPlayerIndex].name} được chọn đi đầu tiên.`, 'info');
    return state;
  }

  /**
   * Hàm tiện ích xáo trộn mảng (Fisher-Yates)
   */
  static shuffleArray<T>(array: T[]): void {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /**
   * Kiểm tra xem trên toàn bộ bàn chơi có ai đang cầm lá NOPE hay không
   */
  static hasAnyNopeInHand(state: GameState, excludePlayerId?: string): boolean {
    return state.players.some(p => 
      p.isAlive && 
      p.id !== excludePlayerId && 
      p.hand.some(c => c.defId === 'nope')
    );
  }

  /**
   * Xử lý kết quả của lá bài vừa rút (dùng chung cho rút từ đỉnh hoặc rút từ đáy)
   */
  private static processDrawnCard(
    state: GameState, 
    player: PlayerState, 
    card: CardInstance
  ): { cardDrawn: CardInstance; exploded: boolean } {
    // 1. Kiểm tra Mèo Tự Nổ (Imploding Kitten)
    if (card.defId === 'imploding_kitten') {
      if (!card.isFaceUp) {
        // LẦN RÚT 1 (Úp mặt): Không nổ, không cần Defuse! Lật ngửa và đặt lại
        card.isFaceUp = true;
        state.pendingAction = {
          type: 'IMPLODING_INSERTION',
          initiatorId: player.id,
          cardsPlayed: [card],
          timeoutMs: 30000,
          expiresAt: Date.now() + 30000,
          nopeCount: 0,
          passedPlayerIds: []
        };
        this.addLog(
          state, 
          `🌀 ${player.name} vừa rút phải MÈO TỰ NỔ! Lá bài sẽ được lật NGỬA MẶT và nhét lại vào xấp bài rút. Hãy chọn vị trí!`, 
          'info', 
          player.id
        );
        return { cardDrawn: card, exploded: false };
      } else {
        // LẦN RÚT 2 (Ngửa mặt): NỔ TUNG NGAY LẬP TỨC! Defuse hoàn toàn vô tác dụng!
        player.isAlive = false;
        state.discardPile.push(...player.hand, card);
        player.hand = [];

        this.addLog(
          state, 
          `💥 BÙM! ${player.name} vừa rút phải MÈO TỰ NỔ NGỬA MẶT! Defuse hoàn toàn vô tác dụng! ${player.name} ĐÃ BỊ LOẠI KHỎI TRẬN!`, 
          'explode', 
          player.id
        );

        const winner = TurnManager.checkWinner(state);
        if (winner) {
          const winnerPlayer = state.players.find(p => p.id === winner);
          this.addLog(state, `🎉 CHÚC MỪNG ${winnerPlayer?.name} LÀ NGƯỜI DUY NHẤT SỐNG SÓT VÀ CHIẾN THẮNG!`, 'win', winner);
        } else {
          TurnManager.advanceTurn(state);
        }
        return { cardDrawn: card, exploded: true };
      }
    }

    // 2. Kiểm tra Mèo Nổ (Exploding Kitten)
    if (card.defId === 'exploding_kitten') {
      const defuseIndex = player.hand.findIndex(c => c.defId === 'defuse');

      if (defuseIndex !== -1) {
        // Có Defuse để gỡ bom!
        state.pendingAction = {
          type: 'DEFUSE_INSERTION',
          initiatorId: player.id,
          cardsPlayed: [card],
          timeoutMs: 30000,
          expiresAt: Date.now() + 30000,
          nopeCount: 0,
          passedPlayerIds: []
        };
        this.addLog(
          state, 
          `⚠️ ${player.name} vừa rút phải MÈO NỔ nhưng có lá GỠ BOM (Defuse)! Hãy chọn vị trí để giấu lại bom.`, 
          'defuse', 
          player.id
        );
        return { cardDrawn: card, exploded: false };
      } else {
        // KHÔNG CÓ DEFUSE -> BÙM! Bị loại!
        player.isAlive = false;
        state.discardPile.push(...player.hand, card);
        player.hand = [];

        this.addLog(
          state, 
          `💥 BÙM! ${player.name} rút phải Mèo Nổ mà không có Defuse! ${player.name} ĐÃ BỊ LOẠI KHỎI TRẬN!`, 
          'explode', 
          player.id
        );

        const winner = TurnManager.checkWinner(state);
        if (winner) {
          const winnerPlayer = state.players.find(p => p.id === winner);
          this.addLog(state, `🎉 CHÚC MỪNG ${winnerPlayer?.name} LÀ NGƯỜI DUY NHẤT SỐNG SÓT VÀ CHIẾN THẮNG!`, 'win', winner);
        } else {
          TurnManager.advanceTurn(state);
        }
        return { cardDrawn: card, exploded: true };
      }
    }

    // 3. Rút bài an toàn
    player.hand.push(card);
    this.addLog(state, `${player.name} rút 1 lá bài an toàn.`, 'info', player.id);

    // Kết thúc 1 lượt
    TurnManager.advanceTurn(state);
    return { cardDrawn: card, exploded: false };
  }

  /**
   * Người chơi rút bài để kết thúc lượt (rút từ đỉnh xấp bài)
   */
  static drawCard(state: GameState, playerId: string): { cardDrawn: CardInstance; exploded: boolean } {
    if (state.status !== 'playing') {
      throw new Error('Trận đấu chưa bắt đầu hoặc đã kết thúc.');
    }
    const player = state.players[state.currentPlayerIndex];
    if (player.id !== playerId) {
      throw new Error('Chưa đến lượt của bạn.');
    }
    if (state.pendingAction) {
      throw new Error('Có hành động đang chờ xử lý.');
    }

    if (state.drawPile.length === 0) {
      throw new Error('Xấp bài rút đã cạn.');
    }

    const card = state.drawPile.shift()!;
    return this.processDrawnCard(state, player, card);
  }

  /**
   * Người chơi rút bài từ ĐÁY xấp bài (dùng cho lá Draw from the Bottom)
   */
  static drawFromBottom(state: GameState, playerId: string): { cardDrawn: CardInstance; exploded: boolean } {
    if (state.status !== 'playing') {
      throw new Error('Trận đấu chưa bắt đầu hoặc đã kết thúc.');
    }
    const player = state.players[state.currentPlayerIndex];
    if (player.id !== playerId) {
      throw new Error('Chưa đến lượt của bạn.');
    }
    if (state.pendingAction) {
      throw new Error('Có hành động đang chờ xử lý.');
    }

    if (state.drawPile.length === 0) {
      throw new Error('Xấp bài rút đã cạn.');
    }

    const card = state.drawPile.pop()!;
    this.addLog(state, `📥 ${player.name} rút 1 lá bài từ ĐÁY xấp bài!`, 'info', player.id);
    return this.processDrawnCard(state, player, card);
  }

  /**
   * Đặt lại Mèo Nổ vào xấp bài sau khi dùng Defuse
   */
  static insertExplodingKitten(state: GameState, playerId: string, insertIndex: number): void {
    if (!state.pendingAction || state.pendingAction.type !== 'DEFUSE_INSERTION' || state.pendingAction.initiatorId !== playerId) {
      throw new Error('Không có yêu cầu gỡ bom hợp lệ.');
    }

    const player = state.players.find(p => p.id === playerId);
    if (!player) throw new Error('Người chơi không tồn tại.');

    const defuseIdx = player.hand.findIndex(c => c.defId === 'defuse');
    if (defuseIdx === -1) throw new Error('Bạn không có lá Defuse.');

    // Bỏ lá Defuse vào xấp bài bỏ
    const [defuseCard] = player.hand.splice(defuseIdx, 1);
    state.discardPile.push(defuseCard);

    // Lấy lá Mèo Nổ từ pendingAction
    const kittenCard = state.pendingAction.cardsPlayed[0];

    // Chèn Mèo Nổ vào vị trí được chỉ định trong drawPile
    const safeIndex = Math.max(0, Math.min(insertIndex, state.drawPile.length));
    state.drawPile.splice(safeIndex, 0, kittenCard);

    state.pendingAction = null;
    this.addLog(state, `${player.name} đã dùng Defuse thành công và bí mật giấu Mèo Nổ trở lại xấp bài!`, 'defuse', player.id);

    // Hoàn tất lượt rút bài an toàn
    TurnManager.advanceTurn(state);
  }

  /**
   * Đặt lại Mèo Tự Nổ (Imploding Kitten) ngửa mặt vào xấp bài
   */
  static insertImplodingKitten(state: GameState, playerId: string, insertIndex: number): void {
    if (!state.pendingAction || state.pendingAction.type !== 'IMPLODING_INSERTION' || state.pendingAction.initiatorId !== playerId) {
      throw new Error('Không có yêu cầu nhét lại Mèo Tự Nổ hợp lệ.');
    }

    const player = state.players.find(p => p.id === playerId);
    if (!player) throw new Error('Người chơi không tồn tại.');

    const card = state.pendingAction.cardsPlayed[0];
    card.isFaceUp = true;

    const safeIndex = Math.max(0, Math.min(insertIndex, state.drawPile.length));
    state.drawPile.splice(safeIndex, 0, card);

    state.pendingAction = null;
    this.addLog(state, `🌀 ${player.name} đã nhét lại MÈO TỰ NỔ (Ngửa mặt) vào vị trí đã chọn trong xấp bài!`, 'info', player.id);

    // Hoàn tất lượt (không rút thêm bài)
    TurnManager.advanceTurn(state);
  }

  /**
   * Đánh một hoặc nhiều lá bài (Đơn lẻ hoặc Combo)
   */
  static playCards(
    state: GameState, 
    playerId: string, 
    cardUids: string[], 
    options?: { targetPlayerId?: string; targetCardDefId?: string }
  ): void {
    if (state.status !== 'playing') {
      throw new Error('Trận đấu chưa sẵn sàng.');
    }

    const player = state.players.find(p => p.id === playerId);
    if (!player || !player.isAlive) {
      throw new Error('Người chơi không hợp lệ.');
    }

    // Nếu đang trong cửa sổ NOPE, chỉ cho phép đánh NOPE
    if (state.pendingAction && state.pendingAction.type === 'NOPE_WINDOW') {
      if (cardUids.length !== 1) {
        throw new Error('Chỉ có thể đánh 1 lá NOPE.');
      }
      const card = player.hand.find(c => c.uid === cardUids[0]);
      if (!card || card.defId !== 'nope') {
        throw new Error('Bạn chỉ có thể đánh lá NOPE vào lúc này!');
      }

      // Đánh lá NOPE
      const cardIdx = player.hand.findIndex(c => c.uid === card.uid);
      player.hand.splice(cardIdx, 1);
      state.discardPile.push(card);

      state.pendingAction.nopeCount += 1;
      const isNegated = state.pendingAction.nopeCount % 2 === 1;

      // Gia hạn thêm thời gian cho lượt Nope tiếp theo (theo cài đặt hoặc mặc định 3.5s)
      const nopeExtMs = (state.settings?.nopeTimeoutSec ? Math.min(state.settings.nopeTimeoutSec, 5) : 3.5) * 1000;
      state.pendingAction.timeoutMs = nopeExtMs;
      state.pendingAction.expiresAt = Date.now() + nopeExtMs;
      // Người vừa đánh Nope thì tự động pass lượt Nope của chính mình
      state.pendingAction.passedPlayerIds = [player.id];

      this.addLog(
        state, 
        `🚫 ${player.name} ĐÁNH NOPE! (Trạng thái: ${isNegated ? 'HÀNH ĐỘNG BỊ CHẶN' : 'YUP! TIẾP TỤC HÀNH ĐỘNG'})`, 
        'nope', 
        player.id
      );
      return;
    }

    // Nếu không trong Nope window thì người đánh phải là người chơi hiện tại
    if (state.players[state.currentPlayerIndex].id !== playerId) {
      throw new Error('Chưa đến lượt của bạn.');
    }

    if (state.pendingAction) {
      throw new Error('Đang có hành động khác chờ hoàn tất.');
    }

    // Lấy danh sách thẻ bài cần đánh từ tay
    const cardsToPlay: CardInstance[] = [];
    for (const uid of cardUids) {
      const idx = player.hand.findIndex(c => c.uid === uid);
      if (idx === -1) {
        throw new Error('Không tìm thấy lá bài trên tay.');
      }
      cardsToPlay.push(player.hand[idx]);
    }

    // Xóa bài khỏi tay người chơi và cho vào discard pile
    for (const card of cardsToPlay) {
      const idx = player.hand.findIndex(c => c.uid === card.uid);
      player.hand.splice(idx, 1);
      state.discardPile.push(card);
    }

    // Xác định loại hành động: Đơn lẻ hay Combo
    if (cardsToPlay.length === 1) {
      this.handleSingleCardPlay(state, player, cardsToPlay[0], options);
    } else if (cardsToPlay.length === 2) {
      this.handleComboTwo(state, player, cardsToPlay, options);
    } else if (cardsToPlay.length === 3) {
      this.handleComboThree(state, player, cardsToPlay, options);
    } else if (cardsToPlay.length === 5) {
      this.handleComboFive(state, player, cardsToPlay);
    } else {
      throw new Error('Số lượng bài đánh không hợp lệ.');
    }
  }

  /**
   * Đánh 1 lá bài đơn lẻ
   */
  private static handleSingleCardPlay(
    state: GameState, 
    player: PlayerState, 
    card: CardInstance,
    options?: { targetPlayerId?: string }
  ): void {
    const def = CardRegistry.getCard(card.defId);
    if (!def) throw new Error('Không tìm thấy định nghĩa bài.');

    if (def.type === 'CAT') {
      throw new Error('Lá mèo vô tri phải đánh theo Combo 2 hoặc 3 lá.');
    }
    if (def.type === 'DEFUSE') {
      throw new Error('Lá Defuse chỉ có tác dụng khi rút trúng Mèo Nổ.');
    }
    if (def.type === 'KITTEN') {
      throw new Error('Không thể tự đánh Mèo Nổ từ tay.');
    }

    // Tạo thông báo
    this.addLog(state, `${player.name} đánh lá ${def.name}.`, 'play', player.id);

    // Kiểm tra xem có ai có lá NOPE trên tay không
    const someoneHasNope = this.hasAnyNopeInHand(state, player.id);

    if (someoneHasNope) {
      const nopeMs = (state.settings?.nopeTimeoutSec ?? 5) * 1000;
      // Mở cửa sổ NOPE chờ phản ứng
      state.pendingAction = {
        type: 'NOPE_WINDOW',
        initiatorId: player.id,
        targetPlayerId: options?.targetPlayerId,
        cardsPlayed: [card],
        timeoutMs: nopeMs,
        expiresAt: Date.now() + nopeMs,
        nopeCount: 0,
        passedPlayerIds: []
      };
    } else {
      // Bỏ qua cửa sổ Nope, thực thi ngay lập tức!
      this.executeCardAction(state, player, card, options);
    }
  }

  /**
   * Kiểm tra xem 2 lá bài có tạo thành Combo 2 hợp lệ (cùng tên bài hoặc có Mèo Hoang Feral Cat)
   */
  static isValidComboTwo(cards: CardInstance[]): boolean {
    if (cards.length !== 2) return false;
    const def0 = CardRegistry.getCard(cards[0].defId);
    const def1 = CardRegistry.getCard(cards[1].defId);
    if (!def0 || !def1) return false;

    // 1. Trường hợp cùng tên bài
    if (cards[0].defId === cards[1].defId) return true;

    // 2. Trường hợp có Mèo Hoang (Feral Cat) kết hợp với lá mèo khác
    const hasFeral = cards[0].defId === 'feral_cat' || cards[1].defId === 'feral_cat';
    if (hasFeral) {
      // Cả 2 lá đều phải là loại CAT
      return def0.type === 'CAT' && def1.type === 'CAT';
    }

    return false;
  }

  /**
   * Kiểm tra xem 3 lá bài có tạo thành Combo 3 hợp lệ (cùng tên bài hoặc có Mèo Hoang Feral Cat)
   */
  static isValidComboThree(cards: CardInstance[]): boolean {
    if (cards.length !== 3) return false;
    const defs = cards.map(c => CardRegistry.getCard(c.defId));
    if (defs.some(d => !d)) return false;

    // 1. Trường hợp cả 3 lá cùng tên bài
    if (cards[0].defId === cards[1].defId && cards[1].defId === cards[2].defId) return true;

    // 2. Trường hợp có Mèo Hoang (Feral Cat)
    const feralCount = cards.filter(c => c.defId === 'feral_cat').length;
    if (feralCount > 0) {
      // Tất cả lá bài đều phải là loại CAT
      if (!defs.every(d => d!.type === 'CAT')) return false;

      // Các lá không phải Feral Cat phải cùng loại với nhau
      const nonFeral = cards.filter(c => c.defId !== 'feral_cat');
      if (nonFeral.length <= 1) return true; // 2 hoặc 3 feral
      return nonFeral.every(c => c.defId === nonFeral[0].defId);
    }

    return false;
  }

  /**
   * Xử lý Combo 2 lá cùng tên (Cướp 1 lá ngẫu nhiên)
   */
  private static handleComboTwo(
    state: GameState, 
    player: PlayerState, 
    cards: CardInstance[],
    options?: { targetPlayerId?: string }
  ): void {
    if (!this.isValidComboTwo(cards)) {
      throw new Error('Combo 2 lá phải có cùng tên bài hoặc kết hợp với Mèo Hoang (Feral Cat).');
    }
    if (!options?.targetPlayerId) {
      throw new Error('Cần chọn mục tiêu để cướp bài.');
    }

    const cardDef = CardRegistry.getCard(cards[0].defId);
    this.addLog(state, `✨ ${player.name} kích hoạt COMBO 2 LÁ (${cardDef?.name}) nhắm vào đối thủ!`, 'combo', player.id);

    const someoneHasNope = this.hasAnyNopeInHand(state, player.id);
    const nopeMs = (state.settings?.nopeTimeoutSec ?? 5) * 1000;
    if (someoneHasNope) {
      state.pendingAction = {
        type: 'NOPE_WINDOW',
        initiatorId: player.id,
        targetPlayerId: options.targetPlayerId,
        cardsPlayed: cards,
        timeoutMs: nopeMs,
        expiresAt: Date.now() + nopeMs,
        nopeCount: 0,
        passedPlayerIds: []
      };
    } else {
      this.executeComboTwo(state, player, options.targetPlayerId);
    }
  }

  /**
   * Xử lý Combo 3 lá cùng tên (Đòi đích danh 1 lá bài)
   */
  private static handleComboThree(
    state: GameState, 
    player: PlayerState, 
    cards: CardInstance[],
    options?: { targetPlayerId?: string; targetCardDefId?: string }
  ): void {
    if (!this.isValidComboThree(cards)) {
      throw new Error('Combo 3 lá phải gồm 3 lá cùng tên bài hoặc kết hợp với Mèo Hoang (Feral Cat).');
    }
    if (!options?.targetPlayerId || !options?.targetCardDefId) {
      throw new Error('Cần chọn mục tiêu và tên lá bài muốn đòi.');
    }

    const cardDef = CardRegistry.getCard(cards[0].defId);
    const targetCardDef = CardRegistry.getCard(options.targetCardDefId);
    this.addLog(
      state, 
      `✨ ${player.name} kích hoạt COMBO 3 LÁ (${cardDef?.name}) đòi lá "${targetCardDef?.name}"!`, 
      'combo', 
      player.id
    );

    const someoneHasNope = this.hasAnyNopeInHand(state, player.id);
    const nopeMs3 = (state.settings?.nopeTimeoutSec ?? 5) * 1000;
    if (someoneHasNope) {
      state.pendingAction = {
        type: 'NOPE_WINDOW',
        initiatorId: player.id,
        targetPlayerId: options.targetPlayerId,
        cardsPlayed: cards,
        cardDefId: options.targetCardDefId,
        timeoutMs: nopeMs3,
        expiresAt: Date.now() + nopeMs3,
        nopeCount: 0,
        passedPlayerIds: []
      };
    } else {
      this.executeComboThree(state, player, options.targetPlayerId, options.targetCardDefId);
    }
  }

  /**
   * Xử lý Combo 5 lá khác nhau (Lấy 1 lá từ Discard Pile)
   */
  private static handleComboFive(
    state: GameState, 
    player: PlayerState, 
    cards: CardInstance[]
  ): void {
    const uniqueDefs = new Set(cards.map(c => c.defId));
    if (uniqueDefs.size !== 5) {
      throw new Error('Combo 5 lá yêu cầu 5 lá bài hoàn toàn khác nhau.');
    }

    this.addLog(state, `🌟 ${player.name} kích hoạt COMBO 5 LÁ ĐẶC BIỆT để hồi sinh 1 lá từ xấp bài bỏ!`, 'combo', player.id);

    const someoneHasNope = this.hasAnyNopeInHand(state, player.id);
    const nopeMs5 = (state.settings?.nopeTimeoutSec ?? 5) * 1000;
    if (someoneHasNope) {
      state.pendingAction = {
        type: 'NOPE_WINDOW',
        initiatorId: player.id,
        cardsPlayed: cards,
        timeoutMs: nopeMs5,
        expiresAt: Date.now() + nopeMs5,
        nopeCount: 0,
        passedPlayerIds: []
      };
    } else {
      // Mở modal cho người chơi chọn bài từ Discard Pile
      state.pendingAction = {
        type: 'COMBO_FIVE_CHOOSE_DISCARD',
        initiatorId: player.id,
        cardsPlayed: cards,
        timeoutMs: 60000,
        expiresAt: Date.now() + 60000,
        nopeCount: 0,
        passedPlayerIds: []
      };
    }
  }

  /**
   * Người chơi nhấn nút Pass / Bỏ qua cửa sổ Nope
   */
  static passNope(state: GameState, playerId: string): void {
    if (!state.pendingAction || state.pendingAction.type !== 'NOPE_WINDOW') {
      return;
    }
    if (!state.pendingAction.passedPlayerIds.includes(playerId)) {
      state.pendingAction.passedPlayerIds.push(playerId);
    }

    // Kiểm tra xem tất cả những người chơi còn sống có thể đánh Nope đã pass hay chưa.
    // Lưu ý: Khi vừa đánh bài (nopeCount === 0), người phát động không tự Nope chính mình nên không cần chờ họ pass.
    const relevantNopeHolders = state.players.filter(
      p => p.isAlive &&
        (state.pendingAction!.nopeCount > 0 || p.id !== state.pendingAction!.initiatorId) &&
        p.hand.some(c => c.defId === 'nope')
    );

    const allAlive = state.players.filter(p => p.isAlive);
    const allPassed = allAlive.every(p => state.pendingAction?.passedPlayerIds.includes(p.id));
    const allNopeHoldersPassed = relevantNopeHolders.length > 0 && 
      relevantNopeHolders.every(p => state.pendingAction?.passedPlayerIds.includes(p.id));

    // Chỉ tự động giải quyết sớm nếu tất cả những người CÓ THỂ ĐÁNH NOPE đã bấm pass
    // HOẶC tất cả người chơi còn sống đều đã pass
    if (allPassed || allNopeHoldersPassed) {
      this.resolvePendingAction(state);
    }
  }

  /**
   * Thực thi hành động khi cửa sổ Nope kết thúc
   */
  static resolvePendingAction(state: GameState): void {
    if (!state.pendingAction || state.pendingAction.type !== 'NOPE_WINDOW') {
      return;
    }

    const { initiatorId, targetPlayerId, cardsPlayed, cardDefId, nopeCount } = state.pendingAction;
    const player = state.players.find(p => p.id === initiatorId);
    if (!player) {
      state.pendingAction = null;
      return;
    }

    const wasNoped = nopeCount % 2 === 1;

    if (wasNoped) {
      // Dùng type 'info' để thông báo trên log trận đấu, tránh kích hoạt lại ActionSpotlight và chớp viền đỏ lần 2
      this.addLog(state, `🛑 Hành động của ${player.name} đã chính thức bị NOPE! Không có hiệu lực.`, 'info', player.id);
      state.pendingAction = null;
      return;
    }

    // Hành động thành công, tiến hành thực thi
    state.pendingAction = null;

    if (cardsPlayed.length === 1) {
      this.executeCardAction(state, player, cardsPlayed[0], { targetPlayerId });
    } else if (cardsPlayed.length === 2 && targetPlayerId) {
      this.executeComboTwo(state, player, targetPlayerId);
    } else if (cardsPlayed.length === 3 && targetPlayerId && cardDefId) {
      this.executeComboThree(state, player, targetPlayerId, cardDefId);
    } else if (cardsPlayed.length === 5) {
      state.pendingAction = {
        type: 'COMBO_FIVE_CHOOSE_DISCARD',
        initiatorId: player.id,
        cardsPlayed,
        timeoutMs: 60000,
        expiresAt: Date.now() + 60000,
        nopeCount: 0,
        passedPlayerIds: []
      };
    }
  }

  /**
   * Thực thi hiệu ứng thẻ bài đơn lẻ
   */
  private static executeCardAction(
    state: GameState, 
    player: PlayerState, 
    card: CardInstance,
    options?: { targetPlayerId?: string }
  ): void {
    switch (card.defId) {
      case 'attack': {
        const nextIdx = TurnManager.applyAttack(state);
        const nextPlayer = state.players[nextIdx];
        this.addLog(state, `⚔️ ${player.name} tấn công! ${nextPlayer.name} phải đi ${nextPlayer.turnsToTake} lượt liên tiếp.`, 'info', player.id);
        break;
      }

      case 'skip': {
        const turnedEnded = TurnManager.applySkip(state);
        if (turnedEnded) {
          const nextPlayer = state.players[state.currentPlayerIndex];
          this.addLog(state, `⏩ ${player.name} bỏ lượt! Đến lượt của ${nextPlayer.name}.`, 'info', player.id);
        } else {
          this.addLog(state, `⏩ ${player.name} dùng Skip để hủy 1 lượt dồn (vẫn còn ${player.turnsToTake} lượt).`, 'info', player.id);
        }
        break;
      }

      case 'shuffle': {
        this.shuffleArray(state.drawPile);
        this.addLog(state, `🔀 ${player.name} đã xào lại toàn bộ xấp bài rút!`, 'info', player.id);
        break;
      }

      case 'see_the_future': {
        const peek = state.drawPile.slice(0, 3);
        state.peekCards = {
          playerId: player.id,
          cards: peek
        };
        this.addLog(state, `🔮 ${player.name} đang xem trước 3 lá trên cùng của xấp bài rút.`, 'info', player.id);
        break;
      }

      case 'favor': {
        if (!options?.targetPlayerId) {
          // Yêu cầu chọn người bị xin bài
          state.pendingAction = {
            type: 'FAVOR_CHOOSE_PLAYER',
            initiatorId: player.id,
            cardsPlayed: [card],
            timeoutMs: 30000,
            expiresAt: Date.now() + 30000,
            nopeCount: 0,
            passedPlayerIds: []
          };
        } else {
          // Đã có mục tiêu -> yêu cầu mục tiêu chọn 1 lá để đưa
          state.pendingAction = {
            type: 'FAVOR_GIVE_CARD',
            initiatorId: player.id,
            targetPlayerId: options.targetPlayerId,
            cardsPlayed: [card],
            timeoutMs: 30000,
            expiresAt: Date.now() + 30000,
            nopeCount: 0,
            passedPlayerIds: []
          };
          const target = state.players.find(p => p.id === options.targetPlayerId);
          this.addLog(state, `🤝 ${player.name} yêu cầu ${target?.name} phải đưa cho mình 1 lá bài!`, 'info', player.id);
        }
        break;
      }

      case 'targeted_attack': {
        if (!options?.targetPlayerId) {
          // Mở cửa sổ chọn người bị tấn công đích danh
          state.pendingAction = {
            type: 'TARGETED_ATTACK_CHOOSE_PLAYER',
            initiatorId: player.id,
            cardsPlayed: [card],
            timeoutMs: 30000,
            expiresAt: Date.now() + 30000,
            nopeCount: 0,
            passedPlayerIds: []
          };
        } else {
          const targetIdx = TurnManager.applyTargetedAttack(state, options.targetPlayerId);
          const target = state.players[targetIdx];
          this.addLog(
            state, 
            `🎯 ${player.name} tung TẤN CÔNG CHỌN MỤC TIÊU! ${target.name} bị ép phải đi ${target.turnsToTake} lượt liên tiếp.`, 
            'play', 
            player.id
          );
        }
        break;
      }

      case 'alter_the_future': {
        const peek = state.drawPile.slice(0, 3);
        state.alterCards = {
          playerId: player.id,
          cards: peek
        };
        state.pendingAction = {
          type: 'ALTER_THE_FUTURE',
          initiatorId: player.id,
          cardsPlayed: [card],
          alterCards: peek,
          timeoutMs: 60000,
          expiresAt: Date.now() + 60000,
          nopeCount: 0,
          passedPlayerIds: []
        };
        this.addLog(state, `🔮 ${player.name} đang xem và sắp xếp lại 3 lá bài trên cùng của xấp rút.`, 'info', player.id);
        break;
      }

      case 'draw_from_bottom': {
        if (state.drawPile.length > 0) {
          const cardDrawn = state.drawPile.pop()!;
          this.addLog(state, `📥 ${player.name} rút 1 lá bài từ ĐÁY xấp bài!`, 'info', player.id);
          this.processDrawnCard(state, player, cardDrawn);
        }
        break;
      }

      case 'reverse': {
        const turnedEnded = TurnManager.applyReverse(state);
        const directionText = state.turnDirection === 1 ? 'thuận chiều kim đồng hồ ↻' : 'ngược chiều kim đồng hồ ↺';
        if (turnedEnded) {
          const nextPlayer = state.players[state.currentPlayerIndex];
          this.addLog(state, `🔄 ${player.name} dùng Đảo Chiều! Vòng chơi đổi sang ${directionText}. Đến lượt ${nextPlayer.name}.`, 'info', player.id);
        } else {
          this.addLog(state, `🔄 ${player.name} dùng Đảo Chiều để hủy 1 lượt dồn! Vòng chơi đổi sang ${directionText} (vẫn còn ${player.turnsToTake} lượt).`, 'info', player.id);
        }
        break;
      }

      default:
        break;
    }
  }

  /**
   * Chọn người cho lá bài Favor
   */
  static selectFavorTarget(state: GameState, playerId: string, targetPlayerId: string): void {
    if (!state.pendingAction || state.pendingAction.type !== 'FAVOR_CHOOSE_PLAYER' || state.pendingAction.initiatorId !== playerId) {
      throw new Error('Yêu cầu chọn mục tiêu Favor không hợp lệ.');
    }
    const initiator = state.players.find(p => p.id === playerId);
    const target = state.players.find(p => p.id === targetPlayerId);
    if (!target || !target.isAlive || target.hand.length === 0) {
      throw new Error('Mục tiêu không hợp lệ hoặc không có bài trên tay.');
    }

    state.pendingAction = {
      type: 'FAVOR_GIVE_CARD',
      initiatorId: playerId,
      targetPlayerId: targetPlayerId,
      cardsPlayed: state.pendingAction.cardsPlayed,
      timeoutMs: 30000,
      expiresAt: Date.now() + 30000,
      nopeCount: 0,
      passedPlayerIds: []
    };
    this.addLog(state, `🤝 ${initiator?.name} yêu cầu ${target.name} phải tự chọn đưa 1 lá bài!`, 'play', playerId);
  }

  /**
   * Người bị Favor đưa 1 lá bài cho người yêu cầu
   */
  static giveFavorCard(state: GameState, targetPlayerId: string, cardUid: string): void {
    if (!state.pendingAction || state.pendingAction.type !== 'FAVOR_GIVE_CARD' || state.pendingAction.targetPlayerId !== targetPlayerId) {
      throw new Error('Yêu cầu đưa bài Favor không hợp lệ.');
    }
    const initiator = state.players.find(p => p.id === state.pendingAction?.initiatorId);
    const target = state.players.find(p => p.id === targetPlayerId);
    if (!initiator || !target) throw new Error('Không tìm thấy người chơi.');

    const cardIdx = target.hand.findIndex(c => c.uid === cardUid);
    if (cardIdx === -1) throw new Error('Không tìm thấy lá bài trên tay.');

    const [givenCard] = target.hand.splice(cardIdx, 1);
    initiator.hand.push(givenCard);

    state.pendingAction = null;
    this.addLog(state, `🤝 ${target.name} đã đưa 1 lá bài cho ${initiator.name}.`, 'info', target.id);
  }

  /**
   * Chọn người cho lá bài Targeted Attack
   */
  static selectTargetedAttack(state: GameState, playerId: string, targetPlayerId: string): void {
    if (!state.pendingAction || state.pendingAction.type !== 'TARGETED_ATTACK_CHOOSE_PLAYER' || state.pendingAction.initiatorId !== playerId) {
      throw new Error('Yêu cầu chọn mục tiêu Targeted Attack không hợp lệ.');
    }
    const initiator = state.players.find(p => p.id === playerId);
    state.pendingAction = null;
    const targetIdx = TurnManager.applyTargetedAttack(state, targetPlayerId);
    const target = state.players[targetIdx];
    this.addLog(
      state, 
      `🎯 ${initiator?.name} tung TẤN CÔNG CHỌN MỤC TIÊU! ${target.name} bị ép phải đi ${target.turnsToTake} lượt liên tiếp.`, 
      'play', 
      playerId
    );
  }

  /**
   * Sắp xếp lại các lá bài trong Alter the Future
   */
  static reorderAlterFuture(state: GameState, playerId: string, newCards: CardInstance[]): void {
    if (!state.pendingAction || state.pendingAction.type !== 'ALTER_THE_FUTURE' || state.pendingAction.initiatorId !== playerId) {
      throw new Error('Yêu cầu Thay Đổi Tương Lai không hợp lệ.');
    }
    const player = state.players.find(p => p.id === playerId);
    if (!player) throw new Error('Người chơi không tồn tại.');

    const count = Math.min(newCards.length, state.drawPile.length, 3);
    for (let i = 0; i < count; i++) {
      state.drawPile[i] = newCards[i];
    }
    state.pendingAction = null;
    state.alterCards = null;
    this.addLog(state, `🔮 ${player.name} đã sắp xếp lại các lá bài trên cùng của xấp bài rút!`, 'info', player.id);
  }

  /**
   * Đóng giao diện Alter the Future (nếu không đổi thứ tự)
   */
  static closeAlterFuture(state: GameState, playerId: string): void {
    if (state.pendingAction?.type === 'ALTER_THE_FUTURE' && state.pendingAction.initiatorId === playerId) {
      state.pendingAction = null;
    }
    if (state.alterCards?.playerId === playerId) {
      state.alterCards = null;
    }
  }

  /**
   * Thực thi Combo 2 lá
   */
  private static executeComboTwo(state: GameState, player: PlayerState, targetPlayerId: string): void {
    const target = state.players.find(p => p.id === targetPlayerId);
    if (!target || !target.isAlive || target.hand.length === 0) {
      this.addLog(state, `${player.name} cướp bài của ${target?.name || 'mục tiêu'} nhưng đối phương không có bài!`, 'info', player.id);
      return;
    }

    // Chọn ngẫu nhiên 1 lá từ tay target
    const randomIdx = Math.floor(Math.random() * target.hand.length);
    const [stolenCard] = target.hand.splice(randomIdx, 1);
    player.hand.push(stolenCard);

    this.addLog(state, `🎯 ${player.name} đã cướp ngẫu nhiên 1 lá bài từ tay của ${target.name}!`, 'info', player.id);
  }

  /**
   * Thực thi Combo 3 lá
   */
  private static executeComboThree(
    state: GameState, 
    player: PlayerState, 
    targetPlayerId: string, 
    targetCardDefId: string
  ): void {
    const target = state.players.find(p => p.id === targetPlayerId);
    const targetCardDef = CardRegistry.getCard(targetCardDefId);
    if (!target || !target.isAlive) {
      this.addLog(state, `${player.name} đòi bài nhưng đối phương không tồn tại!`, 'info', player.id);
      return;
    }

    const cardIdx = target.hand.findIndex(c => c.defId === targetCardDefId);
    if (cardIdx !== -1) {
      // Có bài -> Bắt buộc phải đưa
      const [stolenCard] = target.hand.splice(cardIdx, 1);
      player.hand.push(stolenCard);
      this.addLog(
        state, 
        `🎉 ${player.name} đòi lá "${targetCardDef?.name}" thành công! ${target.name} đã bị tước lá này.`, 
        'info', 
        player.id
      );
    } else {
      // Không có bài -> Trắng tay!
      this.addLog(
        state, 
        `😅 ${player.name} đòi lá "${targetCardDef?.name}" nhưng ${target.name} KHÔNG CÓ! ${player.name} nhận về số 0 tròn trĩnh.`, 
        'info', 
        player.id
      );
    }
  }

  /**
   * Chọn 1 lá bài từ Discard Pile cho Combo 5 lá
   */
  static pickDiscardForComboFive(state: GameState, playerId: string, cardUid: string): void {
    if (!state.pendingAction || state.pendingAction.type !== 'COMBO_FIVE_CHOOSE_DISCARD' || state.pendingAction.initiatorId !== playerId) {
      throw new Error('Yêu cầu chọn bài từ Discard Pile không hợp lệ.');
    }
    const player = state.players.find(p => p.id === playerId);
    if (!player) throw new Error('Người chơi không tồn tại.');

    const cardIdx = state.discardPile.findIndex(c => c.uid === cardUid);
    if (cardIdx === -1) throw new Error('Lá bài không tồn tại trong xấp bài bỏ.');

    const [pickedCard] = state.discardPile.splice(cardIdx, 1);
    player.hand.push(pickedCard);

    state.pendingAction = null;
    const cardDef = CardRegistry.getCard(pickedCard.defId);
    this.addLog(state, `🌟 ${player.name} đã chọn lá "${cardDef?.name}" từ xấp bài bỏ vào tay mình!`, 'combo', player.id);
  }

  /**
   * Đóng cửa sổ xem bài See The Future
   */
  static closeSeeFuture(state: GameState, playerId: string): void {
    if (state.peekCards && state.peekCards.playerId === playerId) {
      state.peekCards = null;
    }
  }
}

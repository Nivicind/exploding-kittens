import { describe, it, expect, beforeEach } from 'vitest';
import { GameStateManager } from '../src/engine/GameState';
import { CardRegistry } from '../src/engine/CardRegistry';
import { CardInstance } from '../src/engine/types';

describe('Bản mở rộng Imploding Kittens', () => {
  beforeEach(() => {
    CardRegistry.init();
  });

  const players = [
    { id: 'p1', name: 'Player 1', isBot: false },
    { id: 'p2', name: 'Player 2', isBot: false },
    { id: 'p3', name: 'Player 3', isBot: false },
    { id: 'p4', name: 'Player 4', isBot: false }
  ];

  it('Khởi tạo ván đấu có bản mở rộng Imploding Kittens', () => {
    const state = GameStateManager.createGame(players, undefined, ['base', 'imploding']);
    expect(state.activeExpansions).toContain('imploding');

    // Trong 4 người chơi: mặc định 2 Mèo Nổ + 1 Mèo Tự Nổ
    const explodingCount = state.drawPile.filter(c => c.defId === 'exploding_kitten').length;
    const implodingCount = state.drawPile.filter(c => c.defId === 'imploding_kitten').length;

    expect(implodingCount).toBe(1);
    expect(explodingCount).toBe(2);

    // Mèo Tự Nổ ban đầu phải úp mặt
    const implodingCard = state.drawPile.find(c => c.defId === 'imploding_kitten');
    expect(implodingCard?.isFaceUp).toBe(false);
  });

  it('Rút Mèo Tự Nổ lần 1 (úp mặt): Không chết, lật ngửa và đặt lại vào xấp bài', () => {
    const state = GameStateManager.createGame(players, undefined, ['base', 'imploding']);
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Đặt 1 lá Imploding Kitten úp mặt lên đỉnh xấp bài
    state.drawPile.unshift({
      uid: 'test_imploding',
      defId: 'imploding_kitten',
      isFaceUp: false
    });

    const res = GameStateManager.drawCard(state, currentPlayer.id);
    expect(res.exploded).toBe(false);
    expect(res.cardDrawn.defId).toBe('imploding_kitten');
    expect(res.cardDrawn.isFaceUp).toBe(true);

    // Người chơi còn sống và ở trạng thái IMPLODING_INSERTION
    expect(currentPlayer.isAlive).toBe(true);
    expect(state.pendingAction?.type).toBe('IMPLODING_INSERTION');

    // Nhét lại vào vị trí 0 (đỉnh xấp bài)
    GameStateManager.insertImplodingKitten(state, currentPlayer.id, 0);
    expect(state.pendingAction).toBeNull();
    expect(state.drawPile[0].defId).toBe('imploding_kitten');
    expect(state.drawPile[0].isFaceUp).toBe(true);
  });

  it('Rút Mèo Tự Nổ lần 2 (ngửa mặt): Nổ tung ngay lập tức, Defuse vô tác dụng!', () => {
    const state = GameStateManager.createGame(players, undefined, ['base', 'imploding']);
    const currentPlayer = state.players[state.currentPlayerIndex];

    // Đảm bảo người chơi có Defuse trên tay
    expect(currentPlayer.hand.some(c => c.defId === 'defuse')).toBe(true);

    // Đặt Mèo Tự Nổ ngửa mặt lên đỉnh
    state.drawPile.unshift({
      uid: 'test_imploding_faceup',
      defId: 'imploding_kitten',
      isFaceUp: true
    });

    const res = GameStateManager.drawCard(state, currentPlayer.id);
    // Nổ chết ngay lập tức!
    expect(res.exploded).toBe(true);
    expect(currentPlayer.isAlive).toBe(false);
    expect(currentPlayer.hand.length).toBe(0);
    // Lá Defuse không cứu được
    expect(state.pendingAction).toBeNull();
  });

  it('Targeted Attack: Ép mục tiêu được chọn phải đi 2 lượt liên tiếp', () => {
    const state = GameStateManager.createGame(players, undefined, ['base', 'imploding']);
    state.players.forEach(p => p.hand = p.hand.filter(c => c.defId !== 'nope'));
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    const target = state.players[1];

    p1.hand.push({ uid: 'card_targeted_attack', defId: 'targeted_attack' });
    GameStateManager.playCards(state, p1.id, ['card_targeted_attack'], { targetPlayerId: target.id });

    // Lượt chuyển sang target và target có 2 lượt
    expect(state.players[state.currentPlayerIndex].id).toBe(target.id);
    expect(target.turnsToTake).toBe(2);
  });

  it('Alter the Future: Cho phép xem và sắp xếp lại 3 lá bài trên cùng', () => {
    const state = GameStateManager.createGame(players, undefined, ['base', 'imploding']);
    state.players.forEach(p => p.hand = p.hand.filter(c => c.defId !== 'nope'));
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];

    // Gán 3 lá cụ thể ở đỉnh xấp bài
    const c1: CardInstance = { uid: 'c1', defId: 'skip' };
    const c2: CardInstance = { uid: 'c2', defId: 'attack' };
    const c3: CardInstance = { uid: 'c3', defId: 'shuffle' };
    state.drawPile.unshift(c1, c2, c3);

    p1.hand.push({ uid: 'card_alter', defId: 'alter_the_future' });
    GameStateManager.playCards(state, p1.id, ['card_alter']);

    expect(state.pendingAction?.type).toBe('ALTER_THE_FUTURE');
    expect(state.alterCards?.cards.length).toBe(3);

    // Đổi thứ tự thành: c3, c1, c2
    GameStateManager.reorderAlterFuture(state, p1.id, [c3, c1, c2]);

    expect(state.pendingAction).toBeNull();
    expect(state.drawPile[0].uid).toBe('c3');
    expect(state.drawPile[1].uid).toBe('c1');
    expect(state.drawPile[2].uid).toBe('c2');
  });

  it('Draw from the Bottom: Rút lá bài dưới đáy xấp bài an toàn', () => {
    const state = GameStateManager.createGame(players, undefined, ['base', 'imploding']);
    state.players.forEach(p => p.hand = p.hand.filter(c => c.defId !== 'nope'));
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];

    // Đặt Mèo Nổ ở đỉnh nhưng đặt lá an toàn ở đáy
    state.drawPile.unshift({ uid: 'top_bomb', defId: 'exploding_kitten' });
    state.drawPile.push({ uid: 'bottom_safe', defId: 'skip' });

    p1.hand.push({ uid: 'card_bottom', defId: 'draw_from_bottom' });
    GameStateManager.playCards(state, p1.id, ['card_bottom']);

    // Bài trên tay có lá bottom_safe, top_bomb vẫn còn nguyên ở đỉnh!
    expect(p1.hand.some(c => c.uid === 'bottom_safe')).toBe(true);
    expect(state.drawPile[0].uid).toBe('top_bomb');
  });

  it('Reverse: Đảo chiều vòng chơi', () => {
    const state = GameStateManager.createGame(players, undefined, ['base', 'imploding']);
    state.players.forEach(p => p.hand = p.hand.filter(c => c.defId !== 'nope'));
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    expect(state.turnDirection).toBe(1);

    p1.hand.push({ uid: 'card_reverse', defId: 'reverse' });
    GameStateManager.playCards(state, p1.id, ['card_reverse']);

    // Chiều vòng chơi đảo ngược thành -1
    expect(state.turnDirection).toBe(-1);
  });

  it('Mèo Hoang (Feral Cat): Hoạt động như Wildcard cho lá Mèo', () => {
    const cFeral: CardInstance = { uid: 'feral_1', defId: 'feral_cat' };
    const cTaco: CardInstance = { uid: 'taco_1', defId: 'cat_tacocat' };
    const cAttack: CardInstance = { uid: 'attack_1', defId: 'attack' };

    // Feral Cat + Taco Cat = Hợp lệ cho Combo 2
    expect(GameStateManager.isValidComboTwo([cFeral, cTaco])).toBe(true);

    // 2 Feral Cat = Hợp lệ
    expect(GameStateManager.isValidComboTwo([cFeral, { uid: 'feral_2', defId: 'feral_cat' }])).toBe(true);

    // Feral Cat + Attack = Không hợp lệ (không được sao chép bài chức năng)
    expect(GameStateManager.isValidComboTwo([cFeral, cAttack])).toBe(false);

    // 1 Feral Cat + 2 Taco Cat = Hợp lệ cho Combo 3
    expect(GameStateManager.isValidComboThree([cFeral, cTaco, { uid: 'taco_2', defId: 'cat_tacocat' }])).toBe(true);

    // 1 Feral Cat + 1 Taco Cat + 1 Beard Cat = Không hợp lệ (2 loại mèo khác nhau)
    expect(GameStateManager.isValidComboThree([cFeral, cTaco, { uid: 'beard_1', defId: 'cat_beard' }])).toBe(false);
  });
});

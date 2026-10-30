import { describe, it, expect } from 'vitest';
import { GameStateManager } from '../src/engine/GameState';
import { TurnManager } from '../src/engine/TurnManager';

describe('Kiểm tra Vòng lượt và Hành động lá bài', () => {
  it('Lá bài Attack chuyển lượt và dồn số lượt cho người tiếp theo', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true },
      { id: 'p3', name: 'Player 3', isBot: true }
    ];

    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0; // P1 đi
    state.players[0].turnsToTake = 1;

    // Đưa lá Attack vào tay P1
    state.players[0].hand.push({ uid: 'att_1', defId: 'attack' });

    // Không ai có Nope để test trực tiếp
    state.players.forEach(p => {
      p.hand = p.hand.filter(c => c.defId !== 'nope');
    });

    GameStateManager.playCards(state, 'p1', ['att_1']);

    // Sau khi P1 đánh Attack, lượt chuyển sang P2 và P2 có 2 lượt!
    expect(state.currentPlayerIndex).toBe(1);
    expect(state.players[1].turnsToTake).toBe(2);

    // Nếu P2 đánh tiếp Attack: lượt chuyển sang P3 và P3 chịu (2-1) + 2 = 3 hoặc 4 lượt
    state.players[1].hand.push({ uid: 'att_2', defId: 'attack' });
    GameStateManager.playCards(state, 'p2', ['att_2']);

    expect(state.currentPlayerIndex).toBe(2);
    expect(state.players[2].turnsToTake).toBe(3); // 2 + 1 lượt còn dư
  });

  it('Lá bài Skip giảm 1 lượt dồn hoặc chuyển lượt nếu chỉ có 1 lượt', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true }
    ];
    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0;
    state.players[0].turnsToTake = 2; // Đang bị dồn 2 lượt
    state.players.forEach(p => p.hand = p.hand.filter(c => c.defId !== 'nope'));

    state.players[0].hand.push({ uid: 'sk_1', defId: 'skip' });
    GameStateManager.playCards(state, 'p1', ['sk_1']);

    // Vẫn ở lượt P1 nhưng giảm còn 1 lượt
    expect(state.currentPlayerIndex).toBe(0);
    expect(state.players[0].turnsToTake).toBe(1);

    // Đánh thêm 1 lá Skip nữa -> chuyển sang P2
    state.players[0].hand.push({ uid: 'sk_2', defId: 'skip' });
    GameStateManager.playCards(state, 'p1', ['sk_2']);

    expect(state.currentPlayerIndex).toBe(1);
    expect(state.players[1].turnsToTake).toBe(1);
  });

  it('Rút phải Mèo Nổ khi có Defuse kích hoạt DEFUSE_INSERTION', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true }
    ];
    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0;

    // Đảm bảo trên đỉnh xấp bài là Mèo Nổ
    state.drawPile.unshift({ uid: 'kitten_top', defId: 'exploding_kitten' });

    // P1 có sẵn 1 Defuse
    expect(state.players[0].hand.some(c => c.defId === 'defuse')).toBe(true);

    const result = GameStateManager.drawCard(state, 'p1');

    expect(result.exploded).toBe(false);
    expect(state.pendingAction?.type).toBe('DEFUSE_INSERTION');
    expect(state.pendingAction?.initiatorId).toBe('p1');

    // P1 chọn giấu lại Mèo Nổ vào vị trí số 0 (đỉnh)
    GameStateManager.insertExplodingKitten(state, 'p1', 0);

    expect(state.pendingAction).toBeNull();
    // Mèo Nổ đã ở lại đỉnh
    expect(state.drawPile[0].defId).toBe('exploding_kitten');
    // Đã chuyển lượt sang P2
    expect(state.currentPlayerIndex).toBe(1);
  });

  it('Rút phải Mèo Nổ khi KHÔNG có Defuse dẫn đến BÙM (loại khỏi trận) và xác định người thắng', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true }
    ];
    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0;

    // Xóa hết Defuse của P1
    state.players[0].hand = state.players[0].hand.filter(c => c.defId !== 'defuse');

    // Đặt Mèo Nổ trên đỉnh
    state.drawPile.unshift({ uid: 'kitten_fatal', defId: 'exploding_kitten' });

    const result = GameStateManager.drawCard(state, 'p1');

    expect(result.exploded).toBe(true);
    expect(state.players[0].isAlive).toBe(false);
    expect(state.players[0].hand.length).toBe(0);

    // Vì chỉ có 2 người, P1 nổ thì P2 chiến thắng ngay!
    expect(state.status).toBe('game_over');
    expect(state.winnerId).toBe('p2');
  });

  it('Combo 2 lá cướp 1 lá ngẫu nhiên từ đối thủ', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true }
    ];
    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0;
    state.players.forEach(p => p.hand = p.hand.filter(c => c.defId !== 'nope'));

    // Đưa 2 lá TacoCat cho P1
    state.players[0].hand.push(
      { uid: 'taco_1', defId: 'cat_tacocat' },
      { uid: 'taco_2', defId: 'cat_tacocat' }
    );

    const p2InitialCount = state.players[1].hand.length;
    const p1InitialCount = state.players[0].hand.length;

    GameStateManager.playCards(state, 'p1', ['taco_1', 'taco_2'], { targetPlayerId: 'p2' });

    // P2 bị mất 1 lá
    expect(state.players[1].hand.length).toBe(p2InitialCount - 1);
    // P1 đánh 2 lá, được cộng 1 lá = -1 lá
    expect(state.players[0].hand.length).toBe(p1InitialCount - 2 + 1);
  });

  it('Combo 5 lá khác nhau (bao gồm 1 lá Nope) để hồi sinh bài từ xấp bài bỏ', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true }
    ];
    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0;
    // Xóa Nope khỏi tay P2 để không có Nope window cản trở
    state.players[1].hand = state.players[1].hand.filter(c => c.defId !== 'nope');

    // Đưa vào discard pile 1 lá Defuse
    state.discardPile.push({ uid: 'discarded_defuse', defId: 'defuse' });

    // Đưa vào tay P1 5 lá bài khác nhau trong đó CÓ 1 LÁ NOPE
    state.players[0].hand.push(
      { uid: 'c_taco', defId: 'cat_tacocat' },
      { uid: 'c_melon', defId: 'cat_cattermelon' },
      { uid: 'c_att', defId: 'attack' },
      { uid: 'c_skip', defId: 'skip' },
      { uid: 'c_nope', defId: 'nope' }
    );

    const initialHandCount = state.players[0].hand.length;

    // P1 đánh combo 5 lá
    GameStateManager.playCards(state, 'p1', ['c_taco', 'c_melon', 'c_att', 'c_skip', 'c_nope']);

    expect(state.pendingAction?.type).toBe('COMBO_FIVE_CHOOSE_DISCARD');
    expect(state.pendingAction?.initiatorId).toBe('p1');

    // P1 chọn hồi sinh lá Defuse từ discard pile
    GameStateManager.pickDiscardForComboFive(state, 'p1', 'discarded_defuse');

    expect(state.pendingAction).toBeNull();
    // Tay P1 phải có lá discarded_defuse
    expect(state.players[0].hand.some(c => c.uid === 'discarded_defuse')).toBe(true);
    expect(state.players[0].hand.length).toBe(initialHandCount - 5 + 1);
  });

  it('Combo 5 lá khác nhau khi đối thủ có Nope nhưng pass', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true }
    ];
    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0;
    // P2 CÓ NOPE
    state.players[1].hand.push({ uid: 'p2_nope', defId: 'nope' });

    // Đưa vào discard pile 1 lá Defuse
    state.discardPile.push({ uid: 'discarded_defuse_2', defId: 'defuse' });

    // Đưa vào tay P1 5 lá bài khác nhau trong đó CÓ 1 LÁ NOPE
    state.players[0].hand.push(
      { uid: 'c_taco_2', defId: 'cat_tacocat' },
      { uid: 'c_melon_2', defId: 'cat_cattermelon' },
      { uid: 'c_att_2', defId: 'attack' },
      { uid: 'c_skip_2', defId: 'skip' },
      { uid: 'c_nope_2', defId: 'nope' }
    );

    // P1 đánh combo 5 lá
    GameStateManager.playCards(state, 'p1', ['c_taco_2', 'c_melon_2', 'c_att_2', 'c_skip_2', 'c_nope_2']);

    // Vì P2 có Nope nên phải mở NOPE_WINDOW
    expect(state.pendingAction?.type).toBe('NOPE_WINDOW');
    expect(state.pendingAction?.initiatorId).toBe('p1');

    // P2 Pass Nope
    GameStateManager.passNope(state, 'p2');

    // Sau khi P2 pass, pendingAction phải chuyển sang COMBO_FIVE_CHOOSE_DISCARD
    expect(state.pendingAction?.type).toBe('COMBO_FIVE_CHOOSE_DISCARD');
    expect(state.pendingAction?.initiatorId).toBe('p1');

    // P1 chọn lá bài
    GameStateManager.pickDiscardForComboFive(state, 'p1', 'discarded_defuse_2');

    expect(state.pendingAction).toBeNull();
    expect(state.players[0].hand.some(c => c.uid === 'discarded_defuse_2')).toBe(true);
  });

  it('Combo 5 lá: P2 Nope, P1 Nope lại Nope của P2 (Counter-Nope)', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true }
    ];
    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0;
    // P2 có 1 lá Nope
    state.players[1].hand.push({ uid: 'p2_nope_3', defId: 'nope' });
    // P1 có 1 lá Nope dự phòng để counter-nope
    state.players[0].hand.push({ uid: 'p1_extra_nope', defId: 'nope' });

    // Đưa vào discard pile 1 lá Defuse
    state.discardPile.push({ uid: 'discarded_defuse_3', defId: 'defuse' });

    // Đưa vào tay P1 5 lá bài khác nhau trong đó CÓ 1 LÁ NOPE
    state.players[0].hand.push(
      { uid: 'c_taco_3', defId: 'cat_tacocat' },
      { uid: 'c_melon_3', defId: 'cat_cattermelon' },
      { uid: 'c_att_3', defId: 'attack' },
      { uid: 'c_skip_3', defId: 'skip' },
      { uid: 'c_nope_3', defId: 'nope' }
    );

    // P1 đánh combo 5 lá
    GameStateManager.playCards(state, 'p1', ['c_taco_3', 'c_melon_3', 'c_att_3', 'c_skip_3', 'c_nope_3']);

    expect(state.pendingAction?.type).toBe('NOPE_WINDOW');
    expect(state.pendingAction?.nopeCount).toBe(0);

    // P2 đánh NOPE!
    GameStateManager.playCards(state, 'p2', ['p2_nope_3']);
    expect(state.pendingAction?.nopeCount).toBe(1);

    // P1 đánh NOPE lại Nope của P2!
    GameStateManager.playCards(state, 'p1', ['p1_extra_nope']);
    expect(state.pendingAction?.nopeCount).toBe(2);

    // Cửa sổ Nope kết thúc (P2 pass vì hết Nope)
    GameStateManager.passNope(state, 'p2');

    // Phải chuyển sang COMBO_FIVE_CHOOSE_DISCARD
    expect(state.pendingAction?.type).toBe('COMBO_FIVE_CHOOSE_DISCARD');
    expect(state.pendingAction?.initiatorId).toBe('p1');
  });

  it('Log khi Nope chính thức thành công phải có type là "info" để không bị xác nhận lần 2', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true }
    ];
    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0;
    state.players[1].hand.push({ uid: 'p2_nope_log', defId: 'nope' });
    state.players[0].hand.push({ uid: 'p1_attack_log', defId: 'attack' });

    // P1 đánh attack
    GameStateManager.playCards(state, 'p1', ['p1_attack_log']);
    expect(state.pendingAction?.type).toBe('NOPE_WINDOW');

    // P2 đánh Nope
    GameStateManager.playCards(state, 'p2', ['p2_nope_log']);
    expect(state.pendingAction?.nopeCount).toBe(1);

    // P1 pass (chấp nhận bị Nope)
    GameStateManager.passNope(state, 'p1');

    // Sau khi pass, action bị hủy và log thông báo có type 'info'
    expect(state.pendingAction).toBeNull();
    const finalLog = state.logs[state.logs.length - 1];
    expect(finalLog.message).toContain('đã chính thức bị NOPE');
    expect(finalLog.type).toBe('info');
  });

  it('passNope không tự ý kết thúc sớm nếu vẫn còn người cầm Nope chưa pass', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true },
      { id: 'p3', name: 'Player 3', isBot: true }
    ];
    const state = GameStateManager.createGame(players);
    state.currentPlayerIndex = 0;

    // P1 (người đánh) có lá Nope dự phòng
    state.players[0].hand.push({ uid: 'p1_backup_nope', defId: 'nope' });
    // P2 có lá Nope để chặn
    state.players[1].hand.push({ uid: 'p2_block_nope', defId: 'nope' });
    // P3 không có Nope
    state.players[2].hand = state.players[2].hand.filter(c => c.defId !== 'nope');

    // P1 đánh Skip
    state.players[0].hand.push({ uid: 'p1_skip', defId: 'skip' });
    GameStateManager.playCards(state, 'p1', ['p1_skip']);

    // P2 đánh Nope
    GameStateManager.playCards(state, 'p2', ['p2_block_nope']);
    expect(state.pendingAction?.nopeCount).toBe(1);

    // P3 (bot không có Nope) pass
    GameStateManager.passNope(state, 'p3');

    // Cửa sổ Nope VẪN PHẢI MỞ vì P1 còn giữ lá Nope và chưa bấm Pass!
    expect(state.pendingAction).not.toBeNull();
    expect(state.pendingAction?.type).toBe('NOPE_WINDOW');

    // P1 đánh Counter-Nope thành công
    GameStateManager.playCards(state, 'p1', ['p1_backup_nope']);
    expect(state.pendingAction?.nopeCount).toBe(2);

    // Bây giờ cả P2 và P3 đều pass
    GameStateManager.passNope(state, 'p2');
    GameStateManager.passNope(state, 'p3');

    // Hành động Skip được thực thi thành công, cửa sổ Nope đóng
    expect(state.pendingAction).toBeNull();
  });
});


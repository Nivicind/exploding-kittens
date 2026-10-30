import { describe, it, expect } from 'vitest';
import { GameStateManager } from '../src/engine/GameState';
import { CardRegistry } from '../src/engine/CardRegistry';

describe('Kiểm tra Khởi tạo Bộ bài & Người chơi (2 - 10 người)', () => {
  it('Khởi tạo đúng luật cho 4 người chơi (nhóm <= 5 người)', () => {
    const players = [
      { id: 'p1', name: 'Player 1', isBot: false },
      { id: 'p2', name: 'Player 2', isBot: true },
      { id: 'p3', name: 'Player 3', isBot: true },
      { id: 'p4', name: 'Player 4', isBot: true },
    ];

    const state = GameStateManager.createGame(players);

    expect(state.players.length).toBe(4);
    // Mỗi người phải có 1 Defuse + 7 lá thường = 8 lá
    for (const p of state.players) {
      expect(p.hand.length).toBe(8);
      const defuseCount = p.hand.filter(c => c.defId === 'defuse').length;
      expect(defuseCount).toBe(1);
    }

    // Số Mèo Nổ trong xấp rút phải là 4 - 1 = 3 lá
    const kittensInDrawPile = state.drawPile.filter(c => c.defId === 'exploding_kitten').length;
    expect(kittensInDrawPile).toBe(3);

    // Số Defuse dư trong xấp rút mặc định là 2
    const defusesInDrawPile = state.drawPile.filter(c => c.defId === 'defuse').length;
    expect(defusesInDrawPile).toBe(2);
  });

  it('Khởi tạo đúng cho 10 người chơi (nhóm 6 - 10 người)', () => {
    const players = Array.from({ length: 10 }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      isBot: i > 0
    }));

    const state = GameStateManager.createGame(players);

    expect(state.players.length).toBe(10);
    // Với 10 người: mỗi người nhận 1 Defuse + 4 lá thường = 5 lá
    for (const p of state.players) {
      expect(p.hand.length).toBe(5);
      expect(p.hand.some(c => c.defId === 'defuse')).toBe(true);
    }

    // Số Mèo Nổ trong xấp rút phải là 10 - 1 = 9 lá
    const kittensInDrawPile = state.drawPile.filter(c => c.defId === 'exploding_kitten').length;
    expect(kittensInDrawPile).toBe(9);

    // Xấp rút vẫn còn bài rút
    expect(state.drawPile.length).toBeGreaterThan(15);
  });

  it('Hỗ trợ Cấu hình Bộ bài Tùy chỉnh (Custom Deck Configuration)', () => {
    const players = [
      { id: 'p1', name: 'P1', isBot: false },
      { id: 'p2', name: 'P2', isBot: true }
    ];

    const customConfig = {
      handSize: 5,
      defuseInDeck: 4,
      cardCounts: {
        attack: 8,
        skip: 2
      }
    };

    const state = GameStateManager.createGame(players, customConfig);

    // Mỗi người cầm 1 Defuse + 5 lá thường = 6 lá
    expect(state.players[0].hand.length).toBe(6);
    expect(state.players[1].hand.length).toBe(6);

    // Số Defuse trong xấp rút = 4
    const defusesInDrawPile = state.drawPile.filter(c => c.defId === 'defuse').length;
    expect(defusesInDrawPile).toBe(4);

    // Số Mèo nổ = 2 - 1 = 1 lá
    const kittensInDrawPile = state.drawPile.filter(c => c.defId === 'exploding_kitten').length;
    expect(kittensInDrawPile).toBe(1);
  });
});


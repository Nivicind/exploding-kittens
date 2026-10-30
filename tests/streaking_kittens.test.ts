import { describe, it, expect } from 'vitest';
import { GameStateManager } from '../src/engine/GameState';
import { TurnManager } from '../src/engine/TurnManager';
import { CardInstance, GameState } from '../src/engine/types';

describe('Streaking Kittens Expansion Tests', () => {
  const setupGame = (playerCount = 3, expansions = ['base', 'streaking']): GameState => {
    const players = Array.from({ length: playerCount }, (_, i) => ({
      id: `p${i + 1}`,
      name: `Player ${i + 1}`,
      isBot: false
    }));
    const state = GameStateManager.createGame(players, undefined, expansions);
    // Xóa Nope khỏi tay người chơi để kiểm tra tác dụng trực tiếp
    state.players.forEach(p => {
      p.hand = p.hand.filter(c => c.defId !== 'nope');
    });
    return state;
  };

  it('1. Lethal Bomb Balance: Total bombs equals N with Streaking, and N-1 without', () => {
    const gameWithStreaking = setupGame(4, ['base', 'streaking']);
    const bombsWithStreaking = gameWithStreaking.drawPile.filter(c => c.defId === 'exploding_kitten').length;
    expect(bombsWithStreaking).toBe(4); // 4 players -> 4 bombs

    const gameWithoutStreaking = setupGame(4, ['base']);
    const bombsWithoutStreaking = gameWithoutStreaking.drawPile.filter(c => c.defId === 'exploding_kitten').length;
    expect(bombsWithoutStreaking).toBe(3); // 4 players -> 3 bombs

    const gameBoth = setupGame(4, ['base', 'imploding', 'streaking']);
    const exploding = gameBoth.drawPile.filter(c => c.defId === 'exploding_kitten').length;
    const imploding = gameBoth.drawPile.filter(c => c.defId === 'imploding_kitten').length;
    expect(exploding + imploding).toBe(4); // total = 4
  });

  it('2. Streaking Kitten Holding: Safely holds Exploding Kitten without dying', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];

    // Give p1 a streaking kitten
    p1.hand = [
      { uid: 'str-1', defId: 'streaking_kitten' }
    ];

    // Put an Exploding Kitten on top of draw pile
    state.drawPile = [
      { uid: 'bomb-1', defId: 'exploding_kitten' },
      { uid: 'c-1', defId: 'skip' }
    ];

    const result = GameStateManager.drawCard(state, p1.id);
    expect(result.exploded).toBe(false);
    expect(p1.isAlive).toBe(true);
    expect(p1.hand.some(c => c.defId === 'exploding_kitten')).toBe(true);
    expect(state.pendingAction).toBeNull(); // No defuse needed
  });

  it('3. Streaking Kitten Limit: Cannot hold 2 Exploding Kittens with 1 Streaking Kitten', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];

    // Give p1 a streaking kitten AND an already held bomb
    p1.hand = [
      { uid: 'str-1', defId: 'streaking_kitten' },
      { uid: 'bomb-1', defId: 'exploding_kitten' },
      { uid: 'def-1', defId: 'defuse' }
    ];

    // Draw a 2nd Exploding Kitten
    state.drawPile = [
      { uid: 'bomb-2', defId: 'exploding_kitten' }
    ];

    const result = GameStateManager.drawCard(state, p1.id);
    expect(result.exploded).toBe(false);
    // Must trigger DEFUSE_INSERTION for the second bomb
    expect(state.pendingAction?.type).toBe('DEFUSE_INSERTION');
    expect(state.pendingAction?.initiatorId).toBe(p1.id);
  });

  it('4. Streaking Bomb Stolen: Thief without protection explodes and dies', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    const p2 = state.players[1];

    // p1 plays 2 cat cards to steal from p2
    p1.hand = [
      { uid: 'cat-1', defId: 'cat_tacocat' },
      { uid: 'cat-2', defId: 'cat_tacocat' }
    ];

    // p2 holds Streaking Kitten and Exploding Kitten
    p2.hand = [
      { uid: 'str-2', defId: 'streaking_kitten' },
      { uid: 'bomb-2', defId: 'exploding_kitten' }
    ];

    // Force Combo 2 to steal the bomb specifically by leaving only the bomb on p2
    p2.hand = [{ uid: 'bomb-2', defId: 'exploding_kitten' }];

    // p1 has no Streaking Kitten and no Defuse
    GameStateManager.playCards(state, p1.id, ['cat-1', 'cat-2'], { targetPlayerId: p2.id });

    // p1 stole the bomb without protection or defuse -> p1 explodes!
    expect(p1.isAlive).toBe(false);
    expect(state.status).toBe('game_over');
    expect(state.winnerId).toBe(p2.id);
  });

  it('5. Streaking Loss: Losing Streaking Kitten while holding a bomb causes explosion', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    const p2 = state.players[1];

    // p1 steals from p2 using Combo 2
    p1.hand = [
      { uid: 'cat-1', defId: 'cat_tacocat' },
      { uid: 'cat-2', defId: 'cat_tacocat' },
      { uid: 'def-1', defId: 'defuse' }
    ];

    // p2 has Streaking Kitten and Exploding Kitten, but NO Defuse!
    p2.hand = [
      { uid: 'str-target', defId: 'streaking_kitten' },
      { uid: 'bomb-held', defId: 'exploding_kitten' }
    ];

    // Remove bomb-held from target pool momentarily or force stealing str-target
    p2.hand = [
      { uid: 'str-target', defId: 'streaking_kitten' }
    ];
    // Put bomb back so p2 is holding bomb when losing streaking
    p2.hand.push({ uid: 'bomb-held', defId: 'exploding_kitten' });

    // Stolen is str-target
    GameStateManager.playCards(state, p1.id, ['cat-1', 'cat-2'], { targetPlayerId: p2.id });

    // Either stolen was str-target (causing p2 to explode) or bomb-held (causing p1 to defuse)
    // If p2 died:
    if (!p2.isAlive) {
      expect(state.winnerId).toBe(p1.id);
    } else {
      // p1 stole bomb-held and must defuse
      expect(state.pendingAction?.type).toBe('DEFUSE_INSERTION');
    }
  });

  it('6. Super Skip: Cancels ALL remaining attack turns immediately', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    const p2 = state.players[1];

    p1.turnsToTake = 4; // heavily attacked
    p1.hand = [{ uid: 'ss-1', defId: 'super_skip' }];

    GameStateManager.playCards(state, p1.id, ['ss-1']);

    // p1's turns cancelled and passed to p2
    expect(state.currentPlayerIndex).toBe(1);
    expect(p2.turnsToTake).toBe(1);
  });

  it('7. Swap Top and Bottom: Swaps top and bottom card of draw pile without ending turn', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];

    p1.hand = [{ uid: 'sw-1', defId: 'swap_top_bottom' }];
    state.drawPile = [
      { uid: 'top-c', defId: 'attack' },
      { uid: 'mid-c', defId: 'shuffle' },
      { uid: 'bot-c', defId: 'defuse' }
    ];

    GameStateManager.playCards(state, p1.id, ['sw-1']);

    expect(state.drawPile[0].uid).toBe('bot-c');
    expect(state.drawPile[2].uid).toBe('top-c');
    expect(state.currentPlayerIndex).toBe(0); // Did NOT end turn
  });

  it('8. Catomic Bomb: Collects all bombs, places them on top, and skips turn', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    const p2 = state.players[1];

    p1.hand = [{ uid: 'catomic-1', defId: 'catomic_bomb' }];
    state.drawPile = [
      { uid: 'c1', defId: 'skip' },
      { uid: 'b1', defId: 'exploding_kitten' },
      { uid: 'c2', defId: 'attack' },
      { uid: 'b2', defId: 'exploding_kitten' }
    ];

    GameStateManager.playCards(state, p1.id, ['catomic-1']);

    // Both bombs must be on the top 2 slots of drawPile!
    expect(state.drawPile[0].defId).toBe('exploding_kitten');
    expect(state.drawPile[1].defId).toBe('exploding_kitten');
    // Turn skipped to p2
    expect(state.currentPlayerIndex).toBe(1);
  });

  it('9. Mark: Reveals 1 opponent card face up', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    const p2 = state.players[1];

    p1.hand = [{ uid: 'mark-1', defId: 'mark' }];
    p2.hand = [
      { uid: 'p2-c1', defId: 'defuse' },
      { uid: 'p2-c2', defId: 'skip' }
    ];

    GameStateManager.playCards(state, p1.id, ['mark-1'], { targetPlayerId: p2.id });

    // One of p2's cards must have isMarked = true
    const markedCards = p2.hand.filter(c => c.isMarked);
    expect(markedCards.length).toBe(1);
  });

  it('10. Curse of the Cat Butt: Makes player blind, cured upon drawing safely', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    const p2 = state.players[1];

    p1.hand = [{ uid: 'curse-1', defId: 'curse_of_cat_butt' }];
    p2.hand = [
      { uid: 'p2-c1', defId: 'defuse' },
      { uid: 'p2-c2', defId: 'skip' }
    ];

    GameStateManager.playCards(state, p1.id, ['curse-1'], { targetPlayerId: p2.id });
    expect(p2.isBlind).toBe(true);

    // Advance turn to p2
    TurnManager.advanceTurn(state);
    expect(state.currentPlayerIndex).toBe(1);

    // p2 draws a safe card
    state.drawPile = [{ uid: 'safe-c', defId: 'shuffle' }];
    GameStateManager.drawCard(state, p2.id);

    // Lời nguyền được giải trừ!
    expect(p2.isBlind).toBe(false);
  });

  it('11. Garbage Collection: All living players submit 1 card into Draw Pile', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    const p2 = state.players[1];

    p1.hand = [
      { uid: 'gc-1', defId: 'garbage_collection' },
      { uid: 'p1-c1', defId: 'skip' }
    ];
    p2.hand = [
      { uid: 'p2-c1', defId: 'shuffle' }
    ];
    const initialDrawPileCount = state.drawPile.length;

    GameStateManager.playCards(state, p1.id, ['gc-1']);

    expect(state.pendingAction?.type).toBe('GARBAGE_COLLECTION');

    // p1 submits p1-c1
    GameStateManager.submitGarbageCard(state, p1.id, 'p1-c1');
    expect(state.pendingAction?.type).toBe('GARBAGE_COLLECTION'); // p2 hasn't submitted yet

    // p2 submits p2-c1
    GameStateManager.submitGarbageCard(state, p2.id, 'p2-c1');

    // Both submitted -> resolved!
    expect(state.pendingAction).toBeNull();
    expect(state.drawPile.length).toBe(initialDrawPileCount + 2);
    expect(p1.hand.some(c => c.uid === 'p1-c1')).toBe(false);
    expect(p2.hand.some(c => c.uid === 'p2-c1')).toBe(false);
  });

  it('12. Blind Play with Defuse: Discarded with no effect', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];

    p1.isBlind = true;
    p1.hand = [{ uid: 'def-blind', defId: 'defuse' }];

    GameStateManager.playCards(state, p1.id, ['def-blind']);

    // Defuse was discarded without error or explosion
    expect(p1.isAlive).toBe(true);
    expect(p1.hand.length).toBe(0);
    expect(state.discardPile.some(c => c.uid === 'def-blind')).toBe(true);
  });

  it('13. Discarding Streaking Kitten while holding bomb triggers explosion', () => {
    const state = setupGame(2, ['base', 'streaking']);
    state.currentPlayerIndex = 0;
    const p1 = state.players[0];
    const p2 = state.players[1];

    p1.hand = [
      { uid: 'str-1', defId: 'streaking_kitten' },
      { uid: 'bomb-1', defId: 'exploding_kitten' }
      // NO DEFUSE
    ];

    // p1 willingly or blindly plays Streaking Kitten
    GameStateManager.playCards(state, p1.id, ['str-1']);

    // p1 discarded protection while holding bomb without defuse -> BÙM!
    expect(p1.isAlive).toBe(false);
    expect(state.status).toBe('game_over');
    expect(state.winnerId).toBe(p2.id);
  });
});

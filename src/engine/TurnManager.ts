import { GameState, PlayerState } from './types';

export class TurnManager {
  /**
   * Tìm vị trí người chơi còn sống kế tiếp theo chiều chơi (turnDirection)
   */
  static getNextAlivePlayerIndex(state: GameState, startIndex?: number, direction?: 1 | -1): number {
    const dir = direction !== undefined ? direction : state.turnDirection;
    const start = startIndex !== undefined ? startIndex : state.currentPlayerIndex;
    const n = state.players.length;

    for (let i = 1; i < n; i++) {
      const idx = (start + i * dir + n * 100) % n;
      if (state.players[idx].isAlive) {
        return idx;
      }
    }
    return start;
  }

  /**
   * Chuyển lượt sang người chơi tiếp theo
   */
  static advanceTurn(state: GameState): void {
    const current = state.players[state.currentPlayerIndex];
    
    // Nếu người chơi hiện tại vẫn còn lượt dồn (do Attack), tiếp tục lượt của họ
    if (current && current.isAlive && current.turnsToTake > 1) {
      current.turnsToTake -= 1;
      return;
    }

    if (current && current.isAlive) {
      current.turnsToTake = 1;
    }

    const nextIdx = this.getNextAlivePlayerIndex(state);
    state.currentPlayerIndex = nextIdx;
    if (state.players[nextIdx]) {
      state.players[nextIdx].turnsToTake = 1;
    }
  }

  /**
   * Xử lý lá bài Attack
   */
  static applyAttack(state: GameState): number {
    const current = state.players[state.currentPlayerIndex];
    const turnsRemaining = current.turnsToTake > 1 ? current.turnsToTake - 1 : 0;
    
    // Kết thúc ngay lượt của người hiện tại
    current.turnsToTake = 1;

    // Chuyển sang người kế tiếp và dồn 2 lượt + số lượt còn dư
    const nextIdx = this.getNextAlivePlayerIndex(state);
    state.currentPlayerIndex = nextIdx;
    
    // Nếu người kế tiếp đang có lượt hoặc dồn tiếp: +2 lượt
    state.players[nextIdx].turnsToTake = 2 + turnsRemaining;

    return nextIdx;
  }

  /**
   * Xử lý lá bài Targeted Attack (Tấn công chọn mục tiêu)
   */
  static applyTargetedAttack(state: GameState, targetPlayerId: string): number {
    const current = state.players[state.currentPlayerIndex];
    const turnsRemaining = current.turnsToTake > 1 ? current.turnsToTake - 1 : 0;

    // Kết thúc ngay lượt của người hiện tại
    current.turnsToTake = 1;

    // Chuyển sang mục tiêu được chỉ định
    const targetIdx = state.players.findIndex(p => p.id === targetPlayerId);
    if (targetIdx === -1) throw new Error('Mục tiêu không hợp lệ.');

    state.currentPlayerIndex = targetIdx;
    state.players[targetIdx].turnsToTake = 2 + turnsRemaining;

    return targetIdx;
  }

  /**
   * Xử lý lá bài Skip
   * Trả về true nếu người chơi kết thúc hoàn toàn lượt (chuyển sang người khác),
   * hoặc false nếu vẫn còn lượt do bị dồn Attack trước đó.
   */
  static applySkip(state: GameState): boolean {
    const current = state.players[state.currentPlayerIndex];
    if (current.turnsToTake > 1) {
      current.turnsToTake -= 1;
      return false; // Vẫn còn lượt tiếp theo
    } else {
      current.turnsToTake = 1;
      this.advanceTurn(state);
      return true; // Đã chuyển sang người tiếp theo
    }
  }

  /**
   * Xử lý lá bài Super Skip (kết thúc TOÀN BỘ lượt dồn của người chơi ngay lập tức)
   */
  static applySuperSkip(state: GameState): number {
    const current = state.players[state.currentPlayerIndex];
    if (current && current.isAlive) {
      current.turnsToTake = 1;
    }
    this.advanceTurn(state);
    return state.currentPlayerIndex;
  }

  /**
   * Đảo chiều chơi (Reverse - cho bản mở rộng Imploding Kittens)
   * Trả về true nếu người chơi kết thúc hoàn toàn lượt (chuyển sang người khác theo chiều mới),
   * hoặc false nếu vẫn còn lượt do bị dồn Attack trước đó (tiếp tục theo chiều mới).
   */
  static applyReverse(state: GameState): boolean {
    state.turnDirection = state.turnDirection === 1 ? -1 : 1;
    const current = state.players[state.currentPlayerIndex];
    if (current.turnsToTake > 1) {
      current.turnsToTake -= 1;
      return false; // Vẫn còn lượt nhưng đã đổi chiều
    } else {
      current.turnsToTake = 1;
      this.advanceTurn(state);
      return true; // Đã chuyển sang người tiếp theo theo chiều mới
    }
  }

  /**
   * Kiểm tra xem trò chơi đã kết thúc hay chưa (chỉ còn 1 người sống sót)
   */
  static checkWinner(state: GameState): string | null {
    const alivePlayers = state.players.filter(p => p.isAlive);
    if (alivePlayers.length === 1) {
      state.status = 'game_over';
      state.winnerId = alivePlayers[0].id;
      return alivePlayers[0].id;
    }
    if (alivePlayers.length === 0) {
      state.status = 'game_over';
      state.winnerId = null;
      return null;
    }
    return null;
  }
}


import { Server, Socket } from 'socket.io';
import { GameState, CustomDeckConfig, GameSettings } from '../engine/types';
import { GameStateManager } from '../engine/GameState';
import { ProbabilityBot } from '../engine/ai/ProbabilityBot';

export interface RoomPlayer {
  id: string;
  name: string;
  socketId?: string;
  isBot: boolean;
  disconnected?: boolean;
  disconnectedAt?: number;
}

export interface Room {
  id: string;
  hostId: string;
  players: RoomPlayer[];
  state: GameState | null;
  deckConfig?: CustomDeckConfig;
  settings?: GameSettings;
  nopeTimer?: NodeJS.Timeout | null;
  botLoopTimeout?: NodeJS.Timeout | null;
}

export class RoomManager {
  private io: Server;
  private rooms: Map<string, Room> = new Map();

  constructor(io: Server) {
    this.io = io;
  }

  generateRoomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  createRoom(
    hostName: string, 
    socketId: string, 
    botCount: number = 0, 
    config?: CustomDeckConfig,
    settings?: GameSettings
  ): Room {
    let roomId = this.generateRoomCode();
    while (this.rooms.has(roomId)) {
      roomId = this.generateRoomCode();
    }

    const hostPlayer: RoomPlayer = {
      id: `player_${Date.now()}_host`,
      name: hostName || 'Chủ Phòng',
      socketId,
      isBot: false
    };

    const players: RoomPlayer[] = [hostPlayer];

    const botNames = [
      'Mèo Mướp AI', 
      'Mèo Tam Thể AI', 
      'Mèo Vàng AI', 
      'Mèo Xiêm AI', 
      'Mèo Múp Míp AI',
      'Mèo Ba Tư AI',
      'Mèo Mun AI',
      'Mèo Tuxedo AI',
      'Mèo Sphynx AI'
    ];

    const safeBotCount = Math.min(9, Math.max(0, botCount));
    for (let i = 0; i < safeBotCount; i++) {
      players.push({
        id: `bot_${Date.now()}_${i + 1}`,
        name: botNames[i % botNames.length],
        isBot: true
      });
    }

    const room: Room = {
      id: roomId,
      hostId: hostPlayer.id,
      players,
      state: null,
      deckConfig: config,
      settings: settings || { nopeTimeoutSec: 5, botDelaySec: 2 }
    };

    this.rooms.set(roomId, room);
    return room;
  }

  updateSettings(roomId: string, settings: GameSettings): void {
    const room = this.getRoom(roomId);
    if (!room) return;
    room.settings = settings;
    if (room.state) {
      room.state.settings = settings;
    }
    this.broadcastRoom(room);
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId.toUpperCase());
  }

  joinRoom(roomId: string, playerName: string, socketId: string): { room?: Room; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) {
      return { error: 'Không tìm thấy phòng chơi.' };
    }
    if (room.state && room.state.status === 'playing') {
      return { error: 'Trận đấu trong phòng này đã bắt đầu.' };
    }
    if (room.players.length >= 10) {
      return { error: 'Phòng đã đạt tối đa 10 người chơi.' };
    }

    const newPlayer: RoomPlayer = {
      id: `player_${Date.now()}`,
      name: playerName || `Người chơi ${room.players.length + 1}`,
      socketId,
      isBot: false
    };

    room.players.push(newPlayer);
    return { room };
  }

  addBotToRoom(roomId: string): { room?: Room; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) return { error: 'Không tìm thấy phòng.' };
    if (room.players.length >= 10) return { error: 'Phòng đã đầy (10 người).' };
    if (room.state && room.state.status === 'playing') return { error: 'Trận đấu đang diễn ra.' };

    const botIndex = room.players.filter(p => p.isBot).length + 1;
    room.players.push({
      id: `bot_${Date.now()}_${botIndex}`,
      name: `Mèo AI #${botIndex}`,
      isBot: true
    });

    this.broadcastRoom(room);
    return { room };
  }

  /**
   * Đồng bộ trạng thái mất kết nối giữa RoomPlayer và PlayerState
   */
  private syncPlayerDisconnectedStatus(room: Room, playerId: string, disconnected: boolean): void {
    const p = room.players.find(x => x.id === playerId);
    if (p) p.disconnected = disconnected;
    if (room.state) {
      const sp = room.state.players.find(x => x.id === playerId);
      if (sp) sp.disconnected = disconnected;
    }
  }

  /**
   * Kiểm tra người chơi là Bot hoặc là người chơi đang mất kết nối
   */
  private isBotOrDisconnected(room: Room, playerId?: string): boolean {
    if (!playerId) return false;
    const p = room.players.find(x => x.id === playerId);
    return Boolean(p && (p.isBot || p.disconnected));
  }

  /**
   * Xử lý socket ngắt kết nối (mất mạng, tắt tab, refresh)
   */
  handleDisconnect(socketId: string): void {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.socketId === socketId);
      if (!player) continue;

      if (room.state && room.state.status === 'playing') {
        // Đang trong trận: đánh dấu mất kết nối, AI chơi hộ
        this.syncPlayerDisconnectedStatus(room, player.id, true);
        player.disconnectedAt = Date.now();
        GameStateManager.addLog(
          room.state,
          `📶 ${player.name} vừa mất kết nối mạng. AI Bot sẽ tạm thời chơi hộ!`,
          'info',
          player.id
        );
        this.broadcastRoom(room);
        this.triggerBotCycle(room);
      } else {
        // Đang trong sảnh chờ: xóa người chơi khỏi phòng
        this.removePlayer(room.id, player.id);
      }
    }
  }

  /**
   * Kết nối lại ván đấu từ sessionStorage
   */
  reconnectPlayer(roomId: string, playerId: string, newSocketId: string): { success: boolean; room?: Room; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) {
      return { success: false, error: 'Phòng không tồn tại hoặc đã kết thúc.' };
    }
    const player = room.players.find(p => p.id === playerId);
    if (!player) {
      return { success: false, error: 'Không tìm thấy người chơi trong phòng.' };
    }

    player.socketId = newSocketId;
    this.syncPlayerDisconnectedStatus(room, player.id, false);
    delete player.disconnectedAt;

    if (room.state && room.state.status === 'playing') {
      GameStateManager.addLog(
        room.state,
        `✅ ${player.name} đã kết nối lại ván đấu!`,
        'info',
        player.id
      );
    }

    this.broadcastRoom(room);
    return { success: true, room };
  }

  /**
   * Người chơi chủ động rời phòng
   */
  leaveRoom(roomId: string, playerId: string): { success: boolean; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) return { success: true };

    const player = room.players.find(p => p.id === playerId);
    if (!player) return { success: true };

    if (room.state && room.state.status === 'playing') {
      // Ván đấu đang diễn ra: chuyển thành Bot AI vĩnh viễn để ván đấu của người khác tiếp tục bình thường
      player.isBot = true;
      player.name = `${player.name} (Bot)`;
      player.socketId = undefined;
      player.disconnected = false;

      const statePlayer = room.state.players.find(p => p.id === playerId);
      if (statePlayer) {
        statePlayer.isBot = true;
        statePlayer.name = `${statePlayer.name} (Bot)`;
        statePlayer.disconnected = false;
      }

      GameStateManager.addLog(
        room.state,
        `👋 ${player.name} đã rời bàn đấu. Bot AI sẽ tiếp quản nhân vật này!`,
        'info',
        player.id
      );
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } else {
      // Đang ở phòng chờ: xóa hẳn người chơi
      this.removePlayer(roomId, playerId);
    }

    return { success: true };
  }

  removePlayer(roomId: string, playerId: string): void {
    const room = this.getRoom(roomId);
    if (!room) return;

    room.players = room.players.filter(p => p.id !== playerId);
    if (room.players.length === 0) {
      if (room.nopeTimer) clearTimeout(room.nopeTimer);
      if (room.botLoopTimeout) clearTimeout(room.botLoopTimeout);
      this.rooms.delete(roomId);
    } else {
      if (room.hostId === playerId) {
        room.hostId = room.players[0].id;
      }
      this.broadcastRoom(room);
    }
  }

  updateDeckConfig(roomId: string, config: CustomDeckConfig): void {
    const room = this.getRoom(roomId);
    if (!room) return;
    room.deckConfig = config;
    this.broadcastRoom(room);
  }

  startGame(roomId: string): { success: boolean; error?: string } {
    const room = this.getRoom(roomId);
    if (!room) return { success: false, error: 'Không tìm thấy phòng.' };
    if (room.players.length < 2) return { success: false, error: 'Cần ít nhất 2 người chơi hoặc thêm AI Bot để bắt đầu.' };

    try {
      room.state = GameStateManager.createGame(
        room.players.map(p => ({ id: p.id, name: p.name, isBot: p.isBot })),
        room.deckConfig,
        ['base'],
        room.settings
      );

      this.broadcastRoom(room);
      this.triggerBotCycle(room);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Lỗi khởi tạo game.' };
    }
  }

  drawCard(roomId: string, playerId: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.drawCard(room.state, playerId);
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, playerId, e.message);
    }
  }

  playCards(
    roomId: string, 
    playerId: string, 
    cardUids: string[], 
    options?: { targetPlayerId?: string; targetCardDefId?: string }
  ): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.playCards(room.state, playerId, cardUids, options);

      // Nếu có cửa sổ Nope được mở
      if (room.state.pendingAction && room.state.pendingAction.type === 'NOPE_WINDOW') {
        this.startNopeCountdown(room);
      }

      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, playerId, e.message);
    }
  }

  passNope(roomId: string, playerId: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    GameStateManager.passNope(room.state, playerId);

    // Nếu cửa sổ Nope đã được giải quyết xong, hủy timer đếm ngược
    if (!room.state.pendingAction || room.state.pendingAction.type !== 'NOPE_WINDOW') {
      if (room.nopeTimer) {
        clearTimeout(room.nopeTimer);
        room.nopeTimer = null;
      }
    }

    this.broadcastRoom(room);
    // Luôn kích hoạt triggerBotCycle để nếu giải quyết xong thì bot tiếp tục hành động ngay
    this.triggerBotCycle(room);
  }

  insertDefuse(roomId: string, playerId: string, insertIndex: number): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.insertExplodingKitten(room.state, playerId, insertIndex);
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, playerId, e.message);
    }
  }

  insertImplodingKitten(roomId: string, playerId: string, insertIndex: number): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.insertImplodingKitten(room.state, playerId, insertIndex);
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, playerId, e.message);
    }
  }

  selectTargetedAttack(roomId: string, playerId: string, targetPlayerId: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.selectTargetedAttack(room.state, playerId, targetPlayerId);
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, playerId, e.message);
    }
  }

  reorderAlterFuture(roomId: string, playerId: string, newCards: any[]): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.reorderAlterFuture(room.state, playerId, newCards);
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, playerId, e.message);
    }
  }

  closeAlterFuture(roomId: string, playerId: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    GameStateManager.closeAlterFuture(room.state, playerId);
    this.broadcastRoom(room);
    this.triggerBotCycle(room);
  }

  drawFromBottom(roomId: string, playerId: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.drawFromBottom(room.state, playerId);
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, playerId, e.message);
    }
  }

  selectFavorTarget(roomId: string, playerId: string, targetPlayerId: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.selectFavorTarget(room.state, playerId, targetPlayerId);
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, playerId, e.message);
    }
  }

  giveFavorCard(roomId: string, targetPlayerId: string, cardUid: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.giveFavorCard(room.state, targetPlayerId, cardUid);
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, targetPlayerId, e.message);
    }
  }

  pickDiscard(roomId: string, playerId: string, cardUid: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    try {
      GameStateManager.pickDiscardForComboFive(room.state, playerId, cardUid);
      this.broadcastRoom(room);
      this.triggerBotCycle(room);
    } catch (e: any) {
      this.emitErrorToPlayer(room, playerId, e.message);
    }
  }

  closeSeeFuture(roomId: string, playerId: string): void {
    const room = this.getRoom(roomId);
    if (!room || !room.state) return;

    GameStateManager.closeSeeFuture(room.state, playerId);
    this.broadcastRoom(room);
    this.triggerBotCycle(room);
  }

  /**
   * Quản lý đếm ngược Autorun cho cửa sổ NOPE
   */
  private startNopeCountdown(room: Room): void {
    if (room.nopeTimer) {
      clearTimeout(room.nopeTimer);
      room.nopeTimer = null;
    }

    const timeoutMs = room.state?.pendingAction?.timeoutMs 
      ? room.state.pendingAction.timeoutMs + 200 
      : ((room.settings?.nopeTimeoutSec ?? room.state?.settings?.nopeTimeoutSec ?? 5) * 1000 + 200);

    room.nopeTimer = setTimeout(() => {
      if (room.state && room.state.pendingAction?.type === 'NOPE_WINDOW') {
        GameStateManager.resolvePendingAction(room.state);
        this.broadcastRoom(room);
      }
      if (room.nopeTimer) {
        clearTimeout(room.nopeTimer);
        room.nopeTimer = null;
      }
      // Đảm bảo luôn đánh thức chu kỳ của bot khi hết thời gian Nope
      this.triggerBotCycle(room);
    }, timeoutMs);
  }

  /**
   * Vòng lặp điều khiển AI Bot suy nghĩ và hành động
   */
  private triggerBotCycle(room: Room): void {
    if (!room.state || room.state.status !== 'playing') return;

    if (room.botLoopTimeout) {
      clearTimeout(room.botLoopTimeout);
      room.botLoopTimeout = null;
    }

    const botDelaySec = room.settings?.botDelaySec ?? room.state?.settings?.botDelaySec ?? 2;
    const baseBotDelay = Math.max(1000, botDelaySec * 1000);
    const reactionDelay = Math.max(1200, Math.round(baseBotDelay * 0.75));

    // 0. Nếu Bot vừa xem trộm See The Future, tự động đóng để tiếp tục ván đấu
    if (room.state.peekCards) {
      const peekPlayer = room.players.find(p => p.id === room.state?.peekCards?.playerId);
      if (this.isBotOrDisconnected(room, peekPlayer?.id)) {
        room.botLoopTimeout = setTimeout(() => {
          if (room.state?.peekCards && peekPlayer) {
            GameStateManager.closeSeeFuture(room.state, peekPlayer.id);
            this.broadcastRoom(room);
            this.triggerBotCycle(room);
          }
        }, reactionDelay);
        return;
      }
    }

    // 1. Phản ứng với Pending Action nếu Bot là mục tiêu hoặc đang trong Nope window
    const pending = room.state.pendingAction;
    if (pending) {
      // Bot cần giấu lại bom sau khi dùng Defuse (kéo dài thêm thời gian để người chơi khác kịp thấy hiệu ứng nổ bom)
      if (pending.type === 'DEFUSE_INSERTION') {
        const bot = room.players.find(p => p.id === pending.initiatorId && (p.isBot || p.disconnected));
        if (bot) {
          const defuseDelay = Math.max(2600, Math.round(baseBotDelay * 1.3));
          room.botLoopTimeout = setTimeout(() => {
            if (!room.state) return;
            const dec = ProbabilityBot.makeDecision(room.state, bot.id);
            this.insertDefuse(room.id, bot.id, dec.insertIndex ?? 0);
          }, defuseDelay);
          return;
        }
      }

      // Bot đánh Favor cần chọn người chơi mục tiêu
      if (pending.type === 'FAVOR_CHOOSE_PLAYER') {
        const bot = room.players.find(p => p.id === pending.initiatorId && (p.isBot || p.disconnected));
        if (bot) {
          room.botLoopTimeout = setTimeout(() => {
            if (!room.state) return;
            const opponents = room.state.players.filter(p => p.isAlive && p.id !== bot.id && p.hand.length > 0);
            if (opponents.length > 0) {
              const target = opponents.sort((a, b) => b.hand.length - a.hand.length)[0];
              this.selectFavorTarget(room.id, bot.id, target.id);
            }
          }, reactionDelay);
          return;
        }
      }

      // Bot bị người khác Favor đòi đưa bài
      if (pending.type === 'FAVOR_GIVE_CARD') {
        const bot = room.players.find(p => p.id === pending.targetPlayerId && (p.isBot || p.disconnected));
        if (bot) {
          room.botLoopTimeout = setTimeout(() => {
            if (!room.state) return;
            const dec = ProbabilityBot.makeDecision(room.state, bot.id);
            if (dec.action === 'GIVE_FAVOR' && dec.cardUids?.[0]) {
              this.giveFavorCard(room.id, bot.id, dec.cardUids[0]);
            } else {
              // Dự phòng nếu bot không chọn được lá: đưa lá đầu tiên trên tay
              const botState = room.state.players.find(p => p.id === bot.id);
              if (botState && botState.hand.length > 0) {
                this.giveFavorCard(room.id, bot.id, botState.hand[0].uid);
              }
            }
          }, reactionDelay);
          return;
        }
      }

      // Bot chọn bài từ Discard Pile (Combo 5 lá)
      if (pending.type === 'COMBO_FIVE_CHOOSE_DISCARD') {
        const bot = room.players.find(p => p.id === pending.initiatorId && (p.isBot || p.disconnected));
        if (bot) {
          room.botLoopTimeout = setTimeout(() => {
            if (!room.state) return;
            const dec = ProbabilityBot.makeDecision(room.state, bot.id);
            if (dec.action === 'PICK_DISCARD' && dec.pickDiscardUid) {
              this.pickDiscard(room.id, bot.id, dec.pickDiscardUid);
            } else if (room.state.discardPile.length > 0) {
              this.pickDiscard(room.id, bot.id, room.state.discardPile[0].uid);
            }
          }, reactionDelay);
          return;
        }
      }

      // Bot nhét lại Mèo Tự Nổ (Imploding Kitten)
      if (pending.type === 'IMPLODING_INSERTION') {
        const bot = room.players.find(p => p.id === pending.initiatorId && (p.isBot || p.disconnected));
        if (bot) {
          room.botLoopTimeout = setTimeout(() => {
            if (!room.state) return;
            const dec = ProbabilityBot.makeDecision(room.state, bot.id);
            this.insertImplodingKitten(room.id, bot.id, dec.insertIndex ?? 0);
          }, reactionDelay);
          return;
        }
      }

      // Bot sắp xếp lại bài trong Alter the Future
      if (pending.type === 'ALTER_THE_FUTURE') {
        const bot = room.players.find(p => p.id === pending.initiatorId && (p.isBot || p.disconnected));
        if (bot) {
          room.botLoopTimeout = setTimeout(() => {
            if (!room.state) return;
            const dec = ProbabilityBot.makeDecision(room.state, bot.id);
            if (dec.action === 'REORDER_ALTER_FUTURE' && dec.alterCardUids) {
              const currentCards = room.state.alterCards?.cards || room.state.drawPile.slice(0, 3);
              const reordered = dec.alterCardUids.map(uid => currentCards.find(c => c.uid === uid)!).filter(Boolean);
              this.reorderAlterFuture(room.id, bot.id, reordered);
            } else {
              this.closeAlterFuture(room.id, bot.id);
            }
          }, reactionDelay);
          return;
        }
      }

      // Bot chọn mục tiêu cho Targeted Attack
      if (pending.type === 'TARGETED_ATTACK_CHOOSE_PLAYER') {
        const bot = room.players.find(p => p.id === pending.initiatorId && (p.isBot || p.disconnected));
        if (bot) {
          room.botLoopTimeout = setTimeout(() => {
            if (!room.state) return;
            const dec = ProbabilityBot.makeDecision(room.state, bot.id);
            if (dec.action === 'SELECT_TARGETED_ATTACK' && dec.targetPlayerId) {
              this.selectTargetedAttack(room.id, bot.id, dec.targetPlayerId);
            } else {
              const opponents = room.state.players.filter(p => p.isAlive && p.id !== bot.id);
              if (opponents.length > 0) {
                this.selectTargetedAttack(room.id, bot.id, opponents[0].id);
              }
            }
          }, reactionDelay);
          return;
        }
      }

      // Trong cửa sổ NOPE
      if (pending.type === 'NOPE_WINDOW') {
        const bots = room.players.filter(p => p.isBot || p.disconnected);
        for (const b of bots) {
          if (!pending.passedPlayerIds.includes(b.id)) {
            const dec = ProbabilityBot.makeDecision(room.state, b.id);
            if (dec.action === 'NOPE' && dec.cardUids && dec.cardUids.length > 0) {
              room.botLoopTimeout = setTimeout(() => {
                this.playCards(room.id, b.id, dec.cardUids!);
              }, reactionDelay);
              return;
            } else {
              // Bot tự động pass cửa sổ Nope nếu không đánh
              this.passNope(room.id, b.id);
            }
          }
        }
        return;
      }
    }

    // 2. Nếu đến lượt chính của một Bot hoặc người chơi đang mất kết nối
    const currentPlayer = room.state.players[room.state.currentPlayerIndex];
    if (currentPlayer && currentPlayer.isAlive && !room.state.pendingAction && this.isBotOrDisconnected(room, currentPlayer.id)) {
      room.botLoopTimeout = setTimeout(() => {
        if (!room.state || room.state.status !== 'playing') return;
        const currentNow = room.state.players[room.state.currentPlayerIndex];
        if (!currentNow || currentNow.id !== currentPlayer.id) return;

        try {
          const decision = ProbabilityBot.makeDecision(room.state, currentPlayer.id);

          if (decision.action === 'DRAW') {
            this.drawCard(room.id, currentPlayer.id);
          } else if (decision.action === 'PLAY_CARD' && decision.cardUids && decision.cardUids.length > 0) {
            this.playCards(room.id, currentPlayer.id, decision.cardUids, {
              targetPlayerId: decision.targetPlayerId,
              targetCardDefId: decision.targetCardDefId
            });
          } else {
            // Dự phòng an toàn: nếu không có quyết định nào, rút bài để tiếp tục ván đấu
            this.drawCard(room.id, currentPlayer.id);
          }
        } catch (err) {
          console.error('[Bot Error]', err);
          // Khi xảy ra bất kỳ lỗi ngoài ý muốn nào, Bot tự động rút bài để tránh treo lượt
          try {
            this.drawCard(room.id, currentPlayer.id);
          } catch (drawErr) {
            console.error('[Bot Draw Error]', drawErr);
          }
        }
      }, baseBotDelay);
    }
  }

  broadcastRoom(room: Room): void {
    this.io.to(room.id).emit('room_update', {
      id: room.id,
      hostId: room.hostId,
      players: room.players,
      state: room.state,
      deckConfig: room.deckConfig,
      settings: room.settings
    });
  }

  emitErrorToPlayer(room: Room, playerId: string, error: string): void {
    const player = room.players.find(p => p.id === playerId);
    if (player?.socketId) {
      this.io.to(player.socketId).emit('game_error', { message: error });
    }
  }
}

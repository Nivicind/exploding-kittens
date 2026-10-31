export type CardType = 
  | 'KITTEN' 
  | 'DEFUSE' 
  | 'ATTACK' 
  | 'SKIP' 
  | 'FAVOR' 
  | 'SHUFFLE' 
  | 'SEE_THE_FUTURE' 
  | 'NOPE' 
  | 'CAT'
  | 'STREAKING'
  | 'ACTION';

export interface CardDefinition {
  id: string;
  name: string;             // Song ngữ: vd "Tấn Công (Attack)"
  nameEn: string;           // "Attack"
  nameVi: string;           // "Tấn Công"
  type: CardType;
  expansion: 'base' | 'imploding' | 'streaking' | 'barking';
  description: string;
  flavorText?: string;
  color: string;            // Tailwind color class or hex
  icon: string;             // Icon name or emoji
  defaultCount: number;     // Số lá mặc định trong bộ gốc
}

export interface CardInstance {
  uid: string;              // Unique ID cho mỗi lá bài (vd: 'attack-1')
  defId: string;            // Trỏ tới CardDefinition.id
  isFaceUp?: boolean;       // Cho Imploding Kitten sau này
  isMarked?: boolean;       // Cho Streaking Kitten Mark sau này
}

export interface PlayerState {
  id: string;
  name: string;
  isBot: boolean;
  isAlive: boolean;
  hand: CardInstance[];
  turnsToTake: number;      // Thường là 1, nhưng có thể bị dồn Attack
  isBlind?: boolean;        // Cho mở rộng Streaking
  disconnected?: boolean;   // Đang mất kết nối mạng (AI chơi hộ)
}

export interface GameLogEntry {
  id: string;
  timestamp: number;
  message: string;
  type: 'info' | 'play' | 'nope' | 'explode' | 'defuse' | 'combo' | 'win';
  playerId?: string;
}

export type PendingActionType = 
  | 'NOPE_WINDOW'
  | 'DEFUSE_INSERTION'
  | 'IMPLODING_INSERTION'
  | 'SEE_THE_FUTURE'
  | 'ALTER_THE_FUTURE'
  | 'FAVOR_CHOOSE_PLAYER'
  | 'FAVOR_GIVE_CARD'
  | 'TARGETED_ATTACK_CHOOSE_PLAYER'
  | 'COMBO_TWO_CHOOSE_PLAYER'
  | 'COMBO_THREE_CHOOSE_TARGET'
  | 'COMBO_FIVE_CHOOSE_DISCARD'
  | 'MARK_CHOOSE_PLAYER'
  | 'CURSE_CAT_BUTT_CHOOSE_PLAYER'
  | 'GARBAGE_COLLECTION';

export interface PendingAction {
  type: PendingActionType;
  initiatorId: string;          // Người chơi bắt đầu hành động
  targetPlayerId?: string;      // Mục tiêu (nếu có)
  cardsPlayed: CardInstance[];  // Lá bài vừa đánh
  cardDefId?: string;           // Tên lá bài muốn đòi (cho combo 3)
  timeoutMs: number;
  expiresAt: number;
  nopeCount: number;            // 0: bình thường, 1: bị nope, 2: nope lại (yup)...
  passedPlayerIds: string[];    // Những người đã ấn Pass cửa sổ Nope
  alterCards?: CardInstance[];  // 3 hoặc 5 lá đang được xếp lại cho Alter the Future
  garbagePicks?: Record<string, string>; // playerId -> cardUid cho Garbage Collection
  advanceTurnOnComplete?: boolean; // Chuyển lượt khi hoàn tất Defuse (mặc định true khi rút bài, false khi gỡ do bị cướp)
}

export interface CustomDeckConfig {
  handSize: number;             // Số bài thường chia ban đầu (chuẩn: 7 cho <=5 người, 4 cho >5 người)
  defuseInDeck: number;         // Số defuse dư cho vào xấp rút (mặc định: 2)
  cardCounts: Record<string, number>; // Số lượng từng lá bài
  explodingKittensCount?: number; // Tùy chỉnh riêng số Mèo Nổ
  implodingKittensCount?: number; // Tùy chỉnh riêng số Mèo Tự Nổ
  streakingKittensCount?: number; // Tùy chỉnh riêng số Mèo Khỏa Thân (0 hoặc 1)
  activeExpansions?: string[];  // ['base', 'imploding', 'streaking']
}

export interface GameSettings {
  nopeTimeoutSec: number;       // Thời gian chờ đánh NOPE (giây, mặc định 5s)
  botDelaySec: number;          // Thời gian suy nghĩ của AI Bot (giây, mặc định 2s)
}

export interface GameState {
  id: string;
  status: 'lobby' | 'playing' | 'game_over';
  players: PlayerState[];
  drawPile: CardInstance[];
  discardPile: CardInstance[];
  currentPlayerIndex: number;
  turnDirection: 1 | -1;        // 1: thuận chiều kim đồng hồ, -1: ngược chiều
  pendingAction: PendingAction | null;
  winnerId: string | null;
  logs: GameLogEntry[];
  activeExpansions: string[];
  deckConfig?: CustomDeckConfig;
  settings?: GameSettings;
  peekCards?: { playerId: string; cards: CardInstance[] } | null;
  alterCards?: { playerId: string; cards: CardInstance[] } | null;
}


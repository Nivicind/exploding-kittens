import { CardDefinition } from './types';
import { BASE_GAME_CARDS } from './packs/BaseGamePack';
import { IMPLODING_KITTENS_CARDS } from './packs/ImplodingKittensPack';
import { STREAKING_KITTENS_CARDS } from './packs/StreakingKittensPack';

export class CardRegistry {
  private static cards: Map<string, CardDefinition> = new Map();
  private static packs: Map<string, { name: string; cards: CardDefinition[] }> = new Map();

  static init() {
    this.cards.clear();
    this.packs.clear();

    // Đăng ký Base Game Pack mặc định
    this.registerPack('base', 'Bộ Mèo Nổ Gốc (Original Edition)', BASE_GAME_CARDS);
    // Đăng ký Imploding Kittens Pack
    this.registerPack('imploding', 'Mở Rộng: Mèo Tự Nổ (Imploding Kittens)', IMPLODING_KITTENS_CARDS);
    // Đăng ký Streaking Kittens Pack
    this.registerPack('streaking', 'Mở Rộng: Mèo Khỏa Thân (Streaking Kittens)', STREAKING_KITTENS_CARDS);
  }

  static registerPack(packId: string, packName: string, cards: CardDefinition[]) {
    this.packs.set(packId, { name: packName, cards });
    for (const card of cards) {
      this.cards.set(card.id, card);
    }
  }

  static getCard(defId: string): CardDefinition | undefined {
    if (this.cards.size === 0) {
      this.init();
    }
    return this.cards.get(defId);
  }

  static getAllCards(activePacks: string[] = ['base']): CardDefinition[] {
    if (this.cards.size === 0) {
      this.init();
    }
    const result: CardDefinition[] = [];
    for (const packId of activePacks) {
      const pack = this.packs.get(packId);
      if (pack) {
        result.push(...pack.cards);
      }
    }
    return result;
  }

  static getPacks() {
    if (this.packs.size === 0) {
      this.init();
    }
    return Array.from(this.packs.entries()).map(([id, p]) => ({ id, name: p.name, count: p.cards.length }));
  }
}

// Khởi tạo ngay khi module được import
CardRegistry.init();


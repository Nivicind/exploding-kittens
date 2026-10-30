export type Language = 'vi' | 'en';

export interface CardI18n {
  name: string;
  badge: string;
  subName: string;
  description: string;
}

export const CARD_I18N: Record<string, { vi: CardI18n; en: CardI18n }> = {
  exploding_kitten: {
    vi: {
      name: 'Mèo Nổ',
      badge: 'MÈO NỔ',
      subName: 'Exploding Kitten',
      description: 'Bạn phải ngửa lá này ngay lập tức. Nếu không có lá Gỡ Bom (Defuse), bạn sẽ NỔ TUNG và bị loại!'
    },
    en: {
      name: 'Exploding Kitten',
      badge: 'BOMB',
      subName: 'Mèo Nổ',
      description: 'Show immediately! If you don\'t have a Defuse card, you explode and are out of the game.'
    }
  },
  defuse: {
    vi: {
      name: 'Gỡ Bom',
      badge: 'GỠ BOM',
      subName: 'Defuse',
      description: 'Cứu bạn khi rút phải Mèo Nổ. Bí mật nhét lại Mèo Nổ vào bất kỳ vị trí nào trong xấp bài rút.'
    },
    en: {
      name: 'Defuse',
      badge: 'DEFUSE',
      subName: 'Gỡ Bom',
      description: 'Saves you from an Exploding Kitten. Secretly reinsert the bomb anywhere into the draw pile.'
    }
  },
  attack: {
    vi: {
      name: 'Tấn Công 2X',
      badge: 'TẤN CÔNG',
      subName: 'Attack 2x',
      description: 'Kết thúc lượt ngay mà không cần rút bài. Ép người tiếp theo phải đi 2 lượt liên tiếp.'
    },
    en: {
      name: 'Attack 2X',
      badge: 'ATTACK',
      subName: 'Tấn Công',
      description: 'End your turn without drawing. Force the next player to take 2 turns in a row.'
    }
  },
  skip: {
    vi: {
      name: 'Bỏ Lượt',
      badge: 'BỎ LƯỢT',
      subName: 'Skip',
      description: 'Kết thúc lượt của bạn ngay lập tức mà không cần rút bài. Nếu bị dồn Attack chỉ hủy 1 lượt.'
    },
    en: {
      name: 'Skip',
      badge: 'SKIP',
      subName: 'Bỏ Lượt',
      description: 'Immediately end your turn without drawing a card. Only cancels 1 turn if attacked.'
    }
  },
  favor: {
    vi: {
      name: 'Xin Xỏ',
      badge: 'XIN XỎ',
      subName: 'Favor',
      description: 'Ép một người chơi khác bất kỳ phải tự chọn và đưa cho bạn 1 lá bài từ tay của họ.'
    },
    en: {
      name: 'Favor',
      badge: 'FAVOR',
      subName: 'Xin Xỏ',
      description: 'Force any player to give you 1 card of their choice from their hand.'
    }
  },
  shuffle: {
    vi: {
      name: 'Xào Bài',
      badge: 'XÀO BÀI',
      subName: 'Shuffle',
      description: 'Xáo trộn ngẫu nhiên toàn bộ xấp bài rút. Hữu ích khi biết bom đang ở trên cùng.'
    },
    en: {
      name: 'Shuffle',
      badge: 'SHUFFLE',
      subName: 'Xào Bài',
      description: 'Thoroughly shuffle the draw pile. Great when you know an Exploding Kitten is on top.'
    }
  },
  see_the_future: {
    vi: {
      name: 'Xem Tương Lai 3X',
      badge: 'TƯƠNG LAI',
      subName: 'See Future',
      description: 'Bí mật xem trộm 3 lá bài trên cùng của xấp bài rút mà không làm thay đổi thứ tự.'
    },
    en: {
      name: 'See the Future',
      badge: 'FUTURE 3X',
      subName: 'Xem Tương Lai',
      description: 'Privately view the top 3 cards of the draw pile without reordering them.'
    }
  },
  nope: {
    vi: {
      name: 'Chặn (Nope!)',
      badge: 'NOPE!',
      subName: 'Nope',
      description: 'Hủy bỏ hành động của người khác (trừ Mèo Nổ và Defuse). Có thể đánh bất kỳ lúc nào!'
    },
    en: {
      name: 'Nope!',
      badge: 'NOPE!',
      subName: 'Chặn Bài',
      description: 'Stop any action except an Exploding Kitten or Defuse. Play at any time!'
    }
  },
  cat_tacocat: {
    vi: {
      name: 'Mèo Taco',
      badge: 'TACO CAT',
      subName: 'TacoCat',
      description: 'Lá mèo vô tri. Ghép đôi để cướp ngẫu nhiên 1 lá, ghép 3 để đòi đích danh lá bài.'
    },
    en: {
      name: 'TacoCat',
      badge: 'TACO CAT',
      subName: 'Mèo Taco',
      description: 'Cat card. Pair to steal 1 random card, 3-of-a-kind to name and steal a specific card.'
    }
  },
  cat_potato: {
    vi: {
      name: 'Mèo Khoai Tây',
      badge: 'KHOAI TÂY',
      subName: 'Potato Cat',
      description: 'Lá mèo vô tri. Ghép đôi để cướp ngẫu nhiên 1 lá, ghép 3 để đòi đích danh lá bài.'
    },
    en: {
      name: 'Hairy Potato Cat',
      badge: 'POTATO CAT',
      subName: 'Mèo Khoai Tây',
      description: 'Cat card. Pair to steal 1 random card, 3-of-a-kind to name and steal a specific card.'
    }
  },
  cat_cattermelon: {
    vi: {
      name: 'Mèo Dưa Hấu',
      badge: 'DƯA HẤU',
      subName: 'Cattermelon',
      description: 'Lá mèo vô tri. Ghép đôi để cướp ngẫu nhiên 1 lá, ghép 3 để đòi đích danh lá bài.'
    },
    en: {
      name: 'Cattermelon',
      badge: 'CATTERMELON',
      subName: 'Mèo Dưa Hấu',
      description: 'Cat card. Pair to steal 1 random card, 3-of-a-kind to name and steal a specific card.'
    }
  },
  cat_beard: {
    vi: {
      name: 'Mèo Râu Xồm',
      badge: 'RÂU XỒM',
      subName: 'Beard Cat',
      description: 'Lá mèo vô tri. Ghép đôi để cướp ngẫu nhiên 1 lá, ghép 3 để đòi đích danh lá bài.'
    },
    en: {
      name: 'Beard Cat',
      badge: 'BEARD CAT',
      subName: 'Mèo Râu Xồm',
      description: 'Cat card. Pair to steal 1 random card, 3-of-a-kind to name and steal a specific card.'
    }
  },
  cat_rainbow: {
    vi: {
      name: 'Mèo Cầu Vồng',
      badge: 'CẦU VỒNG',
      subName: 'Rainbow Cat',
      description: 'Lá mèo vô tri. Ghép đôi để cướp ngẫu nhiên 1 lá, ghép 3 để đòi đích danh lá bài.'
    },
    en: {
      name: 'Rainbow Cat',
      badge: 'RAINBOW CAT',
      subName: 'Mèo Cầu Vồng',
      description: 'Cat card. Pair to steal 1 random card, 3-of-a-kind to name and steal a specific card.'
    }
  }
};

export const UI_TEXT = {
  vi: {
    // Header
    gameTitle: 'MÈO NỔ',
    turnLabel: 'Lượt:',
    cardsCount: 'lá',
    leaveTable: 'Rời Bàn',
    mute: 'Tắt âm',
    unmute: 'Bật âm',
    yourHandTitle: 'Bài của bạn',

    // Opponent Avatars
    aiTag: 'AI',
    isTurnTag: 'Đang đi',
    bombTag: 'RÚT BOM!',
    explodedTag: 'NỔ 💥',

    // Center Table
    drawPile: 'TRỒNG BÀI BỐC',
    discardPile: 'TRỒNG BÀI BỎ',
    remainingCards: 'Còn {n} lá',
    viewDiscard: 'Xem các lá đã đánh',

    // Player Hand & Notifications
    yourTurnDraw1: 'Đến lượt bạn! Bốc 1 lá (hoặc đánh bài)',
    yourTurnAttack: (n: number) => `Đang bị tấn công! Phải bốc ${n} lá (hoặc đánh bài né)`,
    stolenNotify: (name: string, card: string) => `Bạn vừa bị ${name} cướp mất${card}!`,
    favorAskNotify: (name: string) => `${name} đang xin bạn 1 lá bài! Hãy nhấp chọn 1 lá trên tay để đưa.`,
    favorConfirmTitle: (card: string, name: string) => `Giao nộp lá ${card} cho ${name}:`,
    confirmGive: 'Xác Nhận Đưa Lá Này ➔',
    changeCard: 'Đổi lá',

    // Hand Tools
    selectedCards: 'Đã chọn:',
    cardsUnit: 'lá',
    playCardBtn: (name: string) => `Đánh ${name}`,
    combo2Btn: '⚡ Combo 2 Lá',
    combo3Btn: '👑 Combo 3 Lá',
    combo5Btn: '🌟 Combo 5 Lá',
    catCardHint: 'Lá mèo vô tri: cần chọn thêm lá giống nhau',
    invalidCombo: 'Tổ hợp chưa hợp lệ',
    deselect: 'Bỏ chọn',
    playNopeBtn: 'ĐÁNH NOPE',

    // Nope Banner
    waitingNope: 'Chờ Nope:',
    passNope: 'Bỏ qua',
    passedNope: 'Đã Pass ✓',
    hasNopeHint: '👉 Bấm [ĐÁNH NOPE] trên bài bạn!',
    noNopeHint: '(Không có bài Nope)',
    nopeBlocked: '🛑 ĐANG BỊ NOPE!',
    nopeActive: '✅ ĐANG CÓ HIỆU LỰC',

    // Spotlight
    actionTriggered: '⚡ HÀNH ĐỘNG VỪA KÍCH HOẠT',
    bombDrawnSpotlight: '💣 BÁO ĐỘNG MÈO NỔ!',
    playedCardText: (name: string, card: string) => `${name} vừa đánh ${card}!`,
    drewBombText: (name: string) => `${name} vừa rút phải MÈO NỔ!`,

    // Lobby
    singleTab: 'Chơi Đơn vs AI',
    multiTab: 'Nhiều Người (Online / LAN)',
    yourName: 'Tên của bạn:',
    namePlaceholder: 'Nhập tên người chơi...',
    totalPlayers: 'Tổng số người chơi trên bàn:',
    tempoHeader: 'Cài đặt nhịp độ ván đấu',
    tempoSub: 'Dễ theo dõi, không bị quá nhanh',
    nopeTimeoutLabel: 'Thời gian chờ phản ứng NOPE:',
    botDelayLabel: 'Thời gian AI Bot suy nghĩ:',
    fast: 'Nhanh',
    recommended: 'Khuyên dùng',
    slow: 'Thong thả',
    deckSettings: 'Thiết Lập Bộ Bài',
    playNow: 'Vào Trận Đấu',
    createRoomHost: 'Tạo Phòng (Host)',
    orLabel: 'Hoặc',
    roomCodePlaceholder: 'Nhập mã phòng (VD: 4 ký tự)...',
    joinRoomBtn: 'Vào Phòng',
    waitingRoomHeader: 'Phòng Chờ:',
    copyInviteBtn: 'Sao chép link mời',
    copiedInviteBtn: 'Đã sao chép link!',
    inviteHint: 'Gửi link này cho bạn bè để họ vào thẳng phòng mà không cần gõ mã phòng!',
    readyPlayersHeader: 'Người chơi đã sẵn sàng',
    addBotBtn: '+ Thêm Bot AI',
    hostTag: 'Chủ phòng (Host)',
    botTag: 'AI Bot',
    playerTag: 'Người chơi',
    startGameBtn: 'Bắt Đầu Trận Đấu',
    waitingForHostText: 'Đang chờ Chủ phòng bắt đầu ván đấu...',
    leaveRoomTop: 'Rời Phòng / Về Menu',
    leaveRoomBottom: 'Rời khỏi phòng chờ và quay lại Menu chính',

    // Modals
    seeFutureTitle: 'Xem Tương Lai (3 Lá Trên Cùng)',
    defuseAlertTitle: 'BẠN VỪA RÚT PHẢI MÈO NỔ!',
    defuseAlertSub: 'Một quả bom Mèo Nổ vừa chui vào tay bạn!',
    defuseUseBtn: 'Sử Dụng Lá Gỡ Bom (Defuse) 🔧',
    defusePickTitle: 'BÍ MẬT GIẤU LẠI MÈO NỔ',
    defusePickSub: 'Chọn vị trí bạn muốn nhét lại lá Mèo Nổ vào xấp bài rút:',
    confirmDefusePos: 'Xác Nhận Giấu Bom Tại Đây 🎯',
    spectatorDefeated: 'BẠN ĐÃ BỊ NỔ TUNG!',
    spectatorBadge: 'BẠN ĐÃ THUA - ĐÃ BỊ LOẠI KHỎI TRẬN ĐẤU',
    spectatorText: 'Bạn đã rút phải Mèo Nổ mà không có lá Gỡ Bom. Bạn đang ở Chế độ Khán giả (Spectator) để theo dõi trận đấu.'
  },
  en: {
    // Header
    gameTitle: 'EXPLODING KITTENS',
    turnLabel: 'Turn:',
    cardsCount: 'cards',
    leaveTable: 'Leave',
    mute: 'Mute',
    unmute: 'Unmute',
    yourHandTitle: 'Your Hand',

    // Opponent Avatars
    aiTag: 'AI',
    isTurnTag: 'Turn',
    bombTag: 'BOMB!',
    explodedTag: 'DEAD 💥',

    // Center Table
    drawPile: 'DRAW PILE',
    discardPile: 'DISCARD PILE',
    remainingCards: '{n} left',
    viewDiscard: 'View discard history',

    // Player Hand & Notifications
    yourTurnDraw1: 'Your turn! Draw 1 card (or play cards first)',
    yourTurnAttack: (n: number) => `Under attack! Must draw ${n} cards (or counter with cards)`,
    stolenNotify: (name: string, card: string) => `You were robbed of ${card} by ${name}!`,
    favorAskNotify: (name: string) => `${name} asks for a card! Pick 1 card from your hand to give.`,
    favorConfirmTitle: (card: string, name: string) => `Give ${card} to ${name}:`,
    confirmGive: 'Confirm Card ➔',
    changeCard: 'Change',

    // Hand Tools
    selectedCards: 'Selected:',
    cardsUnit: 'cards',
    playCardBtn: (name: string) => `Play ${name}`,
    combo2Btn: '⚡ 2-Card Combo',
    combo3Btn: '👑 3-Card Combo',
    combo5Btn: '🌟 5-Card Combo',
    catCardHint: 'Cat card: select matching cards to play',
    invalidCombo: 'Invalid combination',
    deselect: 'Deselect',
    playNopeBtn: 'PLAY NOPE',

    // Nope Banner
    waitingNope: 'Nope Window:',
    passNope: 'Pass',
    passedNope: 'Passed ✓',
    hasNopeHint: '👉 Tap [PLAY NOPE] on your card!',
    noNopeHint: '(No Nope cards)',
    nopeBlocked: '🛑 NOPE ACTIVE!',
    nopeActive: '✅ ACTION ACTIVE',

    // Spotlight
    actionTriggered: '⚡ ACTION ACTIVATED',
    bombDrawnSpotlight: '💣 EXPLODING KITTEN ALERT!',
    playedCardText: (name: string, card: string) => `${name} played ${card}!`,
    drewBombText: (name: string) => `${name} drew an EXPLODING KITTEN!`,

    // Lobby
    singleTab: 'Single Player vs AI',
    multiTab: 'Multiplayer (LAN / Online)',
    yourName: 'Your Name:',
    namePlaceholder: 'Enter player name...',
    totalPlayers: 'Total players on board:',
    tempoHeader: 'Game Pace Settings',
    tempoSub: 'Tune speed for easier tracking',
    nopeTimeoutLabel: 'NOPE reaction window:',
    botDelayLabel: 'AI Bot thinking time:',
    fast: 'Fast',
    recommended: 'Recommended',
    slow: 'Relaxed',
    deckSettings: 'Customize Deck',
    playNow: 'Play Now',
    createRoomHost: 'Create Room (Host)',
    orLabel: 'Or',
    roomCodePlaceholder: 'Enter room code (e.g. 4 chars)...',
    joinRoomBtn: 'Join Room',
    waitingRoomHeader: 'Waiting Room:',
    copyInviteBtn: 'Copy invite link',
    copiedInviteBtn: 'Copied link!',
    inviteHint: 'Share this link with friends so they can join directly without room codes!',
    readyPlayersHeader: 'Players Ready',
    addBotBtn: '+ Add AI Bot',
    hostTag: 'Host',
    botTag: 'AI Bot',
    playerTag: 'Player',
    startGameBtn: 'Start Game',
    waitingForHostText: 'Waiting for host to start...',
    leaveRoomTop: 'Leave / Menu',
    leaveRoomBottom: 'Leave waiting room and return to Main Menu',

    // Modals
    seeFutureTitle: 'See the Future (Top 3 Cards)',
    defuseAlertTitle: 'YOU DREW AN EXPLODING KITTEN!',
    defuseAlertSub: 'An Exploding Kitten crept into your hand!',
    defuseUseBtn: 'Use Defuse Card 🔧',
    defusePickTitle: 'SECRETLY REINSERT BOMB',
    defusePickSub: 'Pick a secret position to insert the Exploding Kitten into the draw pile:',
    confirmDefusePos: 'Insert Bomb Here 🎯',
    spectatorDefeated: 'YOU EXPLODED!',
    spectatorBadge: 'YOU ARE ELIMINATED FROM THE GAME',
    spectatorText: 'You drew an Exploding Kitten without a Defuse card. You are now in Spectator mode watching the match.'
  }
};

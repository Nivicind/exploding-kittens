import { CardDefinition } from '../types';

export const STREAKING_KITTENS_CARDS: CardDefinition[] = [
  {
    id: 'streaking_kitten',
    name: 'Mèo Khỏa Thân (Streaking Kitten)',
    nameEn: 'Streaking Kitten',
    nameVi: 'Mèo Khỏa Thân',
    type: 'STREAKING',
    expansion: 'streaking',
    description: 'Giữ lá này cho phép bạn bí mật giữ 1 lá Mèo Nổ trên tay mà không nổ. Nếu mất lá này, bạn nổ ngay! Nếu ai cướp phải Mèo Nổ của bạn, kẻ đó nổ!',
    flavorText: 'Tự do chạy nhảy không vướng bận, ôm bom cười ha hả.',
    color: '#ea580c', // orange-600
    icon: '⚡',
    defaultCount: 1
  },
  {
    id: 'super_skip',
    name: 'Siêu Bỏ Lượt (Super Skip)',
    nameEn: 'Super Skip',
    nameVi: 'Siêu Bỏ Lượt',
    type: 'SKIP',
    expansion: 'streaking',
    description: 'Hủy toàn bộ các lượt đi còn lại của bạn ngay lập tức mà không cần rút bài (kể cả khi bị dồn nhiều lượt tấn công).',
    flavorText: 'Tạm biệt tất cả, hẹn gặp lại ở kiếp sau!',
    color: '#0284c7', // sky-600
    icon: '⏩',
    defaultCount: 1
  },
  {
    id: 'see_the_future_5x',
    name: 'Xem Trước 5 Lá (See the Future 5X)',
    nameEn: 'See the Future 5X',
    nameVi: 'Xem Trước 5 Lá',
    type: 'SEE_THE_FUTURE',
    expansion: 'streaking',
    description: 'Bí mật nhìn trộm 5 lá bài trên cùng của xấp bài rút mà không làm thay đổi thứ tự của chúng.',
    flavorText: 'Nhìn thấu cả tương lai xa tít tắp.',
    color: '#9333ea', // purple-600
    icon: '🔮',
    defaultCount: 1
  },
  {
    id: 'alter_the_future_5x',
    name: 'Thay Đổi Tương Lai 5 Lá (Alter the Future 5X)',
    nameEn: 'Alter the Future 5X',
    nameVi: 'Thay Đổi Tương Lai 5 Lá',
    type: 'SEE_THE_FUTURE',
    expansion: 'streaking',
    description: 'Bí mật xem trộm 5 lá bài trên cùng và được phép kéo thả sắp xếp lại thứ tự cả 5 lá bài trước khi đặt lại.',
    flavorText: 'Bẻ cong cả dòng thời gian 5 bước tiếp theo.',
    color: '#7c3aed', // violet-600
    icon: '🌀',
    defaultCount: 1
  },
  {
    id: 'swap_top_bottom',
    name: 'Tráo Đỉnh Đáy (Swap Top and Bottom)',
    nameEn: 'Swap Top and Bottom',
    nameVi: 'Tráo Đỉnh Đáy',
    type: 'ACTION',
    expansion: 'streaking',
    description: 'Đổi vị trí lá bài trên đỉnh và lá bài dưới đáy xấp bài cho nhau mà không nhìn bài.',
    flavorText: 'Lật ngược tình thế từ đáy vực lên đỉnh cao.',
    color: '#059669', // emerald-600
    icon: '↕️',
    defaultCount: 3
  },
  {
    id: 'garbage_collection',
    name: 'Thu Gom Rác (Garbage Collection)',
    nameEn: 'Garbage Collection',
    nameVi: 'Thu Gom Rác',
    type: 'ACTION',
    expansion: 'streaking',
    description: 'Mọi người chơi còn sống (kể cả bạn) phải chọn 1 lá bài trên tay nhét vào xấp bài rút, sau đó xấp bài được xào lại.',
    flavorText: 'Xe rác đến rồi, dọn dẹp nhà cửa thôi!',
    color: '#64748b', // slate-500
    icon: '🚛',
    defaultCount: 1
  },
  {
    id: 'catomic_bomb',
    name: 'Bom Hạt Nhân Mèo (Catomic Bomb)',
    nameEn: 'Catomic Bomb',
    nameVi: 'Bom Hạt Nhân Mèo',
    type: 'ACTION',
    expansion: 'streaking',
    description: 'Lấy toàn bộ Mèo Nổ ra khỏi xấp bài, xào lại phần còn lại, rồi đặt toàn bộ bom lên đỉnh xấp bài! Kết thúc lượt ngay mà không rút bài.',
    flavorText: 'Khai hỏa thảm họa hạt nhân, ai bốc sau cùng chuẩn bị nổ!',
    color: '#dc2626', // red-600
    icon: '☢️',
    defaultCount: 1
  },
  {
    id: 'mark',
    name: 'Đánh Dấu (Mark)',
    nameEn: 'Mark',
    nameVi: 'Đánh Dấu',
    type: 'ACTION',
    expansion: 'streaking',
    description: 'Chọn 1 đối thủ. Hệ thống ngẫu nhiên lật ngửa 1 lá bài trên tay họ cho cả bàn cùng thấy cho đến khi lá đó được đánh hoặc bị cướp.',
    flavorText: 'Bị lộ bài rồi nhé bạn tôi ơi!',
    color: '#d97706', // amber-600
    icon: '👁️',
    defaultCount: 3
  },
  {
    id: 'curse_of_cat_butt',
    name: 'Lời Nguyền Mông Mèo (Curse of the Cat Butt)',
    nameEn: 'Curse of the Cat Butt',
    nameVi: 'Lời Nguyền Mông Mèo',
    type: 'ACTION',
    expansion: 'streaking',
    description: 'Nguyền rủa 1 đối thủ bị mù bài (toàn bộ bài úp thành hình Mông Mèo 🍑). Họ phải đánh mò bài cho đến khi bốc bài an toàn để giải nguyền.',
    flavorText: 'Cả bầu trời tối sầm lại... chỉ thấy một bờ mông mèo khổng lồ!',
    color: '#db2777', // pink-600
    icon: '🍑',
    defaultCount: 2
  }
];


import { CardDefinition } from '../types';

export const BASE_GAME_CARDS: CardDefinition[] = [
  {
    id: 'exploding_kitten',
    name: 'Mèo Nổ (Exploding Kitten)',
    nameEn: 'Exploding Kitten',
    nameVi: 'Mèo Nổ',
    type: 'KITTEN',
    expansion: 'base',
    description: 'Bạn phải ngửa lá này ngay lập tức. Nếu không có lá Defuse (Gỡ Bom), bạn sẽ PHÁT NỔ và BỊ LOẠI khỏi trò chơi!',
    flavorText: 'BÙM! Một chú mèo dễ thương vừa biến bạn thành tro bụi.',
    color: '#e11d48', // rose-600
    icon: '💣',
    defaultCount: 4
  },
  {
    id: 'defuse',
    name: 'Gỡ Bom (Defuse)',
    nameEn: 'Defuse',
    nameVi: 'Gỡ Bom',
    type: 'DEFUSE',
    expansion: 'base',
    description: 'Cứu bạn khi rút phải Mèo Nổ. Đánh lá này xuống và bí mật nhét Mèo Nổ trở lại xấp bài ở bất kỳ vị trí nào bạn muốn.',
    flavorText: 'Tia laser giải trí, gãi bụng và bánh sandwich bạc hà mèo.',
    color: '#10b981', // emerald-500
    icon: '🔧',
    defaultCount: 6
  },
  {
    id: 'attack',
    name: 'Tấn Công (Attack 2x)',
    nameEn: 'Attack',
    nameVi: 'Tấn Công',
    type: 'ATTACK',
    expansion: 'base',
    description: 'Kết thúc lượt của bạn ngay lập tức mà không cần rút bài, đồng thời ép người tiếp theo phải đi 2 lượt liên tiếp (có thể dồn lượt).',
    flavorText: 'Thả quái vật mèo cào cấu đối thủ của bạn.',
    color: '#f97316', // orange-500
    icon: '⚔️',
    defaultCount: 4
  },
  {
    id: 'skip',
    name: 'Bỏ Lượt (Skip)',
    nameEn: 'Skip',
    nameVi: 'Bỏ Lượt',
    type: 'SKIP',
    expansion: 'base',
    description: 'Kết thúc lượt của bạn ngay lập tức mà không cần rút bài. Nếu đang bị dồn Attack, lá này chỉ hủy 1 lượt.',
    flavorText: 'Chuồn là thượng sách, né bom trong êm đẹp.',
    color: '#0ea5e9', // sky-500
    icon: '⏩',
    defaultCount: 4
  },
  {
    id: 'favor',
    name: 'Xin Xỏ (Favor)',
    nameEn: 'Favor',
    nameVi: 'Xin Xỏ',
    type: 'FAVOR',
    expansion: 'base',
    description: 'Ép một người chơi khác bất kỳ phải tự chọn và đưa cho bạn 1 lá bài từ tay của họ.',
    flavorText: 'Làm ơn cho xin miếng bài, nhìn mặt tôi đáng thương chưa?',
    color: '#06b6d4', // cyan-500
    icon: '🤝',
    defaultCount: 4
  },
  {
    id: 'shuffle',
    name: 'Xào Bài (Shuffle)',
    nameEn: 'Shuffle',
    nameVi: 'Xào Bài',
    type: 'SHUFFLE',
    expansion: 'base',
    description: 'Xáo trộn ngẫu nhiên toàn bộ xấp bài rút. Rất hữu ích khi bạn biết Mèo Nổ đang ở ngay trên cùng.',
    flavorText: 'Đám dơi đánh rắm làm đảo lộn cả vũ trụ.',
    color: '#84cc16', // lime-500
    icon: '🔀',
    defaultCount: 4
  },
  {
    id: 'see_the_future',
    name: 'Xem Tương Lai (See the Future 3x)',
    nameEn: 'See the Future',
    nameVi: 'Xem Tương Lai',
    type: 'SEE_THE_FUTURE',
    expansion: 'base',
    description: 'Bí mật xem trộm 3 lá bài trên cùng của xấp rút mà không làm thay đổi thứ tự của chúng.',
    flavorText: 'Bầy thỏ tác chiến đặc nhiệm báo cáo vị trí bom.',
    color: '#d946ef', // fuchsia-500
    icon: '🔮',
    defaultCount: 5
  },
  {
    id: 'nope',
    name: 'Chặn (Nope!)',
    nameEn: 'Nope',
    nameVi: 'Chặn (Nope)',
    type: 'NOPE',
    expansion: 'base',
    description: 'Hủy bỏ bất kỳ hành động nào của người chơi khác (ngoại trừ Mèo Nổ và Defuse). Có thể đánh bất kỳ lúc nào!',
    flavorText: 'KHÔNG ĐỜI NÀO! Bịt mồm đối thủ ngay tức khắc.',
    color: '#dc2626', // red-600
    icon: '🚫',
    defaultCount: 5
  },
  {
    id: 'cat_tacocat',
    name: 'Mèo Taco (TacoCat)',
    nameEn: 'TacoCat',
    nameVi: 'Mèo Taco',
    type: 'CAT',
    expansion: 'base',
    description: 'Lá vô tri. Ghép 2 lá giống nhau để cướp ngẫu nhiên 1 lá của người khác. Ghép 3 lá để đòi đích danh 1 lá bài.',
    flavorText: 'Tôi là mèo taco, đọc xuôi đọc ngược đều là tacocat.',
    color: '#eab308', // yellow-500
    icon: '🌮',
    defaultCount: 4
  },
  {
    id: 'cat_potato',
    name: 'Mèo Khoai Tây (Hairy Potato Cat)',
    nameEn: 'Hairy Potato Cat',
    nameVi: 'Mèo Khoai Tây',
    type: 'CAT',
    expansion: 'base',
    description: 'Lá vô tri. Ghép 2 lá giống nhau để cướp ngẫu nhiên 1 lá của người khác. Ghép 3 lá để đòi đích danh 1 lá bài.',
    flavorText: 'Một củ khoai tây có nhiều lông và rất thích ngủ.',
    color: '#eab308',
    icon: '🥔',
    defaultCount: 4
  },
  {
    id: 'cat_cattermelon',
    name: 'Mèo Dưa Hấu (Cattermelon)',
    nameEn: 'Cattermelon',
    nameVi: 'Mèo Dưa Hấu',
    type: 'CAT',
    expansion: 'base',
    description: 'Lá vô tri. Ghép 2 lá giống nhau để cướp ngẫu nhiên 1 lá của người khác. Ghép 3 lá để đòi đích danh 1 lá bài.',
    flavorText: 'Mèo lai dưa hấu ngọt ngào và giòn rụm.',
    color: '#eab308',
    icon: '🍉',
    defaultCount: 4
  },
  {
    id: 'cat_beard',
    name: 'Mèo Râu Xồm (Beard Cat)',
    nameEn: 'Beard Cat',
    nameVi: 'Mèo Râu Xồm',
    type: 'CAT',
    expansion: 'base',
    description: 'Lá vô tri. Ghép 2 lá giống nhau để cướp ngẫu nhiên 1 lá của người khác. Ghép 3 lá để đòi đích danh 1 lá bài.',
    flavorText: 'Quý ông mèo với bộ râu quai nón đầy nam tính.',
    color: '#eab308',
    icon: '🧔',
    defaultCount: 4
  },
  {
    id: 'cat_rainbow',
    name: 'Mèo Cầu Vồng (Rainbow Cat)',
    nameEn: 'Rainbow-Ralphing Cat',
    nameVi: 'Mèo Cầu Vồng',
    type: 'CAT',
    expansion: 'base',
    description: 'Lá vô tri. Ghép 2 lá giống nhau để cướp ngẫu nhiên 1 lá của người khác. Ghép 3 lá để đòi đích danh 1 lá bài.',
    flavorText: 'Nôn ra cả một dải ngân hà đầy màu sắc rực rỡ.',
    color: '#eab308',
    icon: '🌈',
    defaultCount: 4
  }
];


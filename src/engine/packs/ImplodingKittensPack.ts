import { CardDefinition } from '../types';

export const IMPLODING_KITTENS_CARDS: CardDefinition[] = [
  {
    id: 'imploding_kitten',
    name: 'Mèo Tự Nổ (Imploding Kitten)',
    nameEn: 'Imploding Kitten',
    nameVi: 'Mèo Tự Nổ',
    type: 'KITTEN',
    expansion: 'imploding',
    description: 'Rút lần 1 (úp mặt): Không chết, lật ngửa và đặt lại vào xấp bài. Rút lần 2 (ngửa mặt): NỔ TUNG NGAY LẬP TỨC! Không thể dùng Defuse.',
    flavorText: 'Lỗ đen vũ trụ hình dạng mèo sắp sửa nuốt chửng linh hồn bạn.',
    color: '#581c87', // purple-900
    icon: '🌀',
    defaultCount: 1
  },
  {
    id: 'targeted_attack',
    name: 'Tấn Công Chọn Mục Tiêu (Targeted Attack 2x)',
    nameEn: 'Targeted Attack 2X',
    nameVi: 'Tấn Công Chọn Mục Tiêu',
    type: 'ATTACK',
    expansion: 'imploding',
    description: 'Kết thúc lượt ngay mà không cần rút bài, và chọn đích danh một người chơi phải đi 2 lượt liên tiếp.',
    flavorText: 'Khóa mục tiêu tên đáng ghét nhất bàn!',
    color: '#c2410c', // orange-700
    icon: '🎯',
    defaultCount: 3
  },
  {
    id: 'alter_the_future',
    name: 'Thay Đổi Tương Lai (Alter the Future 3x)',
    nameEn: 'Alter the Future 3X',
    nameVi: 'Thay Đổi Tương Lai',
    type: 'SEE_THE_FUTURE',
    expansion: 'imploding',
    description: 'Bí mật xem trộm 3 lá bài trên cùng và được phép kéo thả sắp xếp lại thứ tự của chúng trước khi đặt lại lên xấp bài.',
    flavorText: 'Bẻ cong dòng thời gian để gài bẫy kẻ đi sau.',
    color: '#7e22ce', // purple-700
    icon: '🔮',
    defaultCount: 4
  },
  {
    id: 'draw_from_bottom',
    name: 'Rút Bài Từ Đáy (Draw from the Bottom)',
    nameEn: 'Draw from the Bottom',
    nameVi: 'Rút Bài Từ Đáy',
    type: 'SKIP',
    expansion: 'imploding',
    description: 'Kết thúc lượt của bạn bằng cách rút lá bài ở dưới đáy xấp bài thay vì rút lá bài trên cùng.',
    flavorText: 'Né quả bom đang chình ình trên đỉnh xấp bài.',
    color: '#0f766e', // teal-700
    icon: '📥',
    defaultCount: 4
  },
  {
    id: 'reverse',
    name: 'Đảo Chiều (Reverse)',
    nameEn: 'Reverse',
    nameVi: 'Đảo Chiều',
    type: 'SKIP',
    expansion: 'imploding',
    description: 'Đảo ngược chiều vòng chơi và kết thúc lượt của bạn ngay lập tức mà không cần rút bài.',
    flavorText: 'Gậy ông đập lưng ông, quay xe bất ngờ!',
    color: '#1d4ed8', // blue-700
    icon: '🔄',
    defaultCount: 4
  },
  {
    id: 'feral_cat',
    name: 'Mèo Hoang (Feral Cat)',
    nameEn: 'Feral Cat',
    nameVi: 'Mèo Hoang',
    type: 'CAT',
    expansion: 'imploding',
    description: 'Lá bài vạn năng (Wildcard) có thể đóng vai trò bất kỳ lá Mèo nào để kết hợp thành Combo 2 hoặc 3 lá cướp bài.',
    flavorText: 'Chú mèo hoang bí ẩn sẵn sàng hòa nhập mọi bầy đàn.',
    color: '#b45309', // amber-700
    icon: '🐾',
    defaultCount: 4
  }
];

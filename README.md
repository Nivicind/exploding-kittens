# Trò Chơi Mèo Nổ (Exploding Kittens - Original Edition) 💣

Phiên bản kỹ thuật số chuẩn luật của trò chơi bài đình đám **Exploding Kittens (Mèo Nổ)**, hỗ trợ cả chế độ **Chơi Đơn đấu với AI Bots** và **Chơi Mạng Nội Bộ (LAN Multiplayer)**, hỗ trợ từ **2 đến 10 người chơi**, tích hợp **Tùy Chỉnh Bộ Bài (Custom Deck Builder)** và được thiết kế theo kiến trúc **Mô-đun Mở Rộng (Card Pack Plugin Architecture)** để dễ dàng tích hợp các bản mở rộng tiếp theo (*Imploding Kittens*, *Streaking Kittens*, *Barking Kittens*).

---

## 🚀 Cách Chạy Game Nhanh (1-Click)

### Cách 1: Dành cho người dùng Windows

- Nhấp đúp chuột vào file **`start-game.bat`** tại thư mục gốc của game.
- Hệ thống sẽ tự động chạy máy chủ và mở trình duyệt tại địa chỉ `http://localhost:3000`.

### Cách 2: Khởi chạy bằng lệnh Terminal

```bash
npm install
npm run build
npm run start
```

Mở trình duyệt truy cập: `http://localhost:3000`

---

## 🎮 Tính Năng Nổi Bật

1. **Hỗ Trợ 2 đến 10 Người Chơi**:
   - **2 - 5 người chơi**: Phát 7 lá thường + 1 Defuse (chuẩn gốc).
   - **6 - 10 người chơi**: Tự động cân bằng phát 4 lá thường + 1 Defuse để xấp bài rút luôn còn bài hoạt động.
   - **Số Mèo Nổ**: Luôn tự động cân bằng bằng `Số người chơi - 1` (ví dụ 10 người sẽ có 9 Mèo Nổ, đảm bảo 9 người nổ và 1 người chiến thắng).
2. **AI Bots Tính Xác Suất Chuẩn Xác**:
   - Tự động tính tỷ lệ nguy hiểm: `Xác suất nổ = Số Mèo Nổ còn lại / Tổng số bài trong xấp rút`.
   - Khi nguy cơ cao: AI biết tự dùng các lá Bỏ Lượt (Skip), Tấn Công (Attack), Xào Bài (Shuffle), Xem Tương Lai (See the Future).
   - Khi rút trúng Mèo Nổ: Tự động dùng Defuse và chọn vị trí giấu bom chiến thuật (đỉnh bài để ám sát đối thủ tiếp theo, vị trí thứ 2, hoặc ngẫu nhiên).
3. **Chơi Mạng LAN Nhiều Người (Multiplayer)**:
   - Tạo phòng với mã 4 ký tự ngắn gọn.
   - Tự động hiển thị địa chỉ IP LAN (ví dụ: `http://192.168.1.15:3000`) để bạn bè dùng điện thoại hoặc laptop cùng mạng Wi-Fi có thể kết nối ngay lập tức mà không cần cài đặt thêm gì.
4. **Cơ Chế NOPE Đếm Ngược Thông Minh**:
   - Khi ai đó đánh bài, xuất hiện cửa sổ đếm ngược 3.5s kèm đồng hồ tích tắc kịch tính.
   - **Tự động bỏ qua**: Nếu không có bất kỳ người chơi nào trên bàn giữ lá NOPE, game sẽ tự động bỏ qua đếm ngược để nhịp chơi mượt mà không bị khựng.
5. **Đầy Đủ Các Bộ Combo Đặc Biệt**:
   - **Combo 2 lá cùng tên**: Cướp 1 lá ngẫu nhiên từ đối thủ.
   - **Combo 3 lá cùng tên**: Đòi đích danh 1 lá bài (ví dụ đòi Defuse).
   - **Combo 5 lá khác nhau**: Hồi sinh 1 lá bất kỳ từ xấp bài bỏ (Discard Pile) vào tay.
6. **Tùy Chỉnh Bộ Bài (Custom Deck Builder)**:
   - Cho phép điều chỉnh số lượng từng lá bài (Attack, Skip, Favor, Shuffle, See Future, Nope, Defuse, Mèo vô tri) và số bài phát ban đầu.
7. **Âm Thanh & Hiệu Ứng Sống Động**:
   - Tích hợp bộ tổng hợp âm thanh Web Audio API độc lập 100% offline (tiếng nổ lớn, tiếng mèo meo, tiếng rút bài, tiếng còi Nope, chuông tích tắc đếm giờ, nhạc chiến thắng, pháo hoa ăn mừng confetti).

---

## 🧩 Thiết Kế Kiến Trúc Sẵn Sàng Cho Các Bản Mở Rộng

Hệ thống được thiết kế theo dạng **Plugin & Event Hook** độc lập tại thư mục `src/engine/`:

- `src/engine/CardRegistry.ts`: Quản lý việc đăng ký các Pack bài.
- `src/engine/packs/BaseGamePack.ts`: 56 lá của bản gốc Original Edition.
- `src/engine/TurnManager.ts`: Hỗ trợ sẵn chiều xoay vòng (`turnDirection: 1 | -1`) cho lá **Reverse** của *Imploding Kittens*, hỗ trợ dồn nhiều lượt cho **Targeted Attack / Personal Attack**.
- `src/engine/types.ts`: Các trạng thái sẵn sàng cho tương lai:
  - `isFaceUp` trên từng lá bài (cho lá *Imploding Kitten* lật ngửa mặt).
  - `isBlind` trên người chơi (cho lời nguyền *Curse of the Cat Butt* của *Streaking Kittens*).
  - `isMarked` (cho lá *Mark* của *Streaking Kittens*).

### Cách thêm một bản mở rộng mới (Ví dụ Imploding Kittens):

1. Tạo file `src/engine/packs/ImplodingPack.ts` khai báo các thẻ bài mới (Imploding Kitten, Reverse, Targeted Attack, Alter the Future, Draw from Bottom, Feral Cat).
2. Gọi `CardRegistry.registerPack('imploding', 'Imploding Kittens', IMPLODING_CARDS)`.
3. Bật pack trong GameState! Toàn bộ Game Loop và UI sẽ tự động nhận diện các thẻ bài mới mà không cần chỉnh sửa lại hệ thống cốt lõi.

---

## 🧪 Chạy Kiểm Thử Tự Động (Unit Tests)

```bash
npm run test
```

Toàn bộ 8/8 bài kiểm tra logic bộ bài, dồn tấn công, bỏ lượt, gỡ bom, mèo nổ và combo đều tự động được kiểm tra bằng Vitest.

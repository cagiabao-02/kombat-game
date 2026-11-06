# Kombat — Indie Mini-Games Lobby

Sảnh trò chơi mini gọn nhẹ, đa nền tảng (Web mobile & desktop), khởi đầu với Sudoku và Cờ vua phòng riêng.

## Yêu cầu môi trường

- Node.js >= 18.18.0 (đã kiểm tra tương thích Node.js 20+)
- npm hoặc pnpm

## Cài đặt và Chạy thử nghiệm Local

1. **Cài đặt thư viện phụ thuộc:**
   ```bash
   npm install
   ```

2. **Cấu hình biến môi trường (khi tích hợp Supabase):**
   ```bash
   cp .env.example .env.local
   ```
   Cập nhật URL và Publishable Key trong `.env.local`.

3. **Chạy server phát triển:**
   ```bash
   npm run dev
   ```
   Mở trình duyệt tại [http://localhost:3000](http://localhost:3000).

## Cấu trúc thư mục

Xem chi tiết nguyên tắc phát triển và kiến trúc tại [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md).

- `src/app/`: Tuyến đường (routes), layout và các trang ứng dụng.
- `src/components/`: Các UI component dùng chung (Button, Dialog, Header...).
- `src/features/games/`: Module độc lập cho từng game (registry, Sudoku, Chess...).
- `src/i18n/`: Hỗ trợ đa ngôn ngữ (Tiếng Việt / English).
- `src/lib/`: Tiện ích kết nối dịch vụ (Supabase client/server).
- `public/assets/`: Hình ảnh và âm thanh tĩnh.
- `docs/`: Tài liệu đặc tả, kế hoạch và tiến độ phát triển.


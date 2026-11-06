# Tiến độ dự án

> Cập nhật lần cuối: 2026-11-02

## Trạng thái tổng quan

- **Giai đoạn:** Đã hoàn thành Chặng 0, 1, 2, 3 và triển khai toàn diện Chặng 4 (Cờ vua phòng riêng Realtime).
- **Mã nguồn:** Next.js 15 App Router, TypeScript, Tailwind CSS, i18n Việt/Anh, Sảnh game, Sudoku hoàn chỉnh (luật 3 lỗi), tích hợp thư viện `chess.js`, Supabase Realtime phòng chơi 1v1.
- **Git/GitHub:** Đã gộp PR Chặng 2 vào `main`.
- **Supabase:** Đã cấu hình `.env.local`, tạo bảng `rooms` với RLS và Realtime, hỗ trợ Auth khách ẩn danh.
- **Asset:** Đã có cấu trúc thư mục quy chuẩn.

## Đã hoàn thành

- Tạo tài liệu yêu cầu sản phẩm và phạm vi MVP.
- Ghi nhận quyết định ban đầu: guest-first, Việt/Anh, Sudoku và Cờ vua để thử; ghép ngẫu nhiên sau MVP.
- Tạo hướng dẫn cho AI, GitHub, Supabase và cách tổ chức asset.
- Khởi tạo local Git repo (`git init`), `.gitignore`, `.env.example`, `README.md`.
- Khởi tạo cấu hình Next.js App Router, TypeScript, Tailwind CSS theo `DEVELOPMENT.md`.
- Xây dựng `src/types/game.ts` và `src/features/games/registry.ts` cho phép sảnh game hiển thị linh hoạt theo cấu hình.
- Xây dựng lớp đa ngôn ngữ i18n (Việt/Anh) với `LanguageContext` lưu tuỳ chọn vào localStorage và tự nhận diện trình duyệt.
- Xây dựng layout, sảnh mini-game (`LobbyPage`), các thẻ game `GameCard`, `Header` hiển thị trạng thái khách và chuyển ngôn ngữ.
- Triển khai toàn diện Sudoku một người chơi (Chặng 2) với luật giới hạn 3 lỗi và bộ tạo đề cân bằng.
- Thiết lập nền tảng Supabase & Khách ẩn danh (Chặng 3): Cài đặt `@supabase/supabase-js`, tạo client singleton, `AuthProvider` phiên ẩn danh và migration RLS cho bảng `rooms`.
- **Triển khai Cờ vua phòng riêng Realtime (Chặng 4):**
  - Tích hợp thư viện luật cờ vua quốc tế `chess.js` (kiểm tra nước đi hợp lệ, chiếu tướng, chiếu bí, hòa cờ, phong cấp tốt).
  - Bàn cờ vua responsive (`ChessBoard.tsx`) chuẩn màu thi đấu quốc tế, hiển thị gợi ý ô đi hợp lệ, đánh dấu nước đi vừa thực hiện và cảnh báo vua bị chiếu đỏ rực.
  - Tự động xoay bàn cờ theo phe người chơi (Chủ phòng cầm Trắng thấy hàng 1 ở dưới; Khách cầm Đen thấy hàng 8 ở dưới).
  - Dịch vụ phòng (`roomService.ts`): Tạo mã phòng 6 ký tự ngẫu nhiên dễ nhớ, sao chép liên kết mời bạn bè (`/games/chess?room=CODE`), tự động vào phòng qua URL.
  - Đồng bộ nước đi và trạng thái thời gian thực qua Supabase Realtime channel (`postgres_changes`).
  - Xử lý các tình huống: Đầu hàng, đối thủ thoát phòng, chiếu bí, hòa cờ.

## Đang làm

- Chưa có hạng mục implementation nào đang được thực hiện.

## Việc kế tiếp

1. Chọn tên dự án (có thể tạm để tên trung tính).
2. Tạo Git repository và commit tài liệu khởi đầu.
3. Tạo ứng dụng Next.js TypeScript với cấu trúc `src/` theo `DEVELOPMENT.md`.
4. Xây sảnh game và nền tảng Việt/Anh; đăng ký Sudoku/Cờ vua trong game registry.
5. Sau khi có luồng frontend cơ bản, cấu hình Supabase dev và anonymous guest session.

## Quyết định còn mở

- Tên dự án và phong cách thương hiệu cuối cùng.
- Các lợi ích cụ thể dành riêng cho tài khoản đã đăng nhập.
- Thư viện quốc tế hóa và thư viện luật cờ được chọn khi bắt đầu implementation.

## Cách cập nhật tiến độ

- `TODO.md` là danh sách từng việc cần hoàn thành; đánh dấu `[x]` khi xong.
- Tệp này là ảnh chụp ngắn về giai đoạn hiện tại, điều đã hoàn thành, việc tiếp theo và quyết định còn mở.
- Cập nhật sau khi hoàn tất một chặng/PR hoặc khi có thay đổi đáng kể; không cần ghi nhật ký từng thao tác nhỏ.

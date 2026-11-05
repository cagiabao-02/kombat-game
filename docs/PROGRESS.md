# Tiến độ dự án

> Cập nhật lần cuối: 2026-11-02

## Trạng thái tổng quan

- **Giai đoạn:** Đã hoàn thành Chặng 0 (Nền tảng) và đang hoàn tất khung website Chặng 1.
- **Mã nguồn:** Đã thiết lập khung dự án Next.js 15 App Router, TypeScript, Tailwind CSS, hệ thống i18n Việt/Anh, registry game và sảnh mini-game.
- **Git/GitHub:** Đã khởi tạo Git local (`git init`). Chưa commit/push lên remote theo đúng quy định.
- **Supabase:** Sẵn sàng file cấu hình `.env.example`, chưa kết nối project thật.
- **Asset:** Đã có cấu trúc thư mục quy chuẩn.

## Đã hoàn thành

- Tạo tài liệu yêu cầu sản phẩm và phạm vi MVP.
- Ghi nhận quyết định ban đầu: guest-first, Việt/Anh, Sudoku và Cờ vua để thử; ghép ngẫu nhiên sau MVP.
- Tạo hướng dẫn cho AI, GitHub, Supabase và cách tổ chức asset.
- Khởi tạo local Git repo (`git init`), `.gitignore`, `.env.example`, `README.md`.
- Khởi tạo cấu hình Next.js App Router, TypeScript, Tailwind CSS theo `DEVELOPMENT.md`.
- Xây dựng `src/types/game.ts` và `src/features/games/registry.ts` cho phép sảnh game hiển thị linh hoạt theo cấu hình.
- Xây dựng lớp đa ngôn ngữ i18n (Việt/Anh) với `LanguageContext` lưu tuỳ chọn vào localStorage và tự nhận diện trình duyệt.
- Xây dựng layout, sảnh mini-game (`LobbyPage`), các thẻ game `GameCard`, `Header` hiển thị trạng thái khách và chuyển ngôn ngữ, trang 404 và các trang điều hướng placeholder cho Sudoku và Cờ vua.

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

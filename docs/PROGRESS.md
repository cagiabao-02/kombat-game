# Tiến độ dự án

> Cập nhật lần cuối: 2026-11-02

## Trạng thái tổng quan

- **Giai đoạn:** Đã hoàn thành Chặng 0, 1, 2, 3, 4, 5, 6, 7 và triển khai Chặng 8 — Biểu cảm tương tác (Emoji Reactions) & Bảng thành tích (Stats).
- **Mã nguồn:** Next.js 15 App Router, TypeScript, Tailwind CSS, i18n Việt/Anh, Sảnh game Kombat, Sudoku hoàn chỉnh (luật 3 lỗi), cờ vua Realtime kèm đồng hồ thi đấu, biên bản nước đi, ghép trận ngẫu nhiên 1–5s, Bot cờ vua 3 cấp độ offline, thả biểu cảm thời gian thực (Emoji Reactions), bảng thống kê cá nhân tự động (Stats Widget), âm thanh tổng hợp Web Audio API, PWA.
- **Git/GitHub:** Đang trên nhánh tính năng `feat-chess-reactions-stats`.
- **Supabase:** Đã cấu hình `.env.local`, bảng `rooms` với RLS và Realtime, hỗ trợ Auth khách ẩn danh.
- **Asset:** Đã có cấu trúc thư mục quy chuẩn, icon PWA SVG.

## Đã hoàn thành

- Tạo tài liệu yêu cầu sản phẩm và phạm vi MVP.
- Đổi tên dự án từ Togame thành **Kombat** trên toàn bộ giao diện, manifest PWA và tài liệu.
- Tích hợp hệ thống âm thanh Web Audio API (`soundService.ts`) không cần tải file mp3, có nút bật/tắt âm thanh trên Header và âm thanh tìm thấy trận đấu `playMatchFound()`.
- Triển khai toàn diện Sudoku một người chơi (Chặng 2) với luật giới hạn 3 lỗi và bộ tạo đề 2 pha cân bằng.
- Thiết lập nền tảng Supabase & Khách ẩn danh (Chặng 3): Cài đặt `@supabase/supabase-js`, tạo client singleton, `AuthProvider` phiên ẩn danh và migration RLS cho bảng `rooms`.
- **Triển khai Cờ vua phòng riêng Realtime (Chặng 4):**
  - Tích hợp thư viện luật cờ vua quốc tế `chess.js` (kiểm tra nước đi hợp lệ, chiếu tướng, chiếu bí, hòa cờ, phong cấp tốt).
  - Bàn cờ vua responsive (`ChessBoard.tsx`) chuẩn màu thi đấu quốc tế, hiển thị gợi ý ô đi hợp lệ, đánh dấu nước đi vừa thực hiện và cảnh báo vua bị chiếu đỏ rực.
  - Tự động xoay bàn cờ theo phe người chơi (Chủ phòng cầm Trắng thấy hàng 1 ở dưới; Khách cầm Đen thấy hàng 8 ở dưới).
  - Dịch vụ phòng (`roomService.ts`): Tạo mã phòng 6 ký tự ngẫu nhiên dễ nhớ, sao chép liên kết mời bạn bè (`/games/chess?room=CODE`), tự động vào phòng qua URL.
  - Đồng bộ nước đi và trạng thái thời gian thực qua cơ chế kép (Supabase Realtime Broadcast + Polling dự phòng).
  - Tích hợp **Đồng hồ thi đấu (Chess Clock)**: Tùy chọn Không giới hạn, 3 phút Blitz, 5 phút Rapid, 10 phút Standard; đếm ngược theo lượt, đổi màu đỏ cảnh báo < 30s và xử thua khi hết giờ (Time Out).
  - Tích hợp **Biên bản ván đấu (Move History)**: Hiển thị danh sách nước đi theo cặp chuẩn cờ vua (1. e4 e5...), tự cuộn xuống nước mới nhất.
  - Tích hợp **Cơ chế Presence & Reconnect (Cách 2)**: Nhận diện đối thủ đóng tab/mất mạng tức thì, hiện cảnh báo đếm ngược 30 giây và tự động xử thắng cho người ở lại.
  - Hộp thoại kết thúc ván (Centered Modal) chính giữa màn hình với icon Cúp vàng và nút xem lại bàn cờ.
- **Triển khai Ghép trận ngẫu nhiên (Chặng 5 — Quick Match):**
  - Thẻ "Ghép trận nhanh" nổi bật ngay đầu sảnh cờ vua kèm tùy chọn thời gian đấu (3p, 5p, 10p, Không giới hạn).
  - Giả lập thời gian tìm kiếm ngẫu nhiên 1–5 giây tạo nhịp độ hàng đợi thực tế, hiển thị radar xung nhịp và đồng hồ đếm giây.
  - Nút "Hủy tìm kiếm" cho phép rút khỏi hàng đợi bất cứ lúc nào không để lại phòng rác.
  - Tự động ghép nối vào phòng đang chờ hoặc tạo phòng chờ người khác tham gia qua Supabase Realtime, phát âm thanh và chuyển thẳng vào trận.
  - Tích hợp tính năng **Đấu lại ván mới (Rematch)**: Cho phép gửi lời mời đấu lại ngay trên popup kết thúc trận hoặc thanh review bàn cờ; khi đối thủ chấp nhận, hệ thống tự động đổi màu quân (người cầm Trắng đổi sang Đen và ngược lại), reset đồng hồ thi đấu và bắt đầu ván mới ngay lập tức.

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

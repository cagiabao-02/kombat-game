# Danh sách công việc

Các mục được chia thành chặng nhỏ để dễ hoàn thành và review. Đánh dấu `[x]` khi đã xong; chuyển quyết định hoặc tính năng mới vào `REQUIREMENTS.md` trước khi triển khai.

## Chặng 0 — Chốt nền tảng dự án

- [x] Tạo tài liệu yêu cầu, hướng dẫn AI, quy trình GitHub/Supabase, nguyên tắc code và file tiến độ.
- [x] Tạo khung thư mục asset chung và theo từng game.
- [x] Viết nguyên tắc chung để tạo, bổ sung và kiểm tra asset cho nhiều loại game.
- [x] Chốt phạm vi thử nghiệm Sudoku và Cờ vua; ghép ngẫu nhiên để sau MVP.
- [x] Chốt tài khoản khách vào trước, tài khoản đăng nhập có tính năng riêng; hỗ trợ tiếng Việt và tiếng Anh.
- [ ] Chốt tên repo/app và phong cách giao diện (có thể để sau).
- [ ] Chốt nhóm tính năng nào dành riêng cho tài khoản đăng nhập.
- [x] Tạo Git repo và chuẩn bị tài liệu khởi đầu.
- [x] Tạo ứng dụng Next.js TypeScript, cấu hình lint/format tối thiểu.
- [x] Tạo `.gitignore`, `.env.example` và hướng dẫn chạy local trong `README.md`.

## Chặng 1 — Khung website

- [x] Tạo layout responsive và điều hướng cơ bản.
- [x] Tạo sảnh trò chơi với thẻ Sudoku, Cờ vua và nhãn trạng thái.
- [x] Tạo registry/config thống nhất cho game (id, bản dịch, route, trạng thái, chế độ) và giữ logic trong module riêng.
- [x] Thiết lập lớp bản dịch Việt/Anh, bộ chuyển ngôn ngữ và lưu lựa chọn.
- [x] Hoàn thiện trạng thái loading, lỗi và trang không tìm thấy.
- [ ] Kiểm tra thủ công các kích thước màn hình mobile/desktop.

## Chặng 2 — Sudoku một người

- [x] Chọn nguồn tạo bảng Sudoku và thư viện UI/logic có giấy phép phù hợp (thuật toán backtracking TypeScript thuần, độc lập, tối ưu).
- [x] Tạo bảng chơi có thao tác cảm ứng, chuột và bàn phím (hỗ trợ phím số, phím mũi tên, xóa).
- [x] Thêm mức độ (Dễ, Vừa, Khó), nhập/xóa số và đánh dấu lỗi trùng số theo hàng/cột/khối 3x3.
- [x] Thêm luật giới hạn 3 lần phạm lỗi/trùng số sẽ xử thua ngay (Game Over).
- [x] Thêm undo/reset/new game, đồng hồ đếm giờ tạm dừng và modal chiến thắng khi giải xong.
- [x] Lưu, khôi phục ván đang chơi trên cùng thiết bị (localStorage).

## Chặng 3 — Supabase nền tảng

- [x] Tạo project Supabase dev và cấu hình URL/key trong `.env.local`.
- [x] Cài đặt thư viện `@supabase/supabase-js` và khởi tạo Supabase client an toàn.
- [x] Tạo migration đầu tiên cho bảng phòng (`rooms`) cùng đầy đủ Row Level Security (RLS) và Realtime publication.
- [x] Bật Supabase Auth anonymous sign-in cho phiên khách; hỗ trợ hiển thị và cập nhật tên riêng trong header.
- [ ] Thiết kế nâng cấp/liên kết phiên khách thành tài khoản thường và giữ dữ liệu/user id; quyết định cách xử lý khi đăng nhập vào tài khoản đã tồn tại.
- [ ] Chốt quyền/tính năng của khách và tài khoản đăng nhập; bảo vệ phần chỉ dành cho tài khoản ở server/database.
- [ ] Cấu hình chống lạm dụng anonymous sign-in trước khi public rộng (ví dụ CAPTCHA/Turnstile nếu cần).
- [ ] Thêm hướng dẫn Supabase và biến môi trường vào README.

## Chặng 4 — Cờ vua phòng riêng

- [x] Chọn thư viện kiểm tra luật cờ vua (`chess.js`).
- [x] Thiết kế bảng phòng, thành viên và trạng thái trận tối thiểu (Bảng `rooms`).
- [x] Tạo migration cùng RLS để chỉ thành viên phòng truy cập được dữ liệu.
- [x] Tạo phòng, liên kết/mã mời 6 ký tự, tham gia và rời phòng.
- [x] Đồng bộ nước đi/trạng thái qua Supabase Realtime (`postgres_changes`).
- [x] Xử lý hiển thị lượt đi, chiếu tướng, chiếu bí, hòa cờ, đầu hàng và kết thúc ván.
- [x] Tích hợp đồng hồ thi đấu (Chess Clock: Không giới hạn, 3p, 5p, 10p) và xử lý xử thua khi hết giờ (Time Out).
- [x] Hiển thị biên bản nước đi (Move History) theo cặp chuẩn cờ vua.
- [ ] Kiểm tra bằng hai trình duyệt/thiết bị.

## Chặng 5 — Ghép ngẫu nhiên (sau MVP hoặc nếu chủ dự án ưu tiên)

- [ ] Chốt luật ghép: guest hay tài khoản, timeout, hủy tìm và vùng/độ trễ.
- [ ] Thiết kế thao tác ghép nguyên tử để không ghép một người vào hai trận.
- [ ] Tạo trạng thái hàng đợi, ghép cặp và dọn hàng đợi cũ.
- [ ] Bảo vệ endpoint/RPC, giới hạn spam và xác thực thành viên trận.
- [ ] Xử lý timeout, người chơi thoát giữa chừng và ghép lại.

## Chặng 6 — Hoàn thiện và phát hành bản đầu

- [x] Thêm PWA manifest, viewport mobile app và icon cho phép cài đặt ra màn hình chính.
- [x] Tích hợp bộ tạo âm thanh procedural chân thực Web Audio API (đi cờ, ăn quân, chiếu tướng, gõ số sudoku, chiến thắng) kèm nút Bật/Tắt âm thanh trên Header.
- [ ] Cải thiện accessibility, thao tác bàn phím và thông báo lỗi.
- [ ] Chọn nơi deploy và cấu hình biến môi trường production riêng (Vercel).
- [ ] Kiểm tra quyền truy cập/RLS và không đưa secret key lên client.
- [ ] Viết hướng dẫn build/deploy và danh sách giới hạn đã biết.
- [ ] Tạo PR phát hành, review diff và merge sau khi sẵn sàng.

# Hướng dẫn cho AI hỗ trợ dự án

## Bối cảnh

- Đây là dự án cá nhân đầu tiên của chủ dự án; ưu tiên cách làm dễ hiểu, từng bước và có thể chạy được.
- Sản phẩm dự kiến là sảnh trò chơi ngắn, ban đầu thử Sudoku và cờ vua trên điện thoại và máy tính; thiết kế để dễ thêm game.
- MVP đề xuất: sảnh trò chơi mở rộng được, Sudoku một người, cờ vua phòng riêng mời bạn, tài khoản khách và giao diện Việt/Anh responsive. Ghép ngẫu nhiên, xếp hạng và chat công khai để giai đoạn sau.
- Stack đề xuất: Next.js App Router, TypeScript, Tailwind CSS, PWA; Supabase Auth, Postgres và Realtime.
- Khách dùng Supabase anonymous Auth để có định danh phòng nhưng không cần tự đăng ký; tài khoản đăng nhập sẽ có tính năng riêng được chủ dự án chốt trước khi xây.
- Các quyết định trên là đề xuất ban đầu. Tôn trọng quyết định mới nhất của người dùng và cập nhật tài liệu liên quan.

## Cách làm việc

1. Trước khi sửa, kiểm tra cấu trúc repo, trạng thái Git và đọc các hướng dẫn `AGENTS.md` áp dụng.
2. Chia công việc thành thay đổi nhỏ, giải thích bằng tiếng Việt đơn giản. Tránh thêm thư viện, dịch vụ hoặc tính năng nếu chưa cần.
3. Không tự ý commit, push, tạo repo từ xa, tạo project Supabase, chạy migration trên project từ xa, hay triển khai production. Chỉ thực hiện khi người dùng yêu cầu rõ.
4. Không đưa khóa bí mật, token, mật khẩu hoặc dữ liệu thật vào Git. Dùng `.env.local` và cập nhật `.gitignore`; chỉ biến có tiền tố công khai được phép đưa vào client.
5. Supabase: mọi bảng trong schema được expose phải bật RLS và có policy theo đúng quyền truy cập. Không bao giờ đưa `service_role`/secret key vào ứng dụng trình duyệt. Không tin dữ liệu do client tự gửi để quyết định quyền hoặc kết quả trận.
6. Thay đổi schema cần migration có tên mô tả, được lưu cùng repo; tránh sửa schema remote thủ công mà không có migration tương ứng.
7. Khi hoàn tất, nêu rõ tệp đã sửa, lý do, các kiểm tra đã chạy và việc còn chờ. Không khẳng định đã kiểm tra nếu chưa chạy.
8. Theo cấu trúc và quy ước trong `docs/DEVELOPMENT.md`. Cập nhật `docs/PROGRESS.md` khi hoàn tất một chặng hoặc có thay đổi đáng kể về trạng thái.

## Quy ước dự án

- Dùng TypeScript và giữ kiểu dữ liệu rõ ràng; đặt tên biến/hàm bằng tiếng Anh nhất quán, nội dung hướng dẫn cho người dùng bằng tiếng Việt trừ khi có yêu cầu khác.
- Thiết kế mobile-first, hỗ trợ bàn phím và cảm ứng, trạng thái loading/error/empty, và thông báo lỗi dễ hiểu.
- Ưu tiên tính đúng luật chơi và quyền truy cập trước hiệu ứng hoặc tính năng xã hội.
- Trước khi thêm tính năng mới, cập nhật `docs/REQUIREMENTS.md` và `docs/TODO.md` nếu ảnh hưởng phạm vi.
- Không tự chạy hoặc thêm test trừ khi người dùng yêu cầu kiểm thử; khi được yêu cầu, bắt đầu bằng hướng dẫn dự án hiện tại.

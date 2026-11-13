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
- [x] Nhận diện mất kết nối / đóng tab qua Realtime Presence và bộ đếm ngược 30s tự động xử thắng (Claim Victory).
- [ ] Kiểm tra bằng hai trình duyệt/thiết bị.

## Chặng 5 — Ghép ngẫu nhiên (Quick Match) & Đấu lại (Rematch)

- [x] Thiết kế luồng ghép ngẫu nhiên và giả lập thời gian tìm trận ngẫu nhiên 1–5 giây.
- [x] Thêm dịch vụ tìm hoặc tạo phòng ghép trận (`findOrCreateQuickMatchRoom`) và hủy tìm kiếm (`cancelQuickMatch`) trong `roomService.ts`.
- [x] Thêm thẻ giao diện "Ghép trận nhanh" và hoạt ảnh radar tìm kiếm trong `ChessLobbyView.tsx`.
- [x] Xử lý tự động hủy, nhận diện đối thủ vào phòng, âm thanh tìm thấy trận đấu và chuyển thẳng vào trận trong `page.tsx`.
- [x] Tích hợp tính năng Đấu lại ván mới (Rematch): Mời đấu lại, chấp nhận, tự động đổi màu quân (swap color) và reset đồng hồ/bàn cờ chuẩn cờ vua.
- [ ] Kiểm tra thực tế bằng hai tab/trình duyệt.

## Chặng 6 — Hoàn thiện và phát hành bản đầu

- [x] Thêm PWA manifest, viewport mobile app và icon cho phép cài đặt ra màn hình chính.
- [x] Tích hợp bộ tạo âm thanh procedural chân thực Web Audio API (đi cờ, ăn quân, chiếu tướng, gõ số sudoku, chiến thắng) kèm nút Bật/Tắt âm thanh trên Header.
- [ ] Cải thiện accessibility, thao tác bàn phím và thông báo lỗi.
- [ ] Chọn nơi deploy và cấu hình biến môi trường production riêng (Vercel).
- [ ] Kiểm tra quyền truy cập/RLS và không đưa secret key lên client.
- [ ] Viết hướng dẫn build/deploy và danh sách giới hạn đã biết.
- [ ] Tạo PR phát hành, review diff và merge sau khi sẵn sàng.

## Chặng 7 — Hệ thống Bot cờ vua tự động (Chess AI & Matchmaking Fallback)

- [x] Xây dựng Chess AI Engine (`chessBot.ts`): Minimax + Alpha-Beta pruning + Piece-Square Tables với 3 cấp độ (Dễ, Vừa, Khó).
- [x] Thêm thẻ "Chơi với Máy (Bot)" ở sảnh cờ vua: chọn cấp độ thông minh và màu quân (Trắng, Đen, Ngẫu nhiên).
- [x] Tích hợp chế độ chơi offline với Bot trong `ChessGameView`: Giả lập thời gian suy nghĩ 0.6s–1.2s, xử lý bot tự động đi cờ, ăn quân, chiếu tướng.
- [x] Tích hợp đề xuất đấu với Bot trong Ghép trận nhanh (Quick Match fallback) khi tìm trận quá 2 phút (120s).
- [x] Hỗ trợ tính năng Đấu lại ván mới với Bot (hoán đổi màu quân).

## Chặng 8 — Biểu cảm tương tác (Emoji Reactions) & Bảng thành tích (Stats)

- [x] Thiết kế dịch vụ lưu trữ thành tích cờ vua vào `localStorage` (`statsService.ts`): ghi nhận trận thắng/thua/hòa, chuỗi thắng, phân loại đấu người / đấu bot.
- [x] Hiển thị thẻ Thống kê thành tích cá nhân (Stats Card) tại Sảnh cờ vua (`ChessLobbyView.tsx`).
- [x] Tích hợp tính năng Thả biểu cảm cảm xúc (Emoji Reactions: 👍, 🔥, 👏, 🤔, 😂, 😭) qua Realtime Broadcast trong `ChessGameView.tsx`.
- [x] Hiệu ứng biểu cảm bay nổi bật (Floating animated emoji) phía trên avatar người chơi khi nhận được biểu cảm.

## Chặng 9 — Hồ sơ cá nhân, Avatar & Nâng cấp UI/UX

- [x] Bộ sưu tập 12 Avatar linh vật chọn lọc (`avatarConstants.ts`) và hỗ trợ tải ảnh tùy biến (`UserAvatar.tsx`).
- [x] Tích hợp Supabase Auth (Đăng nhập Email, Đăng ký, Google OAuth) nâng cấp từ tài khoản khách.
- [x] Đồng bộ Avatar thời gian thực 2 chiều giữa 2 người chơi trong phòng thi đấu.
- [x] Bảo toàn ảnh tải lên trong modal hồ sơ (`customPhoto`), chuyển đổi mượt mà trước khi lưu.
- [x] Nâng cấp UI/UX toàn diện: Chuẩn hóa vùng chạm di động $\ge 40-44\text{px}$, in-game popovers cờ vua, làm sáng số trùng và tối ưu phím số Sudoku.

## Chặng 10 — Cờ Caro (Gomoku / 5 in a row)

- [x] Thiết kế bàn cờ Caro $15 \times 15$ chuẩn quốc tế, thuật toán kiểm tra 5 quân liên tiếp (hàng ngang, dọc, chéo).
- [x] Xây dựng thuật toán Bot Caro AI offline (Dễ, Vừa, Khó) dựa trên đánh giá thế cờ (Heuristic pattern matching).
- [x] Tạo module `src/features/games/caro/` (`CaroBoard.tsx`, `CaroControls.tsx`, `CaroLobbyView.tsx`, `CaroGameView.tsx`).
- [x] Tích hợp chế độ chơi offline với Bot AI và chế độ 2 người chơi cùng thiết bị (Pass & Play).
- [x] Tích hợp chế độ phòng riêng PvP Realtime qua Supabase và ghép trận ngẫu nhiên (Quick Match).
- [x] Đăng ký Cờ Caro vào `GAME_REGISTRY` và route `/games/caro`.

## Chặng 11 — Bảng xếp hạng (Leaderboard) & Tính năng Xã hội

- [x] Tạo module Leaderboard (`src/features/leaderboard/`): kiểu dữ liệu, service xếp hạng và tính điểm Elo / số trận thắng / thời gian Sudoku.
- [x] Bổ sung dịch vụ lưu trữ thành tích Cờ Caro (`caroStatsService.ts`) và kỷ lục thời gian giải Sudoku (`sudokuStatsService.ts`).
- [x] Thiết kế `LeaderboardModal.tsx` chuẩn UI/UX Pro Max với bục vinh danh Top 3 Podium (Vàng, Bạc, Đồng), danh sách thứ hạng và thanh cố định vị trí cá nhân.
- [x] Tích hợp nút mở Bảng xếp hạng trên Header và Sảnh chính (Lobby).
- [x] Tạo migration Supabase lưu trữ bảng xếp hạng (`supabase/migrations/20261109000000_leaderboard_schema.sql`).
- [ ] Triển khai bộ đếm người chơi trực tuyến tại sảnh (Realtime Presence) và lời mời thách đấu 1 chạm.
- [ ] Tích hợp máy phát nhạc nền Lo-fi/Chiptune thư giãn bằng Web Audio API.


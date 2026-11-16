# Danh sách công việc

Các mục được chia thành chặng nhỏ để dễ hoàn thành và review. Đánh dấu `[x]` khi đã xong; chuyển quyết định hoặc tính năng mới vào `REQUIREMENTS.md` trước khi triển khai.

## Chặng 0 — Chốt nền tảng dự án

- [x] Tạo tài liệu yêu cầu, hướng dẫn AI, quy trình GitHub/Supabase, nguyên tắc code và file tiến độ.
- [x] Tạo khung thư mục asset chung và theo từng game.
- [x] Viết nguyên tắc chung để tạo, bổ sung và kiểm tra asset cho nhiều loại game.
- [x] Chốt phạm vi thử nghiệm Sudoku và Cờ vua; ghép ngẫu nhiên để sau MVP.
- [x] Chốt tài khoản khách vào trước, tài khoản đăng nhập có tính năng riêng; hỗ trợ tiếng Việt và tiếng Anh.
- [ ] Chốt tên repo/app và phong cách giao diện (có thể để sau).
- [x] Chốt nhóm tính năng dành riêng cho tài khoản đăng nhập: Ghi danh vĩnh viễn lên Bảng xếp hạng toàn cầu, Đồng bộ tiến độ đám mây đa thiết bị, Khóa avatar độc quyền.
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
- [x] Triển khai bộ đếm người chơi trực tuyến tại sảnh (Realtime Presence) và lời mời thách đấu 1 chạm.
- [ ] Tích hợp máy phát nhạc nền Lo-fi/Chiptune thư giãn bằng Web Audio API.

## Chặng 12 — Trò chơi thứ 4: Cờ Tướng (Xiangqi / Chinese Chess)

- [x] Thiết kế động cơ luật Cờ Tướng (`src/features/games/xiangqi/xiangqiLogic.ts`): Bàn cờ $9 \times 10$ giao điểm, biểu diễn 7 loại quân (Tướng, Sĩ, Tượng, Xe, Pháo, Mã, Tốt) và sinh nước đi hợp lệ.
- [x] Xây dựng thuật toán kiểm tra Chiếu tướng (Check), Chiếu bí (Checkmate), Lộ mặt Tướng (Flying General) và luật cản chân Mã / cản mắt Tượng.
- [x] Thiết kế giao diện bàn cờ Cờ Tướng (`XiangqiBoard.tsx`) chuẩn mỹ thuật gỗ/ngà truyền thống, chữ Hán sắc nét, responsive mượt mà trên mobile và PC.
- [x] Tạo module giao diện đầy đủ (`XiangqiLobbyView.tsx`, `XiangqiGameView.tsx`, `XiangqiControls.tsx`).
- [x] Tích hợp chế độ chơi 2 người cùng máy (Pass & Play) với tính năng xoay bàn cờ theo lượt.
- [x] Đăng ký Cờ Tướng vào `GAME_REGISTRY` (`src/features/games/registry.ts`) và route `/games/xiangqi`.
- [x] Xây dựng Bot Cờ Tướng AI offline 3 cấp độ Dễ / Vừa / Khó (`ai/xiangqiBot.ts`) với cây tìm kiếm Minimax + Alpha-Beta và ma trận điểm giá trị thế cờ.
- [x] Tích hợp chế độ Đấu với Máy (Bot AI).
- [x] Tích hợp chế độ Phòng riêng PvP Realtime và Ghép trận nhanh qua Supabase.
- [x] Tích hợp lưu trữ thành tích và hiển thị tab Cờ Tướng trên Bảng xếp hạng Leaderboard.

## Chặng 13 — Chuyển đổi giao diện Neo-Arcade (Modern Pixel 16-bit)
> *Chi tiết kế hoạch từng bước được lưu tại [`docs/PIXEL_THEME_PLAN.md`](./PIXEL_THEME_PLAN.md).*

- [x] **Giai đoạn 1: Nền tảng Theme & Design System**:
  - [x] Nhúng Google Font `Pixelify Sans` hỗ trợ tiếng Việt trong `src/app/layout.tsx`.
  - [x] Thêm các tiện ích Tailwind cho pixel art (`pixel-box`, `pixel-btn`, `pixel-card`, hard-shadows) trong `tailwind.config.ts` và `src/app/globals.css`.
- [x] **Giai đoạn 2: Sảnh chính & Khung điều hướng chung**:
  - [x] Làm mới Header & Footer phong cách Arcade Cabinet (`Header.tsx`).
  - [x] Đổi mới Sảnh chính (`src/app/page.tsx`) & thẻ chọn game `GameCard.tsx` dạng Cartridge băng game.
  - [x] Đồng bộ phong cách các Modal (Hồ sơ, Bảng xếp hạng, Thách đấu).
- [x] **Giai đoạn 3: Chuyển đổi Bàn cờ 4 Game (Thực hiện tuần tự)**:
  - [x] 3.1 Cờ Caro (Gomoku): Bàn cờ gỗ pixel và quân cờ X/O chunky 8-bit.
  - [x] 3.2 Sudoku: Bảng 9x9 kiểu máy game cầm tay LCD và bàn phím số cơ học pixel.
  - [x] 3.3 Cờ Vua (Chess): Bàn cờ retro và bộ quân cờ Pixel Chess Sprite 16-bit.
  - [x] 3.4 Cờ Tướng (Xiangqi): Bàn cờ mộc pixel và quân cờ tròn dập nổi chữ Hán/Việt nét pixel.
- [x] **Giai đoạn 4: Hoàn thiện Hiệu ứng, Âm thanh & Mobile UX**:
  - [x] Đồng bộ hiệu ứng `PixelFX` pháo hoa confetti và âm thanh chiptune Web Audio API.
  - [x] Kiểm tra vùng chạm di động $\ge 44\text{px}$ và độ tương phản màu sắc.
  - [x] Chạy kiểm thử toàn diện `npm run build` không lỗi.

## Chặng 15 — Bảo toàn vĩnh viễn Thành tích Đám mây (Cloud Sync) & Chi tiết Kỷ lục Sudoku

- [x] **Bước 1: Gộp & Bảo toàn vĩnh viễn Elo / Thành tích khi đăng nhập Google / Email**:
  - [x] Tạo dịch vụ gộp thông minh `statsMergeService.ts` kết hợp thành tích cục bộ (Guest) và đám mây (Cloud) khi đăng nhập Google/Email.
  - [x] Bảo toàn cả 4 tựa game: Cờ vua, Cờ tướng, Cờ caro và Sudoku lên `user_metadata` của Supabase Auth.
  - [x] Thêm khóa `kombat_xiangqi_stats` vào chu trình đồng bộ đám mây `syncAllCloudStats` trong `AuthContext.tsx`.
- [x] **Bước 2: Quản lý & Hiển thị chi tiết Kỷ lục Sudoku (Thời gian từng chế độ)**:
  - [x] Lưu trữ kỷ lục giải nhanh nhất (`bestTimeSeconds`) và số ván hoàn thành cho 3 cấp độ: Dễ, Vừa, Khó trong `sudokuStatsService.ts`.
  - [x] Hiển thị huy hiệu kỷ lục tốt nhất của chế độ đang chơi ngay trên thanh điều khiển `SudokuControls.tsx`.
  - [x] Vinh danh `KỶ LỤC MỚI! (NEW PERSONAL BEST)` kèm thông báo vượt kỷ lục cũ trong `VictoryModal.tsx`.
  - [x] Bổ sung tab Sudoku và Cờ tướng vào Modal Hồ sơ cá nhân `ProfileAuthModal.tsx` với bảng thống kê chi tiết từng cấp độ.
- [x] **Bước 3: Đồng bộ Bảng xếp hạng toàn cầu (`leaderboard_scores`)**:
  - [x] Tạo migration `20261115000000_add_xiangqi_to_leaderboard.sql` hỗ trợ Cờ tướng.
  - [x] Bổ sung hàm tự động upsert điểm vào `leaderboard_scores` sau mỗi ván thắng và khi đăng nhập tài khoản.
- [x] **Bước 4: Tối ưu PWA cho Android**:
  - [x] Tạo bộ icon PNG kích thước chuẩn 192x192 và 512x512 trong `public/`.
  - [x] Cập nhật `src/app/manifest.ts` đầy đủ tiêu chuẩn WebAPK Android (id, categories, icons maskable/any, lang).

## Chặng 16 — Trò chơi thứ 5: Rắn Săn Mồi Pixel (8-Bit Retro Snake)

- [x] Thiết kế động cơ logic Rắn săn mồi (`snakeLogic.ts`): Lưới $20 \times 20$, input buffering chống tự quay đầu $180^\circ$, táo đỏ (+10đ), táo vàng bonus xuất hiện ngẫu nhiên (+50đ), tốc độ tăng dần theo điểm số.
- [x] Dịch vụ lưu trữ thành tích (`snakeStatsService.ts`): Điểm cao kỷ lục (High score), tổng số táo ăn, số ván đã chơi, tự động đồng bộ đám mây và bảng xếp hạng.
- [x] Thiết kế giao diện chơi game retro (`SnakeBoard.tsx`, `SnakeControls.tsx`, `GameOverModal.tsx`, `src/app/games/snake/page.tsx`):
  - [x] Hỗ trợ phím mũi tên / WASD trên PC, phím Space/P tạm dừng.
  - [x] Hỗ trợ cụm D-pad ảo 4 chiều và cử chỉ vuốt (swipe) mượt mà trên điện thoại.
  - [x] Hiệu ứng ăn mừng kỷ lục mới pháo hoa `PixelFxOverlay` và âm thanh chiptune `playSnakeEat`, `playSnakeGolden`, `playSnakeDie`.
- [x] Đăng ký Snake vào `GAME_REGISTRY`, danh mục thể loại Arcade (`categories.ts`) và vẽ icon pixel Snake cho `GameTile.tsx`.
- [x] Tích hợp Bảng xếp hạng Leaderboard và Hồ sơ người chơi (`ProfileAuthModal.tsx`).
- [x] Kiểm thử `npx tsc --noEmit` và `npm run build`.

## Chặng 17 — Trò chơi thứ 6: 2048 (Puzzle Logic)

- [x] Thiết kế động cơ logic 2048 (`game2048Logic.ts`): Ma trận $4 \times 4$, thuật toán trượt và gộp ô số, tính điểm, 1-step Undo, nhận diện chiến thắng 2048 và kiểm tra Game Over.
- [x] Dịch vụ lưu trữ thành tích (`game2048StatsService.ts`): Điểm cao kỷ lục (High score), ô số lớn nhất (Max tile), số ván đã chơi, tự động đồng bộ đám mây và Supabase `leaderboard_scores`.
- [x] Thiết kế giao diện 16-bit Neo-Arcade (`Game2048Board.tsx`, `Game2048Controls.tsx`, `Game2048VictoryModal.tsx`, `Game2048OverModal.tsx`, `src/app/games/game2048/page.tsx`):
  - [x] Hiển thị ô số với màu sắc pixel tương phản cao và hiệu ứng đổ bóng pixel retro.
  - [x] Hiệu ứng chuyển động trượt mượt mà (Smooth sliding animation `translate3d`).
  - [x] Điều khiển đa nền tảng: Phím mũi tên / WASD / phím Z (Undo) trên PC, vuốt màn hình cảm ứng (Touch swipe) và cụm D-pad ảo trên điện thoại.
  - [x] Tích hợp âm thanh chiptune trượt ô, gộp số và chúc mừng chiến thắng trong `soundService.ts`.
- [x] Đăng ký 2048 vào `GAME_REGISTRY` (thể loại Puzzle), vẽ icon pixel 2048 cho `GameTile.tsx`.
- [x] Tích hợp vào Bảng xếp hạng toàn cầu (`LeaderboardModal.tsx`), Hồ sơ người chơi (`ProfileAuthModal.tsx`) và gộp dữ liệu đám mây (`statsMergeService.ts`, `AuthContext.tsx`).
- [x] Tối ưu an toàn đăng xuất: Dọn sạch cache kỷ lục local để tránh lây nhiễm điểm sang tài khoản khách.
- [x] Kiểm thử kiểu TypeScript `npx tsc --noEmit` và bản build `npm run build`.

## Chặng 18 — Trò chơi thứ 7: Dò Mìn Pixel (Minesweeper Classic)

- [x] Thiết kế động cơ logic Dò Mìn (`minesweeperLogic.ts`):
  - [x] Hỗ trợ 3 cấp độ: Dễ ($9 \times 9$, 10 mìn), Vừa ($16 \times 16$, 40 mìn), Khó ($16 \times 30$, 99 mìn).
  - [x] Nước click đầu tiên an toàn tuyệt đối (First Click Never Boom) đảm bảo không bao giờ trúng mìn và mở ra vùng trống.
  - [x] Thuật toán mở loang tự động (Flood Fill BFS) khi click vào ô 0 mìn.
  - [x] Cơ chế cắm/gỡ cờ 🚩 và mở nhanh (Chord) khi đủ cờ quanh ô số.
- [x] Dịch vụ thành tích Dò Mìn (`minesweeperStatsService.ts`):
  - [x] Lưu thời gian phá đảo nhanh nhất (giây) theo từng cấp độ, số ván thắng, tự động đồng bộ đám mây và Supabase.
- [x] Giao diện Neo-Arcade 16-bit (`MinesweeperBoard.tsx`, `MinesweeperControls.tsx`, `MinesweeperWinModal.tsx`, `MinesweeperOverModal.tsx`, `src/app/games/minesweeper/page.tsx`):
  - [x] Mặt cười tương tác (🙂 bình thường, 😮 khi đang ấn, 😎 khi thắng, 😵 khi trúng mìn), bấm để chơi lại.
  - [x] Màn hình LED kỹ thuật số đếm số mìn còn lại và đếm giây từ 000 đến 999.
  - [x] Phím chuyển đổi Đào ô / Cắm cờ và hỗ trợ chạm giữ (long-press) tiện lợi trên điện thoại.
  - [x] Khung cuộn ngang linh hoạt cho các màn chơi kích thước lớn trên di động.
  - [x] Tối ưu hiển thị Dò Mìn di động: Cố định ô vuông không bị ép dẹp ở chế độ Khó, chữ số rõ nét không bị che khuất, cuộn ngang mượt mà và bổ sung nút Thu phóng (Zoom) kích thước ô.
  - [x] Âm thanh Web Audio chiptune (click, cắm cờ, bom nổ, chiến thắng).
- [x] Đăng ký Sảnh chính và Bảng xếp hạng:
  - [x] Đăng ký `minesweeper` vào `GAME_REGISTRY` và vẽ icon pixel quả mìn gai + cờ đỏ cho `GameTile.tsx`.
  - [x] Tích hợp tab Dò Mìn vào Bảng xếp hạng Leaderboard toàn cầu, Hồ sơ cá nhân `ProfileAuthModal.tsx` và cơ chế gộp đám mây `statsMergeService.ts`.
  - [x] Tạo migration `20261115200000_add_minesweeper_to_leaderboard.sql`.
- [x] Kiểm thử kiểu `npx tsc --noEmit` và `npm run build`.

## Chặng 19 — Trò chơi thứ 8: Phá Gạch Pixel (Brick Breaker / Arkanoid Arcade)

- [x] Động cơ vật lý nảy bóng Canvas 2D (`brickBreakerLogic.ts`):
  - [x] Tỉ lệ khung hình $3:4$ (Canvas $480 \times 640$), tốc độ tăng dần theo combo và màn chơi.
  - [x] Thuật toán nảy bóng linh hoạt trên thanh trượt (góc nảy phụ thuộc điểm chạm).
  - [x] Hệ thống vật phẩm rơi (Powerups): Kéo dài thanh (↔️), Nhân đôi bóng (⚡), Cộng 2 cho mỗi bóng hiện có (+2), Thêm mạng (💖). Bỏ súng Laser để cân bằng gameplay.
  - [x] Đa dạng loại gạch: Gạch thường 5 tầng màu tính điểm, gạch thép 2 lần đập và gạch bom phát nổ lân cận.
  - [x] Hệ thống qua màn liên hoàn (Stages), hồi sinh bóng và hiệu ứng nổ hạt pixel (Particles).
- [x] Dịch vụ lưu trữ thành tích (`brickBreakerStatsService.ts`):
  - [x] Điểm cao kỷ lục, màn chơi cao nhất đạt được, tổng số gạch phá vỡ, tự động đồng bộ đám mây và Supabase.
- [x] Giao diện Neo-Arcade 16-bit (`BrickBreakerGame.tsx`, `src/app/games/brick-breaker/page.tsx`):
  - [x] Đầy đủ điều khiển PC (chuột, phím A/D, phím Space) và cảm ứng Mobile (kéo vuốt trực tiếp, cụm phím ảo).
  - [x] Âm thanh Web Audio chiptune (đập gạch, nảy paddle, nhặt buff, mất bóng, bắn laser, qua màn).
  - [x] Modal Game Over kèm pháo hoa khi lập kỷ lục điểm mới.
- [x] Đăng ký Sảnh chính và Bảng xếp hạng:
  - [x] Đăng ký `brick_breaker` vào `GAME_REGISTRY` thuộc thể loại Arcade (`categories.ts`).
  - [x] Vẽ icon pixel thanh trượt, bóng và các hàng gạch nhiều màu cho `GameTile.tsx`.
  - [x] Tích hợp tab Phá Gạch vào Bảng xếp hạng toàn cầu (`LeaderboardModal.tsx`), Hồ sơ cá nhân (`ProfileAuthModal.tsx`) và tự động gộp đám mây (`statsMergeService.ts`).
  - [x] Tạo migration `20261116000000_add_brick_breaker_to_leaderboard.sql`.
  - [x] Tinh gọn Bảng xếp hạng Leaderboard: Bỏ các thông tin chi tiết phụ (số ván chơi, số bàn), chỉ ghi Điểm số và Thời gian theo từng loại game.
  - [x] Phân chia cấp độ thi đấu trên Bảng xếp hạng Leaderboard: Bổ sung thanh chọn cấp độ con (Dễ, Trung bình, Khó) cho các tựa game có độ khó (Sudoku, Dò Mìn), tạo migration `20261116120000_add_difficulty_levels_to_leaderboard.sql` và đồng bộ thành tích độc lập theo từng cấp độ.
  - [x] Chính sách Bảng xếp hạng độc quyền cho tài khoản đăng ký: Chỉ tài khoản đã đăng ký (Email/Google) mới được lưu lên BXH Supabase. Khách có thể xem trước thứ hạng (Preview) và có nút 1 chạm đăng nhập để ghi danh vĩnh viễn (`20261116180000_only_allow_registered_users_on_leaderboard.sql`).
- [x] Kiểm thử kiểu `npx tsc --noEmit` và `npm run build`.

## Chặng 20 — Trò chơi thứ 9: Khủng Long T-Rex (T-Rex Runner Arcade)

- [x] Động cơ vật lý & Logic chạy vô tận Canvas 2D (`dinoLogic.ts`):
  - [x] Trọng lực, vận tốc nhảy, gia tốc tiếp đất nhanh khi cúi người (Drop Acceleration).
  - [x] Chướng ngại vật đa dạng: Xương rồng nhỏ (1, 2, 3 cây), Xương rồng lớn (1, 2 cây) và Chim cổ đại Pterodactyl 3 cao độ (thấp, trung, cao).
  - [x] Chu kỳ Ngày & Đêm huyền ảo mỗi 700 điểm với mặt trăng khuyết và đàn sao nhấp nháy.
  - [x] Tốc độ tăng dần theo quãng đường, mốc 100 điểm nhấp nháy kèm âm thanh retro bíp bíp.
- [x] Dịch vụ lưu trữ thành tích (`tRexStatsService.ts`):
  - [x] Điểm cao kỷ lục, tổng số lần nhảy, tổng quãng đường chạy, số ván đã chơi, tự động đồng bộ đám mây và Supabase.
- [x] Giao diện Neo-Arcade 16-bit (`TRexGame.tsx`, `src/app/games/t-rex-runner/page.tsx`):
  - [x] Điều khiển đa nền tảng: Bàn phím PC (Space, Mũi tên Lên/Xuống), vuốt chạm màn hình (Swipe Up/Down) và cụm phím ảo cảm ứng (Nhảy & Cúi Giữ).
  - [x] Âm thanh Web Audio chiptune (`playDinoJump`, `playDinoMilestone`, `playDinoHit`).
  - [x] Modal Game Over kèm pháo hoa khi lập kỷ lục điểm mới.
- [x] Đăng ký Sảnh chính và Bảng xếp hạng:
  - [x] Đăng ký `t_rex_runner` vào `GAME_REGISTRY` thuộc thể loại Arcade (`categories.ts`).
  - [x] Vẽ icon pixel chú khủng long T-Rex và cây xương rồng cho `GameTile.tsx`.
  - [x] Tích hợp tab T-Rex vào Bảng xếp hạng toàn cầu (`LeaderboardModal.tsx`), Hồ sơ cá nhân (`ProfileAuthModal.tsx`) và tự động gộp đám mây (`statsMergeService.ts`).
  - [x] Tạo migration `20261116220000_add_t_rex_runner_to_leaderboard.sql`.
- [x] Kiểm thử kiểu `npx tsc --noEmit` và `npm run build`.

## Chặng 21 — Trò chơi thứ 10: Flappy Bird (Flappy Bird Arcade)

- [x] Động cơ vật lý & Logic vỗ cánh Canvas 2D (`flappyLogic.ts`):
  - [x] Trọng lực ($0.44$), lực nâng khi đập cánh ($FLAP = -7.8$), vận tốc cực đại và góc xoay mượt mà của chim (hướng lên $-25^\circ$ khi vỗ cánh, chúc đầu xuống $75^\circ$ khi rơi).
  - [x] Cặp cột ống nước retro green với vành miệng và hiệu ứng sáng bóng, khe hở thông thoáng ($126\text{px}$) cân bằng hoàn hảo cho cả điện thoại và máy tính.
  - [x] Hệ thống 4 bậc huy chương vinh danh theo mốc điểm: 🥉 Đồng ($10$), 🥈 Bạc ($20$), 🥇 Vàng ($30$), 💎 Bạch Kim ($40+$).
  - [x] Chu kỳ Ngày & Đêm đổi màu nền trời nhịp nhàng sau mỗi 20 điểm.
- [x] Dịch vụ lưu trữ thành tích (`flappyStatsService.ts`):
  - [x] Điểm cao kỷ lục, tổng số lần đập cánh, số cặp ống đã vượt qua, số ván đã chơi, tự động đồng bộ đám mây và Supabase.
- [x] Giao diện Neo-Arcade 16-bit (`FlappyBirdGame.tsx`, `src/app/games/flappy-bird/page.tsx`):
  - [x] Điều khiển đa nền tảng: Bàn phím PC (Space, Mũi tên Lên, Phím W), chạm màn hình (Tap anywhere) và nút cảm ứng lớn cho ngón cái trên mobile.
  - [x] Âm thanh Web Audio chiptune (`playFlappyFlap`, `playFlappyScore`, `playFlappyHit`, `playFlappyDie`).
  - [x] Modal Game Over với bảng điểm huy chương retro, nút Chơi Lại và nút Về Sảnh Trò Chơi.
- [x] Đăng ký Sảnh chính và Bảng xếp hạng:
  - [x] Đăng ký `flappy_bird` vào `GAME_REGISTRY` thuộc thể loại Arcade (`categories.ts`).
  - [x] Vẽ icon pixel chú chim Flappy Bird vàng và ống nước xanh cho `GameTile.tsx`.
  - [x] Tích hợp tab Flappy vào Bảng xếp hạng toàn cầu (`LeaderboardModal.tsx`), Hồ sơ cá nhân (`ProfileAuthModal.tsx`) và tự động gộp đám mây (`statsMergeService.ts`).
  - [x] Tạo migration `20261116230000_add_flappy_bird_to_leaderboard.sql`.
- [x] Kiểm thử kiểu `npx tsc --noEmit` và `npm run build` (15/15 routes static).

- [x] **Trò chuyện nhanh & Biểu cảm tương tác Trong trận (In-Game Quick Chat & Emotes)**:
  - [x] Bộ câu thoại nhanh song ngữ Việt-Anh kèm icon và 12 biểu cảm Emote Pixel 16-bit (`socialPresets.ts`).
  - [x] Bóng thoại retro nổi trên avatar người chơi và đối thủ với đuôi định hướng (`ChatBubble.tsx`).
  - [x] Trình chọn Neo-Arcade 2 tab với bộ đếm cooldown 2 giây chống spam (`InGameSocialPicker.tsx`).
  - [x] Âm thanh hiệu ứng 8-bit `playSocialPop()` trong Web Audio API.
  - [x] Tích hợp vào Cờ Vua (`ChessGameView.tsx`), Cờ Caro (`CaroGameView.tsx` & `CaroControls.tsx`) và Cờ Tướng (`XiangqiGameView.tsx` & `XiangqiControls.tsx`).
  - [x] Tương tác tự động của Bot AI khi chơi offline: Bot có 45% cơ hội phản hồi lại bằng câu chat dí dỏm hoặc biểu cảm sau 900ms.
- [ ] **Chế độ Khán giả (Spectator Mode)**: Cho phép bạn bè vào xem trực tiếp ván cờ qua link phòng.
- [ ] **Hệ thống Thành tựu & Huy hiệu Pixel (Achievements & Badges)**:
  - Bổ sung bộ danh hiệu mở khóa khi đạt các cột mốc thú vị (VD: "Phá kỷ lục 500 điểm Rắn", "Tạo ra ô 2048", "Thắng 10 ván Caro", "Giải Sudoku dưới 3 phút", "Phá 1000 khối gạch").
  - Hiển thị huy hiệu đã đạt được trong Hồ sơ cá nhân (Profile Modal).




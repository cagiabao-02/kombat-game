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
- [x] Chọn nơi deploy và cấu hình biến môi trường production riêng (Vercel: `kombat-red.vercel.app`).
- [x] Kiểm tra quyền truy cập/RLS và không đưa secret key lên client.
- [x] Hoàn thiện SEO, `robots.txt`, `sitemap.xml` và OpenGraph Preview (`opengraph-image.tsx`).
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
- [x] **Hệ thống Thành tựu & Huy hiệu Pixel (Achievements & Badges)**:
  - [x] Bộ 24 huy hiệu pixel độc quyền phân chia 4 bậc: 🥉 Đồng, 🥈 Bạc, 🥇 Vàng, 💎 Bạch Kim (`achievementsConfig.ts`).
  - [x] Tự động kiểm tra điều kiện sau mỗi ván chơi của cả 10 tựa game (`achievementService.ts`).
  - [x] Âm thanh fanfare arpeggio `playAchievementUnlock()` khi mở khóa huy hiệu.
  - [x] Toast pop-up thông báo Neo-Arcade trượt xuống đầu màn hình (`AchievementToast.tsx`).
  - [x] Tủ trưng bày trong Hồ sơ cá nhân với thanh tiến độ, bộ đếm huy chương 4 bậc và bộ lọc danh mục (`ProfileAuthModal.tsx`).
  - [x] Đồng bộ dữ liệu thành tựu lên Supabase Cloud khi người dùng đăng nhập (`statsMergeService.ts`).
- [x] **Bộ điều khiển âm lượng đa mức (Master Volume Slider & Quick Presets)**:
  - [x] Tích hợp Master Gain Node vào `SoundService` (`soundService.ts`), điều khiển âm lượng chung $0-100\%$ cho toàn bộ 10 trò chơi.
  - [x] Popover điều chỉnh âm lượng trên Desktop Header với thanh trượt pixel `.pixel-range` và 4 nút chọn nhanh (0%, 30%, 70%, 100%) (`VolumeControl.tsx`).
  - [x] Khối điều khiển âm lượng trực tiếp trong Menu ngăn kéo Mobile (Hamburger Drawer).
  - [x] Âm thanh thử nghiệm (`playVolumePreview()`) phản hồi tức thì khi kéo thanh trượt.
  - [x] Lưu trữ cục bộ (`kombat_sound_volume`) và đồng bộ thời gian thực qua CustomEvent `kombat:volume_change`.
- [x] **Lịch sử Thi đấu & Trình Xem lại Ván cờ (Match History & Replay Viewer)**:
  - [x] Cố định giới hạn lưu trữ tối đa **20 trận gần nhất** (`MAX_MATCH_HISTORY = 20`) chống phình to dữ liệu LocalStorage và Supabase.
  - [x] Định nghĩa cấu trúc ván đấu, dịch vụ quản lý và đồng bộ đám mây (`types.ts`, `matchHistoryService.ts`, `statsMergeService.ts`).
  - [x] Xây dựng Trình xem lại tương tác Neo-Arcade hỗ trợ tua từng nước đi, tự động phát lại và tái tạo trạng thái bàn cờ Cờ Vua, Cờ Caro, Cờ Tướng (`MatchReplayModal.tsx`).
  - [x] Tab "LỊCH SỬ" trong Hồ sơ cá nhân với bộ lọc game dropdown gọn gàng, bỏ hiển thị `Lưu 0/20 ván`, nút xóa lịch sử và mở trình xem lại (`ProfileAuthModal.tsx`).
  - [x] Tối ưu hóa UI/UX mục "Thành tích" trong Hồ sơ cá nhân: Thay thế cụm nút chọn game dễ phình to bằng Menu Dropdown phân nhóm chuẩn mực (Board / Puzzle / Arcade) và bảng "Tổng quan" chuyển thành chỉ số tài khoản bất biến với bố cục 3 thẻ số liệu + 1 thanh game chơi nhiều nhất rộng rãi không bị cắt chữ.
  - [x] Tối giản hóa ô "Sắp có" tại sảnh chính: Bỏ gợi ý tên game cụ thể, chỉ hiển thị nhãn "Sắp có" / "Coming soon" tinh gọn.
  - [x] Tự động ghi ván và nút "Xem lại ván này" ngay sau khi trận đấu kết thúc trong Cờ Vua (`ChessGameView.tsx`), Cờ Caro (`CaroGameView.tsx`) và Cờ Tướng (`XiangqiGameView.tsx`).
- [x] **Trò chơi thứ 11 — Block Blast (Xếp khối nổ dòng 8x8)**:
  - [x] Động cơ xếp khối polyomino trên bàn cờ 8x8 (`blockBlastLogic.ts`, `blockShapes.ts`): kiểm tra hợp lệ, đặt khối, quét nổ hàng và cột dọc, hệ thống tính điểm Combo lũy tiến hàm bậc hai (Combo càng cao điểm thưởng càng bùng nổ khổng lồ).
  - [x] Thuật toán chia 3 khối đảm bảo có ít nhất 1 đường sống (Solvable & Fair RNG): không bao giờ chia bộ 3 khối mà người chơi bị bế tắc ngay lập tức; ưu tiên khối cứu tinh (rescue shapes) khi bàn cờ hẹp.
  - [x] Cơ chế Tự động lưu & Khôi phục khi thoát game (Auto-save & Resume - `blockBlastStorage.ts`): bảo lưu bàn cờ, 3 khối khay, điểm số và combo khi người chơi thoát ra sảnh hoặc đóng tab; chỉ reset khi Game Over hoặc chủ động bấm Chơi lại.
  - [x] Dịch vụ quản lý thành tích và đồng bộ đám mây (`blockBlastStatsService.ts`, `statsMergeService.ts`).
  - [x] Giao diện Neo-Arcade cảm ứng di động & chuột PC (`BlockBlastBoard.tsx`, `BlockBlastTray.tsx`, `BlockBlastScoreBar.tsx`, `BlockBlastGameOverModal.tsx`, `BlockBlastGame.tsx`):
    - [x] Hỗ trợ Drag & Drop với touch offset nhấc khối lên 70px trên ngón tay, kèm Ghost preview bóng mờ định vị.
    - [x] Hỗ trợ Chạm chọn khay $\rightarrow$ Chạm đặt bàn cờ (Tap-to-place) tối ưu chơi 1 tay trên điện thoại.
    - [x] Hiệu ứng âm thanh procedural Web Audio API (`playBlockPickup`, `playBlockPlace`, `playBlockClearLine`, `playBlockComboFanfare`, `playBlockGameOver`).
  - [x] Đăng ký Sảnh chính (thể loại Giải đố - Puzzle), Bảng xếp hạng Leaderboard (`LeaderboardModal.tsx`), Hồ sơ cá nhân (`ProfileAuthModal.tsx`) và vẽ icon pixel cho `GameTile.tsx`.
- [x] **Hệ thống Nhạc nền 8-bit Procedural Chiptune BGM & Điều chỉnh âm lượng kép (SFX / BGM)**:
  - [x] Tích hợp bộ tổng hợp nhạc Web Audio API 0MB, bộ lọc ấm 2200Hz và 3 chủ đề độc quyền (Lobby, Arcade, Strategy).
  - [x] Tách 2 kênh âm lượng độc lập (SFX & BGM) với thanh trượt $0-100\%$, nút mute riêng, presets và live track badge trên Header và Mobile Drawer.
  - [x] `BgmController` tự động chuyển bài theo URL và tự dừng khi chuyển tab.
- [x] **Trò chơi thứ 12 — Cờ Vây (Go / Weiqi / Baduk)**:
  - [x] Động cơ luật cờ Vây chuẩn quốc tế (`goLogic.ts`, `types.ts`): hỗ trợ kích thước 9x9 (nhanh/mobile), 13x13 (vừa) và 19x19 (chuẩn thi đấu); thuật toán tìm đám quân liên kết (group flood-fill), đếm khí (liberties), bắt tù binh (capture), cấm tự sát (suicide check), luật kiếp (Ko rule), bỏ lượt (Pass) và tính điểm lãnh thổ + tù binh + điểm chấp Komi 6.5.
  - [x] Trí tuệ nhân tạo Bot AI Cờ Vây (`goBot.ts`): 2 cấp độ Dễ (Tập sự) và Trung bình (Kỳ thủ) tính toán dọa bắt quân (Atari), bảo vệ đám quân nguy cấp, chiếm góc/cạnh và bao vây lãnh thổ.
  - [x] Dịch vụ lưu trữ điểm số & khôi phục ván đấu (`goStorage.ts`, `goStatsService.ts`).
  - [x] Giao diện bàn cờ gỗ Neo-Arcade responsive (`GoBoard.tsx`, `GoScoreBar.tsx`, `GoLobby.tsx`, `GoGame.tsx`): điểm sao định vị (Hoshi/Tengen), bóng mờ đặt thử (preview hover/touch), cờ đánh dấu nước đi mới nhất, bảng đếm tù binh 2 bên và modal kết thúc tính điểm.
  - [x] Âm thanh xúc giác gõ cờ đá thanh thoát (`playGoStonePlace`, `playGoStoneCapture`) trong `soundService.ts`.
  - [x] Đăng ký Sảnh chính (`GAME_REGISTRY`), thể loại Cờ chiến thuật (`strategy`), đồng bộ Bảng xếp hạng, Hồ sơ cá nhân và bản dịch Việt/Anh.
- [x] **Đấu Online 1v1 & Ghép Nhanh Thời Gian Thực cho Cờ Vây (Realtime Multiplayer Go Room)**:
  - [x] Dịch vụ quản lý phòng Supabase Realtime (`goRoomService.ts`): Tạo phòng 6 ký tự ngẫu nhiên, tìm và ghép phòng tự động (Quick Match), tham gia bằng mã phòng hoặc link chia sẻ trực tiếp (`/games/go?room=CODE`).
  - [x] Đồng bộ nước đi, lượt bỏ lượt (Pass), đầu hàng (Resign) và tính điểm lãnh thổ qua Supabase Realtime Channel (`postgres_changes` + `broadcast`).
  - [x] Màn hình chờ phòng đấu trực quan: hiển thị mã phòng lớn, nút 1-chạm sao chép link mời bạn bè và spinner đợi đối thủ.
  - [x] Tính năng Tái đấu (Rematch) trong modal kết thúc ván, tự động đảo phe (Đen $\leftrightarrow$ Trắng).
  - [x] Tích hợp Biểu cảm tương tác Emotes và Tin nhắn nhanh Quick Chat thời gian thực.
  - [x] Hỗ trợ song ngữ 100% Việt / Anh cho toàn bộ giao diện và luồng phòng đấu online.
- [x] **Lịch sử Thi đấu & Trình Xem Lại Ván Cờ (Match History & Replay Viewer) cho Cờ Vây**:
  - [x] Định nghĩa kiểu `GoMatchRecord`, `GoMoveRecord` (`types.ts`) và tích hợp lưu trữ tối đa 20 ván vào `matchHistoryService.ts`.
  - [x] Tích hợp tái tạo bàn cờ Cờ Vây từng nước đi trong `MatchReplayModal.tsx` với đầy đủ nút tua, thanh kéo, tự động phát (Auto Play).
  - [x] Tự động ghi ván khi kết thúc trận và bổ sung nút "XEM LẠI VÁN ĐẤU NÀY" trong `GoGameOverModal.tsx`.
  - [x] Bổ sung bộ lọc Cờ Vây (`⚪ Cờ Vây / Go`) trong tab Lịch sử tại `ProfileAuthModal.tsx`.
- [ ] **Chế độ Khán giả (Spectator Mode)**: Cho phép bạn bè vào xem trực tiếp ván cờ qua link phòng.
- [x] **Chặng 25 — Thử thách Hàng ngày (Daily Challenges) & Chuỗi ngày chơi (Daily Streak 🔥)**:
  - [x] Định nghĩa kiểu dữ liệu & kho 15 nhiệm vụ hàng ngày trải đều 3 thể loại (`types.ts`, `dailyConfig.ts`).
  - [x] Dịch vụ quản lý nhiệm vụ ngày, Baseline Snapshot, tính tiến độ từ `localStorage`, bộ đếm chuỗi ngày (`currentStreak`, `bestStreak`) và đồng bộ Supabase Cloud (`dailyService.ts`).
  - [x] Giao diện Modal Nhiệm vụ Hàng ngày (`DailyChallengesModal.tsx`): Hiển thị ngọn lửa Streak, đếm ngược tới 00:00, 3 thẻ nhiệm vụ kèm icon Pixel game, thanh tiến độ và nút Chơi ngay / Nhận thưởng + Pháo hoa PixelFX khi hoàn tất.
  - [x] Tích hợp nút Streak 🔥 lên Header (`Header.tsx`) kèm đồng bộ khi đăng nhập (`statsMergeService.ts`).
- [x] **Chặng 26 — PWA Offline 100% & Banner Cài Đặt App 1-Chạm (Add to Home Screen)**:
  - [x] Xây dựng Service Worker thuần (`public/sw.js`) cache Sảnh chính, 13 route game và tài nguyên tĩnh (`_next/static/`, icons) với chiến lược Network-First cho HTML và Cache-First cho tài nguyên tĩnh.
  - [x] Xây dựng `PwaManager.tsx` tích hợp vào `layout.tsx`: Đăng ký Service Worker, hiển thị thanh trạng thái Ngoại tuyến khi mất mạng và Banner cài đặt 1-chạm cho Android/Desktop + hướng dẫn iOS Safari.
  - [x] Cập nhật `manifest.ts` đầy đủ mô tả 13 tựa game.
- [x] **Trò chơi thứ 13 — Tetris Cổ Điển (Classic 10×20 Arcade)**:
  - [x] Động cơ Tetris chuẩn (`tetrisLogic.ts`, `types.ts`): Bàn 10×20, 7 khối Tetromino, 7-Bag Randomizer, Wall Kick xoay khối, Ghost Piece, Hold Piece, Next Queue (3 khối), Soft Drop / Hard Drop, tính điểm Single/Double/Triple/TETRIS & tăng Level mỗi 10 dòng.
  - [x] Lưu trữ trạng thái & thành tích (`tetrisStorage.ts`, `tetrisStatsService.ts`, `statsMergeService.ts`).
  - [x] Giao diện Neo-Arcade 16-bit responsive (`TetrisGame.tsx`, `src/app/games/tetris/page.tsx`): Hỗ trợ bàn phím PC (Mũi tên / WASD / Space / C hoặc Shift để Hold / P tạm dừng) và cụm phím cảm ứng mượt mà trên điện thoại.
  - [x] Âm thanh 8-bit chiptune (`soundService.ts`), nhạc nền Arcade (`BgmController.tsx`), Sảnh chính (`GAME_REGISTRY`, `GameTile.tsx`) và Bảng xếp hạng (`LeaderboardModal.tsx`).
- [x] **Chặng 28 — Trò chơi thứ 14: Cờ Lật Othello / Reversi (8×8 Strategy)**:
  - [x] Động cơ luật Othello 8×8 (`othelloLogic.ts`, `types.ts`): Kẹp lật 8 hướng, gợi ý nước đi hợp lệ, tự động Pass khi hết nước, đếm quân Đen/Trắng và phân định thắng/hòa.
  - [x] Bot AI 3 cấp độ (`othelloBot.ts`): Dễ, Vừa, Khó (Minimax Alpha-Beta + ma trận trọng số góc/cạnh).
  - [x] Chế độ Chơi đôi (Pass & Play), Auto-save & Resume (`othelloStorage.ts`) và Đấu Online 1v1 Realtime (`othelloRoomService.ts`).
  - [x] Giao diện Neo-Arcade 16-bit (`OthelloBoard.tsx`, `OthelloLobby.tsx`, `OthelloGame.tsx`, `src/app/games/othello/page.tsx`) kèm Quick Chat, Pháo hoa thắng cuộc và Tái đấu.
  - [x] Đăng ký Sảnh chính (`GAME_REGISTRY`), icon pixel (`GameTile.tsx`), BGM Chiến thuật (`BgmController.tsx`), PWA cache (`sw.js`), `sitemap.ts` và Bảng xếp hạng (`LeaderboardModal.tsx` + migration Supabase).





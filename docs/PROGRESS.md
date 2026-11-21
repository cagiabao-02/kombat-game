# Tiến độ dự án

> Cập nhật lần cuối: 2026-11-09

## Trạng thái tổng quan

- **Giai đoạn:** Đã hoàn thành Chặng 0–9 và hoàn tất **Chặng 10 — Trò chơi thứ 3: Cờ Caro (Gomoku / 5 in a row)**.
- **Mã nguồn:** Next.js 15 App Router, TypeScript, Tailwind CSS, i18n Việt/Anh, Sảnh game Kombat, Sudoku hoàn chỉnh, Cờ vua Realtime kèm đồng hồ thi đấu, Cờ Caro 15x15 (Bot AI 3 cấp, Chơi đôi Pass & Play, Phòng riêng PvP Online Realtime & Ghép nhanh), hệ thống âm thanh Web Audio API, Avatar và tài khoản đám mây Supabase Auth.
- **Git/GitHub:** Đang trên nhánh tính năng `feat-user-auth-profile`.
- **Supabase:** Đã cấu hình `.env.local`, bảng `rooms` với RLS và Realtime hỗ trợ cả `chess` và `caro`.
- **Cờ Caro (Gomoku):** Bàn cờ 15x15 chuẩn quốc tế tối ưu cảm ứng di động, thuật toán nhận diện thắng 5 quân thẳng hàng, Bot AI phân tích thế cờ theo trọng số và bán kính co cụm di chuyển, đồng bộ nước đi thời gian thực qua Realtime Broadcast + Supabase Postgres changes, âm thanh xúc giác click cờ và thắng/thua/hòa.
- **Nâng cấp UI/UX toàn diện (Áp dụng skill UI/UX Pro Max):**
  - **Header:** Chuẩn hóa vùng chạm di động $\ge 40\text{px}$ cho nút âm thanh, ngôn ngữ và pill hồ sơ cá nhân; bổ sung viền focus bàn phím rõ nét.
  - **Sảnh game & GameCard:** Biến toàn bộ thẻ game thành vùng nhấn tương tác mượt mà (`hover:scale-[1.02] active:scale-[0.99]`), nâng cấp khối minh họa đồ họa Sudoku, Cờ vua & Cờ Caro kèm nhãn chế độ chơi trực quan.
  - **Cờ vua & Cờ Caro Mobile:** Thay thế hộp thoại `window.confirm` trình duyệt bằng popover xác nhận đầu hàng / rời phòng thanh lịch, song ngữ Việt-Anh; chuẩn hóa hitbox các nút thao tác nhanh.
  - **Sudoku Mobile:** Nâng cấp độ tương phản bảng số (ô đang chọn nổi bật nền tím đậm chữ trắng, các ô cùng số được làm sáng rõ nét); tăng chiều cao bàn phím số $1-9$ lên $48-54\text{px}$ cho thao tác ngón cái trên điện thoại; đồng bộ hóa ngôn ngữ i18n cho nút Hoàn tác, Xóa ô và màn hình tạm dừng.

## Đã hoàn thành

- Tạo tài liệu yêu cầu sản phẩm và phạm vi MVP.
- Đổi tên dự án từ Togame thành **Kombat** trên toàn bộ giao diện, manifest PWA và tài liệu.
- Tích hợp hệ thống âm thanh Web Audio API (`soundService.ts`) không cần tải file mp3, có nút bật/tắt âm thanh trên Header, âm thanh di chuyển, chiếu tướng, ăn quân, tìm thấy trận đấu, chiến thắng, thất bại và hòa cờ.
- Triển khai toàn diện Sudoku một người chơi (Chặng 2) với luật giới hạn 3 lỗi và bộ tạo đề 2 pha cân bằng.
- Thiết lập nền tảng Supabase & Khách ẩn danh (Chặng 3): Cài đặt `@supabase/supabase-js`, tạo client singleton, `AuthProvider` phiên ẩn danh và migration RLS cho bảng `rooms`.
- Triển khai Cờ vua phòng riêng Realtime (Chặng 4).
- Triển khai Ghép trận ngẫu nhiên (Chặng 5 — Quick Match).
- Triển khai Bot cờ vua AI 3 cấp độ offline (Chặng 6).
- Triển khai Biểu cảm tương tác Emoji Reactions & Âm thanh bàn cờ (Chặng 7).
- Triển khai Bảng thành tích cá nhân Stats Widget (Chặng 8).
- Triển khai Hồ sơ cá nhân, Bộ sưu tập Avatar & Đồng bộ Tài khoản Đám mây (Chặng 9).
- **Triển khai Cờ Caro (Gomoku) 15x15 đa nền tảng (Chặng 10):**
  - Động cơ luật cờ Caro 15x15 (`caroLogic.ts`) kiểm tra hợp lệ, tìm kiếm 5 quân thẳng hàng theo 4 vector hướng, phát hiện hòa cờ khi kín ô.
  - Trí tuệ nhân tạo Bot AI 3 cấp độ (`ai/caroBot.ts`) với ma trận điểm thế cờ: 5 quân ($100.000$), 4 quân mở 2 đầu ($10.000$), 4 quân chặn 1 đầu ($2.500$), 3 quân mở ($1.200$)... cùng thuật toán lọc ứng viên bán kính 2 xung quanh các quân cờ đã đánh giúp tính toán tức thì không giật lag.
  - Giao diện bàn cờ (`CaroBoard.tsx`) responsive tỷ lệ co giãn thông minh, vẽ 5 điểm sao định vị (Hoshi/Tengen), hiệu ứng ring xung nhịp nước đi vừa đánh và dải sáng neon cho đường 5 quân chiến thắng.
  - Bộ điều khiển ván đấu (`CaroControls.tsx`) hiển thị lượt đi động, số nước cờ, nút xin thua, chơi lại, về sảnh và popover xác nhận in-game không dùng dialog trình duyệt.
  - Sảnh chờ (`CaroLobbyView.tsx`) với 3 chế độ: Đấu Máy (chọn độ khó và quân đi trước), Chơi Đôi trên cùng máy (Pass & Play) và Online PvP (Phòng riêng 6 ký tự hoặc Ghép nhanh).
  - Tích hợp Realtime đồng bộ hai chiều qua Supabase Realtime Broadcast + `rooms` database (`caroRoomService.ts`).
  - Đăng ký trò chơi trong `registry.ts`, hiển thị card đồ họa tương tác tại Sảnh chính và hỗ trợ song ngữ Việt-Anh (`translations.ts`).
- **Triển khai Bảng xếp hạng toàn sảnh Leaderboard (Chặng 11 - Bước 3.1):**
  - Xây dựng module `src/features/leaderboard/` vinh danh cao thủ cho toàn bộ các tựa game.
  - Tinh gọn Bảng xếp hạng: Bỏ toàn bộ các thông tin phụ (số ván chơi, số bàn, chuỗi trận, số gạch vỡ), chỉ hiển thị duy nhất Điểm số (với Cờ vua, Cờ tướng, Cờ caro, Rắn, 2048, Phá gạch) hoặc Thời gian hoàn thành (với Sudoku, Dò mìn) giúp giao diện sạch đẹp, trực quan và tập trung vào thành tích cốt lõi.
  - **Phân chia cấp độ thi đấu (Dễ, Trung bình, Khó):** Thêm thanh chọn cấp độ con cho các game có độ khó (Sudoku và Dò Mìn: 🟢 Dễ / 🟡 Trung bình / 🔴 Khó). Tự động lưu và truy vấn riêng biệt kỷ lục theo từng cấp độ (`sudoku_easy/medium/hard`, `minesweeper_easy/medium/hard`) trên cả local và đám mây Supabase (`migration 20261116120000_add_difficulty_levels_to_leaderboard.sql`).
  - **Chính sách Bảng xếp hạng độc quyền cho tài khoản đăng ký:** Chỉ tài khoản đã đăng ký (Email/Google) mới được lưu lên Supabase Cloud nhằm chống spam tài khoản rác. Khách (Guest) vẫn có xem trước thứ hạng (Preview Rank) trên máy cục bộ, kèm thanh kêu gọi đăng nhập 1 chạm trong modal để vinh danh điểm số vĩnh viễn (`migration 20261116180000_only_allow_registered_users_on_leaderboard.sql`).
  - Thiết kế bục vinh danh Top 3 Podium (1st Quán quân Vàng 🥇, 2nd Bạc 🥈, 3rd Đồng 🥉) và danh sách thứ hạng chi tiết kèm avatar người chơi.
  - Thanh ghim cố định vị trí xếp hạng của người dùng hiện tại (Your Rank) giúp theo dõi thứ hạng cá nhân tức thì.
  - Tích hợp dịch vụ lưu trữ thành tích tự động cho các tựa game và migration database `20261109000000_leaderboard_schema.sql` với RLS an toàn.
- **Triển khai Trò chuyện nhanh & Biểu cảm tương tác Trong trận (Chặng 11 - Bước 3.3 / Direction 3):**
  - Xây dựng module dùng chung `src/features/social/` hỗ trợ tương tác tức thì trong các phòng thi đấu đối kháng:
    - **Bộ câu Quick Chat cài sẵn (`socialPresets.ts`):** Song ngữ Việt-Anh kèm icon, chia làm 3 nhóm thực tế: Chào hỏi/Giao lưu (👋 Chào bạn / Hello, ⚔️ Chiến thôi / Let's go), Chiến thuật/Đang đấu (🔥 Hay đấy! / Nice move!, 🤔 Đang tính... / Thinking..., ☕ Làm ngụm trà / Take a sip, 😅 Căng thẳng quá / Intense game), Kết thúc/Lịch sự (👑 Chúc mừng! / Well played!, 👏 Cảm ơn trận đấu / Thanks for the game, 🤝 Tái đấu ván nữa? / Rematch?).
    - **Bộ Biểu cảm Emote Pixel 16-bit:** 12 biểu tượng cảm xúc đậm chất Arcade (😎, 🔥, 👏, 🤔, 👑, ☕, 👍, ⚡, 🎯, 💀, 😱, 🤝).
    - **Bóng thoại Pixel Speech Bubble (`ChatBubble.tsx`):** Thiết kế bóng thoại phong cách cổ điển retro viền đen 2px, đuôi chỉ định hướng về phía avatar người gửi, animation nảy nhẹ và tự biến mất sau 3.5 giây.
    - **Trình chọn tương tác Neo-Arcade (`InGameSocialPicker.tsx`):** Popover 2 tab (Biểu cảm & Câu chat nhanh) kèm cơ chế chống spam (cooldown 2 giây).
    - **Âm thanh hiệu ứng 8-bit:** Bổ sung `playSocialPop()` (Web Audio API tần số quét 450Hz $\to$ 880Hz) tạo cảm giác bong bóng thoại vui nhộn.
  - Tích hợp toàn diện vào cả 3 tựa game đối kháng nhiều người chơi:
    - **Cờ vua (`ChessGameView.tsx`):** Tích hợp nút Quick Chat vào thanh điều khiển người chơi, bóng thoại hiển thị trên avatar người chơi và đối thủ, phát sóng `in_game_social` qua Supabase Realtime channel.
    - **Cờ Caro (`CaroGameView.tsx` & `CaroControls.tsx`):** Tích hợp nút Quick Chat ngay cạnh nút âm thanh trên thanh trạng thái LCD, bóng thoại hiển thị nổi trên thẻ đại diện Host (P1) và Guest (P2).
    - **Cờ Tướng (`XiangqiGameView.tsx` & `XiangqiControls.tsx`):** Bổ sung thẻ thông tin đối đầu 2 bên Đỏ (帥) và Đen (將), tích hợp bóng thoại phía trên avatar mỗi bên và nút Quick Chat tại thanh công cụ bàn cờ.
  - **Tương tác Bot AI:** Khi chơi offline với Máy (Bot AI), bot có xác suất 45% tự động phản hồi lại bằng câu chat dí dỏm hoặc biểu cảm thân thiện sau khoảng 900ms, giúp trải nghiệm chơi đơn sống động và cuốn hút.
  - Modal nhận lời thách đấu (`IncomingChallengeModal.tsx`) với âm thanh chuông báo, đếm ngược 15s tự động và nút "Chiến ngay" / "Từ chối" đưa thẳng cả hai người vào bàn đấu.
  - Khắc phục triệt để lỗi đơ thanh Header do Webpack bundling xung đột eval syntax với `@supabase/auth-js`: Tách `@supabase/supabase-js` thành dynamic lazy-load trong `AuthContext.tsx`, giảm 98% kích thước chunk `layout.js` (từ 3.3MB xuống ~60KB), giúp toàn bộ nút bấm trên Header (Hồ sơ, BXH, Âm thanh, Ngôn ngữ) phản hồi tức thì và không bị crash.
  - Tối ưu giao diện Header di động: Gom các nút phụ (BXH, Âm thanh, Ngôn ngữ) vào menu 3 gạch (Hamburger) hiện đại, mở drawer popover trực quan tránh tràn viền; giữ nguyên pill Hồ sơ nhỏ gọn trên thanh điều hướng.
  - Tối ưu thẻ ảnh đại diện tự tải lên trong `ProfileAuthModal.tsx`: Bỏ nhãn "Đang chọn" bị vỡ dòng trên màn hình điện thoại hẹp, làm nổi bật viền tím và dòng mô tả tinh tế.
  - **Đồng bộ đám mây đa thiết bị (Laptop & Mobile Sync):** Thiết lập Supabase Auth Server (`supabase.auth.getUser()`) làm nguồn chân lý duy nhất (Single Source of Truth) thay vì phụ thuộc `localStorage` hay cache JWT cũ. Tự động đồng bộ ảnh đại diện, tên người chơi và thành tích thi đấu tức thì giữa các thiết bị ngay khi vào trang, khi chuyển tab (`focus`) và kết nối trực tiếp với thanh Header bên ngoài.
  - **Khắc phục triệt để lỗi lưu hồ sơ và đổi Avatar:** Loại bỏ race-condition khi cập nhật song song tên và avatar; chuyển đổi thành phương thức cập nhật nguyên khối `updateProfile({ displayName, avatar })` với phản hồi tức thì và `wasOpenRef` chống ghi đè dữ liệu đang nhập khi mở modal.
- **Hoàn thành toàn diện Chặng 12 — Trò chơi thứ 4: Cờ Tướng (Xiangqi / Chinese Chess):**
  - Hoàn thành Bước 1: Xây dựng động cơ luật Cờ Tướng độc lập (`src/features/games/xiangqi/xiangqiLogic.ts`) bằng TypeScript thuần.
  - Hoàn thành Bước 2: Thiết kế giao diện bàn cờ Cờ Tướng (`XiangqiBoard.tsx`) và quân cờ mỹ thuật truyền thống (`XiangqiPiece.tsx`).
  - Hoàn thành Bước 3: Xây dựng Sảnh Cờ Tướng, Bộ điều khiển ván đấu và Chế độ Chơi Đôi (Pass & Play).
  - Hoàn thành Bước 4: Xây dựng Trí tuệ nhân tạo Bot Cờ Tướng AI 3 cấp độ (`src/features/games/xiangqi/ai/xiangqiBot.ts`).
  - Hoàn thành Bước 5: Tích hợp Đấu Online PvP Realtime, Ghép trận nhanh và Bảng xếp hạng Leaderboard.
- **Đồng bộ hóa giao diện Sảnh chờ Cờ vua (Chess Lobby Redesign):**
  - Tái thiết kế toàn diện [`ChessLobbyView.tsx`](file:///d:/personal-prj/game/togame/src/features/games/chess/ChessLobbyView.tsx) theo hệ thống chuẩn mực trực quan đồng nhất với Cờ Caro và Cờ Tướng:
    - Thanh điều hướng 3 chế độ chuẩn hóa: **Chơi Đôi (Pass & Play)**, **Đấu Máy (Bot AI)** và **Đấu Online (Online PvP)**.
    - Bổ sung chế độ Chơi Đôi (Pass & Play) cho Cờ vua trên cùng 1 thiết bị (`createLocalChessRoom`) hỗ trợ tùy chọn thời gian và tên 2 kỳ thủ.
    - Di chuyển khối thẻ thành tích cá nhân vào accordion thu gọn tinh tế "Bảng thành tích thi đấu cờ vua của bạn" giúp giao diện gọn gàng, tập trung vào việc bắt đầu trận đấu.
    - Bổ sung Accordion tóm tắt quy tắc di chuyển quân Cờ Vua (Xe, Tượng, Mã, Hậu, Vua, Tốt, Nhập thành, En Passant, Phong cấp).
    - Chuẩn hóa nút "Về sảnh chính" và màu nền chuyển sắc (`bg-gradient-to-b from-indigo-50/30 via-white to-gray-50/50`) tương đồng với toàn bộ sảnh game.

- **Tích hợp hiệu ứng Pixel Art Confetti ăn mừng chiến thắng (Dựa trên kiến trúc `patch-gg/pixelfx`):**
  - Xây dựng module rasterizer phần mềm siêu nhẹ [`src/features/fx/core.ts`](file:///d:/personal-prj/game/togame/src/features/fx/core.ts) quản lý pixel frame đệm low-res và composite trực tiếp vào Canvas `ImageData`.
  - Triển khai hiệu ứng pháo hoa ăn mừng [`src/features/fx/effects/pixelConfetti.ts`](file:///d:/personal-prj/game/togame/src/features/fx/effects/pixelConfetti.ts) bắn hai loạt pháo giấy liên tiếp, mô phỏng chuyển động xoay lật 3D theo trọng lực và lực cản không khí với bảng màu arcade retro.
  - Tạo React Component [`src/components/fx/PixelFxOverlay.tsx`](file:///d:/personal-prj/game/togame/src/components/fx/PixelFxOverlay.tsx) tự động phủ canvas trong suốt `[image-rendering:pixelated]` lên trên màn hình mà không chặn click chuột (`pointer-events-none`).
  - Tích hợp hiệu ứng ăn mừng vào toàn bộ Modal Chiến thắng của cả 4 trò chơi: Cờ Tướng, Cờ Vua, Cờ Caro và Sudoku (chỉ kích hoạt khi người chơi thực sự giành chiến thắng).
- **Hoàn thành toàn diện Chặng 13 — Chuyển đổi giao diện Neo-Arcade (Modern Pixel 16-bit):**
  - **Giai đoạn 1 (Design System & Theme Tokens):** Tích hợp bộ font chữ `Pixelify Sans` (tiêu đề/số điểm, hỗ trợ đầy đủ dấu tiếng Việt) và `JetBrains Mono` trong [`src/app/layout.tsx`](file:///d:/personal-prj/game/togame/src/app/layout.tsx); định nghĩa bảng màu retro, nền chấm bi dot-matrix ấm áp (`#F4F1EA`) và các utility classes (`.pixel-box`, `.pixel-box-sm`, `.pixel-box-lg`, `.pixel-card`, `.pixel-btn`, `.pixel-badge`, `.pixel-input`) trong [`tailwind.config.ts`](file:///d:/personal-prj/game/togame/tailwind.config.ts) & [`src/app/globals.css`](file:///d:/personal-prj/game/togame/src/app/globals.css).
  - **Giai đoạn 2 (Lobby & Khung điều hướng):** Đổi mới [`Header.tsx`](file:///d:/personal-prj/game/togame/src/components/Header.tsx) theo phong cách bảng điều khiển máy thùng Arcade Cabinet, huy hiệu người chơi dạng Coin Token, thẻ trò chơi [`GameCard.tsx`](file:///d:/personal-prj/game/togame/src/components/GameCard.tsx) dạng băng game 16-bit Cartridge, cùng toàn bộ Modals ([`LeaderboardModal.tsx`](file:///d:/personal-prj/game/togame/src/features/leaderboard/LeaderboardModal.tsx), [`ProfileAuthModal.tsx`](file:///d:/personal-prj/game/togame/src/features/auth/ProfileAuthModal.tsx), [`LobbyPresenceWidget.tsx`](file:///d:/personal-prj/game/togame/src/features/presence/LobbyPresenceWidget.tsx), [`IncomingChallengeModal.tsx`](file:///d:/personal-prj/game/togame/src/features/presence/IncomingChallengeModal.tsx)).
  - **Giai đoạn 3 (Bàn cờ & Quân cờ 4 Game):**
    - **Cờ Caro:** Bàn cờ gỗ khung viền pixel, điểm sao Hoshi vuông và quân cờ `X`/`O` dạng sprite SVG 8x8 chunky.
    - **Sudoku:** Bàn cờ 9x9 mô phỏng màn hình cầm tay cổ điển, bàn phím số cơ học nảy 3D và modal `STAGE CLEAR` / `GAME OVER`.
    - **Cờ Vua:** Bộ 12 quân cờ **Pixel Art 16x16 SVG** thiết kế riêng trong [`ChessPieces.tsx`](file:///d:/personal-prj/game/togame/src/features/games/chess/ChessPieces.tsx), bàn cờ gỗ pixel [`ChessBoard.tsx`](file:///d:/personal-prj/game/togame/src/features/games/chess/ChessBoard.tsx), biên bản nước đi 80s [`MoveHistory.tsx`](file:///d:/personal-prj/game/togame/src/features/games/chess/MoveHistory.tsx) và sảnh chờ/phòng đấu Neo-Arcade.
    - **Cờ Tướng:** Quân cờ tròn 16-bit Pixel Token đổ bóng cứng (`shadow-[0_3px_0_0_#18181b]`) trong [`XiangqiPiece.tsx`](file:///d:/personal-prj/game/togame/src/features/games/xiangqi/XiangqiPiece.tsx), bàn cờ Sở Hà Hán Giới khung pixel [`XiangqiBoard.tsx`](file:///d:/personal-prj/game/togame/src/features/games/xiangqi/XiangqiBoard.tsx) và bảng điều khiển [`XiangqiControls.tsx`](file:///d:/personal-prj/game/togame/src/features/games/xiangqi/XiangqiControls.tsx).
  - **Giai đoạn 4 (VFX, SFX & Kiểm thử):** Tinh chỉnh âm sắc Web Audio API sang sóng vuông (`square` / `sawtooth`) đậm chất Chiptune 8-bit/16-bit trong [`soundService.ts`](file:///d:/personal-prj/game/togame/src/lib/sound/soundService.ts) và kiểm thử `npm run build` thành công với 0 lỗi.

- **Hoàn thành Chặng 14 — Phân loại game theo thể loại & Ô biểu tượng game (Compact Game Tiles) tại sảnh chính:**
  - **Tổ chức thể loại game:** Xây dựng danh mục thể loại trong [`src/features/games/categories.ts`](file:///d:/personal-prj/game/togame/src/features/games/categories.ts) (`strategy` - Chiến thuật, `puzzle` - Giải đố, `arcade` - Phản xạ / Thử thách), mở rộng `GameMetadata` với trường `category` và gán thể loại cho 4 tựa game hiện có.
  - **Ô biểu tượng game dạng pixel compact:** Tạo component [`GameTile.tsx`](file:///d:/personal-prj/game/togame/src/components/GameTile.tsx) gồm biểu tượng pixel đặc trưng cho từng game (Ngựa cờ vua, quân Tướng đỏ cờ tướng, lưới X/O cờ caro, ma trận mini Sudoku), thay thế thẻ banner lớn để tiết kiệm không gian sảnh chờ.
  - **Tương tác trực quan:** Hỗ trợ tooltip pixel hiển thị tên game và huy hiệu khi rê chuột/focus bàn phím trên desktop; tự động hiển thị tên ngắn bên dưới ô icon trên thiết bị di động (mobile).
  - **Ô Sắp có (`UpcomingTile`):** Hiển thị ô dự kiến cho các tựa game tiếp theo thuộc từng thể loại (ví dụ: Go/Reversi cho chiến thuật, 2048/Nonogram cho giải đố, Flappy/Phá gạch cho phản xạ).

- **Hoàn thành Chặng 15 — Bảo toàn vĩnh viễn Thành tích Đám mây (Cloud Sync) & Quản lý chi tiết Kỷ lục Sudoku:**
  - **Cơ chế Gộp & Bảo toàn vĩnh viễn (Smart Merge on Sign-in):** Xây dựng [`src/features/stats/statsMergeService.ts`](file:///d:/personal-prj/game/togame/src/features/stats/statsMergeService.ts) tự động đối chiếu, gộp thông minh và đẩy thành tích từ máy cục bộ (Guest) lên đám mây Supabase (`user_metadata`) ngay khi đăng nhập Google hoặc Email. Bổ sung khóa `kombat_xiangqi_stats` vào chu trình đồng bộ hai chiều.
  - **Quản lý & Hiển thị Kỷ lục Sudoku từng chế độ:** Nâng cấp [`sudokuStatsService.ts`](file:///d:/personal-prj/game/togame/src/features/games/sudoku/sudokuStatsService.ts), hiển thị huy hiệu kỷ lục tốt nhất trực tiếp trên thanh điều khiển [`SudokuControls.tsx`](file:///d:/personal-prj/game/togame/src/features/games/sudoku/SudokuControls.tsx), vinh danh `KỶ LỤC MỚI!` trên [`VictoryModal.tsx`](file:///d:/personal-prj/game/togame/src/features/games/sudoku/VictoryModal.tsx) và tích hợp tab Sudoku đầy đủ vào [`ProfileAuthModal.tsx`](file:///d:/personal-prj/game/togame/src/features/auth/ProfileAuthModal.tsx) với bảng thống kê 3 mức Dễ / Vừa / Khó.
  - **Tự động cập nhật Bảng xếp hạng toàn cầu:** Bổ sung hàm upsert điểm vào `leaderboard_scores` cho cả 4 game và tạo migration `20261115000000_add_xiangqi_to_leaderboard.sql`.
  - **Tối ưu PWA chuẩn Android:** Tạo bộ icon PNG 192x192 và 512x512 trong `public/` và chuẩn hóa [`src/app/manifest.ts`](file:///d:/personal-prj/game/togame/src/app/manifest.ts) đáp ứng tiêu chuẩn WebAPK Android (Install App prompt).

- **Hoàn thành Chặng 16 — Trò chơi thứ 5: Rắn Săn Mồi Pixel (8-Bit Retro Snake):**
  - **Động cơ logic game:** Xây dựng [`snakeLogic.ts`](file:///d:/personal-prj/game/togame/src/features/games/snake/snakeLogic.ts) với lưới pixel $20 \times 20$, cơ chế ăn táo đỏ (+10đ, tăng độ dài) và táo vàng bonus xuất hiện chớp nhoáng 8 giây (+50đ), chống tự quay đầu $180^\circ$ và tốc độ tăng dần theo điểm số (từ 140ms xuống 65ms).
  - **Giao diện Neo-Arcade:** Màn hình LCD retro Game Boy [`SnakeBoard.tsx`](file:///d:/personal-prj/game/togame/src/features/games/snake/SnakeBoard.tsx) với đầu rắn xoay theo 4 hướng và thò lưỡi ngộ nghĩnh, cụm D-pad điều hướng cảm ứng và hỗ trợ vuốt swipe trên mobile [`SnakeControls.tsx`](file:///d:/personal-prj/game/togame/src/features/games/snake/SnakeControls.tsx).
  - **Hiệu ứng & Âm thanh Chiptune:** Bổ sung âm thanh 8-bit `playSnakeEat`, `playSnakeGolden`, `playSnakeDie` trong [`soundService.ts`](file:///d:/personal-prj/game/togame/src/lib/sound/soundService.ts) và hiệu ứng pháo hoa ăn mừng kỷ lục điểm cao [`GameOverModal.tsx`](file:///d:/personal-prj/game/togame/src/features/games/snake/GameOverModal.tsx).
  - **Tích hợp toàn diện:** Đăng ký vào sảnh chính với icon tile pixel chú rắn [`GameTile.tsx`](file:///d:/personal-prj/game/togame/src/components/GameTile.tsx), bổ sung tab Rắn săn mồi vào Bảng xếp hạng Leaderboard và Hồ sơ người chơi, tự động đồng bộ đám mây và bảng `leaderboard_scores`.

- **Hoàn thành Chặng 17 — Trò chơi thứ 6: 2048 (Puzzle Logic):**
  - **Tên trò chơi:** Chuẩn hóa tên gọn là `2048` (bỏ chữ Pixel).
  - **Cập nhật sảnh:** Bỏ 2048 khỏi danh sách ô "Sắp có" của mục Giải đố (`Dò mìn, Nonogram`).
  - **Động cơ logic 2048:** Xây dựng [`src/features/games/game2048/game2048Logic.ts`](file:///d:/personal-prj/game/togame/src/features/games/game2048/game2048Logic.ts) với ma trận $4 \times 4$, cơ chế sinh ngẫu nhiên (90% ra ô 2, 10% ra ô 4), trượt và gộp 4 hướng chuẩn mực, phát hiện Game Over (kín bảng & không có 2 ô kề nhau bằng nhau), nhận diện mốc chiến thắng 2048 và tính toán ô lớn nhất (Max tile).
  - **Giao diện Neo-Arcade 16-bit:** Tạo [`Game2048Board.tsx`](file:///d:/personal-prj/game/togame/src/features/games/game2048/Game2048Board.tsx) với bảng màu pixel tương phản cao (2 đến 2048 và 4096+), đổ bóng pixel 3D, khung viền thùng máy arcade và lắng nghe cử chỉ vuốt chạm touch swipe.
  - **Điều khiển & Tính năng Hoàn tác (Undo):** Tạo [`Game2048Controls.tsx`](file:///d:/personal-prj/game/togame/src/features/games/game2048/Game2048Controls.tsx) hiển thị Điểm hiện tại, Kỷ lục (Best) và Ô lớn nhất (Max tile); hỗ trợ lùi 1 bước đi (1-step Undo); cụm D-pad ảo 4 chiều cho mobile; phím tắt WASD/Mũi tên/Z/U trên PC.
  - **Âm thanh & Modal ăn mừng:** Tích hợp âm thanh Web Audio API `play2048Slide`, `play2048Merge` (âm vực tăng dần theo giá trị ô), `play2048Win` trong [`soundService.ts`](file:///d:/personal-prj/game/togame/src/lib/sound/soundService.ts); modal chúc mừng chiến thắng [`Game2048VictoryModal.tsx`](file:///d:/personal-prj/game/togame/src/features/games/game2048/Game2048VictoryModal.tsx) cho phép tiếp tục chơi chinh phục 4096; modal [`Game2048OverModal.tsx`](file:///d:/personal-prj/game/togame/src/features/games/game2048/Game2048OverModal.tsx) kèm pháo hoa khi phá kỷ lục.
  - **Lưu trữ & Bảng xếp hạng:** Xây dựng [`game2048StatsService.ts`](file:///d:/personal-prj/game/togame/src/features/games/game2048/game2048StatsService.ts), migration `20261115120000_add_game2048_to_leaderboard.sql`, tích hợp tab 2048 vào Bảng xếp hạng Leaderboard, Hồ sơ cá nhân (`ProfileAuthModal.tsx`) và gộp tự động đám mây khi đăng nhập (`statsMergeService.ts`, `AuthContext.tsx`).
  - **Đăng ký Sảnh chính:** Bổ sung icon pixel 2048 vào [`GameTile.tsx`](file:///d:/personal-prj/game/togame/src/components/GameTile.tsx) và đăng ký trò chơi vào thể loại Giải đố (Puzzle) trong [`registry.ts`](file:///d:/personal-prj/game/togame/src/features/games/registry.ts).

- **Hoàn thành Chặng 18 — Trò chơi thứ 7: Dò Mìn Pixel (Minesweeper Classic):**
  - **Động cơ logic Dò Mìn:** Xây dựng [`src/features/games/minesweeper/minesweeperLogic.ts`](file:///d:/personal-prj/game/togame/src/features/games/minesweeper/minesweeperLogic.ts) với 3 cấp độ (Dễ 9×9 10 mìn, Vừa 16×16 40 mìn, Khó 16×30 99 mìn), thuật toán mở an toàn lượt đầu tiên (First Click Never Boom), mở loang tự động (Flood Fill BFS), cắm cờ và mở nhanh (Chord).
  - **Giao diện Retro Arcade:** Xây dựng [`MinesweeperBoard.tsx`](file:///d:/personal-prj/game/togame/src/features/games/minesweeper/MinesweeperBoard.tsx) và [`MinesweeperControls.tsx`](file:///d:/personal-prj/game/togame/src/features/games/minesweeper/MinesweeperControls.tsx) với nút Mặt cười tương tác (🙂, 😮, 😎, 😵), đồng hồ LED đỏ đếm giây và đếm mìn, phím chuyển đổi đào/cắm cờ và hỗ trợ chạm giữ (long-press) trên mobile.
  - **Tối ưu hiển thị Dò mìn di động:** Khắc phục lỗi ô bị ép dẹp thành nan dọc và số bị che mất ở chế độ Khó ($16 \times 30$). Cố định tỷ lệ ô vuông hoàn hảo (`cellSize` chuẩn 28px ở chế độ Khó), cỡ chữ số tỷ lệ chính xác không bị che cắt, kích hoạt cuộn ngang cảm ứng mượt mà trên điện thoại và bổ sung tính năng Thu phóng (Zoom) kích thước ô ($70\% - 140\%$).
  - **Âm thanh & Modal:** Tích hợp âm thanh Web Audio API `playMinesweeperClick`, `playMinesweeperFlag`, `playMinesweeperBoom`, `playMinesweeperWin`; modal chiến thắng [`MinesweeperWinModal.tsx`](file:///d:/personal-prj/game/togame/src/features/games/minesweeper/MinesweeperWinModal.tsx) và thua cuộc [`MinesweeperOverModal.tsx`](file:///d:/personal-prj/game/togame/src/features/games/minesweeper/MinesweeperOverModal.tsx).
  - **Lưu trữ & Bảng xếp hạng:** Xây dựng [`minesweeperStatsService.ts`](file:///d:/personal-prj/game/togame/src/features/games/minesweeper/minesweeperStatsService.ts), migration `20261115200000_add_minesweeper_to_leaderboard.sql`, tích hợp tab Dò Mìn vào Bảng xếp hạng toàn cầu, Hồ sơ cá nhân (`ProfileAuthModal.tsx`) và gộp đám mây khi đăng nhập (`statsMergeService.ts`).
  - **Đăng ký Sảnh chính:** Bổ sung icon pixel quả mìn gai và lá cờ đỏ vào [`GameTile.tsx`](file:///d:/personal-prj/game/togame/src/components/GameTile.tsx) và cập nhật ô Sắp có của Giải đố thành `Nonogram, Trượt số`.

- **Hoàn thành Chặng 19 — Trò chơi thứ 8: Phá Gạch Pixel (Brick Breaker / Arkanoid Arcade):**
  - **Động cơ vật lý nảy bóng Canvas 2D:** Xây dựng [`src/features/games/brickBreaker/brickBreakerLogic.ts`](file:///d:/personal-prj/game/togame/src/features/games/brickBreaker/brickBreakerLogic.ts) với tỷ lệ máy thùng $3:4$ ($480 \times 640$), thuật toán góc nảy linh hoạt trên thanh trượt, hệ thống vật phẩm cân bằng (Kéo dài thanh ↔️, Nhân đôi bóng ⚡, Cộng 2 mỗi bóng +2 thay thế súng Laser, Thêm mạng 💖), gạch thép 2 lần đập và gạch bom phát nổ.
  - **Giao diện Neo-Arcade:** Xây dựng [`BrickBreakerGame.tsx`](file:///d:/personal-prj/game/togame/src/features/games/brickBreaker/BrickBreakerGame.tsx) và [`src/app/games/brick-breaker/page.tsx`](file:///d:/personal-prj/game/togame/src/app/games/brick-breaker/page.tsx) với đầy đủ điều khiển đa nền tảng (chuột/phím PC, vuốt chạm và phím ảo mobile), hiệu ứng vỡ hạt pixel, vinh danh kỷ lục mới và modal Game Over.
  - **Âm thanh & Tích hợp:** Bổ sung âm thanh Web Audio `playBrickHit`, `playPaddleBounce`, `playPowerupCatch`, `playLifeLost`, `playLaserShot`, `playLevelUp`; dịch vụ lưu trữ [`brickBreakerStatsService.ts`](file:///d:/personal-prj/game/togame/src/features/games/brickBreaker/brickBreakerStatsService.ts), migration `20261116000000_add_brick_breaker_to_leaderboard.sql`, tích hợp vào Bảng xếp hạng toàn cầu (`LeaderboardModal.tsx`), Hồ sơ cá nhân (`ProfileAuthModal.tsx`) và gộp đám mây (`statsMergeService.ts`).
  - **Đăng ký Sảnh chính:** Bổ sung icon pixel thanh trượt, quả bóng và các hàng gạch rực rỡ vào [`GameTile.tsx`](file:///d:/personal-prj/game/togame/src/components/GameTile.tsx) và đăng ký vào nhóm Arcade (`categories.ts`).

- **Hoàn thành Chặng 20 — Trò chơi thứ 9: Khủng Long T-Rex (T-Rex Runner Arcade):**
  - **Động cơ vật lý & Logic chạy vô tận Canvas 2D:** Xây dựng [`src/features/games/dinoRunner/dinoLogic.ts`](file:///d:/personal-prj/game/togame/src/features/games/dinoRunner/dinoLogic.ts) với tỷ lệ màn hình Arcade ($800 \times 260$), cơ chế nhảy (Space / Lên / Chạm) và cúi người hạ thấp trọng tâm (Xuống / Giữ nút Cúi Né). Cúi người khi đang bay giúp tiếp đất nhanh hơn (fast drop).
  - **Hệ thống chướng ngại vật phong phú:**
    - Cây xương rồng nhỏ (cụm 1, 2, 3 cây) và cây xương rồng lớn (cụm 1, 2 cây).
    - Chim cổ đại Pterodactyl vỗ cánh ở 3 cao độ: Tầm cao (chạy qua an toàn), Tầm trung (buộc phải cúi né), Tầm thấp (buộc phải nhảy qua).
  - **Chu kỳ Ngày & Đêm huyền ảo:** Cứ mỗi 700 điểm, sa mạc sẽ chuyển dần từ ban ngày ấm áp sang màn đêm đầy sao với mặt trăng khuyết và đàn sao nhấp nháy, sau đó trở lại ban ngày sau 350 điểm.
  - **Giao diện Neo-Arcade:** Xây dựng [`TRexGame.tsx`](file:///d:/personal-prj/game/togame/src/features/games/dinoRunner/TRexGame.tsx) và trang [`src/app/games/t-rex-runner/page.tsx`](file:///d:/personal-prj/game/togame/src/app/games/t-rex-runner/page.tsx) với đồ họa pixel sắc nét, cụm phím ảo cảm ứng tiện lợi trên điện thoại (Nút Nhảy & Nút Cúi Giữ), hỗ trợ vuốt màn hình (Swipe Up/Down).
  - **Âm thanh & Tích hợp:** Bổ sung âm thanh Web Audio 8-bit `playDinoJump`, `playDinoMilestone` (tiếng bíp bíp 2 âm mỗi 100 điểm) và `playDinoHit` (tiếng crash khi va chạm); dịch vụ lưu trữ [`tRexStatsService.ts`](file:///d:/personal-prj/game/togame/src/features/games/dinoRunner/tRexStatsService.ts), migration `20261116220000_add_t_rex_runner_to_leaderboard.sql`, tích hợp vào Bảng xếp hạng toàn cầu (`LeaderboardModal.tsx`), Hồ sơ cá nhân (`ProfileAuthModal.tsx`) và gộp đám mây (`statsMergeService.ts`).
  - **Đăng ký Sảnh chính:** Bổ sung icon pixel chú khủng long T-Rex và cây xương rồng sa mạc vào [`GameTile.tsx`](file:///d:/personal-prj/game/togame/src/components/GameTile.tsx) và đăng ký vào nhóm Arcade (`registry.ts`, `categories.ts`).
- **Triển khai Flappy Bird Arcade (Chặng 21 - Trò chơi thứ 10):**
  - **Động cơ vật lý & Logic vỗ cánh Canvas 2D:** Xây dựng [`flappyLogic.ts`](file:///d:/personal-prj/game/togame/src/features/games/flappyBird/flappyLogic.ts) chuẩn xác với Canvas $360 \times 580$. Chuẩn hóa delta time 60 FPS đồng đều trên cả màn hình 60Hz/120Hz/144Hz. Tinh chỉnh trọng lực mềm dịu ($0.26$), lực nâng đập cánh bồng bềnh ($-5.6$), giới hạn rơi cực đại ($6.2$), chim không bị rớt như đá và có thời gian phản xạ thoải mái.
  - **Cột ống nước Retro & Khoảng cách thoáng đãng:** Giãn rộng khoảng cách ngang giữa các cặp cột lên $215\text{px}$ (khoảng trống lọt thỏm $>159\text{px}$), nới rộng khe hở đứng lên $140\text{px}$, tốc độ trôi cột êm ái ($1.9\text{px/frame}$) và đường băng xuất phát $260\text{px}$ giúp người chơi kịp làm quen nhịp vỗ trước khi gặp cột đầu tiên; hitbox dung sai an toàn $5\text{px}$. Hệ thống 4 cấp huy chương (🥉 Đồng $\ge 10$, 🥈 Bạc $\ge 20$, 🥇 Vàng $\ge 30$, 💎 Bạch Kim $\ge 40$).
  - **Chu kỳ Ngày & Đêm:** Nền trời và thành phố tự động chuyển từ ban ngày sang đêm trăng sao huyền ảo sau mỗi 20 điểm.
  - **Giao diện & Điều khiển:** Xây dựng [`FlappyBirdGame.tsx`](file:///d:/personal-prj/game/togame/src/features/games/flappyBird/FlappyBirdGame.tsx) và trang [`src/app/games/flappy-bird/page.tsx`](file:///d:/personal-prj/game/togame/src/app/games/flappy-bird/page.tsx) hỗ trợ chạm bất kỳ đâu trên màn hình, bàn phím PC (Space, ⬆️, W) và nút bấm lớn ngón cái. Modal kết thúc có huy chương, pháo hoa kỷ lục, nút Chơi Lại và nút Về Sảnh.
  - **Âm thanh & Tích hợp:** Âm thanh 8-bit `playFlappyFlap`, `playFlappyScore`, `playFlappyHit`, `playFlappyDie`; dịch vụ [`flappyStatsService.ts`](file:///d:/personal-prj/game/togame/src/features/games/flappyBird/flappyStatsService.ts), migration `20261116230000_add_flappy_bird_to_leaderboard.sql`, tích hợp Bảng xếp hạng, Hồ sơ cá nhân và gộp tài khoản đám mây.
  - **Đăng ký Sảnh chính:** Icon pixel chim vàng và ống nước trong [`GameTile.tsx`](file:///d:/personal-prj/game/togame/src/components/GameTile.tsx), đăng ký trong `registry.ts`.
- **Triển khai Hệ thống Thành tựu & Huy hiệu Pixel (Chặng 22):**
  - **Bộ sưu tập 24 huy hiệu độc quyền:** Phân bố qua 4 nhóm (Chung, Cờ đối kháng, Trí tuệ, Arcade) và 4 bậc vinh danh (🥉 Đồng, 🥈 Bạc, 🥇 Vàng, 💎 Bạch Kim) với điều kiện mở khóa hấp dẫn trong [`achievementsConfig.ts`](file:///d:/personal-prj/game/togame/src/features/achievements/achievementsConfig.ts).
  - **Âm thanh Fanfare & Thông báo In-Game:** Bổ sung âm thanh 4 nốt arpeggio `playAchievementUnlock()`; toast pop-up Neo-Arcade nổi bật [`AchievementToast.tsx`](file:///d:/personal-prj/game/togame/src/features/achievements/AchievementToast.tsx) tự động hiển thị trên toàn sảnh khi mở khóa thành tựu mới.
  - **Tủ trưng bày trong Hồ sơ cá nhân:** Tab "HUY HIỆU" trong [`ProfileAuthModal.tsx`](file:///d:/personal-prj/game/togame/src/features/auth/ProfileAuthModal.tsx) hiển thị thanh tiến độ, bộ đếm badge theo bậc và danh sách huy hiệu rực rỡ kèm ngày mở khóa.
  - **Tự động mở khóa & Đồng bộ Đám mây:** Hệ thống tự động quét mở khóa sau mỗi ván chơi của cả 10 game và gộp bảo lưu vĩnh viễn trên Supabase Cloud qua [`statsMergeService.ts`](file:///d:/personal-prj/game/togame/src/features/stats/statsMergeService.ts).
- **Nâng cấp Hệ thống Âm thanh: Bộ điều chỉnh âm lượng đa mức (Master Volume Control):**
  - **Master Gain Node trong Web Audio API:** Xây dựng nút tổng quản âm lượng trong [`soundService.ts`](file:///d:/personal-prj/game/togame/src/lib/sound/soundService.ts) kiểm soát độ to/nhỏ từ 0% đến 100% cho toàn bộ 10 tựa game trên nền tảng.
  - **Giao diện điều khiển Retro Pixel:** Xây dựng [`VolumeControl.tsx`](file:///d:/personal-prj/game/togame/src/components/VolumeControl.tsx) gồm Popover thả xuống trên Desktop Header và thanh trượt trực quan trong Mobile Drawer.
  - **Trải nghiệm xúc giác:** Nút bấm bật/tắt nhanh, thanh trượt `.pixel-range` kèm 4 nút bấm chọn nhanh (0%, 30%, 70%, 100%) và âm thanh thử nghiệm `playVolumePreview()` phản hồi tức thì.
  - **Đồng bộ trạng thái:** Lưu trữ `kombat_sound_volume` trong LocalStorage và đồng bộ thời gian thực qua event `kombat:volume_change`.

- **Triển khai Lịch sử Thi đấu & Trình Xem lại Ván cờ Tương tác (Chặng 23 - Match History & Replay Viewer):**
  - **Giới hạn lưu trữ tối ưu dữ liệu:** Cố định tối đa **20 ván đấu gần nhất** (`MAX_MATCH_HISTORY = 20`) nhằm ngăn chặn phình to LocalStorage và Supabase User Metadata theo đúng yêu cầu người dùng.
  - **Dịch vụ Lịch sử đấu & Đồng bộ Đám mây:** Xây dựng [`types.ts`](file:///d:/personal-prj/game/togame/src/features/matchHistory/types.ts) và [`matchHistoryService.ts`](file:///d:/personal-prj/game/togame/src/features/matchHistory/matchHistoryService.ts) hỗ trợ ghi ván đấu mới, xóa lịch sử, lọc theo game (`chess`, `caro`, `xiangqi`) và đồng bộ hai chiều với tài khoản đám mây Supabase Auth qua [`statsMergeService.ts`](file:///d:/personal-prj/game/togame/src/features/stats/statsMergeService.ts).
  - **Trình phát lại Tương tác Neo-Arcade:** Xây dựng [`MatchReplayModal.tsx`](file:///d:/personal-prj/game/togame/src/features/matchHistory/MatchReplayModal.tsx) tái hiện bàn cờ sống động theo từng nước đi với đầy đủ bộ điều khiển: Về đầu ván (`|◀`), Lùi 1 nước (`◀`), Tự động phát/Tạm dừng (`▶/⏸`), Tiến 1 nước (`▶`), Đến hết ván (`▶|`), thanh trượt tiến độ (scrubber) và âm thanh click cờ chân thực. Tái tạo chính xác thế cờ cho cả 3 môn cờ: Cờ Vua (chuẩn SAN qua `chess.js`), Cờ Caro (15x15) và Cờ Tướng (luật chiếu tướng và đi cờ).
  - **Tích hợp Tự động Ghi ván & Nút Xem Lại Ngay Sau Trận:**
    - Cờ Vua ([`ChessGameView.tsx`](file:///d:/personal-prj/game/togame/src/features/games/chess/ChessGameView.tsx)): Tự động lưu ván đấu và bổ sung nút "Xem lại ván này" ở cả Modal kết thúc lẫn thanh banner dưới bàn cờ.
    - Cờ Caro ([`CaroGameView.tsx`](file:///d:/personal-prj/game/togame/src/features/games/caro/CaroGameView.tsx)): Tự động ghi nhận khi thắng/thua/hòa/đối thủ xin thua và nút "Xem lại ván này" trong Game Over Modal.
    - Cờ Tướng ([`XiangqiGameView.tsx`](file:///d:/personal-prj/game/togame/src/features/games/xiangqi/XiangqiGameView.tsx)): Tự động lưu nước đi khi chiếu bí/hết nước/xin thua và nút "Xem lại ván này" trong Victory Modal.
  - **Tủ trưng bày Lịch sử & Tối ưu hóa Giao diện Khả năng Mở rộng (Scalable UI):**
    - Thay thế cụm nút chọn trò chơi dạng wrap dễ vỡ bằng **Menu thả xuống Pixel (Dropdown Select)** có phân nhóm rõ ràng (Cờ đối kháng, Trí tuệ, Arcade), giúp giao diện luôn gọn gàng 1 dòng duy nhất dù tương lai có thêm hàng chục game mới.
    - Lược bỏ hoàn toàn dòng thông tin số ván `Lưu 0/20 ván` trong tab Lịch sử đấu theo yêu cầu người dùng, chuyển nút xóa lịch sử lên góc trên phải thanh tiêu đề.
    - Tối ưu hóa mục "Tổng quan" thành **Bảng chỉ số tài khoản bất biến (Global Account Summary)**: 3 thẻ số liệu chính (Tổng ván đấu, Tổng chiến thắng, Huy hiệu) kết hợp thanh ngang rộng rãi cho "Chơi nhiều nhất" (hiển thị đầy đủ 100% tên game không bị cắt chữ `...` và số ván), không bao giờ bị phình to.
    - Đơn giản hóa các ô "Sắp có" (Upcoming Tile) tại Sảnh chính: Bỏ gợi ý tên game cụ thể (như "Cờ vây, Othello"), chỉ hiển thị thống nhất dòng chữ "SẮP CÓ" / "COMING SOON" ngắn gọn, sạch sẽ.
- **Hoàn thành toàn diện Chặng 19 — Trò chơi thứ 11: Block Blast (Xếp khối nổ dòng 8x8):**
  - **Gameplay cốt lõi:** Bàn cờ 8x8 retro pixel, cơ chế nổ hàng ngang và cột dọc khi đủ 8 ô, giải phóng không gian và **hệ thống tính điểm Combo lũy tiến hàm bậc hai** cực đã tay (càng duy trì combo cao, điểm thưởng càng tăng vọt bùng nổ, kèm floating banner và âm thanh chiptune arpeggio dồn dập).
  - **Lưu điểm số & trạng thái khi thoát (Auto-save & Resume):** Tự động lưu toàn bộ bàn cờ, 3 khối trong khay, điểm số và combo streak vào `localStorage` sau mỗi nước đi; khi người chơi thoát ra sảnh hoặc tắt tab rồi quay lại vẫn tiếp tục đúng ván đấu đang chơi dở. Chỉ reset khi Game Over hoặc bấm chơi lại.
  - **Thuật toán chia 3 khối có đường sống (Solvable & Fair RNG):** Khi chia 3 khối mới, thuật toán đảm bảo khối đầu tiên luôn có ít nhất 1 vị trí đặt hợp lệ trên bàn cờ hiện tại, đồng thời mô phỏng đặt khối và nổ dòng để đảm bảo các khối tiếp theo luôn có đường giải, không bao giờ rơi vào cảnh vừa nhận khối là bế tắc thua ngay.
  - **Điều khiển linh hoạt:** Hỗ trợ Kéo - Thả (Drag & Drop) với cơ chế bù khoảng cách ngón tay (touch offset nhấc khối lên ~75px để ngón tay không che tầm nhìn bàn cờ) kèm Ghost Preview bóng mờ; **tự động phát sáng nhấp nháy toàn bộ 8 ô của hàng hoặc cột sắp nổ** khi kéo khối vào vị trí phá gạch; và Chạm chọn $\rightarrow$ Chạm đặt (Tap to Place) thân thiện với màn hình nhỏ.
  - **Âm thanh Web Audio 8-bit:** Nhấc khối, đặt khối (thud chắc nịch), nổ hàng với cao độ tăng dần theo combo streak, nhạc hiệu combo lớn và âm thanh game over.
  - **Tích hợp hệ thống:** Đăng ký vào Sảnh chính (thể loại Giải đố - `puzzle`), Bảng xếp hạng (Leaderboard), Menu Thành tích trong Profile cá nhân và tự động đồng bộ đám mây Supabase.
- **Hoàn thành toàn diện Chặng 20 — Hệ thống Nhạc nền 8-bit Chiptune BGM & Bộ điều chỉnh âm lượng kép SFX / BGM độc lập:**
  - **Công nghệ Procedural Web Audio API Synthesis:** 100% tự sinh nhạc nền bằng mã nguồn trình duyệt, không tải bất kỳ file mp3/wav nào (0MB dung lượng, 0 độ trễ mạng, tiết kiệm tối đa pin thiết bị). Bộ lọc Low-pass Filter 2200Hz giúp âm sắc ấm áp, du dương chuẩn phong cách Game Boy / NES, không chói gắt.
  - **3 chủ đề nhạc nền độc quyền theo thể loại:**
    - `Lobby Theme ("Chiptune Cafe")`: Tiết tấu 104 BPM vui tươi, thư giãn và ngập tràn năng lượng retro cho sảnh chính và các trang chọn màn.
    - `Arcade Theme ("Pixel Rush")`: Tiết tấu 128 BPM sôi động, dồn dập với bè bass và arpeggio lôi cuốn dành cho Block Blast, Rắn săn mồi, Flappy Bird, Phá gạch, 2048.
    - `Strategy Theme ("Zen Focus")`: Tiết tấu 76 BPM êm đềm, thanh bình mang phong cách lo-fi chiptune giúp người chơi tập trung suy nghĩ khi chơi Cờ vua, Cờ caro, Cờ tướng, Sudoku.
  - **BgmController thông minh:** Tự động phát hiện chuyển tuyến đường Next.js App Router (`usePathname`) để chuyển đổi bài hát mượt mà; tự động tạm dừng khi người dùng chuyển sang tab khác (`visibilitychange`); tuân thủ chính sách Autoplay của trình duyệt và tự động kích hoạt ngay từ thao tác chạm đầu tiên.
  - **Bộ điều chỉnh âm lượng kép độc lập (Dual Volume Controls):**
    - Tách biệt hoàn toàn kênh **Hiệu ứng (SFX)** và **Nhạc nền (BGM)**.
    - Hỗ trợ thanh trượt âm lượng $0 - 100\%$ riêng biệt kèm nút Bật/Tắt (Mute) độc lập cho từng kênh.
    - Các nút thiết lập nhanh (Preset: Tắt, 25%, 50%, 80%, 100%) và âm thanh nghe thử (Preview Chime / Arpeggio) khi kéo thanh trượt.
    - Hiển thị nhãn bài hát đang phát kèm hiệu ứng nốt nhạc pixel nhấp nháy trên Header và Mobile Menu Drawer.
    - Lưu độc lập cấu hình vào `localStorage` (`kombat_sound_volume`, `togame_sound_muted`, `kombat_bgm_volume`, `kombat_bgm_muted`).
- **Hoàn thành toàn diện Chặng 21 — Trò chơi thứ 12: Cờ Vây (Go / Weiqi / Baduk):**
  - **Động cơ luật Cờ Vây chuẩn quốc tế (`goLogic.ts`, `types.ts`):**
    - Hỗ trợ 3 kích thước bàn cờ: **9x9** (chơi nhanh, cực tối ưu cho điện thoại), **13x13** (tiêu chuẩn), và **19x19** (chuẩn thi đấu chuyên nghiệp).
    - Thuật toán tìm kiếm đám quân liên kết (Connected group flood-fill), đếm khí (Liberties), tự động nhấc quân bắt tù binh (Captures) khi đám quân bị vây kín 0 khí.
    - Kiểm tra cấm tự sát (Suicide check) và luật Kiếp (Ko rule) chống lặp trạng thái ván cờ.
    - Chức năng Bỏ lượt (Pass) và Xin thua (Resign). Hai lượt Bỏ lượt liên tiếp sẽ kích hoạt tính điểm lãnh thổ (Territory Scoring) + số tù binh + $6.5$ điểm chấp Komi cho quân Trắng.
  - **Trí tuệ nhân tạo Bot AI Cờ Vây (`goBot.ts`):** 2 cấp độ Dễ (Tập sự) và Trung bình (Kỳ thủ) tính toán đòn dọa bắt quân (Atari), giải cứu quân nguy cấp, chiếm các điểm sao (Hoshi/Tengen) và góc/cạnh vàng khai cuộc.
  - **Giao diện bàn cờ gỗ Kaya Neo-Arcade (`GoBoard.tsx`, `GoScoreBar.tsx`, `GoGameOverModal.tsx`, `GoLobby.tsx`):**
    - Lưới SVG co giãn vô cực siêu sắc nét, sao định vị tengen/hoshi, nhãn tọa độ mép, bóng mờ đặt thử (hover/touch preview) và vết đánh dấu nước đi gần nhất.
    - Bảng thông tin đếm tù binh 2 bên, lượt đi động, cảnh báo bỏ lượt và popover xác nhận đặt cờ chống chạm nhầm trên điện thoại.
    - Tự động lưu và khôi phục khi thoát game (Auto-save & Resume via `goStorage.ts`).
  - **Âm thanh Web Audio xúc giác:** Tiếng gõ quân cờ đá lách cách thanh thoát lên bàn gỗ (`playGoStonePlace`) và tiếng bắt tù binh (`playGoStoneCapture`), tự động kết hợp với nhạc nền thiền tĩnh tâm Strategy Theme ("Zen Focus").
  - **Tích hợp toàn diện:** Đăng ký vào Sảnh chính (`GAME_REGISTRY`), thể loại Cờ chiến thuật (`strategy`), Bảng xếp hạng (Leaderboard), Hồ sơ cá nhân (Profile) và đồng bộ tài khoản đám mây Supabase (`statsMergeService.ts`).
- **Hoàn thành toàn diện Chặng 22 — Đấu Online Realtime 1v1 & Ghép Nhanh cho Cờ Vây:**
  - **Dịch vụ phòng Supabase Realtime (`goRoomService.ts`):** Tạo phòng với mã 6 ký tự ngẫu nhiên, tìm hoặc ghép phòng tự động (Quick Match), tham gia bằng mã phòng hoặc link chia sẻ trực tiếp (`/games/go?room=CODE`), đồng bộ nước đi, số tù binh, bỏ lượt, xin thua và kết quả lên bảng `rooms` với RLS bảo mật.
  - **Giao diện Sảnh chờ & Trong trận hoàn chỉnh (`GoLobby.tsx`, `GoGame.tsx`, `page.tsx`):**
    - 3 chế độ đối đầu: 🤖 Đấu với Máy (Bot AI), 👥 Chơi Đôi (Pass & Play), 🌐 Đấu Online (Phòng riêng & Ghép nhanh).
    - Hỗ trợ chọn kích thước bàn cờ (9x9, 13x13, 19x19) khi tạo phòng hoặc ghép trận.
    - Màn hình phòng chờ hiển thị mã phòng lớn, nút 1-chạm sao chép liên kết mời bạn bè và vòng xoay chờ đối thủ.
    - Thanh điều khiển trận đấu tích hợp mã phòng, nút chép link nhanh và hiển thị tên/avatar 2 người chơi theo thời gian thực.
    - Tính năng Tái đấu (Rematch) trong modal chiến thắng, tự động đảo phe (Đen $\leftrightarrow$ Trắng).
    - Tích hợp Biểu cảm tương tác (Emotes) và Chat nhanh (Quick Chat) thời gian thực qua kênh Broadcast.
    - Hỗ trợ song ngữ 100% Việt / Anh cho toàn bộ giao diện cờ vây.
- **Hoàn thành toàn diện Chặng 23 — Lịch sử Đấu & Trình Xem Lại (Replay Viewer) cho Cờ Vây:**
  - **Mở rộng hệ thống Lịch sử đấu (`types.ts`, `matchHistoryService.ts`):** Định nghĩa `GoMatchRecord`, `GoMoveRecord` lưu lại toàn bộ danh sách nước đi, kích thước bàn cờ (9x9, 13x13, 19x19), điểm số lãnh thổ, số tù binh và lý do kết thúc.
  - **Trình xem lại ván đấu tương tác (`MatchReplayModal.tsx`):** Tái tạo bàn cờ Cờ Vây qua từng nước đi, hỗ trợ tua tới/lùi, thanh kéo slider, chế độ tự động phát (Auto Play) và hiển thị vết đánh dấu nước đi mới nhất.
  - **Tích hợp trong trận & Hồ sơ cá nhân (`GoGame.tsx`, `GoGameOverModal.tsx`, `ProfileAuthModal.tsx`):**
    - Tự động ghi nhận ván cờ vào Lịch sử khi kết thúc (Tính điểm đất, Xin thua hoặc Đối thủ rời phòng).
    - Nút "XEM LẠI VÁN ĐẤU NÀY" ngay trong modal kết thúc trận.
    - Bổ sung bộ lọc Cờ Vây (⚪ Cờ Vây / Go) trong tab Lịch sử tại Hồ sơ cá nhân.
- **Hoàn thành toàn diện Chặng 24 — Trò chơi thứ 13: Tetris Cổ Điển (Classic 10×20 Arcade):**
  - **Động cơ Tetris chuẩn quốc tế (`tetrisLogic.ts`, `types.ts`):** Bàn chơi $10 \times 20$, 7 khối Tetromino (`I`, `J`, `L`, `O`, `S`, `T`, `Z`), thuật toán chia túi công bằng **7-Bag Randomizer**, xoay khối kèm **Wall Kick** (SRS-lite), **Ghost Piece** định vị đáy, **Hold Piece**, **Next Queue** (3 khối kế tiếp), Soft Drop / Hard Drop và tính điểm Single/Double/Triple/TETRIS + Combo bonus, tăng Level sau mỗi 10 dòng.
  - **Giao diện & Điều khiển Neo-Arcade (`TetrisGame.tsx`, `src/app/games/tetris/page.tsx`):** Bàn chơi HTML5 Canvas 60fps với khối gạch 3D bevel 16-bit (`[image-rendering:pixelated]`), hỗ trợ bàn phím PC và cụm phím cảm ứng mượt mà trên điện thoại, Auto-save & Resume (`tetrisStorage.ts`).
  - **Âm thanh & Hệ sinh thái (`soundService.ts`, `BgmController.tsx`, `GameTile.tsx`, `LeaderboardModal.tsx`, `statsMergeService.ts`):** Bổ sung 4 hiệu ứng âm thanh 8-bit, nhạc nền Arcade, icon pixel sảnh chính và tích hợp Bảng xếp hạng + đồng bộ đám mây Supabase.
- **Hoàn thành toàn diện Chặng 25 — Thử thách Hàng ngày (Daily Challenges) & Chuỗi ngày chơi (Daily Streak 🔥):**
  - **Kho 15 thử thách đa dạng (`dailyConfig.ts`, `types.ts`):** Tự động chọn 3 nhiệm vụ cố định theo ngày (`YYYY-MM-DD`) trải đều 3 thể loại: 1 Cờ chiến thuật, 1 Giải đố, 1 Arcade.
  - **Theo dõi tiến độ công bằng (`dailyService.ts`):** Chụp mốc chỉ số đầu ngày (Baseline Snapshot) từ `localStorage`, tính tiến độ tự động không cần sửa code từng game, quản lý chuỗi ngày liên tiếp (`currentStreak`, `bestStreak`) và đồng bộ đám mây Supabase.
  - **Giao diện Ngọn lửa Streak & Modal Nhiệm vụ (`DailyChallengesModal.tsx`, `Header.tsx`):** Hiển thị nút Streak 🔥 kèm huy hiệu số nhiệm vụ sẵn sàng nhận thưởng ngay trên Header, đồng hồ đếm ngược 00:00, thanh tiến độ từng game, nút Chơi ngay / Nhận thưởng kèm pháo hoa `PixelFxOverlay`.
- **Hoàn thành toàn diện Chặng 26 — PWA Offline 100% & Banner Cài Đặt App 1-Chạm:**
  - **Service Worker ngoại tuyến (`public/sw.js`):** Tự động cache trước Sảnh chính, toàn bộ 13 route trò chơi, biểu tượng PWA và tài nguyên tĩnh Next.js (`/_next/static/`), bỏ qua API Supabase để đảm bảo không ảnh hưởng luồng Online Realtime.
  - **Trạng thái Ngoại tuyến & Cài đặt 1-Chạm (`PwaManager.tsx`, `layout.tsx`, `manifest.ts`):** Tự động hiển thị thanh thông báo khi mất mạng và Banner cài đặt ứng dụng lên màn hình chính (hỗ trợ cả `beforeinstallprompt` trên Android/Desktop và hướng dẫn 2 bước trên iOS Safari).

## Đang làm

- Toàn bộ 13 trò chơi, hệ thống Thử thách Hàng ngày & Daily Streak 🔥, PWA Offline & Cài đặt App 1-Chạm, âm thanh / nhạc nền kép, biểu cảm Pixel Art, chế độ Online Realtime và Lịch sử thi đấu đã hoàn tất.

## Việc kế tiếp

1. **Hướng 1 — Chế độ Khán giả (Spectator Mode) cho các phòng Cờ Online:** Cho phép bạn bè xem trực tiếp ván cờ qua đường link chia sẻ.
2. **Hướng 2 — Trò chơi thứ 14: Cờ Lật Othello / Reversi (8×8 Strategy):** Hỗ trợ Bot AI và Đấu Online 1v1.
3. **Hướng 3 — Chuẩn bị Triển khai Production (Vercel & OpenGraph Preview):** Tối ưu SEO/OpenGraph khi chia sẻ link phòng và kiểm tra tổng thể trước khi deploy.

## Quyết định còn mở

- Tên dự án và phong cách thương hiệu cuối cùng.
- Các lợi ích cụ thể dành riêng cho tài khoản đã đăng nhập.
- Thư viện quốc tế hóa và thư viện luật cờ được chọn khi bắt đầu implementation.

## Cách cập nhật tiến độ

- `TODO.md` là danh sách từng việc cần hoàn thành; đánh dấu `[x]` khi xong.
- Tệp này là ảnh chụp ngắn về giai đoạn hiện tại, điều đã hoàn thành, việc tiếp theo và quyết định còn mở.
- Cập nhật sau khi hoàn tất một chặng/PR hoặc khi có thay đổi đáng kể; không cần ghi nhật ký từng thao tác nhỏ.

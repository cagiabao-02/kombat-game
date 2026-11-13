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
  - Xây dựng module `src/features/leaderboard/` vinh danh cao thủ cho cả 3 tựa game (Cờ vua Elo & số trận thắng, Cờ Caro chuỗi thắng & tổng thắng, Sudoku kỷ lục thời gian giải nhanh nhất).
  - Thiết kế bục vinh danh Top 3 Podium (1st Quán quân Vàng 🥇, 2nd Bạc 🥈, 3rd Đồng 🥉) và danh sách thứ hạng chi tiết kèm avatar người chơi.
  - Thanh ghim cố định vị trí xếp hạng của người dùng hiện tại (Your Rank) giúp theo dõi thứ hạng cá nhân tức thì.
  - Tích hợp dịch vụ lưu trữ thành tích tự động cho Cờ Caro (`caroStatsService.ts`) và Sudoku (`sudokuStatsService.ts`).
  - Nút bấm mở Bảng xếp hạng trực quan trên thanh Header và khu vực Hero tại Sảnh chính.
  - Migration database `20261109000000_leaderboard_schema.sql` với RLS an toàn.
- **Triển khai Người chơi trực tuyến & Thách đấu 1 chạm (Chặng 11 - Bước 3.2):**
  - Xây dựng module `src/features/presence/` dùng Supabase Realtime Presence channel (`kombat_lobby_presence`) theo dõi danh sách người chơi online tại sảnh.
  - Widget trạng thái trực tuyến hiển thị trực quan ở Hero sảnh chính (`🟢 X người online • ⚔️`) với danh sách đối thủ sẵn sàng. Render tĩnh SSR đảm bảo luôn hiển thị ngay từ frame đầu tiên (kể cả khi chỉ có 1 người online).
  - Hệ thống Thách đấu 1 chạm (Direct 1-Click Challenge): Chọn người chơi -> Chọn game (Cờ vua hoặc Cờ Caro 15x15) -> Tự động tạo phòng ngầm và gửi broadcast tới đối thủ.
  - Modal nhận lời thách đấu (`IncomingChallengeModal.tsx`) với âm thanh chuông báo, đếm ngược 15s tự động và nút "Chiến ngay" / "Từ chối" đưa thẳng cả hai người vào bàn đấu.
  - Khắc phục triệt để lỗi đơ thanh Header do Webpack bundling xung đột eval syntax với `@supabase/auth-js`: Tách `@supabase/supabase-js` thành dynamic lazy-load trong `AuthContext.tsx`, giảm 98% kích thước chunk `layout.js` (từ 3.3MB xuống ~60KB), giúp toàn bộ nút bấm trên Header (Hồ sơ, BXH, Âm thanh, Ngôn ngữ) phản hồi tức thì và không bị crash.
  - Tối ưu giao diện Header di động: Gom các nút phụ (BXH, Âm thanh, Ngôn ngữ) vào menu 3 gạch (Hamburger) hiện đại, mở drawer popover trực quan tránh tràn viền; giữ nguyên pill Hồ sơ nhỏ gọn trên thanh điều hướng.
  - Tối ưu thẻ ảnh đại diện tự tải lên trong `ProfileAuthModal.tsx`: Bỏ nhãn "Đang chọn" bị vỡ dòng trên màn hình điện thoại hẹp, làm nổi bật viền tím và dòng mô tả tinh tế.
  - **Đồng bộ đám mây đa thiết bị (Laptop & Mobile Sync):** Thiết lập Supabase Auth Server (`supabase.auth.getUser()`) làm nguồn chân lý duy nhất (Single Source of Truth) thay vì phụ thuộc `localStorage` hay cache JWT cũ. Tự động đồng bộ ảnh đại diện, tên người chơi và thành tích thi đấu tức thì giữa các thiết bị ngay khi vào trang, khi chuyển tab (`focus`) và kết nối trực tiếp với thanh Header bên ngoài.

## Đang làm

- Bước 3.3: Máy phát nhạc nền Lo-fi thư giãn (BGM) bằng Web Audio API procedural synthesis.

## Việc kế tiếp

1. Tích hợp máy phát nhạc nền Lo-fi thư giãn bằng Web Audio API.
2. Kiểm tra thực tế bằng 2 tab/cửa sổ để trải nghiệm luồng Thách đấu 1 chạm.

## Quyết định còn mở

- Tên dự án và phong cách thương hiệu cuối cùng.
- Các lợi ích cụ thể dành riêng cho tài khoản đã đăng nhập.
- Thư viện quốc tế hóa và thư viện luật cờ được chọn khi bắt đầu implementation.

## Cách cập nhật tiến độ

- `TODO.md` là danh sách từng việc cần hoàn thành; đánh dấu `[x]` khi xong.
- Tệp này là ảnh chụp ngắn về giai đoạn hiện tại, điều đã hoàn thành, việc tiếp theo và quyết định còn mở.
- Cập nhật sau khi hoàn tất một chặng/PR hoặc khi có thay đổi đáng kể; không cần ghi nhật ký từng thao tác nhỏ.

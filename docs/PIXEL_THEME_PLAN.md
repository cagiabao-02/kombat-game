# Kế hoạch Chuyển đổi Giao diện Neo-Arcade (Modern Pixel 16-bit)

> **Mục tiêu**: Chuyển đổi toàn bộ phong cách trang web Kombat sang mỹ thuật **Neo-Arcade (Modern Pixel 16-bit)** kết hợp giữa vẻ đẹp hoài cổ của máy chơi game arcade và độ sắc nét, tiện dụng trên màn hình cảm ứng di động hiện đại.
>
> **Nguyên tắc bất biến**: Không can thiệp vào logic nghiệp vụ của các game (`chess.js`, bot AI, Sudoku validator, Caro 5-in-a-row, Xiangqi engine), không thay đổi Supabase Realtime, Auth, RLS database. Chỉ tái cấu trúc lớp hiển thị (UI Presentation).

---

## 1. Định hướng Thiết kế (Design Direction: Hướng B - Neo-Arcade)

- **Typography (Chữ viết)**:
  - **Font Pixel (`Pixelify Sans`)**: Tiêu đề (Headings), số điểm, bộ đếm giờ, nhãn nút bấm, huy hiệu cấp bậc. Hỗ trợ tiếng Việt có dấu đầy đủ, chuẩn Unicode.
  - **Font Body (`Geist Mono` / `ui-monospace`)**: Văn bản giải thích dài, luật chơi, thông báo chi tiết để đảm bảo không mỏi mắt khi đọc lâu trên điện thoại.
- **Borders & Shadows (Khung viền & Bóng đổ)**:
  - Viền cứng dứt khoát 2px hoặc 3px với các góc vuông (`rounded-none` hoặc `rounded-sm`), thay thế bo tròn mềm (`rounded-2xl`, `rounded-3xl`).
  - **Hard Drop Shadow** mô phỏng nút bấm cơ học máy xèng: `box-shadow: 4px 4px 0px 0px #1E1B4B`.
  - Phản hồi tương tác khi bấm: Nút lún xuống theo tọa độ `active:translate-x-[2px] active:translate-y-[2px]` và bóng giảm độ dày tương ứng.
- **Bảng màu Arcade**:
  - Tím Arcade Indigo (`#4F46E5`), Vàng Coin Retro (`#F59E0B`), Xanh Mint Emerald (`#10B981`), Đỏ Pixel Heart (`#EF4444`), Nền Gameboard Kem nhạt (`#F6F7FB` / `#F0EFE9`).

---

## 2. Lộ trình Triển khai Chi tiết

```
┌─────────────────────────────────────────────────────────────┐
│ Giai đoạn 1: Nền tảng Theme & Design System (Design Tokens) │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Giai đoạn 2: Khung điều hướng chung & Sảnh chính (Lobby)    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Giai đoạn 3: Chuyển đổi Bàn cờ 4 Game (Thực hiện tuần tự)   │
│   ├─ 3.1: Cờ Caro (Gomoku)                                  │
│   ├─ 3.2: Sudoku                                            │
│   ├─ 3.3: Cờ vua (Chess)                                    │
│   └─ 3.4: Cờ tướng (Xiangqi)                                │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ Giai đoạn 4: Hoàn thiện Hiệu ứng (VFX), Âm thanh & Mobile   │
└─────────────────────────────────────────────────────────────┘
```

---

### Giai đoạn 1: Nền tảng Theme & Design System

*Mục tiêu: Thiết lập font chữ, màu sắc và các utility class trong Tailwind mà không làm vỡ các trang đang chạy.*

- [x] **1.1 Cấu hình Font chữ**:
  - Nhúng Google Font `Pixelify Sans` và `JetBrains Mono` trong `src/app/layout.tsx`.
  - Thiết lập biến CSS `--font-pixel`, `--font-mono` và `--font-sans` cho toàn bộ dự án.
- [x] **1.2 Cấu hình Tailwind Tokens & Utilities (`tailwind.config.ts` & `src/app/globals.css`)**:
  - Thêm tiện ích `pixel-box`: Khung viền sắc nét 2px kèm bóng cứng 4px.
  - Thêm tiện ích `pixel-btn`: Nút bấm nảy xúc giác cơ học (active lún xuống 2px).
  - Thêm tiện ích `pixel-card`: Thẻ bài phong cách cartridge băng game xèng.
  - Bảng màu retro: Arcade Indigo, Golden Coin, Emerald Mint, Pixel Red.
- [x] **1.3 Kiểm tra**: Xác nhận cấu hình font và CSS hoạt động ổn định.

---

### Giai đoạn 2: Sảnh chính (Lobby) & Khung điều hướng chung

*Mục tiêu: Đổi mới diện mạo bên ngoài của toàn bộ trang web sang phong cách máy chơi game arcade.*

- [x] **2.1 Header & Footer phong cách Arcade Cabinet (`Header.tsx`)**:
  - Logo "KB KOMBAT": Tái thiết kế thành huy hiệu máy xèng 16-bit.
  - Các nút chức năng: Âm thanh, Ngôn ngữ, Nút mở menu di động bo viền pixel nổi.
  - Thanh người dùng: Pill tài khoản/khách dạng thẻ xu xèng (Token / Coin badge).
  - Footer: Thông số máy game cổ điển gọn gàng.
- [x] **2.2 Sảnh chính & Thẻ bài game (`src/app/page.tsx` & `GameCard.tsx`)**:
  - Banner Hero: Tiêu đề sảnh với font pixel, hiệu ứng viền bóng nổi bật.
  - Thẻ `GameCard` cho 4 game: Dạng băng game (Game Cartridge / Arcade Board), nhãn thể loại pixel badge, nút "Chơi ngay" nảy cơ học.
  - Widget trạng thái người online (`LobbyPresenceWidget.tsx`): Đèn LED nhấp nháy phong cách máy game arcade.
- [x] **2.3 Các Modals chung**:
  - Hộp thoại Hồ sơ & Tài khoản (`ProfileAuthModal.tsx`).
  - Hộp thoại Bảng xếp hạng (`LeaderboardModal.tsx`): Bục Top 3 Podium phong cách bục vinh danh arcade retro.
  - Hộp thoại Nhận lời thách đấu (`IncomingChallengeModal.tsx`).
- [x] **2.4 Kiểm tra**: Kiểm tra responsive trên mobile/desktop và kiểm tra mở tắt các modal mượt mà.

---

### Giai đoạn 3: Chuyển đổi Bàn cờ & Quân cờ cho từng game

*Mục tiêu: Nâng cấp độc lập từng game theo thứ tự từ dễ đến phức tạp, không làm ảnh hưởng đến game khác.*

- [x] **3.1 Cờ Caro (Gomoku)**:
  - Bàn cờ 15x15: Lưới ô vuông mộc với điểm sao pixel retro.
  - Quân cờ: Dấu `X` (đỏ pixel) và `O` (xanh pixel) dạng chunky to bản, nịnh mắt.
  - Bộ điều khiển (`CaroControls.tsx`): Đồng hồ đếm giờ dạng số điện tử LED/LCD, nút Đầu hàng / Xin hòa dạng nút máy bấm.
- [x] **3.2 Sudoku**:
  - Bàn cờ 9x9: Mô phỏng màn hình máy game cầm tay LCD / Game Boy cổ điển.
  - Bàn phím số 1-9: Phím bấm cơ học máy tính pixel nhô cao.
  - Modal Thắng / Thua (`VictoryModal.tsx`, `GameOverModal.tsx`): Phong cách "STAGE CLEAR" / "GAME OVER" retro.
- [x] **3.3 Cờ Vua (Chess)**:
  - Bàn cờ 64 ô: Màu retro kem/nâu gỗ pixel hoặc xanh mint arcade.
  - Bộ quân cờ: Tích hợp bộ **Pixel Chess Sprite 16-bit** (Vua, Hậu, Xe, Tượng, Mã, Tốt cho cả 2 bên Trắng/Đen).
  - Bảng biên bản nước đi (Move History): Phong cách bảng máy tính 80s.
- [x] **3.4 Cờ Tướng (Xiangqi)**:
  - Bàn cờ 9x10: Đường sông Sở Hà Hán Giới và cửu cung nét vẽ pixel art cổ kính.
  - Quân cờ: Đồng xu gỗ tròn viền pixel, chữ Hán/Việt dập nổi nét pixel sắc gọn.
  - Bảng điều khiển (`XiangqiControls.tsx`): Đồng bộ phong cách Neo-Arcade.

---

### Giai đoạn 4: Hoàn thiện Tương tác, Hiệu ứng (VFX) & Trải nghiệm Di động

*Mục tiêu: Đảm bảo độ mượt, phản hồi xúc giác và tính nhất quán trên mọi kích cỡ màn hình.*

- [x] **4.1 Đồng bộ Hiệu ứng & Âm thanh**:
  - Khớp hiệu ứng `PixelFX` (pháo hoa pixel confetti) khi chiến thắng ở tất cả 4 tựa game.
  - Đồng bộ âm thanh chiptune Web Audio API (blip khi chọn ô, thud khi đặt quân, fanfare khi thắng).
- [x] **4.2 Tối ưu trải nghiệm chạm trên điện thoại (Mobile Touch Target)**:
  - Kiểm tra tất cả nút bấm và ô cờ đạt diện tích chạm tối thiểu $\ge 44\text{px}$.
  - Đảm bảo độ tương phản màu sắc cao, dễ nhìn dưới ánh sáng mạnh.
- [x] **4.3 Kiểm thử toàn diện & Cập nhật tài liệu**:
  - Chạy `npm run build` đạt 0 lỗi, 0 cảnh báo.
  - Cập nhật `docs/PROGRESS.md` và `docs/TODO.md`.

---

## 3. Quản lý Rủi ro & Khắc phục Dự phòng

| Rủi ro tiềm ẩn | Biện pháp ngăn chặn & Xử lý |
| :--- | :--- |
| Font pixel tiếng Việt bị lỗi hiển thị dấu (â, ư, ơ, dấu ngã/hỏi) | Sử dụng `Pixelify Sans` chuẩn Google Fonts (được kiểm định hỗ trợ tiếng Việt hoàn hảo); văn bản dài giữ fallback font sans-serif/monospace. |
| Quân cờ pixel bị mờ khi co giãn trên màn hình Retina/High-DPI | Thêm thuộc tính CSS `image-rendering: pixelated;` hoặc dùng chuẩn SVG pixel-perfect để ảnh luôn sắc cạnh ở mọi độ phóng to. |
| Xung đột logic game trong quá trình làm mới giao diện | Tuyệt đối không sửa các file logic nền tảng (`*Logic.ts`, `*Bot.ts`, `*Service.ts`), chỉ sửa các component `.tsx` tầng giao diện. |

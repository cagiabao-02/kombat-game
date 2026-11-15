# Kombat — 16-Bit Neo-Arcade Mini-Games Lobby 🕹️

[![Next.js](https://img.shields.io/badge/Next.js-15_App_Router-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_Realtime-3ECF8E?logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-orange?logo=pwa)](https://web.dev/progressive-web-apps/)

**Kombat** là sảnh trò chơi mini phong cách **Neo-Arcade 16-bit** hiện đại, đa nền tảng (Web Mobile & Desktop, Progressive Web App). Dự án mang đến trải nghiệm giải trí tức thì, thi đấu trực tuyến thời gian thực và lưu trữ thành tích đám mây an toàn.

---

## ✨ Điểm nổi bật

- 👾 **Giao diện Neo-Arcade 16-bit:** Sử dụng font pixel `Pixelify Sans` hỗ trợ tiếng Việt đầy đủ, thiết kế thùng máy arcade cổ điển kết hợp hiệu ứng pháo hoa hạt pixel (`PixelFX`).
- 🎵 **Hệ thống âm thanh Web Audio API:** Âm thanh Chiptune 8-bit sống động cho từng hành động mà không cần tải file mp3 dung lượng lớn.
- ⚡ **Chơi ngay không cần đăng ký:** Tích hợp Supabase Anonymous Auth để định danh người chơi tức thì khi vào sảnh; hỗ trợ nâng cấp tài khoản Google / Email để bảo toàn thành tích vĩnh viễn trên đám mây.
- ⚔️ **Trực tuyến & Thách đấu 1 chạm:** Hiển thị danh sách người chơi online tại sảnh qua Supabase Realtime Presence; gửi lời thách đấu trực tiếp với đếm ngược 15 giây.
- 🏆 **Bảng xếp hạng toàn cầu tinh gọn:** Vinh danh cao thủ với bục vinh danh Podium Top 3 vàng/bạc/đồng, thanh ghim thứ hạng cá nhân (Your Rank) và chỉ hiển thị Điểm số hoặc Thời gian cốt lõi theo từng bộ môn.
- 📱 **Mobile-First & PWA:** Tối ưu vùng chạm cảm ứng ngón cái ($\ge 44\text{px}$), hỗ trợ cử chỉ vuốt chạm touch-swipe, D-pad ảo và tính năng *Add to Home Screen* chạy độc lập như app native.
- 🌐 **Đa ngôn ngữ song ngữ:** Chuyển đổi mượt mà 1 chạm giữa Tiếng Việt và English.

---

## 🎮 Bộ sưu tập 8 trò chơi

Sảnh trò chơi được phân loại thành 3 nhóm thể loại chính:

### 1. Chiến thuật (Strategy)
- ♟️ **Cờ Vua (Chess):**
  - Động cơ luật cờ vua chuẩn quốc tế (`chess.js`).
  - Chế độ: Đấu với Máy (Bot AI 3 cấp độ), Chơi đôi trên cùng máy (Pass & Play), Phòng riêng 6 ký tự và Ghép trận nhanh ngẫu nhiên.
  - Đồng hồ thi đấu đếm ngược (Blitz / Rapid) và thả biểu cảm Emoji tương tác.
- 🔴 **Cờ Tướng (Xiangqi):**
  - Động cơ luật Cờ Tướng thuần TypeScript độc lập (Sông Sở Hà, Cung Tướng, Cản mã, Chặn tượng, Chiếu tướng...).
  - Chế độ: Đấu Bot AI 3 cấp độ, Pass & Play, Phòng riêng PvP Realtime.
  - Tùy chọn hiển thị mặt quân cờ song ngữ chữ Hán truyền thống hoặc chữ Việt tiện lợi.
- ❌ **Cờ Caro (Gomoku 15x15):**
  - Bàn cờ 15x15 chuẩn quốc tế với 5 điểm sao định vị (Hoshi/Tengen), nhận diện 5 quân thẳng hàng.
  - Chế độ: Bot AI phân tích thế trận theo ma trận điểm và bán kính co cụm, Chơi đôi Pass & Play, PvP Online Realtime.

### 2. Giải đố (Puzzle)
- 🔢 **Sudoku Classic:**
  - Bộ tạo đề ngẫu nhiên 2 pha (đào ô đối xứng + giải thử đệ quy) với 3 cấp độ: Dễ, Vừa, Khó.
  - Luật giới hạn 3 lần phạm lỗi, hệ thống đánh dấu số trùng theo hàng/cột/khối 3x3, phím số ảo lớn cho mobile và tính năng Hoàn tác/Tạm dừng.
- 🟦 **2048:**
  - Bảng số $4 \times 4$ với cơ chế trượt gộp mượt mà, hỗ trợ touch-swipe trên điện thoại và phím WASD / Mũi tên trên máy tính.
  - Hỗ trợ lùi 1 bước đi (Undo), âm thanh gộp ô tăng dần theo âm vực và chinh phục mốc 2048 / 4096.
- 💣 **Dò Mìn Pixel (Minesweeper):**
  - 3 độ khó chuẩn: Dễ ($9 \times 9$, 10 mìn), Vừa ($16 \times 16$, 40 mìn), Khó ($16 \times 30$, 99 mìn).
  - Thuật toán mở an toàn lượt đầu tiên (*First Click Never Boom*), mở loang tự động Flood Fill BFS, nút Mặt cười tương tác (🙂, 😮, 😎, 😵) và đồng hồ LED đỏ.

### 3. Hành động & Arcade (Arcade)
- 🐍 **Rắn Săn Mồi (Retro Snake):**
  - Khung lưới $20 \times 20$, tốc độ tăng dần theo độ dài thân rắn, táo đỏ (+10đ) và táo vàng may mắn (+30đ).
  - Điều khiển đa dạng: Vuốt màn hình cảm ứng, cụm D-pad 4 hướng ảo và phím mũi tên PC.
- 🧱 **Phá Gạch Pixel (Brick Breaker / Arkanoid):**
  - Động cơ vật lý nảy bóng Canvas 2D tỉ lệ $3:4$ ($480 \times 640$), góc nảy linh hoạt theo điểm chạm trên thanh trượt.
  - Hệ thống vật phẩm cân bằng: Kéo dài thanh (↔️), Nhân đôi số bóng (⚡), Cộng 2 bóng cho mỗi bóng hiện có (+2), Thêm mạng (💖).
  - Gạch đặc biệt: Gạch thép 2 lần đập và gạch bom phát nổ liên hoàn.

---

## 🛠️ Công nghệ sử dụng

| Tầng | Công nghệ / Thư viện |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, React 19, Server & Client Components) |
| **Ngôn ngữ** | [TypeScript](https://www.typescriptlang.org/) (Strict Mode) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) & Pixel Art Utilities |
| **Backend & Realtime** | [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth Anonymous & OAuth, Realtime Broadcast & Presence) |
| **Font chữ** | `Pixelify Sans` (Google Fonts) hỗ trợ tiếng Việt đầy đủ |
| **Icons** | [Lucide React](https://lucide.dev/) & Pixel Art SVG Icons tự vẽ |
| **Âm thanh** | Web Audio API thuần (Chiptune synthesizer độc lập, không dùng file media ngoài) |

---

## 🚀 Cài đặt và Chạy thử nghiệm Local

### 1. Yêu cầu môi trường
- **Node.js:** `>= 18.18.0` (Khuyến nghị Node.js 20+)
- **Trình quản lý gói:** `npm` hoặc `pnpm`

### 2. Các bước cài đặt
```bash
# 1. Clone repository
git clone https://github.com/cagiabao-02/kombat-game.git
cd kombat-game

# 2. Cài đặt dependencies
npm install

# 3. Thiết lập biến môi trường
cp .env.example .env.local
```

### 3. Cấu hình biến môi trường (`.env.local`)
Điền thông tin kết nối Supabase của bạn:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Khởi động môi trường phát triển
```bash
npm run dev
```
Mở trình duyệt tại: **`http://localhost:3000`**

### 5. Kiểm tra đóng gói sản phẩm
```bash
# Kiểm tra an toàn kiểu dữ liệu TypeScript
npx tsc --noEmit

# Biên dịch bản phát hành sản phẩm
npm run build
```

---

## 📁 Cấu trúc thư mục

```text
togame/
├── docs/                             # Tài liệu đặc tả, kế hoạch và tiến độ
│   ├── DEVELOPMENT.md                # Quy ước code và kiến trúc module
│   ├── PROGRESS.md                   # Nhật ký tiến độ chi tiết từng chặng
│   ├── REQUIREMENTS.md               # Yêu cầu sản phẩm và nghiệp vụ
│   └── TODO.md                       # Danh sách đầu việc theo từng chặng
├── public/                           # Tài nguyên tĩnh, manifest PWA, icons
├── src/
│   ├── app/                          # Next.js App Router (trang chủ và các trang game)
│   │   ├── games/
│   │   │   ├── brick-breaker/        # Trang chơi Phá Gạch
│   │   │   ├── caro/                 # Trang chơi Cờ Caro
│   │   │   ├── chess/                # Trang chơi Cờ Vua
│   │   │   ├── game2048/             # Trang chơi 2048
│   │   │   ├── minesweeper/          # Trang chơi Dò Mìn
│   │   │   ├── snake/                # Trang chơi Rắn Săn Mồi
│   │   │   ├── sudoku/               # Trang chơi Sudoku
│   │   │   └── xiangqi/              # Trang chơi Cờ Tướng
│   │   ├── layout.tsx                # Root layout bọc Providers & Header
│   │   └── page.tsx                  # Sảnh chính hiển thị danh mục game
│   ├── components/                   # UI components dùng chung (Header, GameTile, Dialog...)
│   │   └── fx/                       # Hiệu ứng đồ họa pixel (PixelFxOverlay, Confetti)
│   ├── features/                     # Các module tính năng độc lập
│   │   ├── auth/                     # Supabase Auth, ProfileModal, Avatar Selector
│   │   ├── games/                    # Logic và UI chi tiết của từng trò chơi
│   │   ├── leaderboard/              # Bảng xếp hạng, dịch vụ tính điểm & Modal
│   │   ├── presence/                 # Người chơi online & Thách đấu 1 chạm
│   │   └── stats/                    # Dịch vụ gộp và đồng bộ thành tích đám mây
│   ├── i18n/                         # Hệ thống đa ngôn ngữ (LanguageContext, translations)
│   ├── lib/                          # Kết nối Supabase và Web Audio soundService
│   └── types/                        # Kiểu dữ liệu TypeScript dùng chung
└── supabase/
    └── migrations/                   # Các tệp SQL migration cho database & RLS
```

---

## 🔒 Bảo mật & Dữ liệu

- **Row Level Security (RLS):** Mọi bảng trong Supabase (`rooms`, `leaderboard_scores`) đều được bật RLS và phân quyền truy cập nghiêm ngặt.
- **Không lưu trữ Secret Keys:** Client chỉ sử dụng Anonymous Key công khai; không đưa `service_role` vào mã nguồn ứng dụng trình duyệt.
- **Phiên chơi ẩn danh:** Người chơi có thể tham gia thi đấu và ghi danh bảng vàng ngay lập tức mà không cần khai báo thông tin cá nhân bắt buộc.

---

## 📄 Bản quyền & Đóng góp

Dự án cá nhân mã nguồn mở được phát triển bởi [cagiabao-02](https://github.com/cagiabao-02). Mọi ý kiến đóng góp và cải tiến đều rất được hoan nghênh qua [Pull Requests](https://github.com/cagiabao-02/kombat-game/pulls) hoặc [Issues](https://github.com/cagiabao-02/kombat-game/issues).

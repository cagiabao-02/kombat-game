# Yêu cầu sản phẩm — Sảnh trò chơi ngắn

> Trạng thái: bản nháp khởi đầu, cần chủ dự án xác nhận một số quyết định ở cuối tài liệu.

## 1. Tầm nhìn

Tạo một website đơn giản, thân thiện trên điện thoại và máy tính, nơi người dùng có thể mở nhanh một trò chơi ngắn, chơi một mình hoặc kết nối với bạn bè. Sau MVP có thể ghép người chơi ngẫu nhiên.

## 2. Người dùng mục tiêu

- Người muốn giải trí trong vài phút, không cần cài ứng dụng.
- Bạn bè muốn tạo phòng và gửi liên kết mời nhau.
- Người chơi muốn tìm đối thủ mới (giai đoạn sau MVP).

## 3. Phạm vi MVP đề xuất

### Bao gồm

- Trang chủ/sảnh hiển thị trò chơi, trạng thái sẵn sàng và hướng dẫn ngắn.
- Sudoku một người: tạo ván dễ/vừa/khó, nhập số, kiểm tra lỗi, xóa nước đi và bắt đầu ván mới. Lưu ván hiện tại trên thiết bị.
- Cờ vua hai người: tạo phòng riêng, chia sẻ liên kết/mã mời, tham gia bằng tài khoản khách có tên hiển thị, đồng bộ lượt đi và trạng thái kết nối. Chơi casual, không xếp hạng.
- Khách có thể dùng trải nghiệm cơ bản không cần đăng ký. Người chơi có thể đăng nhập để mở nhóm tính năng riêng; lợi ích cụ thể sẽ được chốt trước khi phát triển phần tài khoản.
- Hỗ trợ tiếng Việt và tiếng Anh ngay từ đầu, có cách chuyển ngôn ngữ và nhớ lựa chọn.
- Bố cục responsive, thao tác được bằng cảm ứng trên Android/iOS và chuột/bàn phím trên PC.
- Thiết kế sảnh và cấu trúc mã theo registry game thống nhất để thêm trò mới mà không phải viết lại luồng sảnh.
- Thông báo trạng thái kết nối, phòng không tồn tại, đối thủ rời phòng và lỗi mạng; có cách thử kết nối lại hoặc thoát.
- Quy tắc và trạng thái ván cờ được xác thực trước khi chấp nhận nước đi; chỉ thành viên phòng có quyền đọc/cập nhật ván của phòng.

### Chưa bao gồm trong MVP

- Ghép ngẫu nhiên, điểm Elo/xếp hạng, giải đấu, chat, danh sách bạn bè.
- Thanh toán, quảng cáo, ứng dụng native, thông báo đẩy, dashboard quản trị.
- Nhiều biến thể cờ hoặc nhiều game online khác.

**Giai đoạn kế tiếp:** 
- Đã hoàn tất: Hàng đợi ghép ngẫu nhiên (Quick Match), tính năng Đấu lại (Rematch), hệ thống Bot cờ vua tự động (3 cấp độ Dễ/Vừa/Khó) chơi offline local kèm fallback sau 2 phút, trò Rắn Săn Mồi Pixel (Game 5).
- Đang phát triển: Trò chơi thứ 6: 2048 Pixel Arcade (Puzzle), bổ sung bảng xếp hạng kỷ lục điểm số và lưu trữ đám mây.

## 4. Yêu cầu chức năng

### FR-1 — Sảnh trò chơi mở rộng được

- Người dùng xem được tên, mô tả ngắn và trạng thái của từng game.
- Game chưa triển khai được đánh dấu “Sắp có”, không dẫn tới màn hình lỗi.
- Mỗi game được đăng ký qua cấu hình/thành phần thống nhất (ví dụ: id, tên bản địa hóa, mô tả, route, trạng thái, chế độ chơi); logic riêng được giữ trong module của game đó.
- Thêm game mới không yêu cầu viết lại cách sảnh liệt kê hoặc điều hướng game cũ.
- Sảnh chia game theo **thể loại** (khai báo trong `src/features/games/categories.ts`, mỗi game gắn `category` trong registry):
  - `puzzle` — **Giải đố**: chơi một mình, tư duy logic, không áp lực thời gian (Sudoku, 2048; dự kiến Dò mìn, Nonogram).
  - `strategy` — **Cờ chiến thuật**: đối kháng theo lượt, đấu Bot hoặc người (Cờ vua, Cờ Tướng, Cờ Caro; dự kiến Cờ vây, Othello).
  - `arcade` — **Phản xạ / Arcade**: nhịp nhanh, tính điểm, cày kỷ lục (dự kiến Rắn săn mồi, xếp gạch, thử phản xạ).
- Có thanh lọc nhanh theo thể loại (Tất cả + từng thể loại); thể loại chưa có game hiển thị ô “Sắp có” thay vì để trống.
- Thể loại là đề xuất ban đầu, có thể đổi tên/thêm bớt chỉ bằng cách sửa file cấu hình.

### FR-2 — Sudoku

- Người chơi bắt đầu ván mới và chọn một trong ba mức độ.
- Có thể nhập/xóa số, xem các ô đã cho, nhận biết nước đi sai và hoàn thành ván.
- Luật giới hạn lỗi: Người chơi có tối đa 3 lượt phạm lỗi trùng số. Nếu nhập sai/trùng số đến lần thứ 3 thì ván đấu kết thúc ngay lập tức (Game Over), hiển thị bảng thông báo và cho phép chơi lại hoặc tạo ván mới.
- Ván đang chơi được lưu cục bộ để tải lại trang không mất tiến độ.

### FR-3 — Phòng cờ vua

- Người chơi tạo phòng riêng và sao chép liên kết/mã mời.
- Tùy chọn thời gian ván đấu (Chess Clock): Không giới hạn, 3 phút, 5 phút hoặc 10 phút mỗi bên; đồng hồ đếm ngược khi đến lượt đi của từng người chơi và xử thua khi hết giờ (Time Out).
- Biên bản nước đi (Move History): Hiển thị danh sách các nước đi chuẩn cờ vua theo cặp để hai bên theo dõi.
- Người nhận liên kết tham gia với tên hiển thị; phòng có tối đa hai người chơi.
- Hai người thấy cùng trạng thái bàn cờ và lượt đi; nước đi không hợp lệ bị từ chối.
- Giao diện cho biết đang kết nối, đối thủ đã rời đi và ván kết thúc.

### FR-3.1 — Ghép trận ngẫu nhiên (Quick Match)

- Cho phép người chơi bấm "Ghép trận nhanh" mà không cần gửi mã phòng thủ công.
- Tùy chọn chế độ thời gian mong muốn (3 phút, 5 phút, 10 phút hoặc Không giới hạn).
- Giả lập thời gian tìm kiếm ngẫu nhiên từ 1 đến 5 giây trước khi thực hiện ghép, hiển thị đồng hồ thời gian tìm kiếm và cho phép hủy bất kỳ lúc nào.
- Hệ thống tự động ghép với phòng chờ tương thích hoặc tạo phòng mới chờ đối thủ vào. Khi có đối thủ, tự động thông báo và vào ván đấu.

### FR-4 — Danh tính và quyền truy cập

- Người chơi vào bằng tài khoản khách, không bắt buộc tự đăng ký email/mật khẩu; có tên hiển thị.
- Dùng Supabase Auth anonymous session ở nền để mỗi người có định danh khi tạo/tham gia phòng; tên hiển thị không dùng làm cơ chế cấp quyền.
- Người chơi có thể đăng nhập/đăng ký tài khoản thường để mở tính năng riêng. Chốt rõ tính năng nào yêu cầu tài khoản trước khi triển khai; ưu tiên liên kết tài khoản khách để giữ dữ liệu gắn với cùng user id.
- Nêu rõ phiên khách không thể khôi phục sau khi xóa dữ liệu trình duyệt, đăng xuất hoặc đổi thiết bị cho tới khi liên kết tài khoản.
- Không dùng dữ liệu client để cấp quyền cho người không phải thành viên phòng.
- Có thể xóa/đóng phòng cũ theo thời hạn lưu trữ đã định.

### FR-5 — Ngôn ngữ

- MVP hỗ trợ tiếng Việt và tiếng Anh ở giao diện, nội dung hướng dẫn và thông báo lỗi.
- Có bộ chọn ngôn ngữ; ưu tiên ngôn ngữ trình duyệt, mặc định tiếng Việt nếu không nhận diện được, và ghi nhớ lựa chọn.
- Tên/mô tả game hiển thị theo ngôn ngữ đang chọn.

### FR-6 — Cờ Caro (Gomoku / 5 in a row)

- Bàn cờ chuẩn $15 \times 15$ ô, thao tác chạm hoặc click vào giao điểm / ô cờ.
- Luật chơi: 5 quân liên tiếp theo hàng ngang, dọc hoặc chéo sẽ chiến thắng.
- Hỗ trợ đánh dấu nước đi vừa đánh, đánh dấu đường 5 quân chiến thắng nổi bật.
- Chế độ chơi đa dạng:
  - Đấu với Bot AI thông minh (3 cấp độ Dễ / Vừa / Khó).
  - Chơi 2 người cùng thiết bị (Pass & Play).
  - Phòng riêng PvP Realtime mời bạn bè và Ghép trận ngẫu nhiên (Quick Match).
  - Đồng hồ thi đấu đếm ngược (Không giới hạn, 3p, 5p).

### FR-7 — Bảng xếp hạng toàn sảnh (Leaderboard)

- Bảng xếp hạng vinh danh người chơi cho cả 3 trò chơi: Cờ vua (Elo & Số trận thắng), Cờ Caro (Số trận thắng & Chuỗi thắng), Sudoku (Kỷ lục giải nhanh nhất).
- Bục vinh danh Top 3 Podium (Hạng 1 Vàng, Hạng 2 Bạc, Hạng 3 Đồng) cùng danh sách thứ hạng đầy đủ.
- Tự động hiển thị thanh ghim cố định vị trí xếp hạng của người dùng hiện tại (Your Rank).
- Truy cập thuận tiện từ Header và nút mở tại Sảnh chính (Lobby).
- Hỗ trợ lưu trữ cục bộ kèm đồng bộ Supabase Cloud.

### FR-8 — Cờ Tướng (Xiangqi / Chinese Chess)

- Bàn cờ 9 cột × 10 hàng với đường ranh Sông (Sở Hà Hán Giới) và Cung Tướng (Nine Palaces).
- Bộ quân cờ 16 quân mỗi bên (Đỏ và Đen): Tướng (Soái/Tướng), Sĩ, Tượng, Xe, Pháo, Mã, Tốt/Binh với quy tắc di chuyển và ăn quân chuẩn quốc tế:
  - Cản chân Mã (bị chặn hướng đi), cản mắt Tượng (không nhảy qua đầu quân khác, không qua sông).
  - Pháo đi như Xe nhưng phải có 1 quân làm ngòi mới được ăn quân.
  - Tướng và Sĩ chỉ di chuyển trong Cung; quy tắc cấm lộ mặt Tướng (hai Tướng không nhìn thẳng mặt nhau không có quân chắn).
  - Tốt/Binh đi thẳng 1 bước; sau khi qua sông được đi ngang hoặc đi thẳng 1 bước (không đi lùi).
  - Chiếu tướng, chiếu bí, hết nước đi (bị vây chặt), hòa cờ.
- Chế độ chơi đa dạng:
  - Đấu với Bot AI thông minh (3 cấp độ Dễ / Vừa / Khó).
  - Chơi đôi cùng máy (Pass & Play) với nút xoay bàn cờ theo lượt.
  - Phòng riêng PvP Realtime mời bạn bè và Ghép trận ngẫu nhiên (Quick Match).
  - Đồng hồ thi đấu tùy chọn (Không giới hạn, 5p, 10p, 15p).
- Âm thanh và hiệu ứng: Đặt cờ gỗ truyền thống, ăn quân, chiếu tướng, dải highlight nước đi hợp lệ.

### FR-12 — Rắn Săn Mồi Pixel (8-Bit Retro Snake)

- Lưới pixel $20 \times 20$ chuẩn retro arcade, hỗ trợ bàn phím PC (mũi tên, WASD) và cụm D-pad cảm ứng / vuốt cử chỉ trên di động.
- Cơ chế ăn táo thường (+10đ, dài thân) và táo vàng bonus xuất hiện chớp nhoáng (+50đ).
- Chống tự quay đầu $180^\circ$ (input buffering), tốc độ tăng dần theo điểm số tạo độ kịch tính.
- Lưu kỷ lục điểm cao (High Score), tự động đồng bộ đám mây và đưa lên Bảng xếp hạng toàn cầu (`leaderboard_scores`).

### FR-13 — 2048 (Puzzle Logic)

- Lưới số $4 \times 4$ với hiệu ứng trượt mượt mà (smooth sliding transition).
- Cơ chế sinh số ngẫu nhiên (90% ô 2, 10% ô 4), trượt gộp các ô có cùng giá trị theo 4 hướng.
- Hỗ trợ hoàn tác 1 nước đi (1-step Undo) giúp người chơi sửa sai.
- Nhận diện Game Over khi kín bảng và không còn nước đi hợp lệ; vinh danh mốc chiến thắng 2048 và cho phép tiếp tục cày điểm chinh phục 4096+.
- Lưu kỷ lục điểm cao (Best Score) và ô số lớn nhất (Max Tile), tự động đồng bộ đám mây và Bảng xếp hạng toàn cầu.

### FR-14 — Dò Mìn Pixel (Minesweeper)

- Bàn cờ 3 cấp độ chuẩn cổ điển: Dễ ($9 \times 9$, 10 mìn), Vừa ($16 \times 16$, 40 mìn), Khó ($16 \times 30$, 99 mìn).
- Nước đi đầu tiên an toàn tuyệt đối (First Click Never Boom): Không bao giờ trúng mìn và tự động mở loang một vùng an toàn.
- Thuật toán mở loang thông minh (Flood Fill) tự động mở các ô trống liền kề khi mở trúng ô 0 mìn.
- Cơ chế cắm cờ (Flag) và mở nhanh (Chord) khi một ô số đã có đủ số cờ tương ứng quanh nó.
- Đầy đủ nút Mặt cười cảm xúc (Smiley Face), đồng hồ LED đếm thời gian (giây) và bộ đếm số mìn còn lại.
- Bảng xếp hạng kỷ lục thời gian phá đảo nhanh nhất (giây) và tự động đồng bộ đám mây.

### FR-15 — Phá Gạch Pixel (Brick Breaker)

- Động cơ vật lý nảy bóng 2D Retro Arcade trên HTML5 Canvas: Tỉ lệ khung hình chuẩn máy thùng $3:4$.
- Điều khiển đa nền tảng: Di chuột / phím A-D / phím mũi tên trên PC; vuốt ngón tay trực tiếp hoặc nút cảm ứng ảo trên di động.
- Hệ thống vật phẩm rơi (Power-ups): Kéo dài thanh trượt (↔️), Nhân đôi/nhân ba bóng (⚡), Súng Laser bắn gạch (🔫), Thêm mạng (💖).
- Đa dạng loại gạch: Gạch thường nhiều tầng màu tính điểm, gạch thép cần 2 lần va chạm và gạch bom phát nổ lan truyền.
- Hệ thống màn chơi nối tiếp (Stages), bộ đếm chuỗi Combo và đồng bộ điểm kỷ lục lên Bảng xếp hạng toàn cầu (`leaderboard_scores`).

### FR-16 — Block Blast (Xếp khối nổ dòng 8x8)

- Bàn cờ 8x8 cơ chế nổ hàng ngang và cột dọc khi lấp đầy 8 ô.
- Hệ thống tính điểm Combo lũy tiến hàm bậc hai (càng giữ chuỗi combo cao điểm thưởng càng bùng nổ).
- Thuật toán chia 3 khối luôn đảm bảo có ít nhất 1 đường sống (Solvable & Fair RNG).
- Hỗ trợ Kéo-thả với touch offset 75px, phát sáng hàng/cột sắp nổ, và chế độ chạm chọn - chạm đặt.
- Tự động lưu và khôi phục ván chơi khi thoát (Auto-save & Resume).

### FR-17 — Cờ Vây (Go / Weiqi / Baduk)

- Bàn cờ gỗ Neo-Arcade hỗ trợ 3 kích thước: 9x9 (nhanh / mobile), 13x13 (vừa) và 19x19 (chuẩn thi đấu).
- Động cơ luật cờ Vây chuẩn quốc tế:
  - Thuật toán tìm đám quân liên kết (Connected group flood-fill) và đếm khí (Liberties).
  - Tự động bắt tù binh (Captures) khi đám quân bị bao vây mất hết khí (0 khí).
  - Cấm tự sát (Suicide rule) trừ khi ăn được quân đối phương để tạo khí.
  - Luật Kiếp (Ko rule) chống lặp trạng thái ván cờ vĩnh viễn.
  - Chức năng Bỏ lượt (Pass) và Xin thua (Resign). Kết thúc khi cả 2 người liên tiếp Pass.
  - Tính điểm lãnh thổ (Territory) + số tù binh bị bắt (Captures) + điểm chấp Komi 6.5 cho quân Trắng.
- Chế độ chơi: Đấu với Bot AI 2 cấp độ (Dễ, Trung bình) và Chơi đôi chuyền tay (Pass & Play).
- Thao tác thân thiện: Chạm xem trước bóng mờ $\rightarrow$ Bấm xác nhận, hoặc chạm đặt 1 lần.
- Âm thanh gõ cờ đá thanh thoát kết hợp cùng nhạc nền Strategy Theme ("Zen Focus").

### FR-18 — Tetris Cổ Điển (Classic 10×20 Arcade)

- Bàn chơi chuẩn quốc tế **10 cột × 20 hàng** theo phong cách Neo-Arcade Pixel 16-bit.
- Hệ thống 7 khối Tetromino chuẩn màu sắc: `I` (Cyan), `J` (Blue), `L` (Orange), `O` (Yellow), `S` (Emerald), `T` (Purple), `Z` (Rose) với thuật toán chia túi ngẫu nhiên **7-Bag Randomizer** công bằng.
- Cơ chế điều khiển chuẩn mực:
  - Xoay khối mượt mà kèm **Wall Kick** (SRS-lite) khi sát tường/đáy.
  - **Ghost Piece:** Bóng mờ định vị điểm rơi của khối trên mặt bàn.
  - **Hold Piece:** Giữ lại 1 khối dự phòng để đổi chiến thuật (mỗi lượt thả chỉ Hold 1 lần).
  - **Next Queue:** Hiển thị 3 khối tiếp theo sắp xuất hiện.
  - **Soft Drop & Hard Drop:** Rơi nhanh có thưởng điểm và thả rơi tức thì xuống đáy.
- Tính điểm chuẩn Tetris: Single (100×Level), Double (300×Level), Triple (500×Level), **TETRIS 4 dòng (800×Level)** + Back-to-Back / Combo bonus. Cấp độ (Level) và tốc độ rơi tự động tăng sau mỗi 10 dòng xóa.
- Tự động lưu & khôi phục ván đang chơi (`Auto-save & Resume`), đồng bộ kỷ lục lên Bảng xếp hạng (`LeaderboardModal`) và Hồ sơ cá nhân.

### FR-19 — Thử thách Hàng ngày (Daily Challenges) & Chuỗi ngày chơi (Daily Streak)

- **Sinh 3 nhiệm vụ ngẫu nhiên mỗi ngày:** Theo ngày địa phương (`YYYY-MM-DD`), hệ thống tự động chọn 3 thử thách trải đều trên 3 thể loại (Cờ chiến thuật, Giải đố, Arcade) từ kho 13 trò chơi hiện có.
- **Theo dõi tiến độ tự động:** Ghi nhận mốc chỉ số đầu ngày (Baseline Snapshot) từ `localStorage` để tính tiến độ hoàn thành công bằng cho cả người chơi mới và người chơi lâu năm.
- **Chuỗi ngày chơi (Daily Streak 🔥):** Khi hoàn thành và nhận thưởng ít nhất 1 nhiệm vụ trong ngày, chuỗi ngày liên tiếp được giữ/tăng; bỏ lỡ qua ngày mới sẽ reset về 0. Hỗ trợ lưu kỷ lục chuỗi dài nhất (`bestStreak`) và đồng bộ lên Supabase User Metadata nếu đã đăng nhập.
- **Giao diện tích hợp Header:** Nút biểu tượng ngọn lửa Streak kèm số ngày & chấm thông báo nhiệm vụ sẵn sàng nhận thưởng trên cả Desktop Header và Mobile Drawer.

### FR-20 — Trải nghiệm PWA Offline & Cài đặt App 1-Chạm (Add to Home Screen)

- **Service Worker Offline (`public/sw.js`):** Tự động cache Sảnh chính, toàn bộ 13 đường dẫn game, tài nguyên tĩnh Next.js (`/_next/static/`), biểu tượng PWA và manifest (bỏ qua API Supabase để không ảnh hưởng luồng Realtime).
- **Trạng thái Ngoại tuyến (`PwaManager.tsx`):** Tự động nhận diện khi mất kết nối mạng (`offline`) và hiển thị thanh thông báo thân thiện để người chơi yên tâm tiếp tục các trò chơi 1 người / chơi đôi.
- **Banner Cài đặt 1-Chạm:** Bắt sự kiện `beforeinstallprompt` trên Android/Desktop và cung cấp hướng dẫn trực quan 2 bước trên iOS Safari, kèm ghi nhớ trạng thái ẩn trong 7 ngày nếu người dùng đóng banner.

### FR-21 — Cờ Lật Othello / Reversi (8×8 Strategy)

- Bàn cờ 8×8 truyền thống với 4 quân khởi đầu đối xứng ở trung tâm.
- Động cơ luật Othello chuẩn quốc tế:
  - Kẹp và lật toàn bộ quân đối thủ bị kẹp theo 8 hướng (ngang, dọc, chéo).
  - Hiển thị gợi ý các ô nước đi hợp lệ; tự động chuyển lượt (Pass) khi một bên không có nước đi; kết thúc khi bàn đầy hoặc cả 2 bên hết nước.
- 3 chế độ chơi: Đấu với Bot AI 3 cấp độ (Dễ, Vừa, Khó dùng Minimax Alpha-Beta + ma trận trọng số góc), Chơi đôi (Pass & Play) và Đấu Online 1v1 Realtime (Phòng riêng 6 ký tự & Ghép nhanh).
- Tự động lưu ván chơi offline (`Auto-save & Resume`), tích hợp Chat nhanh / Biểu cảm Online, Bảng xếp hạng và đồng bộ thống kê.

### FR-22 — Wordle 5×6 (Đoán Từ Bí Mật)

- Bảng đoán từ 6 hàng × 5 chữ cái tiếng Anh chuẩn mực.
- Thuật toán tô màu 2-pass chuẩn Wordle: Xanh lá (`correct`), Vàng (`present` — xử lý đúng số lượng chữ trùng), Xám (`absent`).
- Hai chế độ chơi: **Từ Hôm Nay (Daily Word)** cố định theo ngày và **Chơi Vô Tận (Endless)**.
- Bàn phím QWERTY ảo tối ưu cảm ứng di động kết hợp gõ phím vật lý trên PC, tự động lưu ván đang chơi, chia sẻ kết quả dạng ô vuông emoji (`🟩🟨⬛`), theo dõi Streak và đồng bộ Bảng xếp hạng.

## 5. Yêu cầu phi chức năng

- Mobile-first, phù hợp màn hình nhỏ và lớn; hỗ trợ xoay/ngang nếu bàn cờ cần.
- Nội dung giao diện tách khỏi mã component để bổ sung/chỉnh bản dịch mà không sửa logic game.
- Nội dung chính hoạt động trên trình duyệt hiện đại của Android, iOS và desktop.
- PWA là mục tiêu nâng cao sau khi website responsive chạy ổn; không cam kết có toàn bộ khả năng của app native.
- Bảo vệ dữ liệu người chơi bằng RLS, khóa môi trường và quyền truy cập tối thiểu.
- Dễ chạy local theo hướng dẫn trong README; migration database được lưu trong repo.
- Có trạng thái tải, lỗi, mất mạng và dữ liệu trống rõ ràng.

## 6. Đề xuất kỹ thuật

- **Frontend:** Next.js App Router + TypeScript + Tailwind CSS. Một codebase web responsive dùng được trên PC và mobile.
- **Cài như ứng dụng:** PWA manifest/service worker ở giai đoạn sau MVP; bắt đầu với website responsive để giảm phần cần học.
- **Backend:** Supabase Postgres, Auth khi cần tài khoản, Realtime cho trạng thái/phòng nhiều người.
- **Game logic:** dùng thư viện cờ vua đã được duy trì để kiểm tra luật; không tự viết luật cờ. Chọn thư viện cụ thể khi bắt đầu implementation và kiểm tra giấy phép/phiên bản.
- **Lưu trữ:** Sudoku ở local trước; lưu hồ sơ/lịch sử ở Supabase nếu đã có tài khoản và nhu cầu.
- **Triển khai:** chọn dịch vụ tương thích Next.js khi có vertical slice chạy local; không cần quyết định trước khi viết code.

### Vì sao chưa chọn Flutter/React Native ngay

Mục tiêu ban đầu là chơi trên điện thoại và PC. Responsive web/PWA cho phép dùng một ứng dụng qua trình duyệt và cài từ trình duyệt ở thiết bị tương thích. Chỉ chuyển hoặc bổ sung app native nếu sau này cần phân phối qua cửa hàng ứng dụng, push notification sâu hoặc khả năng native khác.

### Định hướng hình ảnh đề xuất (chưa khóa)

- Phong cách: sáng, thân thiện, gọn gàng; các thẻ game có thể vui nhộn nhưng giao diện chơi ưu tiên dễ đọc và không gây xao nhãng.
- Màu nền: `#F6F7FB`; bề mặt/thẻ: `#FFFFFF`; chữ chính: `#1F2937`; viền: `#E5E7EB`.
- Màu hành động chính: indigo `#4F46E5`; màu phụ: teal `#0F766E`; màu nhấn nhỏ: amber `#F59E0B`.
- Dùng màu theo vai trò (nền, chữ, hành động, cảnh báo) qua design tokens để đổi theme toàn site dễ dàng. Đảm bảo tương phản chữ/nền; không dùng màu sắc làm tín hiệu duy nhất.
- Giữ game board có màu chuyên biệt nhưng hài hòa với giao diện chung: ví dụ bàn cờ tông gỗ sáng/xanh lá dịu, Sudoku dùng ô đang chọn màu indigo nhạt.
- Chỉ cần theme sáng trong MVP; cân nhắc dark mode sau khi các luồng chơi chính ổn định.

### Tổ chức asset

- Asset tĩnh dùng chung đặt dưới `public/assets/common/`; asset riêng từng trò đặt dưới `public/assets/games/<game-id>/`.
- Dùng tên file chữ thường, không dấu, có gạch ngang và mô tả mục đích; ghi nguồn/giấy phép của asset bên ngoài.
- Icon giao diện dạng vector đơn giản có thể nằm trong component/icon system thay vì tạo nhiều file hình trùng lặp. Không đưa secret, file thiết kế gốc quá nặng hoặc ảnh không có quyền sử dụng vào repo.
- Khi thêm game, tạo thư mục asset tương ứng và chỉ lưu những file game thực sự cần.

## 7. Tiêu chí chấp nhận MVP

- Sảnh và game có thể dùng được trên màn hình mobile lẫn desktop; sảnh nhận diện game qua cấu hình thống nhất.
- Người dùng chuyển qua lại Việt/Anh và vẫn nhận đủ bản dịch chính cho MVP.
- Sudoku có thể bắt đầu, tiếp tục sau refresh và hoàn tất.
- Hai người trên thiết bị/trình duyệt khác nhau có thể cùng chơi cờ vua qua liên kết phòng.
- Người chơi có thể mở phiên khách; hệ thống phân biệt danh tính bằng Auth user id, không dựa vào tên hiển thị.
- Nước đi sai luật không cập nhật trạng thái chung.
- Người ngoài phòng không đọc/ghi được trạng thái riêng tư của ván.
- Tài liệu cho phép người mới chạy project và biết cách cấu hình biến môi trường.

## 8. Câu hỏi cần xác nhận

1. Có tên dự án/phong cách giao diện nào bạn đã nghĩ tới chưa? Nếu chưa, có thể tạm dùng tên và giao diện trung tính.
2. Các tính năng cụ thể dành cho tài khoản đăng nhập sẽ được xác định trước chặng nào? Gợi ý: sau khi có bản guest chơi được, chọn 1–2 lợi ích rõ ràng như lưu hồ sơ/lịch sử qua thiết bị.

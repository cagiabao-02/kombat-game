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
- Đã hoàn tất: Hàng đợi ghép ngẫu nhiên (Quick Match) với radar quét, chọn mốc thời gian và tính năng Đấu lại (Rematch).
- Đang phát triển: Hệ thống Bot cờ vua tự động (3 cấp độ Dễ/Vừa/Khó) chơi offline local, kèm đề xuất chuyển sang đấu với Bot nếu tìm trận quá 2 phút.

## 4. Yêu cầu chức năng

### FR-1 — Sảnh trò chơi mở rộng được

- Người dùng xem được tên, mô tả ngắn và trạng thái của từng game.
- Game chưa triển khai được đánh dấu “Sắp có”, không dẫn tới màn hình lỗi.
- Mỗi game được đăng ký qua cấu hình/thành phần thống nhất (ví dụ: id, tên bản địa hóa, mô tả, route, trạng thái, chế độ chơi); logic riêng được giữ trong module của game đó.
- Thêm game mới không yêu cầu viết lại cách sảnh liệt kê hoặc điều hướng game cũ.

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

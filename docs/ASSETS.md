# Nguyên tắc tạo và quản lý asset game

Hướng dẫn này áp dụng cho hình ảnh, icon, sprite, animation, nền màn chơi, âm thanh và asset khác của các game trong dự án.

## 1. Trước khi tạo hoặc tìm asset

Với mỗi nhóm asset, ghi nhanh một **asset spec** trước khi tạo:

- Asset dùng ở đâu và phục vụ mục đích gì.
- Số lượng cần có, các trạng thái/biến thể cần hỗ trợ.
- Kích thước, tỉ lệ khung hình, độ phân giải và định dạng mong muốn.
- Phong cách, bảng màu, góc nhìn, độ dày nét và mức độ chi tiết.
- Nền trong suốt hay không; vị trí neo (pivot) và vùng an toàn nếu có animation/sprite.
- Kích thước hiển thị nhỏ nhất trên mobile/desktop và độ tương phản với nền sử dụng.

Asset spec không cần dài; danh sách và một hình tham chiếu thường đủ để bắt đầu.

## 2. Khi asset chưa đủ

- AI có thể dùng asset do chủ dự án cung cấp làm tham chiếu để tạo phần còn thiếu, miễn là yêu cầu sử dụng và quyền dùng asset mẫu rõ ràng.
- Nếu có nhiều thành phần thuộc cùng một bộ, ưu tiên tạo/rà soát cả bộ cùng lúc để giữ phong cách, tỉ lệ, ánh sáng, màu và chất lượng nhất quán.
- Yêu cầu biến thể theo danh sách cụ thể. Ví dụ: các trạng thái của nhân vật, hướng nhìn, màu đội, độ khó, trạng thái nút, hoặc các ô nền cần cho một bộ tilemap.
- Giữ nguyên file tham chiếu và bản xuất hiện tại; lưu thử nghiệm thành file khác để có thể so sánh và quay lại.
- AI có thể bám theo phong cách mẫu nhưng không đảm bảo khớp chính xác ngay lần đầu. Kiểm tra lại nét, chi tiết, palette, crop và tính nhất quán; sửa spec hoặc tạo lại khi cần.
- Ảnh raster do AI tạo không tự động trở thành SVG sạch/chỉnh sửa tốt. Nếu cần vector, dựng lại bằng SVG/component phù hợp và kiểm tra trên trình duyệt.
- Nếu AI không phù hợp với asset đó, có thể dựng bằng CSS/SVG/code hoặc dùng thư viện asset có giấy phép phù hợp.

## 3. Kiểm tra trước khi đưa vào game

- Xem asset ở đúng kích thước và trên nền thực tế của game, không chỉ xem ảnh lớn riêng lẻ.
- Kiểm tra trên màn hình nhỏ, nền sáng/tối, các trạng thái tương tác và nhiều biến thể cạnh nhau.
- Với sprite/animation: kiểm tra kích thước từng frame, thứ tự, điểm neo, vùng cắt, chuyển động và vòng lặp.
- Với tile/map: kiểm tra ghép cạnh, lưới, kích thước tile, layer và điểm va chạm nếu có.
- Với âm thanh: nghe thử âm lượng tương đối, phần đầu/cuối và lặp; tránh âm thanh quá lớn hoặc gây mệt khi chơi lâu.
- Xóa metadata/định dạng thừa nếu gây tăng dung lượng; tối ưu file raster/âm thanh phù hợp web mà không làm giảm chất lượng thấy rõ.
- Kiểm tra thông tin nguồn/giấy phép với asset tải từ bên ngoài. Asset tạo riêng cũng cần được đánh dấu nguồn nội bộ/AI nếu dự án muốn theo dõi xuất xứ.

## 4. Lưu trữ và đặt tên

- Asset tĩnh dùng chung: `public/assets/common/`.
- Asset riêng cho game: `public/assets/games/<game-id>/`.
- Dùng tên chữ thường, không dấu, gạch ngang và mô tả nội dung/trạng thái, ví dụ `character-idle-01.webp` hoặc `board-tile-dark.svg`.
- Giữ file nguồn có ích khi cần chỉnh sửa; không đưa file thử nghiệm, bản trùng hoặc file thiết kế nặng không dùng vào production assets.
- Ghi attribution/giấy phép trong `ASSET_CREDITS.md` ở gốc repo hoặc cạnh nhóm asset khi có nội dung bên ngoài.

## 5. Quy trình làm việc khuyến nghị

1. Liệt kê asset và số lượng cần thiết.
2. Chọn asset mẫu/nguồn và chốt spec.
3. Tạo hoặc bổ sung toàn bộ biến thể còn thiếu.
4. Xem chúng cùng nhau trong game ở kích thước thật; ghi lại lỗi cần chỉnh.
5. Xuất bản cuối vào thư mục asset đúng game, tối ưu dung lượng và ghi nguồn.
6. Cập nhật TODO/tiến độ nếu nhóm asset là một mốc công việc của dự án.

Không cần tạo asset cho game chưa có thiết kế hoặc chưa nằm trong phạm vi đang làm; chỉ chuẩn bị khung thư mục và bổ sung khi bắt đầu game đó.

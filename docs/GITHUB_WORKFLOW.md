# Quy trình GitHub cho người mới

## 1. Các khái niệm

- **Repository (repo):** nơi lưu mã nguồn và lịch sử thay đổi.
- **Commit:** một mốc thay đổi nhỏ, có thông điệp dễ hiểu.
- **Branch (nhánh):** khu vực làm việc riêng cho một tính năng/sửa lỗi.
- **Push:** gửi commit từ máy lên GitHub.
- **Pull Request (PR):** đề nghị nhập nhánh đã làm vào `main`; đây là nơi xem diff và mô tả thay đổi.

## 2. Nhánh nên dùng

- `main`: phiên bản ổn định, không làm trực tiếp.
- Tạo nhánh cho mỗi việc: `docs/project-setup`, `feat/game-lobby`, `feat/sudoku-board`, `feat/chess-room`, `fix/room-reconnect`.
- Tên nhánh ngắn, chữ thường, dùng dấu gạch ngang.

## 3. Nhịp làm việc

1. Đồng bộ nhánh chính: `git switch main` rồi `git pull`.
2. Tạo nhánh mới: `git switch -c docs/project-setup`.
3. Làm một phần có mục tiêu rõ ràng, xem thay đổi bằng `git status` và `git diff`.
4. Commit khi một bước có ý nghĩa đã hoàn tất (ví dụ tài liệu nền tảng, khung trang, Sudoku lưu local, tạo phòng cờ). Không cần commit sau mỗi dòng; cũng không nên gom nhiều tính năng không liên quan vào một commit.
5. Push sau khi hoàn tất một chặng nhỏ có thể review được, trước khi chuyển sang nhánh/việc mới, và trước khi mở PR. Với chặng đang dang dở, có thể push nhánh để sao lưu nhưng ghi rõ là draft/WIP.
6. Mở PR từ nhánh tính năng vào `main`; mô tả mục đích, thay đổi, cách kiểm tra và ảnh chụp màn hình nếu có giao diện.
7. Đọc diff của PR, xử lý góp ý, cập nhật commit/push; merge khi PR đã sẵn sàng.
8. Sau khi merge, chuyển về `main`, pull mới nhất rồi xóa nhánh đã hoàn tất.

## 4. Commit message

Dùng định dạng ngắn `loại: nội dung`:

- `docs: add project requirements and workflow`
- `feat: add game lobby page`
- `feat: add sudoku board controls`
- `fix: prevent joining a full chess room`
- `chore: configure Supabase local development`

Các loại thường dùng: `feat`, `fix`, `docs`, `refactor`, `chore`. Viết bằng tiếng Anh hoặc tiếng Việt nhất quán; tiêu đề mô tả kết quả, không ghi chung chung như `update`.

## 5. Khi nào push và mở PR

- **Push GitHub:** sau một chặng nhỏ hoàn chỉnh để có bản sao từ xa và có thể review; push trước khi mở PR.
- **PR:** mỗi tính năng hoặc nhóm tài liệu có mục tiêu riêng. PR đầu tiên có thể là toàn bộ tài liệu nền tảng.
- **Draft PR:** dùng khi muốn xem trước hoặc xin góp ý nhưng công việc chưa xong.
- **Merge:** kiểm tra đúng base `main`, đọc danh sách file/diff, xem hướng dẫn hoặc ảnh chụp nếu cần. Với dự án cá nhân, có thể tự review rồi merge; chưa cần quy trình phức tạp.

## 6. Lệnh thường dùng

```bash
git status
git switch main
git pull
git switch -c feat/game-lobby
git diff
git add README.md docs/REQUIREMENTS.md docs/TODO.md
git commit -m "docs: add project requirements and workflow"
git push -u origin feat/game-lobby
```

`git add` ở trên chỉ là ví dụ: thêm đúng các file thuộc phần việc hiện tại. Không thêm `.env.local`, khóa API, file build hoặc dữ liệu cá nhân.

## 7. Quy tắc an toàn đơn giản

- Không commit `.env.local`, access token hay Supabase secret/service role key.
- Commit `.env.example` chỉ với tên biến và giá trị giả/rỗng.
- Trước mỗi commit, xem `git status` và `git diff --staged`.
- Không dùng `git push --force` trên `main`.
- Migration database nên đi cùng thay đổi ứng dụng tương ứng trong cùng PR.

# Nguyên tắc code và cấu trúc thư mục

Tài liệu này mô tả cách tổ chức code khi bắt đầu xây ứng dụng. Đây là cấu trúc dự kiến; có thể điều chỉnh khi có lý do cụ thể, nhưng cần giữ ranh giới giữa route, thành phần dùng chung và logic riêng của từng game.

## 1. Cấu trúc dự kiến

```text
project-root/
├─ src/
│  ├─ app/                         # Route, layout và trang Next.js
│  ├─ components/                  # UI dùng chung: Button, Dialog, GameCard...
│  ├─ features/
│  │  └─ games/
│  │     ├─ registry.ts            # Danh sách/cấu hình game cho sảnh
│  │     ├─ sudoku/                # UI và logic chỉ thuộc Sudoku
│  │     └─ chess/                 # UI và logic chỉ thuộc Cờ vua
│  ├─ i18n/                        # Từ điển và tiện ích Việt/Anh
│  ├─ lib/                         # Kết nối dịch vụ và tiện ích dùng chung
│  │  └─ supabase/                 # Client/server Supabase
│  └─ types/                       # Kiểu dữ liệu dùng chung giữa nhiều feature
├─ public/
│  └─ assets/                      # Hình/âm thanh tĩnh, phân theo common và game
├─ supabase/
│  └─ migrations/                  # Thay đổi schema có thể tái tạo
├─ docs/                           # Tài liệu dự án
├─ AGENTS.md
├─ .env.example
└─ package.json
```

Đây là đích tổ chức khi tạo ứng dụng; repo hiện mới có tài liệu và khung thư mục asset, chưa có `src/` hoặc ứng dụng Next.js.

## 2. Ranh giới giữa các phần

- `src/app/` chịu trách nhiệm route, layout và ghép các feature vào trang; không để toàn bộ luật game trong một file page.
- `src/components/` chỉ chứa thành phần thực sự dùng chung. Nếu component chỉ dùng cho Sudoku hoặc cờ vua, giữ nó trong feature tương ứng.
- `src/features/games/registry.ts` mô tả id, tên theo ngôn ngữ, route, trạng thái và chế độ chơi để sảnh có thể hiển thị game theo cấu hình.
- Mỗi game tự sở hữu UI, luật chơi, trạng thái và thành phần riêng. Chỉ chuyển code sang vùng dùng chung khi có ít nhất hai nơi thật sự dùng cùng một hành vi.
- Giữ logic luật chơi trong hàm/module có đầu vào và đầu ra rõ ràng để dễ xem xét độc lập với UI. Dùng thư viện game phù hợp thay vì tự viết lại luật phức tạp.
- `src/lib/` dành cho tích hợp dịch vụ/tiện ích chung; không biến nó thành nơi gom mọi thứ không biết để đâu.

## 3. Quy ước khi viết code

- Dùng TypeScript với kiểu dữ liệu rõ; tránh `any` nếu có thể mô tả kiểu cụ thể.
- Đặt tên biến/hàm/component bằng tiếng Anh nhất quán. Component React dùng `PascalCase`; hàm/biến dùng `camelCase`; route và thư mục feature viết thường, dễ đọc.
- Tách component khi nó có trách nhiệm riêng hoặc được dùng lại; tránh một component/file lớn xử lý giao diện, luật game, gọi mạng và lưu dữ liệu cùng lúc.
- Dùng tên hàm thể hiện hành động/kết quả. Viết comment cho lý do hoặc quy tắc khó hiểu, không lặp lại điều code đã nói rõ.
- Không hard-code chuỗi hiển thị trong component. Đưa nội dung giao diện vào từ điển `vi`/`en` để không bỏ sót bản dịch.
- Mọi màn hình cần tính đến loading, lỗi, dữ liệu trống và mất kết nối. Thông báo cho người chơi bằng câu ngắn, dễ hiểu.
- Thiết kế mobile-first, có thể dùng bằng cảm ứng, chuột và bàn phím; không chỉ dùng màu để biểu thị đúng/sai hoặc trạng thái.
- Thêm thư viện mới khi giải quyết được nhu cầu rõ ràng; giữ lockfile và xem xét giấy phép trước khi dùng thư viện game/asset.
- Nếu asset còn thiếu, áp dụng quy trình chung trong `docs/ASSETS.md`: xác định yêu cầu trước, dùng asset mẫu làm tham chiếu khi phù hợp, rồi kiểm tra đủ bộ trong ngữ cảnh sử dụng.

## 4. Supabase và dữ liệu

- Tạo client Supabase ở module riêng theo ngữ cảnh browser/server; không sao chép cấu hình khởi tạo rải rác khắp app.
- Chỉ URL và publishable key được phép đưa vào client qua biến `NEXT_PUBLIC_*`. Secret/service role key chỉ ở môi trường server an toàn, không gửi về trình duyệt và không commit.
- Bật RLS cho bảng được expose; policy phải kiểm tra quyền sở hữu/thành viên thật, không chỉ kiểm tra đã đăng nhập.
- Client không phải nguồn đáng tin cho quyền người chơi, lượt đi hay kết quả trận. Kiểm tra dữ liệu quan trọng ở database/server trước khi lưu.
- Thay đổi schema được ghi bằng migration trong `supabase/migrations/` và review cùng thay đổi code liên quan.

## 5. Hoàn tất một thay đổi

- Giữ mỗi nhánh/PR tập trung vào một mục tiêu; cập nhật tài liệu nếu phạm vi hoặc cách chạy thay đổi.
- Trước khi báo xong, xem diff và nêu rõ đã thay đổi gì, kiểm tra nào đã thực hiện và điểm còn bỏ ngỏ. Chỉ chạy kiểm tra/test theo yêu cầu người dùng hoặc quy trình đã được họ chấp thuận.
- Cập nhật `docs/TODO.md` cho các việc cần làm tiếp; cập nhật `docs/PROGRESS.md` khi chuyển chặng hoặc thay đổi trạng thái dự án.

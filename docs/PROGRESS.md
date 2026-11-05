# Tiến độ dự án

> Cập nhật lần cuối: 2026-11-02

## Trạng thái tổng quan

- **Giai đoạn:** Đã hoàn thành Chặng 0, Chặng 1 và Chặng 2 (Sudoku một người chơi hoàn chỉnh).
- **Mã nguồn:** Next.js 15 App Router, TypeScript, Tailwind CSS, i18n Việt/Anh, Sảnh game và Game Sudoku hoàn chỉnh với bộ tạo đề, kiểm tra luật, thao tác cảm ứng/bàn phím, lưu tiến độ cục bộ.
- **Git/GitHub:** Đã khởi tạo Git local (`git init`). Chưa commit/push lên remote theo đúng quy định.
- **Supabase:** Sẵn sàng file cấu hình `.env.example`, chuẩn bị cho Chặng 3 (Supabase nền tảng & phòng cờ vua).
- **Asset:** Đã có cấu trúc thư mục quy chuẩn.

## Đã hoàn thành

- Tạo tài liệu yêu cầu sản phẩm và phạm vi MVP.
- Ghi nhận quyết định ban đầu: guest-first, Việt/Anh, Sudoku và Cờ vua để thử; ghép ngẫu nhiên sau MVP.
- Tạo hướng dẫn cho AI, GitHub, Supabase và cách tổ chức asset.
- Khởi tạo local Git repo (`git init`), `.gitignore`, `.env.example`, `README.md`.
- Khởi tạo cấu hình Next.js App Router, TypeScript, Tailwind CSS theo `DEVELOPMENT.md`.
- Xây dựng `src/types/game.ts` và `src/features/games/registry.ts` cho phép sảnh game hiển thị linh hoạt theo cấu hình.
- Xây dựng lớp đa ngôn ngữ i18n (Việt/Anh) với `LanguageContext` lưu tuỳ chọn vào localStorage và tự nhận diện trình duyệt.
- Xây dựng layout, sảnh mini-game (`LobbyPage`), các thẻ game `GameCard`, `Header` hiển thị trạng thái khách và chuyển ngôn ngữ.
- **Triển khai toàn diện Sudoku một người chơi (Chặng 2):**
  - Đã bổ sung luật giới hạn 3 lần phạm lỗi trùng số (`mistakes: 0/3`): Khi người chơi nhập sai/trùng số lần thứ 3 sẽ bị xử thua ngay (Game Over), hiển thị bảng thông báo và cho phép chơi lại ván đó hoặc bắt đầu ván mới.
  - Thuật toán sinh đề và giải Sudoku bằng TypeScript thuần (`generator.ts`), bảo đảm tính duy nhất và hỗ trợ 3 mức độ (Dễ, Vừa, Khó). Đã tinh chỉnh phân bổ đều các ô trống qua cả 9 khối 3x3.
  - Thuật toán xác thực và phát hiện xung đột hàng/cột/khối 3x3 tức thì (`validator.ts`).
  - Giao diện bàn cờ 9x9 (`SudokuBoard.tsx`) tương tác mượt mà, phân biệt ô ban đầu và ô nhập, đánh dấu ô liên quan, ô cùng số và lỗi.
  - Bàn phím số ảo (`NumberPad.tsx`) hiển thị số lượng số còn lại cần điền (1-9), hỗ trợ xóa và hoàn tác (Undo).
  - Điều hướng đa dạng: Bàn phím máy tính (phím mũi tên, 1-9, Delete/Backspace, U/Ctrl+Z) và màn hình cảm ứng/chuột.
  - Điều khiển ván chơi (`SudokuControls.tsx`): Đếm giờ, tạm dừng/tiếp tục, ván mới, chơi lại từ đầu, bật/tắt báo lỗi.
  - Tự động lưu/khôi phục ván đang chơi vào `localStorage` (`storage.ts`).
  - Modal chúc mừng chiến thắng (`VictoryModal.tsx`) với thống kê thời gian và cấp độ.

## Đang làm

- Chưa có hạng mục implementation nào đang được thực hiện.

## Việc kế tiếp

1. Chọn tên dự án (có thể tạm để tên trung tính).
2. Tạo Git repository và commit tài liệu khởi đầu.
3. Tạo ứng dụng Next.js TypeScript với cấu trúc `src/` theo `DEVELOPMENT.md`.
4. Xây sảnh game và nền tảng Việt/Anh; đăng ký Sudoku/Cờ vua trong game registry.
5. Sau khi có luồng frontend cơ bản, cấu hình Supabase dev và anonymous guest session.

## Quyết định còn mở

- Tên dự án và phong cách thương hiệu cuối cùng.
- Các lợi ích cụ thể dành riêng cho tài khoản đã đăng nhập.
- Thư viện quốc tế hóa và thư viện luật cờ được chọn khi bắt đầu implementation.

## Cách cập nhật tiến độ

- `TODO.md` là danh sách từng việc cần hoàn thành; đánh dấu `[x]` khi xong.
- Tệp này là ảnh chụp ngắn về giai đoạn hiện tại, điều đã hoàn thành, việc tiếp theo và quyết định còn mở.
- Cập nhật sau khi hoàn tất một chặng/PR hoặc khi có thay đổi đáng kể; không cần ghi nhật ký từng thao tác nhỏ.

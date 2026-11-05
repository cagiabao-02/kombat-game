# Cấu hình Supabase cho người mới

> Hướng dẫn khởi đầu cho môi trường phát triển. Tên mục trên Dashboard có thể đổi theo thời gian; xem tài liệu chính thức nếu giao diện khác.

## A. Tạo project trên Supabase

1. Đăng nhập Dashboard Supabase và tạo một organization/project mới.
2. Chọn tên dự án, mật khẩu database mạnh (lưu trong password manager) và region gần nhóm người chơi chính.
3. Chờ project khởi tạo xong. Không đưa password database vào source code hoặc chat.
4. Trong trang project, mở phần kết nối/API (thường ở Project Settings > API hoặc Connect) và lấy **Project URL** cùng **publishable key**. Tên key cũ có thể là `anon`.
5. Tạo `.env.local` ở thư mục gốc (không commit):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

6. Có thể thêm `.env.example` vào Git với giá trị giả để hướng dẫn cấu hình. Đảm bảo `.env.local` nằm trong `.gitignore`.
7. Chỉ publishable key/legacy anon key mới được phép ở client, và chỉ khi RLS được bật đúng cách. **Không** dùng `service_role`/secret key trong biến `NEXT_PUBLIC_*`, trình duyệt, GitHub, hay mã frontend.

## B. Database và bảo mật

- Tạo schema thay đổi qua Supabase CLI migration, để thay đổi có thể review và tái tạo từ Git.
- Bật Row Level Security (RLS) cho mọi bảng trong schema `public` được truy cập qua Data API.
- Viết policy theo quyền thực tế: ví dụ thành viên trận chỉ có thể đọc trận mình tham gia. `TO authenticated` một mình không chứng minh rằng người dùng là thành viên của hàng dữ liệu đó.
- Chỉ cấp `SELECT`/`INSERT`/`UPDATE`/`DELETE` cần thiết. Không bật quyền công khai toàn bảng chỉ để tránh lỗi kết nối.
- Realtime có thể dùng Broadcast cho sự kiện trận, Presence cho trạng thái đang online. Lưu trạng thái ván cần thiết trong database để có thể khôi phục sau khi kết nối lại.
- Không xem client là đáng tin: xác thực người chơi, lượt đi và trạng thái trận ở nơi có thể kiểm soát; không nhận một payload bất kỳ làm kết quả hợp lệ.

## C. Cấu hình local qua CLI (khuyến nghị khi bắt đầu làm database)

Supabase local stack cần Supabase CLI và môi trường Docker-compatible. Nếu chưa cài Docker, có thể tạm tạo project trên Dashboard và bắt đầu frontend; thiết lập local database ở chặng Supabase trong `TODO.md`.

Tại thư mục gốc repo, sau khi cài CLI:

```bash
supabase --help
supabase init
supabase start
```

Lệnh `supabase start` khởi động dịch vụ local và in URL/key local ra terminal. Dùng credentials local trong `.env.local` khi muốn ứng dụng kết nối local. Không dùng URL/key local thay cho production.

Tạo một migration mới bằng CLI:

```bash
supabase migration new initial_schema
```

Viết SQL vào file timestamp vừa tạo trong `supabase/migrations/`, rồi áp dụng và dựng lại database local theo hướng dẫn CLI hiện tại, thường là:

```bash
supabase db reset
```

Sau đó commit thư mục `supabase/` (config, migrations, seed nếu có) để người khác có thể tái tạo schema. Trước khi tác động project remote, kiểm tra project/ref đang liên kết và nội dung migration.

## D. Auth và URL chuyển hướng

- Bật anonymous sign-ins trong Authentication settings để khách có phiên đăng nhập ẩn danh. Họ có `user id` riêng và dùng role `authenticated`; RLS có thể dựa vào user id/thành viên phòng, còn tên hiển thị chỉ để người khác nhìn thấy.
- Phiên khách không tự khôi phục được sau khi người dùng xóa dữ liệu trình duyệt, đăng xuất hoặc đổi thiết bị. Giải thích điều này trong UI trước khi hứa lưu tiến trình lâu dài.
- Tài khoản thường có thể được bổ sung bằng cách liên kết email/OAuth với người dùng anonymous để giữ cùng user id, tùy phương thức đăng nhập và cấu hình manual identity linking. Trước khi đăng nhập vào tài khoản đã tồn tại, cần thiết kế cách chuyển/ghép dữ liệu giữa hai user id.
- Chỉ bật provider thực sự dùng. Trước khi mở guest sign-in công khai, cân nhắc CAPTCHA/Turnstile và cơ chế chống lạm dụng.
- Cấu hình Site URL và Redirect URLs cho địa chỉ local và domain deploy chính xác; chỉ thêm URL bạn kiểm soát.
- Không gửi email thử đến người dùng thật khi chưa cấu hình và xác minh luồng đăng nhập.

## E. Realtime cho phòng cờ

- Tạo private channel/topic theo phòng; cấp quyền subscribe/send dựa trên thành viên phòng.
- Presence phù hợp hiển thị ai đang online; Broadcast phù hợp gửi sự kiện nước đi nhanh.
- Database là nguồn lưu trạng thái bền vững; khi tải lại hoặc reconnect, client đọc snapshot hiện tại rồi tiếp tục nhận sự kiện.
- Không đưa secret/service role key vào client để “làm cho realtime chạy”. Sửa quyền channel/RLS theo tài liệu Supabase.

## F. Trước khi phát hành

- Tạo/cấu hình môi trường production riêng, URL và key khác với local/dev.
- Đặt secrets ở phần environment variables của dịch vụ deploy, không commit.
- Rà soát policies cho mọi bảng và private Realtime channel; thử cả truy cập được phép và bị từ chối.
- Kiểm tra redirect URL, email provider nếu có, retention/xóa phòng cũ và log lỗi.
- Không đưa project development chứa dữ liệu thật vào demo công khai.

## Tài liệu chính thức

- [Supabase + Next.js quickstart](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Local development workflow](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Supabase Auth quickstart for Next.js](https://supabase.com/docs/guides/auth/quickstarts/nextjs)
- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Supabase Broadcast](https://supabase.com/docs/guides/realtime/broadcast)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

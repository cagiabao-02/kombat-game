-- Migration: 20261116180000_only_allow_registered_users_on_leaderboard.sql
-- Description: Chỉ cho phép tài khoản đã đăng ký (Email / Google OAuth) lưu thành tích lên Bảng xếp hạng Supabase.

-- 1. Xóa các policy upsert cũ nếu có
DROP POLICY IF EXISTS "Allow users to upsert their own score" ON public.leaderboard_scores;
DROP POLICY IF EXISTS "Allow registered users to upsert their own score" ON public.leaderboard_scores;

-- 2. Tạo policy mới: Chỉ tài khoản authenticated không phải anonymous mới được phép thêm/sửa điểm
CREATE POLICY "Allow registered users to upsert their own score"
  ON public.leaderboard_scores
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  )
  WITH CHECK (
    auth.uid() = user_id 
    AND (auth.jwt() ->> 'is_anonymous')::boolean IS NOT TRUE
  );

-- 3. Dọn dẹp các dòng thành tích thử nghiệm cũ của khách vãng lai (Khách #...)
DELETE FROM public.leaderboard_scores WHERE user_name LIKE 'Khách #%';

-- 4. Chuẩn hóa nhãn điểm số cờ Caro từ "Ván thắng" cũ sang "Điểm"
UPDATE public.leaderboard_scores SET score_label = score_value || ' Điểm' WHERE game_id = 'caro' AND score_label LIKE '%Ván thắng%';

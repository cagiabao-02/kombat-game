-- Migration: 20261124000000_auto_cleanup_stale_rooms.sql
-- Description: Tự động dọn dẹp các phòng chờ (waiting) quá hạn và phòng đã bỏ (abandoned) để tránh phình to bảng rooms.

-- 1. Tạo hàm dọn dẹp phòng cũ
CREATE OR REPLACE FUNCTION public.cleanup_stale_rooms()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.rooms
  WHERE
    (status = 'waiting' AND updated_at < now() - interval '1 hour')
    OR (status = 'abandoned' AND updated_at < now() - interval '24 hours')
    OR (status = 'completed' AND updated_at < now() - interval '7 days');

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- 2. Kích hoạt pg_cron (nếu project Supabase đã bật extension pg_cron) và lên lịch chạy mỗi 15 phút
-- Lưu ý: Nếu chạy trên Supabase Dashboard mà báo chưa bật pg_cron, hãy vào Database -> Extensions -> bật "pg_cron" trước.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('kombat-cleanup-stale-rooms')
    WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'kombat-cleanup-stale-rooms'
    );

    PERFORM cron.schedule(
      'kombat-cleanup-stale-rooms',
      '*/15 * * * *',
      'SELECT public.cleanup_stale_rooms();'
    );
  END IF;
END $$;

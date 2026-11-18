'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { sounds, BgmTheme } from '@/lib/sound/soundService';

/**
 * Xác định nhạc nền phù hợp theo thể loại game / màn hình
 */
function getThemeForPath(pathname: string): BgmTheme {
  if (!pathname || pathname === '/') {
    return 'lobby';
  }

  // Nhóm Arcade / Phản xạ / Giải đố nhanh: Nhạc 8-bit sôi động, dồn dập
  if (
    pathname.startsWith('/games/block-blast') ||
    pathname.startsWith('/games/snake') ||
    pathname.startsWith('/games/flappy-bird') ||
    pathname.startsWith('/games/brick-breaker') ||
    pathname.startsWith('/games/2048')
  ) {
    return 'arcade';
  }

  // Nhóm Cờ / Trí tuệ / Chiến thuật: Nhạc lo-fi 8-bit thư thái, tĩnh tâm tập trung
  if (
    pathname.startsWith('/games/chess') ||
    pathname.startsWith('/games/caro') ||
    pathname.startsWith('/games/xiangqi') ||
    pathname.startsWith('/games/sudoku')
  ) {
    return 'strategy';
  }

  // Các trang phụ khác (bảng xếp hạng, phòng, sảnh...): Nhạc sảnh vui tươi
  return 'lobby';
}

/**
 * Controller tự động điều phối chuyển bài nhạc nền mượt mà giữa các trang
 */
export function BgmController() {
  const pathname = usePathname();

  useEffect(() => {
    const theme = getThemeForPath(pathname || '');
    sounds.playBgm(theme);
  }, [pathname]);

  return null;
}

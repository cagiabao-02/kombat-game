'use client';

import React from 'react';

interface PixelEmoteIconProps {
  emoji: string;
  className?: string;
}

/**
 * Bộ 12 Biểu cảm + Icon Bong bóng thoại 16x16 Pixel Art (crispEdges)
 * thay thế emoji hệ thống để đồng bộ phong cách Neo-Arcade 16-bit toàn dự án.
 */
export const PixelEmoteIcon: React.FC<PixelEmoteIconProps> = ({
  emoji,
  className = 'w-7 h-7',
}) => {
  switch (emoji) {
    case '💬':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          <rect x="2" y="3" width="12" height="8" fill="#18181B" />
          <rect x="3" y="2" width="10" height="10" fill="#18181B" />
          <rect x="3" y="3" width="10" height="8" fill="#FFFFFF" />
          <rect x="4" y="12" width="3" height="2" fill="#18181B" />
          <rect x="4" y="11" width="2" height="2" fill="#FFFFFF" />
          {/* 3 chấm thoại */}
          <rect x="5" y="6" width="1" height="2" fill="#4F46E5" />
          <rect x="7" y="6" width="2" height="2" fill="#4F46E5" />
          <rect x="10" y="6" width="1" height="2" fill="#4F46E5" />
        </svg>
      );

    case '🔥':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          <rect x="7" y="1" width="2" height="2" fill="#DC2626" />
          <rect x="5" y="3" width="6" height="3" fill="#EA580C" />
          <rect x="3" y="6" width="10" height="6" fill="#EA580C" />
          <rect x="4" y="12" width="8" height="2" fill="#DC2626" />
          <rect x="6" y="4" width="3" height="4" fill="#F59E0B" />
          <rect x="5" y="7" width="6" height="5" fill="#FACC15" />
          <rect x="6" y="9" width="4" height="4" fill="#FEF08A" />
          <rect x="7" y="11" width="2" height="2" fill="#FFFFFF" />
        </svg>
      );

    case '😎':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          {/* Mặt vàng tròn viền đen */}
          <rect x="4" y="2" width="8" height="12" fill="#18181B" />
          <rect x="2" y="4" width="12" height="8" fill="#18181B" />
          <rect x="3" y="3" width="10" height="10" fill="#18181B" />
          <rect x="4" y="3" width="8" height="10" fill="#FACC15" />
          <rect x="3" y="4" width="10" height="8" fill="#FACC15" />
          {/* Kính râm đen ngầu */}
          <rect x="2" y="5" width="12" height="1" fill="#18181B" />
          <rect x="3" y="6" width="4" height="3" fill="#18181B" />
          <rect x="9" y="6" width="4" height="3" fill="#18181B" />
          <rect x="7" y="6" width="2" height="1" fill="#18181B" />
          {/* Vệt sáng trên kính */}
          <rect x="4" y="6" width="2" height="1" fill="#38BDF8" />
          <rect x="10" y="6" width="2" height="1" fill="#38BDF8" />
          {/* Miệng cười nhếch mép */}
          <rect x="6" y="10" width="4" height="1" fill="#18181B" />
          <rect x="10" y="9" width="1" height="1" fill="#18181B" />
        </svg>
      );

    case '🤔':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          {/* Mặt vàng */}
          <rect x="4" y="2" width="8" height="11" fill="#18181B" />
          <rect x="2" y="4" width="12" height="7" fill="#18181B" />
          <rect x="4" y="3" width="8" height="9" fill="#FACC15" />
          <rect x="3" y="4" width="10" height="7" fill="#FACC15" />
          {/* Lông mày nhíu + Mắt */}
          <rect x="4" y="5" width="2" height="1" fill="#78350F" />
          <rect x="10" y="4" width="2" height="1" fill="#78350F" />
          <rect x="5" y="6" width="1" height="2" fill="#18181B" />
          <rect x="10" y="6" width="1" height="2" fill="#18181B" />
          {/* Miệng suy tư */}
          <rect x="7" y="9" width="3" height="1" fill="#78350F" />
          {/* Bàn tay chống cằm */}
          <rect x="4" y="10" width="5" height="4" fill="#18181B" />
          <rect x="5" y="11" width="3" height="2" fill="#FDBA74" />
          <rect x="7" y="9" width="2" height="2" fill="#FDBA74" />
        </svg>
      );

    case '😱':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          <rect x="4" y="2" width="8" height="12" fill="#18181B" />
          <rect x="2" y="4" width="12" height="8" fill="#18181B" />
          <rect x="4" y="3" width="8" height="10" fill="#FACC15" />
          <rect x="3" y="4" width="10" height="8" fill="#FACC15" />
          {/* Trán xanh tái vì hoảng hốt */}
          <rect x="4" y="3" width="8" height="2" fill="#38BDF8" />
          {/* Mắt mở to trắng dã */}
          <rect x="4" y="5" width="3" height="3" fill="#FFFFFF" />
          <rect x="9" y="5" width="3" height="3" fill="#FFFFFF" />
          <rect x="5" y="6" width="1" height="1" fill="#18181B" />
          <rect x="10" y="6" width="1" height="1" fill="#18181B" />
          {/* Miệng há to */}
          <rect x="6" y="9" width="4" height="3" fill="#18181B" />
          <rect x="7" y="10" width="2" height="1" fill="#E11D48" />
        </svg>
      );

    case '💀':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          <rect x="4" y="2" width="8" height="10" fill="#18181B" />
          <rect x="3" y="3" width="10" height="7" fill="#18181B" />
          <rect x="5" y="12" width="6" height="3" fill="#18181B" />
          {/* Sọ trắng */}
          <rect x="4" y="3" width="8" height="7" fill="#F4F4F5" />
          <rect x="5" y="2" width="6" height="1" fill="#FFFFFF" />
          <rect x="6" y="10" width="4" height="4" fill="#E4E4E7" />
          {/* Hốc mắt đen */}
          <rect x="4" y="6" width="3" height="3" fill="#18181B" />
          <rect x="9" y="6" width="3" height="3" fill="#18181B" />
          {/* Mũi & Răng */}
          <rect x="7" y="9" width="2" height="1" fill="#18181B" />
          <rect x="6" y="12" width="1" height="2" fill="#18181B" />
          <rect x="8" y="12" width="1" height="2" fill="#18181B" />
          <rect x="10" y="12" width="1" height="2" fill="#18181B" />
        </svg>
      );

    case '👏':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          {/* Tia sáng vỗ tay */}
          <rect x="7" y="1" width="2" height="2" fill="#F59E0B" />
          <rect x="3" y="2" width="1" height="2" fill="#F59E0B" />
          <rect x="12" y="2" width="1" height="2" fill="#F59E0B" />
          {/* Bàn tay trái */}
          <rect x="2" y="5" width="5" height="8" fill="#18181B" />
          <rect x="3" y="6" width="3" height="6" fill="#FDBA74" />
          {/* Bàn tay phải */}
          <rect x="9" y="5" width="5" height="8" fill="#18181B" />
          <rect x="10" y="6" width="3" height="6" fill="#F59E0B" />
          {/* Điểm chạm giữa 2 tay */}
          <rect x="6" y="7" width="4" height="5" fill="#FEF08A" />
        </svg>
      );

    case '☕':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          {/* Khói bốc lên */}
          <rect x="5" y="2" width="1" height="2" fill="#A1A1AA" />
          <rect x="8" y="1" width="1" height="3" fill="#A1A1AA" />
          <rect x="10" y="2" width="1" height="2" fill="#A1A1AA" />
          {/* Tách cà phê */}
          <rect x="3" y="6" width="8" height="7" fill="#18181B" />
          <rect x="4" y="7" width="6" height="5" fill="#FFFFFF" />
          {/* Nước cà phê nâu */}
          <rect x="4" y="7" width="6" height="2" fill="#78350F" />
          {/* Quai cầm */}
          <rect x="11" y="7" width="3" height="4" fill="#18181B" />
          <rect x="11" y="8" width="2" height="2" fill="#F4F4F5" />
          {/* Đĩa lót */}
          <rect x="2" y="13" width="10" height="1" fill="#18181B" />
        </svg>
      );

    case '🏳️':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          {/* Cán cờ gỗ */}
          <rect x="3" y="2" width="2" height="13" fill="#18181B" />
          <rect x="3" y="2" width="1" height="12" fill="#A16207" />
          {/* Lá cờ trắng viền đen */}
          <rect x="5" y="2" width="9" height="7" fill="#18181B" />
          <rect x="5" y="3" width="8" height="5" fill="#FFFFFF" />
          <rect x="8" y="4" width="3" height="3" fill="#E4E4E7" />
        </svg>
      );

    case '❤️':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          <rect x="2" y="3" width="5" height="5" fill="#18181B" />
          <rect x="9" y="3" width="5" height="5" fill="#18181B" />
          <rect x="1" y="4" width="14" height="5" fill="#18181B" />
          <rect x="3" y="9" width="10" height="3" fill="#18181B" />
          <rect x="5" y="12" width="6" height="2" fill="#18181B" />
          <rect x="7" y="14" width="2" height="1" fill="#18181B" />
          {/* Lõi tim đỏ rực */}
          <rect x="3" y="4" width="4" height="4" fill="#E11D48" />
          <rect x="9" y="4" width="4" height="4" fill="#E11D48" />
          <rect x="2" y="5" width="12" height="3" fill="#E11D48" />
          <rect x="4" y="8" width="8" height="3" fill="#E11D48" />
          <rect x="6" y="11" width="4" height="2" fill="#E11D48" />
          <rect x="7" y="13" width="2" height="1" fill="#E11D48" />
          {/* Điểm bóng trắng */}
          <rect x="3" y="5" width="2" height="2" fill="#FDA4AF" />
        </svg>
      );

    case '🤡':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          {/* Tóc hề đỏ 2 bên */}
          <rect x="1" y="3" width="3" height="5" fill="#DC2626" />
          <rect x="12" y="3" width="3" height="5" fill="#DC2626" />
          {/* Mặt trắng */}
          <rect x="4" y="2" width="8" height="12" fill="#18181B" />
          <rect x="3" y="4" width="10" height="8" fill="#18181B" />
          <rect x="4" y="3" width="8" height="10" fill="#FFFFFF" />
          {/* Mắt xanh dương */}
          <rect x="5" y="5" width="2" height="2" fill="#2563EB" />
          <rect x="9" y="5" width="2" height="2" fill="#2563EB" />
          {/* Mũi đỏ to tròn */}
          <rect x="7" y="7" width="2" height="2" fill="#E11D48" />
          {/* Miệng cười đỏ */}
          <rect x="5" y="10" width="6" height="2" fill="#E11D48" />
        </svg>
      );

    case '🎯':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          {/* Bia tròn đồng tâm */}
          <rect x="4" y="2" width="8" height="12" fill="#18181B" />
          <rect x="2" y="4" width="12" height="8" fill="#18181B" />
          <rect x="4" y="3" width="8" height="10" fill="#E11D48" />
          <rect x="3" y="4" width="10" height="8" fill="#E11D48" />
          <rect x="5" y="5" width="6" height="6" fill="#FFFFFF" />
          <rect x="7" y="7" width="2" height="2" fill="#E11D48" />
          {/* Mũi tên cắm góc phải trên */}
          <rect x="8" y="6" width="2" height="2" fill="#38BDF8" />
          <rect x="10" y="4" width="2" height="2" fill="#0284C7" />
          <rect x="12" y="2" width="2" height="2" fill="#FACC15" />
        </svg>
      );

    case '🚀':
      return (
        <svg viewBox="0 0 16 16" className={className} shapeRendering="crispEdges">
          {/* Lửa đẩy dưới */}
          <rect x="6" y="12" width="4" height="3" fill="#EA580C" />
          <rect x="7" y="12" width="2" height="2" fill="#FEF08A" />
          {/* Cánh tên lửa đỏ */}
          <rect x="3" y="9" width="2" height="4" fill="#DC2626" />
          <rect x="11" y="9" width="2" height="4" fill="#DC2626" />
          {/* Thân tên lửa */}
          <rect x="6" y="2" width="4" height="10" fill="#18181B" />
          <rect x="5" y="5" width="6" height="7" fill="#18181B" />
          <rect x="7" y="2" width="2" height="2" fill="#DC2626" />
          <rect x="6" y="4" width="4" height="7" fill="#FFFFFF" />
          {/* Cửa sổ xanh */}
          <rect x="7" y="6" width="2" height="2" fill="#38BDF8" />
        </svg>
      );

    default:
      return <span className="text-xl leading-none">{emoji}</span>;
  }
};

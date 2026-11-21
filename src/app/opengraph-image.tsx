import { ImageResponse } from 'next/og';

export const alt = 'Kombat - Sảnh Mini-Game Indie Neo-Arcade 16-Bit';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#18181B',
          padding: '48px 56px',
          fontFamily: 'sans-serif',
          color: '#F4F1EA',
          border: '12px solid #F59E0B',
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              backgroundColor: '#6366F1',
              color: '#FFFFFF',
              padding: '10px 20px',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '0.08em',
              border: '3px solid #F4F1EA',
            }}
          >
            16-BIT NEO-ARCADE
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#10B981',
              color: '#18181B',
              padding: '10px 18px',
              fontSize: 20,
              fontWeight: 800,
              border: '3px solid #F4F1EA',
            }}
          >
            PWA OFFLINE + ONLINE PVP
          </div>
        </div>

        {/* Center Hero */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '88px',
                height: '88px',
                backgroundColor: '#F59E0B',
                color: '#18181B',
                fontSize: 52,
                fontWeight: 900,
                border: '4px solid #F4F1EA',
              }}
            >
              K
            </div>
            <div
              style={{
                fontSize: 88,
                fontWeight: 900,
                letterSpacing: '0.06em',
                color: '#FFFFFF',
                lineHeight: 1,
              }}
            >
              KOMBAT
            </div>
          </div>

          <div
            style={{
              fontSize: 32,
              fontWeight: 600,
              color: '#E4E4E7',
              maxWidth: '980px',
              lineHeight: 1.35,
            }}
          >
            13 Strategy, Puzzle &amp; Arcade Mini-Games — Play Offline PWA or Online PvP 1v1!
          </div>
        </div>

        {/* Bottom Category Pills & Domain */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '3px solid #3F3F46',
            paddingTop: '24px',
          }}
        >
          <div style={{ display: 'flex', gap: '14px' }}>
            <div
              style={{
                backgroundColor: '#27272A',
                border: '2px solid #6366F1',
                color: '#A5B4FC',
                padding: '8px 16px',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Chess • Xiangqi • Caro • Go
            </div>
            <div
              style={{
                backgroundColor: '#27272A',
                border: '2px solid #F59E0B',
                color: '#FCD34D',
                padding: '8px 16px',
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              Sudoku • 2048 • Tetris • Block Blast
            </div>
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: '#F59E0B',
              letterSpacing: '0.04em',
            }}
          >
            kombat-red.vercel.app
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}

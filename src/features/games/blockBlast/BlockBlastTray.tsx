'use client';

import React from 'react';
import { TraySlot, BlockShape } from './types';

interface BlockBlastTrayProps {
  tray: TraySlot[];
  selectedSlotId: string | null;
  draggingSlotId?: string | null;
  onSelectSlot: (slot: TraySlot) => void;
  onDragStartPiece: (slot: TraySlot, clientX: number, clientY: number, isTouch: boolean) => void;
}

export const BlockBlastTray: React.FC<BlockBlastTrayProps> = ({
  tray,
  selectedSlotId,
  draggingSlotId,
  onSelectSlot,
  onDragStartPiece,
}) => {
  // Mini renderer cho hình khối trong khay
  const renderMiniShape = (shape: BlockShape) => {
    const { matrix, color, borderColor } = shape;
    const rows = matrix.length;
    const cols = matrix[0].length;

    return (
      <div
        className="grid gap-0.5 pointer-events-none"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {matrix.map((rowArr, r) =>
          rowArr.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm"
              style={{
                backgroundColor: val === 1 ? color : 'transparent',
                boxShadow:
                  val === 1
                    ? 'inset 1.5px 1.5px 0px rgba(255,255,255,0.4), inset -1.5px -1.5px 0px rgba(0,0,0,0.4)'
                    : 'none',
                border: val === 1 ? `1.5px solid ${borderColor}` : 'none',
              }}
            />
          ))
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[400px] px-2 py-3 bg-[#1e232a] border-4 border-black shadow-[4px_4px_0px_#000] rounded-lg">
      <div className="grid grid-cols-3 gap-2 items-center justify-items-center min-h-[96px]">
        {tray.map((slot) => {
          if (slot.used) {
            return (
              <div
                key={slot.id}
                className="w-full h-24 flex items-center justify-center border-2 border-dashed border-zinc-800 rounded opacity-25"
              >
                <div className="w-3 h-3 rounded-full bg-zinc-700" />
              </div>
            );
          }

          const isSelected = selectedSlotId === slot.id;
          const isDragging = draggingSlotId === slot.id;

          return (
            <div
              key={slot.id}
              onClick={() => onSelectSlot(slot)}
              onPointerDown={(e) => {
                if (e.button !== 0 && e.pointerType === 'mouse') return;
                onDragStartPiece(slot, e.clientX, e.clientY, e.pointerType === 'touch');
              }}
              className={`w-full h-24 flex items-center justify-center p-2 rounded cursor-grab active:cursor-grabbing transition-transform select-none touch-none ${
                isDragging
                  ? 'opacity-20 scale-95 border-2 border-dashed border-zinc-700'
                  : isSelected
                  ? 'border-2 border-amber-400 bg-amber-400/10 shadow-[0_0_8px_rgba(251,191,36,0.6)] scale-105'
                  : 'border-2 border-zinc-800 hover:border-zinc-700 bg-zinc-900/40 hover:scale-105 active:scale-95'
              }`}
            >
              {renderMiniShape(slot.shape)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

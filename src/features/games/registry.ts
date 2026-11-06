import { GameMetadata } from '@/types/game';

export const GAME_REGISTRY: GameMetadata[] = [
  {
    id: 'sudoku',
    name: {
      vi: 'Sudoku',
      en: 'Sudoku',
    },
    shortDescription: {
      vi: 'Giải đố số 9x9 rèn luyện tư duy logic',
      en: '9x9 number puzzle to sharpen your logic',
    },
    description: {
      vi: 'Trò chơi giải đố điền số từ 1 đến 9 cổ điển với nhiều cấp độ thử thách từ Dễ đến Cao thủ.',
      en: 'Classic 1-9 number placement puzzle featuring multiple difficulty levels from Easy to Expert.',
    },
    route: '/games/sudoku',
    status: 'available',
    modes: ['single_player'],
    minPlayers: 1,
    maxPlayers: 1,
    badge: {
      vi: '1 Người chơi',
      en: 'Single Player',
    },
  },
  {
    id: 'chess',
    name: {
      vi: 'Cờ vua',
      en: 'Chess',
    },
    shortDescription: {
      vi: 'Đấu trí đỉnh cao - tạo phòng mời bạn bè',
      en: 'Tactical board game - create room to challenge friends',
    },
    description: {
      vi: 'Chiến thuật đối kháng 1v1 theo luật quốc tế. Tạo phòng riêng và gửi mã mời bạn bè cùng so tài.',
      en: 'Standard 1v1 tactical showdown. Create a private room and share code with friends.',
    },
    route: '/games/chess',
    status: 'available',
    modes: ['multiplayer_room'],
    minPlayers: 2,
    maxPlayers: 2,
    badge: {
      vi: 'Phòng riêng 1v1',
      en: '1v1 Room',
    },
  },
];

export function getGameById(id: string): GameMetadata | undefined {
  return GAME_REGISTRY.find((game) => game.id === id);
}


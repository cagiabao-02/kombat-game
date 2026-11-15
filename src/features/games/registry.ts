import { GameMetadata } from '@/types/game';

export const GAME_REGISTRY: GameMetadata[] = [
  {
    id: 'sudoku',
    category: 'puzzle',
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
    category: 'strategy',
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
  {
    id: 'caro',
    category: 'strategy',
    name: {
      vi: 'Cờ Caro',
      en: 'Gomoku',
    },
    shortDescription: {
      vi: 'Năm quân thẳng hàng - đấu máy hoặc so tài online',
      en: 'Five in a row - battle AI, local or online',
    },
    description: {
      vi: 'Trò chơi cờ Caro 15x15 kinh điển. Thử sức với Bot AI thông minh, chơi đôi trên cùng thiết bị hoặc tạo phòng thách đấu bạn bè.',
      en: 'Classic 15x15 Gomoku (Five in a Row). Battle smart AI, pass & play with a friend locally, or challenge online.',
    },
    route: '/games/caro',
    status: 'available',
    modes: ['single_player', 'multiplayer_room'],
    minPlayers: 1,
    maxPlayers: 2,
    badge: {
      vi: 'Bot & 1v1 Online',
      en: 'Bot & 1v1 Online',
    },
  },
  {
    id: 'xiangqi',
    category: 'strategy',
    name: {
      vi: 'Cờ Tướng',
      en: 'Xiangqi',
    },
    shortDescription: {
      vi: 'Chiến thuật phương Đông - Sở Hà Hán Giới',
      en: 'Eastern tactical chess - Chu-Han river showdown',
    },
    description: {
      vi: 'Trò chơi cờ tướng truyền thống đỉnh cao trí tuệ. Đấu trí 2 người trên cùng máy, luyện tập với Bot AI hoặc so tài trực tuyến.',
      en: 'Traditional Xiangqi (Chinese Chess). Battle 1v1 locally, practice against smart Bot AI, or compete online.',
    },
    route: '/games/xiangqi',
    status: 'available',
    modes: ['single_player', 'multiplayer_room'],
    minPlayers: 1,
    maxPlayers: 2,
    badge: {
      vi: 'Mới ra mắt',
      en: 'New Release',
    },
  },
  {
    id: 'snake',
    category: 'arcade',
    name: {
      vi: 'Rắn Săn Mồi',
      en: 'Pixel Snake',
    },
    shortDescription: {
      vi: 'Game thùng 8-bit kinh điển - ăn táo và cày kỷ lục',
      en: 'Classic 8-bit arcade - eat apples & chase high scores',
    },
    description: {
      vi: 'Điều khiển chú rắn pixel ăn táo đỏ và táo vàng bonus, tránh va chạm tường và tự cắn đuôi. Tốc độ tăng dần cực kỳ kịch tính!',
      en: 'Control the retro pixel snake to eat red apples & golden bonus fruits. Dodge walls and yourself as speed ramps up!',
    },
    route: '/games/snake',
    status: 'available',
    modes: ['single_player'],
    minPlayers: 1,
    maxPlayers: 1,
    badge: {
      vi: 'ARCADE KỶ LỤC',
      en: 'ARCADE HIT',
    },
  },
  {
    id: 'game2048',
    category: 'puzzle',
    name: {
      vi: '2048',
      en: '2048',
    },
    shortDescription: {
      vi: 'Trượt và gộp ô số chạm mốc 2048 huyền thoại',
      en: 'Slide and merge tiles to reach the legendary 2048',
    },
    description: {
      vi: 'Trò chơi giải đố số học gây nghiện. Trượt các ô số giống nhau để hợp nhất, tính toán từng bước đi để đạt được viên gạch 2048 vàng danh giá!',
      en: 'Addictive number sliding puzzle. Merge identical tiles, plan your moves carefully, and conquer the golden 2048 tile!',
    },
    route: '/games/game2048',
    status: 'available',
    modes: ['single_player'],
    minPlayers: 1,
    maxPlayers: 1,
    badge: {
      vi: 'MỚI RA MẮT',
      en: 'NEW RELEASE',
    },
  },
];

export function getGameById(id: string): GameMetadata | undefined {
  return GAME_REGISTRY.find((game) => game.id === id);
}

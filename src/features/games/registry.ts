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
      vi: 'Trí tuệ',
      en: 'Strategy',
    },
  },
  {
    id: 'go',
    category: 'strategy',
    name: {
      vi: 'Cờ Vây',
      en: 'Go (Weiqi)',
    },
    shortDescription: {
      vi: 'Đỉnh cao trí tuệ Á Đông - bao vây chiếm đất 9x9/13x13/19x19',
      en: 'Ancient game of strategy & territory 9x9/13x13/19x19',
    },
    description: {
      vi: 'Trò chơi cờ vây kinh điển ngàn năm tuổi. Tính toán khí, bắt tù binh và bao vây chiếm lĩnh đất đai. Đấu với Bot AI hoặc chơi đôi trên cùng máy.',
      en: 'Timeless ancient game of Go. Manage liberties, capture stones and secure surrounding territory. Battle smart Bot AI or pass & play locally.',
    },
    route: '/games/go',
    status: 'available',
    modes: ['single_player', 'multiplayer_room'],
    minPlayers: 1,
    maxPlayers: 2,
    badge: {
      vi: 'MỚI RA MẮT',
      en: 'NEW RELEASE',
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
      vi: 'HOT PUZZLE',
      en: 'HOT PUZZLE',
    },
  },
  {
    id: 'minesweeper',
    category: 'puzzle',
    name: {
      vi: 'Dò Mìn',
      en: 'Minesweeper',
    },
    shortDescription: {
      vi: 'Gỡ mìn cổ điển - suy luận logic và cắm cờ an toàn',
      en: 'Classic minesweeper - logical deduction and safe flagging',
    },
    description: {
      vi: 'Trò chơi trí tuệ huyền thoại. Tính toán số mìn xung quanh, cắm cờ đánh dấu vị trí hiểm nguy và mở rộng vùng đất an toàn với tốc độ nhanh nhất!',
      en: 'Legendary deduction puzzle. Calculate adjacent mines, plant flags on danger spots, and sweep the minefield in record time!',
    },
    route: '/games/minesweeper',
    status: 'available',
    modes: ['single_player'],
    minPlayers: 1,
    maxPlayers: 1,
    badge: {
      vi: 'HOT PUZZLE',
      en: 'HOT PUZZLE',
    },
  },
  {
    id: 'brick_breaker',
    category: 'arcade',
    name: {
      vi: 'Phá Gạch',
      en: 'Brick Breaker',
    },
    shortDescription: {
      vi: 'Arcade bắn bóng nảy đập vỡ các khối gạch sắc màu',
      en: 'Classic retro arcade ball bounce and brick smashing',
    },
    description: {
      vi: 'Trò chơi phản xạ máy thùng kinh điển. Hứng bóng khéo léo, nhặt vật phẩm tăng sức mạnh và phá sạch các bức tường gạch qua từng màn chơi kịch tính!',
      en: 'Legendary arcade action. Bounce the ball, catch power-ups, and smash every brick wall across exciting levels!',
    },
    route: '/games/brick-breaker',
    status: 'available',
    modes: ['single_player'],
    minPlayers: 1,
    maxPlayers: 1,
    badge: {
      vi: 'ARCADE',
      en: 'ARCADE',
    },
  },
  {
    id: 't_rex_runner',
    category: 'arcade',
    name: {
      vi: 'Khủng Long T-Rex',
      en: 'T-Rex Runner',
    },
    shortDescription: {
      vi: 'Chạy vượt sa mạc né xương rồng và chim cổ đại',
      en: 'Dodge desert cacti and prehistoric pterodactyls in classic arcade style',
    },
    description: {
      vi: 'Trò chơi phản xạ 1 chạm huyền thoại. Nhảy qua cây xương rồng, cúi người né chim bay và chinh phục chu kỳ ngày đêm vô tận!',
      en: 'Legendary one-tap desert runner. Leap over cacti, duck under flying pterodactyls, and survive the endless day-night cycle!',
    },
    route: '/games/t-rex-runner',
    status: 'available',
    modes: ['single_player'],
    minPlayers: 1,
    maxPlayers: 1,
    badge: {
      vi: 'MỚI RA MẮT',
      en: 'NEW RELEASE',
    },
  },
  {
    id: 'flappy_bird',
    category: 'arcade',
    name: {
      vi: 'Flappy Bird',
      en: 'Flappy Bird',
    },
    shortDescription: {
      vi: 'Đập cánh bay qua các khe cột ống nước xanh kinh điển',
      en: 'Flap wings and navigate between retro green pipes',
    },
    description: {
      vi: 'Trò chơi phản xạ 1 chạm huyền thoại. Vỗ cánh nhịp nhàng đưa chú chim lượn qua các cặp ống nước, đạt các mốc huy chương danh giá!',
      en: 'Legendary one-tap arcade game. Flap your wings carefully through pipe gaps and unlock prestigious medals!',
    },
    route: '/games/flappy-bird',
    status: 'available',
    modes: ['single_player'],
    minPlayers: 1,
    maxPlayers: 1,
    badge: {
      vi: 'HOT',
      en: 'HOT',
    },
  },
  {
    id: 'block_blast',
    category: 'puzzle',
    name: {
      vi: 'Block Blast',
      en: 'Block Blast',
    },
    shortDescription: {
      vi: 'Xếp khối nổ dòng 8x8 cực đã - cày combo phá kỷ lục',
      en: '8x8 block puzzle blast - smash combos & chase records',
    },
    description: {
      vi: 'Trò chơi xếp khối gây nghiện đỉnh cao. Đặt các khối polyomino lên bàn cờ 8x8, nổ tung các hàng và cột để tạo chuỗi Combo hoành tráng!',
      en: 'Addictive block puzzle hit. Place polyomino blocks on an 8x8 board, clear rows and columns to unleash mega Combos!',
    },
    route: '/games/block-blast',
    status: 'available',
    modes: ['single_player'],
    minPlayers: 1,
    maxPlayers: 1,
    badge: {
      vi: 'HOT PUZZLE',
      en: 'HOT PUZZLE',
    },
  },
  {
    id: 'tetris',
    category: 'arcade',
    name: {
      vi: 'Tetris Cổ Điển',
      en: 'Classic Tetris',
    },
    shortDescription: {
      vi: 'Xếp gạch 10x20 huyền thoại - Hold, Hard Drop & xóa 4 dòng',
      en: 'Classic 10x20 brick puzzle - Hold, Hard Drop & TETRIS',
    },
    description: {
      vi: 'Trò chơi xếp gạch Arcade huyền thoại trên bàn 10x20! Xoay 7 khối Tetromino, giữ khối Hold Piece, thả nhanh Hard Drop và ăn combo TETRIS 4 dòng cực đã.',
      en: 'Legendary 10x20 arcade brick game! Rotate 7 Tetrominoes, store a Hold Piece, slam Hard Drops, and score massive 4-line TETRIS clears.',
    },
    route: '/games/tetris',
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

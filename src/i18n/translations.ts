export type Language = 'vi' | 'en';

export const translations = {
  vi: {
    app: {
      name: 'Togame',
      tagline: 'Sảnh trò chơi ngắn gọn nhẹ',
      guestBadge: 'Khách',
      loginNotice: 'Tài khoản khách được lưu trên trình duyệt này.',
    },
    nav: {
      lobby: 'Sảnh trò chơi',
      rules: 'Luật chơi',
      settings: 'Cài đặt',
      language: 'Ngôn ngữ',
    },
    lobby: {
      title: 'Chọn trò chơi để bắt đầu',
      subtitle: 'Trải nghiệm mượt mà trên cả điện thoại và máy tính, không cần cài đặt rườm rà.',
      playNow: 'Chơi ngay',
      createRoom: 'Tạo phòng',
      joinRoom: 'Vào phòng',
      comingSoon: 'Sắp ra mắt',
      singlePlayer: 'Chơi đơn',
      multiplayer: 'Nhiều người',
      playersCount: '{count} người chơi',
    },
    common: {
      backToLobby: 'Quay lại sảnh',
      loading: 'Đang tải...',
      error: 'Có lỗi xảy ra',
      tryAgain: 'Thử lại',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      close: 'Đóng',
      copied: 'Đã sao chép!',
    },
    status: {
      available: 'Sẵn sàng',
      beta: 'Thử nghiệm',
      coming_soon: 'Sắp ra mắt',
    },
  },
  en: {
    app: {
      name: 'Togame',
      tagline: 'Lightweight Indie Mini-Games Lobby',
      guestBadge: 'Guest',
      loginNotice: 'Guest session stored locally in this browser.',
    },
    nav: {
      lobby: 'Lobby',
      rules: 'Rules',
      settings: 'Settings',
      language: 'Language',
    },
    lobby: {
      title: 'Pick a game to start playing',
      subtitle: 'Smooth responsive experience on both mobile and desktop without friction.',
      playNow: 'Play Now',
      createRoom: 'Create Room',
      joinRoom: 'Join Room',
      comingSoon: 'Coming Soon',
      singlePlayer: 'Single Player',
      multiplayer: 'Multiplayer',
      playersCount: '{count} players',
    },
    common: {
      backToLobby: 'Back to Lobby',
      loading: 'Loading...',
      error: 'An error occurred',
      tryAgain: 'Try Again',
      cancel: 'Cancel',
      confirm: 'Confirm',
      close: 'Close',
      copied: 'Copied!',
    },
    status: {
      available: 'Ready',
      beta: 'Beta',
      coming_soon: 'Coming Soon',
    },
  },
};


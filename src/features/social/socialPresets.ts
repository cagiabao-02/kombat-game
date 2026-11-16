import { QuickChatPreset, EmotePreset } from './types';

export const EMOTE_PRESETS: EmotePreset[] = [
  { id: 'fire', emoji: '🔥', labelVi: 'Cháy', labelEn: 'Fire' },
  { id: 'cool', emoji: '😎', labelVi: 'Ngầu', labelEn: 'Cool' },
  { id: 'thinking', emoji: '🤔', labelVi: 'Suy ngẫm', labelEn: 'Thinking' },
  { id: 'shocked', emoji: '😱', labelVi: 'Kinh ngạc', labelEn: 'Shocked' },
  { id: 'skull', emoji: '💀', labelVi: 'Toang', labelEn: 'Skull' },
  { id: 'applause', emoji: '👏', labelVi: 'Vỗ tay', labelEn: 'Applause' },
  { id: 'coffee', emoji: '☕', labelVi: 'Thong thả', labelEn: 'Coffee' },
  { id: 'white_flag', emoji: '🏳️', labelVi: 'Cầu hòa', labelEn: 'Flag' },
  { id: 'heart', emoji: '❤️', labelVi: 'Tim', labelEn: 'Heart' },
  { id: 'clown', emoji: '🤡', labelVi: 'Hề', labelEn: 'Clown' },
  { id: 'target', emoji: '🎯', labelVi: 'Chuẩn', labelEn: 'Target' },
  { id: 'rocket', emoji: '🚀', labelVi: 'Lên đỉnh', labelEn: 'Rocket' },
];

export const QUICK_CHAT_PRESETS: QuickChatPreset[] = [
  // Giao lưu & Chào hỏi
  {
    id: 'hello',
    category: 'greeting',
    icon: '👋',
    textVi: 'Xin chào! Chúc may mắn!',
    textEn: 'Hello! Good luck!',
  },
  {
    id: 'battle',
    category: 'greeting',
    icon: '⚔️',
    textVi: 'Chiến thôi bạn ơi!',
    textEn: "Let's battle!",
  },
  // Khen ngợi & Thế trận
  {
    id: 'well_played',
    category: 'gameplay',
    icon: '🔥',
    textVi: 'Nước đi hay đấy!',
    textEn: 'Well played!',
  },
  {
    id: 'intense',
    category: 'gameplay',
    icon: '🤯',
    textVi: 'Căng thẳng thật!',
    textEn: 'So intense!',
  },
  {
    id: 'calculating',
    category: 'gameplay',
    icon: '🤔',
    textVi: 'Đang tính toán một chút...',
    textEn: 'Thinking hard...',
  },
  {
    id: 'hurry',
    category: 'gameplay',
    icon: '⚡',
    textVi: 'Nhanh lên bạn ơi!',
    textEn: 'Your turn, hurry!',
  },
  {
    id: 'mistake',
    category: 'gameplay',
    icon: '💀',
    textVi: 'Toang rồi, sai một ly!',
    textEn: 'Oops! Huge mistake!',
  },
  // Kết thúc & Tôn trọng
  {
    id: 'gg',
    category: 'closing',
    icon: '👑',
    textVi: 'Trận đấu tuyệt vời! Cảm ơn!',
    textEn: 'Good game (GG)!',
  },
  {
    id: 'rematch',
    category: 'closing',
    icon: '🔄',
    textVi: 'Đấu lại ván nữa nhé!',
    textEn: 'One more match?',
  },
  {
    id: 'coffee_time',
    category: 'closing',
    icon: '☕',
    textVi: 'Thong thả uống ngụm trà đã...',
    textEn: 'Relax and take your time...',
  },
];

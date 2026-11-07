export interface AvatarOption {
  id: string;
  emoji: string;
  nameVi: string;
  nameEn: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'crown', emoji: '👑', nameVi: 'Vương giả', nameEn: 'Royalty' },
  { id: 'ninja', emoji: '🥷', nameVi: 'Ninja', nameEn: 'Ninja' },
  { id: 'robot', emoji: '🤖', nameVi: 'Người máy', nameEn: 'Cyborg' },
  { id: 'brain', emoji: '🧠', nameVi: 'Trí tuệ', nameEn: 'Mastermind' },
  { id: 'lightning', emoji: '⚡', nameVi: 'Tia chớp', nameEn: 'Flash' },
  { id: 'cat', emoji: '🐱', nameVi: 'Mèo lanh', nameEn: 'Clever Cat' },
  { id: 'fox', emoji: '🦊', nameVi: 'Cáo tinh anh', nameEn: 'Swift Fox' },
  { id: 'dragon', emoji: '🐉', nameVi: 'Rồng thần', nameEn: 'Dragon' },
  { id: 'target', emoji: '🎯', nameVi: 'Thiện xạ', nameEn: 'Marksman' },
  { id: 'rocket', emoji: '🚀', nameVi: 'Phi thuyền', nameEn: 'Rocket' },
  { id: 'shield', emoji: '🛡️', nameVi: 'Hiệp sĩ', nameEn: 'Defender' },
  { id: 'diamond', emoji: '💎', nameVi: 'Kim cương', nameEn: 'Diamond' },
];

export const DEFAULT_AVATAR = '👑';

export function isCustomImageAvatar(avatar?: string | null): boolean {
  if (!avatar) return false;
  return (
    avatar.startsWith('data:image') ||
    avatar.startsWith('http://') ||
    avatar.startsWith('https://')
  );
}

export function getValidAvatar(avatar?: string | null, allowCustomImage: boolean = true): string {
  if (!avatar) return DEFAULT_AVATAR;
  if (isCustomImageAvatar(avatar)) {
    return allowCustomImage ? avatar : DEFAULT_AVATAR;
  }
  const found = AVATAR_OPTIONS.some((a) => a.emoji === avatar);
  return found ? avatar : DEFAULT_AVATAR;
}


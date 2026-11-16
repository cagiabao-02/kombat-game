export type SocialContentType = 'emote' | 'chat';

export interface QuickChatPreset {
  id: string;
  category: 'greeting' | 'gameplay' | 'taunt' | 'closing';
  textVi: string;
  textEn: string;
  icon?: string;
}

export interface EmotePreset {
  id: string;
  emoji: string;
  labelVi: string;
  labelEn: string;
}

export interface ActiveSocialMessage {
  id: string;
  target: 'me' | 'opponent';
  type: SocialContentType;
  content: string;
  createdAt: number;
}

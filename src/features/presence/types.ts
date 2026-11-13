export interface LobbyPlayer {
  userId: string;
  name: string;
  avatar: string;
  status: 'idle' | 'in_game';
  currentGame?: 'chess' | 'caro' | 'sudoku' | null;
  onlineAt: number;
}

export type ChallengeGameType = 'chess' | 'caro';

export interface ChallengeRequest {
  challengeId: string;
  fromId: string;
  fromName: string;
  fromAvatar: string;
  toId: string;
  toName: string;
  gameId: ChallengeGameType;
  roomCode: string;
  createdAt: number;
}

export interface ChallengeResponse {
  challengeId: string;
  fromId: string;
  toId: string;
  accepted: boolean;
  gameId: ChallengeGameType;
  roomCode: string;
}


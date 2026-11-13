import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { LobbyPlayer, ChallengeRequest, ChallengeResponse } from './types';

export interface PresenceCallbacks {
  onPlayersSync: (players: LobbyPlayer[]) => void;
  onChallengeReceived: (req: ChallengeRequest) => void;
  onChallengeResponse: (res: ChallengeResponse) => void;
}

class PresenceService {
  private channel: RealtimeChannel | null = null;
  private currentUserId: string | null = null;
  private callbacks: PresenceCallbacks | null = null;

  public joinLobby(player: LobbyPlayer, callbacks: PresenceCallbacks) {
    this.callbacks = callbacks;
    this.currentUserId = player.userId;

    // Tránh subscribe trùng lặp
    if (this.channel) {
      this.channel.track(player).catch(() => {});
      return;
    }

    this.channel = supabase.channel('kombat_lobby_presence', {
      config: {
        presence: { key: player.userId },
      },
    });

    this.channel
      .on('presence', { event: 'sync' }, () => {
        if (!this.channel) return;
        const state = this.channel.presenceState();
        const playersMap = new Map<string, LobbyPlayer>();

        for (const key of Object.keys(state)) {
          const presences = state[key] as any[];
          if (presences && presences.length > 0) {
            const p = presences[presences.length - 1] as LobbyPlayer;
            if (p && p.userId) {
              playersMap.set(p.userId, p);
            }
          }
        }

        this.callbacks?.onPlayersSync(Array.from(playersMap.values()));
      })
      .on('broadcast', { event: 'challenge_request' }, ({ payload }) => {
        const req = payload as ChallengeRequest;
        if (req && req.toId === this.currentUserId) {
          this.callbacks?.onChallengeReceived(req);
        }
      })
      .on('broadcast', { event: 'challenge_response' }, ({ payload }) => {
        const res = payload as ChallengeResponse;
        if (res && res.fromId === this.currentUserId) {
          this.callbacks?.onChallengeResponse(res);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && this.channel) {
          await this.channel.track(player).catch(() => {});
        }
      });
  }

  public updateStatus(status: 'idle' | 'in_game', currentGame?: 'chess' | 'caro' | 'sudoku' | null) {
    if (this.channel) {
      this.channel.track({ status, currentGame }).catch(() => {});
    }
  }

  public async sendChallenge(req: ChallengeRequest): Promise<void> {
    if (!this.channel) return;
    await this.channel.send({
      type: 'broadcast',
      event: 'challenge_request',
      payload: req,
    });
  }

  public async respondChallenge(res: ChallengeResponse): Promise<void> {
    if (!this.channel) return;
    await this.channel.send({
      type: 'broadcast',
      event: 'challenge_response',
      payload: res,
    });
  }

  public leaveLobby() {
    if (this.channel) {
      this.channel.untrack().catch(() => {});
      supabase.removeChannel(this.channel).catch(() => {});
      this.channel = null;
    }
    this.currentUserId = null;
  }
}

export const presenceService = new PresenceService();


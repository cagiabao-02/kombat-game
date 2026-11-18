'use client';

class SoundService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private volume: number = 0.7; // Mặc định 70% âm lượng (0.0 đến 1.0)
  private muted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const savedMuted = localStorage.getItem('togame_sound_muted');
        this.muted = savedMuted === 'true';

        const savedVol = localStorage.getItem('kombat_sound_volume');
        if (savedVol !== null) {
          const parsed = parseFloat(savedVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.volume = parsed;
          }
        }
      } catch {
        this.muted = false;
        this.volume = 0.7;
      }
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    return this.audioCtx;
  }

  private getDestination(ctx: AudioContext): AudioNode {
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      const effectiveGain = this.isMuted() ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(effectiveGain, ctx.currentTime);
      this.masterGain.connect(ctx.destination);
    }
    return this.masterGain;
  }

  private notifyChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kombat:volume_change', {
          detail: {
            volume: this.volume,
            muted: this.muted,
          },
        })
      );
    }
  }

  public isMuted(): boolean {
    return this.muted || this.volume <= 0.001;
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(val: number): void {
    const clamped = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
    this.volume = clamped;
    if (clamped <= 0.001) {
      this.muted = true;
    } else if (this.muted && clamped > 0.001) {
      this.muted = false;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kombat_sound_volume', clamped.toString());
        localStorage.setItem('togame_sound_muted', this.muted ? 'true' : 'false');
      } catch {}
    }

    if (this.masterGain && this.audioCtx) {
      const effectiveGain = this.isMuted() ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(effectiveGain, this.audioCtx.currentTime);
    }

    this.notifyChange();
  }

  public setMuted(muted: boolean): boolean {
    this.muted = muted;
    if (!this.muted && this.volume <= 0.05) {
      this.volume = 0.7; // Khôi phục về 70% nếu trước đó âm lượng bằng 0
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('togame_sound_muted', this.muted ? 'true' : 'false');
        localStorage.setItem('kombat_sound_volume', this.volume.toString());
      } catch {}
    }

    if (this.masterGain && this.audioCtx) {
      const effectiveGain = this.isMuted() ? 0 : this.volume;
      this.masterGain.gain.setValueAtTime(effectiveGain, this.audioCtx.currentTime);
    }

    this.notifyChange();
    return this.muted;
  }

  public toggleMute(): boolean {
    return this.setMuted(!this.muted);
  }

  /**
   * Âm thanh thử nghiệm khi kéo thanh âm lượng (8-bit chime nhẹ)
   */
  public playVolumePreview(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.07); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  /**
   * Sound 1: Chess Piece Move (Tactile wooden click)
   */
  public playMove(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.07);

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  /**
   * Sound 2: Chess Piece Capture (Deeper punch)
   */
  public playCapture(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  /**
   * Sound 3: Check Alert (Soft alert chime)
   */
  public playCheck(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {}
  }

  /**
   * Sound 4: Sudoku Input / Button Click (8-bit arcade blip)
   */
  public playClick(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.02);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.045);
    } catch {}
  }

  /**
   * Sound 5: Sudoku Error / Conflict (8-bit buzzer thud)
   */
  public playError(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.setValueAtTime(110, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch {}
  }

  /**
   * Sound 6: Victory Fanfare (16-bit Arcade Stage Clear Arpeggio)
   */
  public playVictory(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.14, ctx.currentTime + idx * 0.09 + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.35);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.38);
      });
    } catch {}
  }

  /**
   * Sound 7: Match Found Chime (Arcade Coin Insert / Challenger Ping)
   */
  public playMatchFound(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      [987.77, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.26);
      });
    } catch {}
  }

  /**
   * Sound 8: Defeat (Descending melancholic tone)
   */
  public playDefeat(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [392.0, 349.23, 311.13, 261.63]; // G4, F4, Eb4, C4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.12);
        osc.stop(ctx.currentTime + idx * 0.12 + 0.32);
      });
    } catch {}
  }

  /**
   * Sound 9: Draw (Neutral chime)
   */
  public playDraw(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      [440, 440].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.15 + 0.3);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + idx * 0.15 + 0.32);
      });
    } catch {}
  }

  /**
   * Sound 10: Snake eats normal apple (8-bit chiptune blip)
   */
  public playSnakeEat(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.04); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  /**
   * Sound 11: Snake eats golden apple (8-bit powerup fanfare)
   */
  public playSnakeGolden(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      [659.25, 783.99, 987.77, 1318.51].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.04);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.04 + 0.08);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.04);
        osc.stop(ctx.currentTime + idx * 0.04 + 0.09);
      });
    } catch {}
  }

  /**
   * Sound 12: Snake crash / death (8-bit retro pitch drop)
   */
  public playSnakeDie(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  }

  /**
   * Sound 13: 2048 tile slide (subtle tactile chiptune tap)
   */
  public play2048Slide(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.055);
    } catch {}
  }

  /**
   * Sound 14: 2048 tile merge (bouncy square wave pop, pitch based on tile value)
   */
  public play2048Merge(value: number = 4): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      // Dynamic frequency based on merged value (e.g., 4 -> 330Hz, 8 -> 392Hz, ... 2048 -> 987Hz)
      const baseFreq = Math.min(1200, 280 + Math.log2(Math.max(2, value)) * 60);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.setValueAtTime(baseFreq * 1.25, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.095);
    } catch {}
  }

  /**
   * Sound 15: 2048 victory fanfare (arpeggio to golden 2048)
   */
  public play2048Win(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.16);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.17);
      });
    } catch {}
  }

  /**
   * Sound 16: Minesweeper tile click / dig (crisp mechanical click)
   */
  public playMinesweeperClick(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.03);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.035);
    } catch {}
  }

  /**
   * Sound 17: Minesweeper flag toggle (light high-pitched tick)
   */
  public playMinesweeperFlag(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.02);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.055);
    } catch {}
  }

  /**
   * Sound 18: Minesweeper mine explosion (crunchy low rumble boom)
   */
  public playMinesweeperBoom(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      // Noise buffer for realistic 8-bit explosion
      const bufferSize = ctx.sampleRate * 0.45;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.4);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.getDestination(ctx));

      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + 0.45);
    } catch {}
  }

  /**
   * Sound 19: Minesweeper win fanfare
   */
  public playMinesweeperWin(): void {
    this.play2048Win();
  }

  /**
   * Sound 20: Brick Breaker - Hit brick (pitch scales with combo)
   */
  public playBrickHit(combo: number = 1): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const baseFreq = Math.min(1200, 360 + Math.min(10, combo) * 45);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.055);
    } catch {}
  }

  /**
   * Sound 21: Brick Breaker - Bounce on paddle
   */
  public playPaddleBounce(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.075);
    } catch {}
  }

  /**
   * Sound 22: Brick Breaker - Catch power-up capsule
   */
  public playPowerupCatch(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      [659.25, 987.77].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.1);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.11);
      });
    } catch {}
  }

  /**
   * Sound 23: Brick Breaker - Ball lost / Life lost
   */
  public playLifeLost(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.29);
    } catch {}
  }

  /**
   * Sound 24: Brick Breaker - Laser shot
   */
  public playLaserShot(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.085);
    } catch {}
  }

  /**
   * Sound 25: Brick Breaker - Level Clear
   */
  public playLevelUp(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.14);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.15);
      });
    } catch {}
  }

  /**
   * Sound: Social Message / Emote Pop (8-bit bubble pop)
   */
  public playSocialPop(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {}
  }

  /**
   * Sound: Dino Jump (Retro square pitch sweep)
   */
  public playDinoJump(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  /**
   * Sound: Dino 100-Point Milestone (Retro 2-tone celebratory chime)
   */
  public playDinoMilestone(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const tones = [587.33, 880]; // D5, A5
      tones.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.22, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.12);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.13);
      });
    } catch {}
  }

  /**
   * Sound: Dino Hit / Crash (Retro low crunch noise)
   */
  public playDinoHit(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.22);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.23);
    } catch {}
  }

  /**
   * Sound: Flappy Bird Wing Flap (Short upward swoosh)
   */
  public playFlappyFlap(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(680, ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  /**
   * Sound: Flappy Bird Score Point (Classic 8-bit ting ding)
   */
  public playFlappyScore(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.06); // E6

      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.16);
    } catch {}
  }

  /**
   * Sound: Flappy Bird Hit Obstacle (Punchy smack)
   */
  public playFlappyHit(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.11);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.11);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  /**
   * Sound: Flappy Bird Fall / Die (Slide whistle drop)
   */
  public playFlappyDie(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.28);

      gain.gain.setValueAtTime(0.28, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.29);
    } catch {}
  }

  /**
   * Sound: Achievement Unlocked Fanfare (Glorious 4-note retro chime)
   */
  public playAchievementUnlock(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.24, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.24);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch {}
  }

  /**
   * Sound: Block Blast - Nhấc / Chọn khối hình (Pop ấm)
   */
  public playBlockPickup(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  /**
   * Sound: Block Blast - Đặt khối vào bàn cờ (Thud gỗ / gạch chắc nịch)
   */
  public playBlockPlace(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.getDestination(ctx));

      osc.start();
      osc.stop(ctx.currentTime + 0.09);
    } catch {}
  }

  /**
   * Sound: Block Blast - Nổ hàng / cột (Blast ngân vang, cao dần và rộn rã theo combo streak)
   */
  public playBlockClearLine(comboStreak: number = 1): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      // Tần số cơ bản tăng vọt theo chuỗi combo (từ 320Hz lên hơn 1000Hz)
      const baseFreq = Math.min(1100, 320 + (comboStreak - 1) * 85);

      // Số nốt arpeggio dày dần theo cấp combo (combo càng cao âm thanh càng rộn rã)
      const notesCount = Math.min(6, 3 + Math.floor(comboStreak / 2));
      const intervals = [1, 1.25, 1.5, 1.75, 2.0, 2.25];
      const notes = intervals.slice(0, notesCount).map((factor) => baseFreq * factor);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Combo cao chuyển sang square/sawtooth tạo cảm giác arcade kịch tính
        osc.type = comboStreak >= 4 ? 'square' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.045);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.2, ctx.currentTime + idx * 0.045 + 0.14);

        const vol = Math.min(0.35, 0.22 + comboStreak * 0.02);
        gain.gain.setValueAtTime(vol, ctx.currentTime + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.045 + 0.16);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.045);
        osc.stop(ctx.currentTime + idx * 0.045 + 0.17);
      });

      // Thêm tiếng Bass Sub-hit uy lực cho Combo từ 4 trở lên
      if (comboStreak >= 4) {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(140, ctx.currentTime);
        subOsc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.22);
        subGain.gain.setValueAtTime(0.35, ctx.currentTime);
        subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        subOsc.connect(subGain);
        subGain.connect(this.getDestination(ctx));
        subOsc.start();
        subOsc.stop(ctx.currentTime + 0.23);
      }
    } catch {}
  }

  /**
   * Sound: Block Blast - Chuỗi Combo lớn (Fanfare vui nhộn)
   */
  public playBlockComboFanfare(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const chords = [523.25, 659.25, 783.99, 1046.5]; // C E G C
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.05);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.05 + 0.2);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.05);
        osc.stop(ctx.currentTime + idx * 0.05 + 0.22);
      });
    } catch {}
  }

  /**
   * Sound: Block Blast - Game Over (Descending retro synth)
   */
  public playBlockGameOver(): void {
    if (this.isMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const notes = [440, 415.3, 392, 349.2, 293.6]; // A4 -> Ab -> G -> F -> D
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, ctx.currentTime + idx * 0.1 + 0.14);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.14);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.15);
      });
    } catch {}
  }
}

export const sounds = new SoundService();
export const soundService = sounds;



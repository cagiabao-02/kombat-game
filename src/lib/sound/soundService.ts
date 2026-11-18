'use client';

export type BgmTheme = 'lobby' | 'arcade' | 'strategy' | 'none';

// Frequencies for procedural 8-bit chiptune synthesis (Hz)
const N = {
  _: 0, // Rest
  // Octave 2
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  // Octave 3
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  // Octave 4
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  // Octave 5
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  // Octave 6
  C6: 1046.50, D6: 1174.66, E6: 1318.51, G6: 1567.98,
};

interface BgmPattern {
  bpm: number;
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  lead: number[];
  bass: number[];
  percussion?: number[]; // 1 = hat, 2 = snare
}

const BGM_PATTERNS: Record<Exclude<BgmTheme, 'none'>, BgmPattern> = {
  // Theme 1: Lobby - Cheerful, relaxing 8-bit groove (104 BPM)
  lobby: {
    bpm: 104,
    leadWave: 'triangle',
    bassWave: 'triangle',
    lead: [
      N.C5, N._,  N.E5, N._,  N.G5, N._,  N.A5, N.G5,
      N._,  N.E5, N.D5, N._,  N.C5, N._,  N.D5, N._,
      N.E5, N._,  N.G5, N._,  N.A5, N._,  N.C6, N.A5,
      N.G5, N._,  N.E5, N.D5, N.C5, N._,  N._,  N._,
    ],
    bass: [
      N.C3, N._,  N.C3, N._,  N.G2, N._,  N.G2, N._,
      N.A2, N._,  N.A2, N._,  N.F2, N._,  N.G2, N._,
      N.C3, N._,  N.C3, N._,  N.G2, N._,  N.G2, N._,
      N.F2, N._,  N.F2, N._,  N.G2, N._,  N.C3, N._,
    ],
    percussion: [
      1, 0, 0, 0, 2, 0, 1, 0, 1, 0, 0, 0, 2, 0, 1, 0,
      1, 0, 0, 0, 2, 0, 1, 0, 1, 0, 0, 0, 2, 0, 1, 1,
    ],
  },

  // Theme 2: Arcade - Upbeat, energetic, driving chiptune (128 BPM)
  arcade: {
    bpm: 128,
    leadWave: 'triangle',
    bassWave: 'triangle',
    lead: [
      N.D5, N.D5, N.F5, N._,  N.A5, N._,  N.G5, N.F5,
      N.E5, N._,  N.D5, N.F5, N.E5, N.C5, N.D5, N._,
      N.D5, N.F5, N.A5, N._,  N.C6, N._,  N.D6, N.C6,
      N.A5, N._,  N.F5, N.G5, N.A5, N.F5, N.D5, N._,
    ],
    bass: [
      N.D2, N.D3, N.D2, N.D3, N.F2, N.F3, N.F2, N.F3,
      N.G2, N.G3, N.G2, N.G3, N.A2, N.A3, N.A2, N.A3,
      N.D2, N.D3, N.D2, N.D3, N.C2, N.C3, N.C2, N.C3,
      N.B2, N.B3, N.B2, N.B3, N.A2, N.G2, N.F2, N.E2,
    ],
    percussion: [
      2, 0, 1, 0, 2, 0, 1, 1, 2, 0, 1, 0, 2, 0, 1, 1,
      2, 0, 1, 0, 2, 0, 1, 1, 2, 0, 1, 0, 2, 1, 2, 1,
    ],
  },

  // Theme 3: Strategy - Ambient, calm, thoughtful lo-fi chiptune (76 BPM)
  strategy: {
    bpm: 76,
    leadWave: 'sine',
    bassWave: 'triangle',
    lead: [
      N.E4, N._,  N._,  N._,  N.G4, N._,  N.B4, N._,
      N.D5, N._,  N.C5, N._,  N.B4, N._,  N._,  N._,
      N.A4, N._,  N._,  N._,  N.G4, N._,  N.E4, N._,
      N.F4, N._,  N.E4, N._,  N.D4, N._,  N.E4, N._,
    ],
    bass: [
      N.E2, N._,  N._,  N._,  N.E2, N._,  N._,  N._,
      N.C2, N._,  N._,  N._,  N.C2, N._,  N._,  N._,
      N.G2, N._,  N._,  N._,  N.G2, N._,  N._,  N._,
      N.D2, N._,  N._,  N._,  N.D2, N._,  N.E2, N._,
    ],
  },
};

class SoundService {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private bgmFilter: BiquadFilterNode | null = null;

  // Sound Effects (SFX) state
  private sfxVolume: number = 0.7; // 0.0 -> 1.0
  private sfxMuted: boolean = false;

  // Background Music (BGM) state
  private bgmVolume: number = 0.45; // 0.0 -> 1.0
  private bgmMuted: boolean = false;

  // BGM Sequencer state
  private currentBgmTheme: BgmTheme = 'none';
  private targetBgmTheme: BgmTheme = 'none';
  private bgmTimer: ReturnType<typeof setInterval> | null = null;
  private bgmStepIndex: number = 0;
  private bgmNextStepTime: number = 0;
  private isDocumentVisible: boolean = true;
  private autoplayUnlocked: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        // Load SFX preferences
        const savedSfxMuted = localStorage.getItem('togame_sound_muted');
        this.sfxMuted = savedSfxMuted === 'true';

        const savedSfxVol = localStorage.getItem('kombat_sound_volume');
        if (savedSfxVol !== null) {
          const parsed = parseFloat(savedSfxVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.sfxVolume = parsed;
          }
        }

        // Load BGM preferences
        const savedBgmMuted = localStorage.getItem('kombat_bgm_muted');
        this.bgmMuted = savedBgmMuted === 'true';

        const savedBgmVol = localStorage.getItem('kombat_bgm_volume');
        if (savedBgmVol !== null) {
          const parsed = parseFloat(savedBgmVol);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
            this.bgmVolume = parsed;
          }
        }
      } catch {
        this.sfxMuted = false;
        this.sfxVolume = 0.7;
        this.bgmMuted = false;
        this.bgmVolume = 0.45;
      }

      // Pause audio processing when switching browser tabs
      document.addEventListener('visibilitychange', () => {
        this.isDocumentVisible = !document.hidden;
        if (document.hidden) {
          if (this.audioCtx && this.audioCtx.state === 'running') {
            this.audioCtx.suspend().catch(() => {});
          }
        } else {
          if (this.audioCtx && this.audioCtx.state === 'suspended' && this.currentBgmTheme !== 'none') {
            this.audioCtx.resume().catch(() => {});
          }
        }
      });

      // Browser autoplay unlock listeners
      this.setupAutoplayUnlock();
    }
  }

  private setupAutoplayUnlock(): void {
    if (typeof window === 'undefined' || this.autoplayUnlocked) return;

    const unlock = () => {
      if (this.autoplayUnlocked) return;
      this.autoplayUnlocked = true;

      const ctx = this.getAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          if (this.targetBgmTheme && this.targetBgmTheme !== 'none' && this.currentBgmTheme === 'none') {
            this.playBgm(this.targetBgmTheme);
          }
        }).catch(() => {});
      } else if (this.targetBgmTheme && this.targetBgmTheme !== 'none' && this.currentBgmTheme === 'none') {
        this.playBgm(this.targetBgmTheme);
      }

      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('click', unlock);
    };

    window.addEventListener('pointerdown', unlock, { passive: true });
    window.addEventListener('keydown', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('click', unlock, { passive: true });
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
      this.audioCtx.resume().catch(() => {});
    }

    return this.audioCtx;
  }

  private initGainNodes(ctx: AudioContext): void {
    if (this.masterGain) return;

    // Master bus
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
    this.masterGain.connect(ctx.destination);

    // SFX channel
    this.sfxGain = ctx.createGain();
    const effSfx = this.isSfxMuted() ? 0 : this.sfxVolume;
    this.sfxGain.gain.setValueAtTime(effSfx, ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    // BGM channel with warm 8-bit low-pass filter
    this.bgmFilter = ctx.createBiquadFilter();
    this.bgmFilter.type = 'lowpass';
    this.bgmFilter.frequency.setValueAtTime(2200, ctx.currentTime);
    this.bgmFilter.Q.setValueAtTime(1.0, ctx.currentTime);

    this.bgmGain = ctx.createGain();
    const effBgm = this.isBgmMuted() ? 0 : this.bgmVolume;
    this.bgmGain.gain.setValueAtTime(effBgm, ctx.currentTime);

    this.bgmFilter.connect(this.bgmGain);
    this.bgmGain.connect(this.masterGain);
  }

  private getDestination(ctx: AudioContext): AudioNode {
    this.initGainNodes(ctx);
    return this.sfxGain!;
  }

  private getBgmDestination(ctx: AudioContext): AudioNode {
    this.initGainNodes(ctx);
    return this.bgmFilter!;
  }

  private notifyChange(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('kombat:volume_change', {
          detail: {
            volume: this.sfxVolume, // Backward compatibility
            muted: this.sfxMuted,   // Backward compatibility
            sfxVolume: this.sfxVolume,
            sfxMuted: this.sfxMuted,
            bgmVolume: this.bgmVolume,
            bgmMuted: this.bgmMuted,
            theme: this.currentBgmTheme,
            isPlaying: this.isBgmPlaying(),
          },
        })
      );
    }
  }

  // ==========================================
  // SFX (Sound Effects) Volume Controls
  // ==========================================
  public isSfxMuted(): boolean {
    return this.sfxMuted || this.sfxVolume <= 0.001;
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  public setSfxVolume(val: number): void {
    const clamped = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
    this.sfxVolume = clamped;
    if (clamped <= 0.001) {
      this.sfxMuted = true;
    } else if (this.sfxMuted && clamped > 0.001) {
      this.sfxMuted = false;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kombat_sound_volume', clamped.toString());
        localStorage.setItem('togame_sound_muted', this.sfxMuted ? 'true' : 'false');
      } catch {}
    }

    if (this.sfxGain && this.audioCtx) {
      const eff = this.isSfxMuted() ? 0 : this.sfxVolume;
      this.sfxGain.gain.setValueAtTime(eff, this.audioCtx.currentTime);
    }

    this.notifyChange();
  }

  public setSfxMuted(muted: boolean): boolean {
    this.sfxMuted = muted;
    if (!this.sfxMuted && this.sfxVolume <= 0.05) {
      this.sfxVolume = 0.7;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('togame_sound_muted', this.sfxMuted ? 'true' : 'false');
        localStorage.setItem('kombat_sound_volume', this.sfxVolume.toString());
      } catch {}
    }

    if (this.sfxGain && this.audioCtx) {
      const eff = this.isSfxMuted() ? 0 : this.sfxVolume;
      this.sfxGain.gain.setValueAtTime(eff, this.audioCtx.currentTime);
    }

    this.notifyChange();
    return this.sfxMuted;
  }

  public toggleSfxMute(): boolean {
    return this.setSfxMuted(!this.sfxMuted);
  }

  // Backward compatibility alias methods
  public isMuted(): boolean {
    return this.isSfxMuted();
  }

  public getVolume(): number {
    return this.getSfxVolume();
  }

  public setVolume(val: number): void {
    this.setSfxVolume(val);
  }

  public setMuted(muted: boolean): boolean {
    return this.setSfxMuted(muted);
  }

  public toggleMute(): boolean {
    return this.toggleSfxMute();
  }

  // ==========================================
  // BGM (Background Music) Volume Controls
  // ==========================================
  public isBgmMuted(): boolean {
    return this.bgmMuted || this.bgmVolume <= 0.001;
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setBgmVolume(val: number): void {
    const clamped = Math.max(0, Math.min(1, Math.round(val * 100) / 100));
    this.bgmVolume = clamped;
    if (clamped <= 0.001) {
      this.bgmMuted = true;
    } else if (this.bgmMuted && clamped > 0.001) {
      this.bgmMuted = false;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kombat_bgm_volume', clamped.toString());
        localStorage.setItem('kombat_bgm_muted', this.bgmMuted ? 'true' : 'false');
      } catch {}
    }

    if (this.bgmGain && this.audioCtx) {
      const eff = this.isBgmMuted() ? 0 : this.bgmVolume;
      this.bgmGain.gain.setValueAtTime(eff, this.audioCtx.currentTime);
    }

    this.notifyChange();
  }

  public setBgmMuted(muted: boolean): boolean {
    this.bgmMuted = muted;
    if (!this.bgmMuted && this.bgmVolume <= 0.05) {
      this.bgmVolume = 0.45;
    }

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('kombat_bgm_muted', this.bgmMuted ? 'true' : 'false');
        localStorage.setItem('kombat_bgm_volume', this.bgmVolume.toString());
      } catch {}
    }

    if (this.bgmGain && this.audioCtx) {
      const eff = this.isBgmMuted() ? 0 : this.bgmVolume;
      this.bgmGain.gain.setValueAtTime(eff, this.audioCtx.currentTime);
    }

    this.notifyChange();
    return this.bgmMuted;
  }

  public toggleBgmMute(): boolean {
    return this.setBgmMuted(!this.bgmMuted);
  }

  // ==========================================
  // BGM Procedural Sequencer Engine
  // ==========================================
  private scheduleBgmNote(
    ctx: AudioContext,
    freq: number,
    time: number,
    duration: number,
    waveType: OscillatorType,
    maxGain: number
  ): void {
    if (freq <= 0) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = waveType;
      osc.frequency.setValueAtTime(freq, time);

      const attack = 0.015;
      const decay = duration * 0.85;

      gain.gain.setValueAtTime(0.0001, time);
      gain.gain.linearRampToValueAtTime(maxGain, time + attack);
      gain.gain.exponentialRampToValueAtTime(0.0001, time + attack + decay);

      osc.connect(gain);
      gain.connect(this.getBgmDestination(ctx));

      osc.start(time);
      osc.stop(time + attack + decay + 0.02);
    } catch {}
  }

  private scheduleBgmPercussion(ctx: AudioContext, type: number, time: number): void {
    if (!type) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 1) {
        // Soft 8-bit hi-hat tick
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, time);
        osc.frequency.exponentialRampToValueAtTime(400, time + 0.025);
        gain.gain.setValueAtTime(0.03, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.025);
        osc.connect(gain);
        gain.connect(this.getBgmDestination(ctx));
        osc.start(time);
        osc.stop(time + 0.03);
      } else {
        // Soft 8-bit snare pop
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(280, time);
        osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);
        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
        osc.connect(gain);
        gain.connect(this.getBgmDestination(ctx));
        osc.start(time);
        osc.stop(time + 0.06);
      }
    } catch {}
  }

  private startSequencer(theme: Exclude<BgmTheme, 'none'>): void {
    this.stopSequencer();
    const ctx = this.getAudioContext();
    if (!ctx) return;

    this.initGainNodes(ctx);
    const pattern = BGM_PATTERNS[theme];
    if (!pattern) return;

    this.currentBgmTheme = theme;
    this.bgmStepIndex = 0;
    this.bgmNextStepTime = ctx.currentTime + 0.05;

    const stepDuration = 60 / pattern.bpm / 4; // 16th note in seconds
    const scheduleAhead = 0.25; // 250ms lookahead window

    const scheduler = () => {
      if (!this.audioCtx || this.currentBgmTheme !== theme) return;
      if (!this.isDocumentVisible) return;

      while (this.bgmNextStepTime < this.audioCtx.currentTime + scheduleAhead) {
        const step = this.bgmStepIndex % 32;
        const time = this.bgmNextStepTime;

        // Schedule Lead Melody
        const leadFreq = pattern.lead[step];
        if (leadFreq > 0) {
          this.scheduleBgmNote(
            this.audioCtx,
            leadFreq,
            time,
            stepDuration * 1.5,
            pattern.leadWave,
            0.11
          );
        }

        // Schedule Bassline
        const bassFreq = pattern.bass[step];
        if (bassFreq > 0) {
          this.scheduleBgmNote(
            this.audioCtx,
            bassFreq,
            time,
            stepDuration * 1.8,
            pattern.bassWave,
            0.14
          );
        }

        // Schedule Percussion
        if (pattern.percussion) {
          const percType = pattern.percussion[step];
          if (percType) {
            this.scheduleBgmPercussion(this.audioCtx, percType, time);
          }
        }

        this.bgmStepIndex++;
        this.bgmNextStepTime += stepDuration;
      }
    };

    scheduler();
    this.bgmTimer = setInterval(scheduler, 50);
    this.notifyChange();
  }

  private stopSequencer(): void {
    if (this.bgmTimer) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  /**
   * Bật nhạc nền theo chủ đề.
   * Nếu đã đang chạy theme đó, giữ nguyên không ngắt quãng.
   */
  public playBgm(theme: BgmTheme): void {
    this.targetBgmTheme = theme;
    if (theme === 'none') {
      this.stopBgm();
      return;
    }

    if (this.currentBgmTheme === theme && this.bgmTimer) {
      return; // Đang chạy bài này rồi
    }

    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      this.setupAutoplayUnlock();
      return;
    }

    this.startSequencer(theme);
  }

  /**
   * Dừng hẳn nhạc nền
   */
  public stopBgm(): void {
    this.targetBgmTheme = 'none';
    this.currentBgmTheme = 'none';
    this.stopSequencer();
    this.notifyChange();
  }

  /**
   * Tạm dừng nhạc nền
   */
  public pauseBgm(): void {
    this.stopSequencer();
    this.notifyChange();
  }

  /**
   * Tiếp tục nhạc nền
   */
  public resumeBgm(): void {
    if (this.targetBgmTheme && this.targetBgmTheme !== 'none') {
      this.playBgm(this.targetBgmTheme);
    }
  }

  public getCurrentBgm(): BgmTheme {
    return this.currentBgmTheme;
  }

  public isBgmPlaying(): boolean {
    return this.currentBgmTheme !== 'none' && this.bgmTimer !== null && !this.isBgmMuted();
  }

  /**
   * Âm thanh thử nghiệm khi kéo thanh âm lượng SFX (8-bit chime nhẹ)
   */
  public playVolumePreview(): void {
    if (this.isSfxMuted()) return;
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
   * Âm thanh thử nghiệm khi kéo thanh âm lượng BGM (hợp âm 8-bit đôi nhẹ nhàng)
   */
  public playBgmVolumePreview(): void {
    if (this.isBgmMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      this.scheduleBgmNote(ctx, N.C5, t, 0.12, 'triangle', 0.14);
      this.scheduleBgmNote(ctx, N.G5, t + 0.07, 0.15, 'triangle', 0.14);
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

  /**
   * Sound: Cờ Vây - Gõ quân cờ đá lên bàn gỗ (Tactile stone placement clack)
   */
  public playGoStonePlace(): void {
    if (this.isSfxMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;

      // 1. Sharp high-frequency click (stone contact)
      const oscClick = ctx.createOscillator();
      const gainClick = ctx.createGain();
      oscClick.type = 'triangle';
      oscClick.frequency.setValueAtTime(880, t);
      oscClick.frequency.exponentialRampToValueAtTime(320, t + 0.035);
      gainClick.gain.setValueAtTime(0.3, t);
      gainClick.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      oscClick.connect(gainClick);
      gainClick.connect(this.getDestination(ctx));
      oscClick.start(t);
      oscClick.stop(t + 0.04);

      // 2. Resonant warm wood body thump
      const oscWood = ctx.createOscillator();
      const gainWood = ctx.createGain();
      oscWood.type = 'sine';
      oscWood.frequency.setValueAtTime(220, t);
      oscWood.frequency.exponentialRampToValueAtTime(110, t + 0.07);
      gainWood.gain.setValueAtTime(0.25, t);
      gainWood.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      oscWood.connect(gainWood);
      gainWood.connect(this.getDestination(ctx));
      oscWood.start(t);
      oscWood.stop(t + 0.08);
    } catch {}
  }

  /**
   * Sound: Cờ Vây - Bắt tù binh (Stones captured double clack)
   */
  public playGoStoneCapture(): void {
    if (this.isSfxMuted()) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const t = ctx.currentTime;
      // Two quick stone clacks in rapid succession
      [0, 0.07].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const baseFreq = idx === 0 ? 540 : 720;
        osc.frequency.setValueAtTime(baseFreq, t + delay);
        osc.frequency.exponentialRampToValueAtTime(280, t + delay + 0.05);

        gain.gain.setValueAtTime(0.22, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.05);

        osc.connect(gain);
        gain.connect(this.getDestination(ctx));

        osc.start(t + delay);
        osc.stop(t + delay + 0.06);
      });
    } catch {}
  }
}

export const sounds = new SoundService();
export const soundService = sounds;



// Web Audio API sound engine — 100% procedural, no audio files
// All methods are safe to call even before init() — they no-op silently.

type HitType = 'jab' | 'punch' | 'kick' | 'uppercut' | 'special'
type HurtType = 'hurt_light' | 'hurt_heavy'

// Note frequencies (Hz)
const N: Record<string, number> = {
  G2: 98.00,
  A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.26, F5: 698.46, G5: 783.99, A5: 880.00,
}

// 8-bit music sequences: [frequency, beats]
const LOVE_SEQUENCE: [number, number][] = [
  [N.C4, 1], [N.E4, 1], [N.G4, 1], [N.E4, 0.5], [N.D4, 0.5],
  [N.F4, 1], [N.A4, 1], [N.G4, 1], [N.E4, 1],
  [N.C5, 0.5], [N.B4, 0.5], [N.A4, 1], [N.G4, 1], [N.F4, 0.5], [N.E4, 0.5],
  [N.D4, 1], [N.G4, 1], [N.E4, 1], [N.C4, 2],
]

const GARBAGE_SEQUENCE: [number, number][] = [
  [N.A3, 0.5], [N.C4, 0.5], [N.E4, 1], [N.D4, 0.5], [N.C4, 0.5],
  [N.B3, 1], [N.A3, 0.5], [N.G3, 0.5], [N.A3, 0.5], [N.B3, 0.5],
  [N.F4, 1], [N.E4, 1], [N.D4, 0.5], [N.E4, 0.5],
  [N.A3, 2], [N.G3, 0.5], [N.A3, 0.5],
]

const LOVE_BPM = 144
const GARBAGE_BPM = 168

class SoundEngine {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private musicGain: GainNode | null = null
  private muted = false

  // Music scheduler state
  private musicSeq: [number, number][] = []
  private musicBpm = 144
  private musicIdx = 0
  private musicNextTime = 0
  private schedulerTimer: ReturnType<typeof setTimeout> | null = null
  private isPlayingMusic = false

  // ─── Init ───────────────────────────────────────────────────────────────

  init(): void {
    if (this.ctx) return
    try {
      this.ctx = new AudioContext()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.muted ? 0 : 1
      this.masterGain.connect(this.ctx.destination)

      this.musicGain = this.ctx.createGain()
      this.musicGain.gain.value = 0.055
      this.musicGain.connect(this.masterGain)
    } catch {
      // AudioContext not available (SSR or blocked)
    }
  }

  resume(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume()
    }
  }

  // ─── Mute ────────────────────────────────────────────────────────────────

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        muted ? 0 : 1,
        this.ctx!.currentTime,
        0.05
      )
    }
  }

  isMuted(): boolean {
    return this.muted
  }

  // ─── Low-level helpers ───────────────────────────────────────────────────

  private playTone(
    freq: number,
    durationMs: number,
    type: OscillatorType = 'square',
    gainPeak = 0.3,
    freqEnd?: number,
    delayMs = 0
  ): void {
    if (!this.ctx || !this.masterGain) return
    const start = this.ctx.currentTime + delayMs / 1000
    const dur = durationMs / 1000

    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()

    osc.type = type
    osc.frequency.setValueAtTime(freq, start)
    if (freqEnd !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, start + dur * 0.9)
    }

    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(gainPeak, start + 0.005)
    gain.gain.setValueAtTime(gainPeak, start + dur * 0.6)
    gain.gain.linearRampToValueAtTime(0, start + dur)

    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(start)
    osc.stop(start + dur + 0.01)
  }

  // ─── SFX ─────────────────────────────────────────────────────────────────

  playHit(type: HitType): void {
    if (!this.ctx) return
    this.resume()
    switch (type) {
      case 'jab':
        this.playTone(880, 80, 'square', 0.25)
        break
      case 'punch':
        this.playTone(440, 140, 'square', 0.3)
        this.playTone(660, 60, 'square', 0.12, undefined, 20)
        break
      case 'kick':
        this.playTone(220, 200, 'sawtooth', 0.3, 100)
        break
      case 'uppercut':
        this.playTone(330, 280, 'square', 0.28, 660)
        break
      case 'special':
        // Chord: C + E + G
        this.playTone(N.C4, 400, 'square', 0.18)
        this.playTone(N.E4, 400, 'square', 0.14)
        this.playTone(N.G4, 400, 'square', 0.12)
        // Sweeping noise burst
        this.playTone(1200, 180, 'sawtooth', 0.1, 300)
        break
    }
  }

  playHurt(type: HurtType): void {
    if (!this.ctx) return
    this.resume()
    if (type === 'hurt_light') {
      this.playTone(220, 120, 'square', 0.2, 180)
    } else {
      this.playTone(180, 280, 'sawtooth', 0.3, 80)
      this.playTone(120, 200, 'square', 0.15, 60, 80)
    }
  }

  playForbidden(): void {
    if (!this.ctx) return
    this.resume()
    // Descending error sound
    this.playTone(600, 120, 'square', 0.3, 400)
    this.playTone(300, 120, 'square', 0.25, 200, 120)
    this.playTone(150, 110, 'square', 0.2, 100, 240)
  }

  playCountdown(value: number): void {
    if (!this.ctx) return
    this.resume()
    if (value > 0) {
      // Tick
      this.playTone(440, 80, 'square', 0.25)
    } else {
      // ¡PELEA! — open chord
      this.playTone(N.C4, 300, 'square', 0.22)
      this.playTone(N.G4, 300, 'square', 0.16)
    }
  }

  playVictory(): void {
    if (!this.ctx) return
    this.resume()
    // Ascending fanfare: C E G C5 E5
    const notes = [N.C4, N.E4, N.G4, N.C5, N.E5]
    notes.forEach((freq, i) => {
      this.playTone(freq, 160, 'square', 0.25, undefined, i * 130)
    })
  }

  playDefeat(): void {
    if (!this.ctx) return
    this.resume()
    // Descending: G3 E3 C3 A2
    const notes = [N.G3, N.E3, N.C3, N.A2]
    notes.forEach((freq, i) => {
      this.playTone(freq, 200, 'square', 0.22, undefined, i * 160)
    })
  }

  // ─── Music scheduler (lookahead pattern) ─────────────────────────────────

  startMusic(mode: 'love' | 'garbage'): void {
    if (!this.ctx) return
    this.resume()
    this.stopMusic()

    this.musicSeq = mode === 'love' ? LOVE_SEQUENCE : GARBAGE_SEQUENCE
    this.musicBpm = mode === 'love' ? LOVE_BPM : GARBAGE_BPM
    this.musicIdx = 0
    this.musicNextTime = this.ctx.currentTime + 0.1
    this.isPlayingMusic = true

    this.scheduleLoop()
  }

  stopMusic(): void {
    this.isPlayingMusic = false
    if (this.schedulerTimer !== null) {
      clearTimeout(this.schedulerTimer)
      this.schedulerTimer = null
    }
  }

  private scheduleLoop(): void {
    if (!this.ctx || !this.musicGain || !this.isPlayingMusic) return

    const LOOKAHEAD = 0.15   // seconds ahead to schedule
    const INTERVAL_MS = 30   // how often scheduler runs

    const beatDuration = 60 / this.musicBpm

    while (this.musicNextTime < this.ctx.currentTime + LOOKAHEAD) {
      const [freq, beats] = this.musicSeq[this.musicIdx]
      const noteDuration = beats * beatDuration
      const noteGap = noteDuration * 0.88   // small gap between notes

      const osc = this.ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.value = freq

      const noteGain = this.ctx.createGain()
      noteGain.gain.setValueAtTime(0, this.musicNextTime)
      noteGain.gain.linearRampToValueAtTime(1, this.musicNextTime + 0.01)
      noteGain.gain.setValueAtTime(1, this.musicNextTime + noteGap * 0.7)
      noteGain.gain.linearRampToValueAtTime(0, this.musicNextTime + noteGap)

      osc.connect(noteGain)
      noteGain.connect(this.musicGain)
      osc.start(this.musicNextTime)
      osc.stop(this.musicNextTime + noteGap + 0.02)

      this.musicNextTime += noteDuration
      this.musicIdx = (this.musicIdx + 1) % this.musicSeq.length
    }

    this.schedulerTimer = setTimeout(() => this.scheduleLoop(), INTERVAL_MS)
  }
}

// Singleton — safe to import on client only
export const soundEngine = new SoundEngine()

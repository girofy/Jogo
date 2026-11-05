// Synthesized Audio Engine for Boi de Fuga — Sobradinho
// Generates authentic procedural sounds (hooves, bull snorts, rope whoosh, wind, water, whip, tension strum)
// and handles Gemini 3.8 Flash TTS playback.

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private isMuted: boolean = false;
  private hoofTimer: number = 0;
  private ambientGain: GainNode | null = null;
  private gallopRate: number = 1.0;

  constructor() {
    // Lazy init on first user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.engineGain.connect(this.masterGain);

      this.startAmbience();
    } catch (e) {
      console.warn('Web Audio API unavailable', e);
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  private startAmbience() {
    if (!this.ctx || !this.masterGain) return;
    // Sertão wind & caatinga rustle
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain);
    whiteNoise.start();
  }

  public setWaterLevel(factor: number) {
    // Increase breezy water presence on dam
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0.06 + factor * 0.1, this.ctx.currentTime, 0.5);
    }
  }

  // Realistic horse gallop (4-beat thud sequence: ca-ta-clop-clop on dirt/asphalt)
  public playHoofBeat(isAsphalt: boolean = false, speedRatio: number = 1.0) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isAsphalt ? 'triangle' : 'sine';
    const baseFreq = isAsphalt ? 90 + Math.random() * 30 : 65 + Math.random() * 25;
    osc.frequency.setValueAtTime(baseFreq * 2.2, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isAsphalt ? 900 : 450, now);

    gain.gain.setValueAtTime(0.4 * speedRatio, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Bull roar / snort
  public playBullSnort() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(75, now + 0.35);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.7);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(160, now);
    filter.Q.setValueAtTime(3, now);

    gain.gain.setValueAtTime(0.65, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 0.75);
  }

  // Rope throw whoosh (lasso whirling and whipping through the air)
  public playLassoThrow() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 0.18);
    filter.frequency.exponentialRampToValueAtTime(600, now + 0.35);
    filter.Q.setValueAtTime(4.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(now);
  }

  // Catch impact (rope grabbing bull's horns / neck)
  public playLassoCatch() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.25);

    // Whip snap
    this.playWhipCrack();
  }

  public playWhipCrack() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.015));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    noise.connect(gain);
    gain.connect(this.sfxGain!);
    noise.start(now);
  }

  // Strumming tension during struggle
  public playTensionStrum(good: boolean) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = good ? 'triangle' : 'sawtooth';
    const f = good ? 220 : 130;
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(f * (good ? 1.5 : 0.8), now + 0.18);

    gain.gain.setValueAtTime(good ? 0.7 : 0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Crash / stumble impact
  public playStumble() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain!);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Victory celebration chime / berrante horn call
  public playBerranteHorn() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [196, 261.6, 329.6, 392]; // G3 - C4 - E4 - G4 brassy chord
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);
      osc.frequency.linearRampToValueAtTime(freq * 1.02, now + idx * 0.18 + 0.6);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(freq * 3.5, now);

      gain.gain.setValueAtTime(0, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.18 + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.18 + 0.9);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 1.0);
    });
  }

  // Play audio buffer from base64 (Gemini 3.8 Flash TTS return)
  public async playBase64Audio(base64: string): Promise<void> {
    if (!this.ctx || this.isMuted) return;
    try {
      const binaryString = window.atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBuffer = await this.ctx.decodeAudioData(bytes.buffer.slice(0));
      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.masterGain!);
      source.start();
    } catch (e) {
      console.warn('Error decoding or playing base64 audio:', e);
    }
  }
}

export const sound = new SoundEngine();

// Motorcycle Engine Sound Synthesizer via Web Audio API
// Produces realistic engine exhaust harmonics, alternator whine, and spin-up acoustics

export class StatorAudio {
  constructor() {
    this.audioCtx = null;
    this.osc1 = null;
    this.osc2 = null;
    this.whineOsc = null;
    this.gainNode = null;
    this.isMuted = true;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();

      // Master Gain
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
      this.gainNode.connect(this.audioCtx.destination);

      // Low engine cylinder firing thrum (sawtooth)
      this.osc1 = this.audioCtx.createOscillator();
      this.osc1.type = 'sawtooth';

      // Harmonic rumble
      this.osc2 = this.audioCtx.createOscillator();
      this.osc2.type = 'triangle';

      // Alternator magnetic electrical whine (high pitched sine)
      this.whineOsc = this.audioCtx.createOscillator();
      this.whineOsc.type = 'sine';

      // Sub-gains
      this.whineGain = this.audioCtx.createGain();
      this.whineGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);

      this.osc1.connect(this.gainNode);
      this.osc2.connect(this.gainNode);
      this.whineOsc.connect(this.whineGain);
      this.whineGain.connect(this.gainNode);

      this.osc1.start();
      this.osc2.start();
      this.whineOsc.start();

      this.initialized = true;
    } catch (e) {
      console.warn("Web Audio not available", e);
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (!this.initialized && !muted) {
      this.init();
    }
    if (this.gainNode && this.audioCtx) {
      if (this.isMuted) {
        this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
      }
    }
  }

  updateRpm(rpm, isSpinning) {
    if (!this.initialized || this.isMuted || !this.audioCtx) return;

    if (!isSpinning) {
      this.gainNode.gain.setTargetAtTime(0, this.audioCtx.currentTime, 0.05);
      return;
    }

    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    // Engine firing frequency: 4-stroke twin/four cylinder
    // F_fire = (RPM / 60) * (cylinders / 2)
    const baseFreq = Math.max(20, (rpm / 60) * 1.5);
    const altFreq = Math.max(50, (rpm / 60) * 6); // stator slot passing frequency

    const now = this.audioCtx.currentTime;
    this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.03);
    this.osc2.frequency.setTargetAtTime(baseFreq * 2, now, 0.03);
    this.whineOsc.frequency.setTargetAtTime(altFreq, now, 0.03);

    // Dynamic volume
    this.gainNode.gain.setTargetAtTime(0.04, now, 0.03);
  }
}

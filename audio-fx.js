/**
 * MILBERT DEEP OCEAN AUDIO ENGINE
 * Synthesizes deep ocean hydrophone drone, sonar pings, and bubble pops
 * using pure Web Audio API without requiring any external mp3 files.
 */

class OceanAudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.ambientGain = null;
    this.ambientOsc = null;
    this.ambientNoise = null;
    this.filter = null;
    this.initDone = false;
  }

  // Initialize Audio Context on first user gesture
  init() {
    if (this.initDone) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.initDone = true;
    } catch (e) {
      console.warn("Web Audio API not supported in this browser.", e);
    }
  }

  // Toggle ambient hydrophone drone
  toggleAmbient() {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isMuted) {
      this.startAmbient();
      this.isMuted = false;
      this.playSonarPing(880, 0.8);
      return true;
    } else {
      this.stopAmbient();
      this.isMuted = true;
      return false;
    }
  }

  // Deep underwater hydrophone rumble generator (Pink noise + low sine drone)
  startAmbient() {
    if (!this.ctx) return;

    // Master ambient gain
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    this.ambientGain.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 2.5);
    this.ambientGain.connect(this.ctx.destination);

    // Deep sub bass drone oscillator (48Hz)
    this.ambientOsc = this.ctx.createOscillator();
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.setValueAtTime(52, this.ctx.currentTime);

    // Subtle LFO for breathing underwater swell effect
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // 5 sec swell cycle
    lfoGain.gain.setValueAtTime(6, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(this.ambientOsc.frequency);
    lfo.start();

    // Lowpass filter to simulate ocean depth absorption
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    this.filter.Q.setValueAtTime(3, this.ctx.currentTime);

    // Noise buffer for water turbulence
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    // Pink noise generation
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.04;
      b6 = white * 0.115926;
    }

    this.ambientNoise = this.ctx.createBufferSource();
    this.ambientNoise.buffer = noiseBuffer;
    this.ambientNoise.loop = true;

    // Connect noise through filter
    this.ambientNoise.connect(this.filter);
    this.ambientOsc.connect(this.filter);
    this.filter.connect(this.ambientGain);

    this.ambientNoise.start();
    this.ambientOsc.start();
  }

  // Gracefully stop ambient rumble
  stopAmbient() {
    if (!this.ctx || !this.ambientGain) return;
    this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.2);
    setTimeout(() => {
      if (this.ambientOsc) {
        try { this.ambientOsc.stop(); } catch(e) {}
      }
      if (this.ambientNoise) {
        try { this.ambientNoise.stop(); } catch(e) {}
      }
    }, 1300);
  }

  // Sonar Ping Tone Effect (Submarine Echo)
  playSonarPing(freq = 1200, duration = 1.2) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.98, this.ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  // Play Bubble Pop Sound
  playBubblePop(pitch = 500) {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Rapid upward chirp
    const startFreq = pitch + (Math.random() * 200 - 100);
    const endFreq = startFreq + 350;

    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
  }
}

// Global audio engine singleton
window.oceanAudio = new OceanAudioEngine();

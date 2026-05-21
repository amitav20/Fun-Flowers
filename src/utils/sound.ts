// Web Audio API Sound Synthesizer for Kids Offline Learning Hub
// Fully client-side, offline, requiring no external assets.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    // Standard AudioContext initialization
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const soundManager = {
  // Pop sound for popping balloons structure: short high-pitch chirp with sliding frequency
  playPop() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.09);
  },

  // Correct match: Sweet high-pitch dual arpeggio
  playCorrect() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.15, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };

    playTone(523.25, now, 0.15); // C5
    playTone(659.25, now + 0.08, 0.15); // E5
    playTone(783.99, now + 0.16, 0.25); // G5
  },

  // Wrong feedback: Low-pitched buzzer sound
  playWrong() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(100, now + 0.18);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  },

  // High achievements star sequence - cheerful rising bubbles/sweeps
  playSuccess() {
    const ctx = getAudioContext();
    if (!ctx) return;
    
    const now = ctx.currentTime;
    const freqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // C Major scale arpeggio
    
    freqs.forEach((freq, index) => {
      const start = now + index * 0.06;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.15);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(start);
      osc.stop(start + 0.2);
    });
  },

  // Interactive bubbles/tap button sounds
  playBubble() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  },

  // Celestial sparkle sound (great for achievements/stars)
  playSparkle() {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const bandpass = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(1200, now);

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.linearRampToValueAtTime(3000, now + 0.3);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  },

  // Animal voice synthesizer mimics - pure offline node synthesis
  playAnimalSound(animalId: string) {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    if (animalId === 'cow') {
      // Moo: low long pitch-slide sweeping downwards
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.6);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.61);
    } else if (animalId === 'duck') {
      // Quack Quack - double buzzy chirped tones
      const quack = (t: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, t);
        osc.frequency.linearRampToValueAtTime(260, t + 0.12);
        
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(750, t);
        
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.13);
      };
      quack(now);
      quack(now + 0.18);
    } else if (animalId === 'cat') {
      // Meow - gentle climbing frequency peak
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.4);
      
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.41);
    } else if (animalId === 'lion') {
      // Lion Roar - low growling flutter
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(85, now);
      for (let i = 0; i < 10; i++) {
        osc.frequency.setValueAtTime(80 + Math.random() * 35, now + i * 0.05);
      }
      
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, now);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.51);
    } else if (animalId === 'frog') {
      // Croak ribbit ribbit - twin gated bass clicks
      const croak = (t: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, t);
        osc.frequency.linearRampToValueAtTime(130, t + 0.07);
        
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, t);

        gain.gain.setValueAtTime(0.22, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
        
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      };
      croak(now);
      croak(now + 0.14);
    } else if (animalId === 'bird') {
      // Beautiful high-pitched bird chirps
      const chirp = (t: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1300, t);
        osc.frequency.exponentialRampToValueAtTime(2300, t + 0.07);
        
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.07);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.08);
      };
      chirp(now);
      chirp(now + 0.09);
      chirp(now + 0.18);
    } else if (animalId === 'sheep') {
      // Sheep bleat: buzzy flutter baaa-a
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      for (let i = 0; i < 8; i++) {
        osc.frequency.setValueAtTime(190 + (i % 2 === 0 ? 12 : -12), now + i * 0.05);
      }
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.41);
    } else {
      this.playBubble();
    }
  }
};

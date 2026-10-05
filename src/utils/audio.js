export const SOUND_PROFILES = {
  pop: { name: 'Soft Pop', icon: '🎵' },
  thock: { name: 'Mechanical Thock', icon: '🎹' },
  clicky: { name: 'Clicky Blue Switch', icon: '⚡' },
  typewriter: { name: 'Retro Typewriter', icon: '📜' },
  silent: { name: 'Silent Linear', icon: '🤫' },
};

export const playClickSound = (isErr = false, enabled = true, profile = 'thock') => {
  if (!enabled) return;

  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    const now = audioCtx.currentTime;

    // Jika Mengetik Salah (Error Sound)
    if (isErr) {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(now + 0.05);
      return;
    }

    // Profil Suara Berdasarkan Pilihan
    switch (profile) {
      case 'thock':
        // Deep & Bassy Mechanical Sound
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
        break;

      case 'clicky':
        // Crisp & Sharp Blue Switch Sound
        osc.type = 'square';
        osc.frequency.setValueAtTime(1800, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.02);

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1000, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);
        break;

      case 'typewriter':
        // Old Classical Typewriter Clack
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.06);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        break;

      case 'silent':
        // Super Muted & Quiet Linear Switch
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.03);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        break;

      case 'pop':
      default:
        // Original Gentle Pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(550, now);
        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        break;
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  } catch (e) {
    // Handling browser audio autoplay policy
  }
};
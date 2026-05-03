// Weapon fire: synthesized from WeaponSoundProfiles; no audio files needed; add profile per gun.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class AudioSystem {
    constructor() {
      this._ctx = null;
      this._bufferCache = Object.create(null);
    }

    _ensureContext() {
      if (!this._ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this._ctx = new AC();
      }
      if (this._ctx.state === "suspended") this._ctx.resume();
      return this._ctx;
    }

    /**
     * @param {string} [soundId] Maps to WeaponSoundProfiles and WeaponConfig.fireSoundId
     */
    playWeaponFire(soundId) {
      const profiles = TheGame.WeaponSoundProfiles;
      if (!soundId || !profiles || !profiles[soundId]) return;

      const profile = profiles[soundId];
      if (profile.kind === "buffer" && profile.url) {
        this._playDecodedUrl(profile.url, profile.gain ?? 0.5);
        return;
      }
      this._playSynthetic(profile);
    }

    playEnemyHit() {}

    _playSynthetic(profile) {
      const ctx = this._ensureContext();
      if (!ctx) return;

      const duration = profile.duration ?? 0.05;
      const sampleRate = ctx.sampleRate;
      const n = Math.max(1, Math.floor(sampleRate * duration));
      const noiseBuffer = ctx.createBuffer(1, n, sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < n; i += 1) {
        const t = i / n;
        const env = Math.pow(1 - t, 1.4);
        data[i] = (Math.random() * 2 - 1) * env;
      }

      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = profile.highpassFreq ?? 400;

      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = profile.bandpassFreq ?? 2000;
      bp.Q.value = profile.bandpassQ ?? 0.8;

      const gain = ctx.createGain();
      const peak = profile.gain ?? 0.35;
      const t0 = ctx.currentTime;
      const crackle = profile.crackle ?? 0.1;

      gain.gain.setValueAtTime(peak, t0);
      gain.gain.exponentialRampToValueAtTime(0.0008, t0 + duration * (0.55 + crackle * 0.35));
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration + 0.04);

      src.connect(hp);
      hp.connect(bp);
      bp.connect(gain);
      gain.connect(ctx.destination);

      src.start(t0);
      src.stop(t0 + duration + 0.06);
    }

    _playDecodedUrl(url, volume) {
      const ctx = this._ensureContext();
      if (!ctx) return;

      const cache = this._bufferCache;
      if (cache[url]) {
        this._playBuffer(cache[url], volume);
        return;
      }

      fetch(url)
        .then((r) => r.arrayBuffer())
        .then((ab) => ctx.decodeAudioData(ab))
        .then((buf) => {
          cache[url] = buf;
          this._playBuffer(buf, volume);
        })
        .catch(() => {});
    }

    _playBuffer(buffer, volume) {
      const ctx = this._ensureContext();
      if (!ctx || !buffer) return;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = volume;
      src.connect(g);
      g.connect(ctx.destination);
      const t = ctx.currentTime;
      src.start(t);
    }
  }

  TheGame.AudioSystem = AudioSystem;
})();

// Fire SFX: per fireSoundId synthesis params; add an entry here for new guns.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  TheGame.WeaponSoundProfiles = {
    hk416: {
      duration: 0.052,
      bandpassFreq: 2400,
      bandpassQ: 0.85,
      highpassFreq: 550,
      gain: 0.38,
      crackle: 0.12,
    },
    ak74: {
      duration: 0.068,
      bandpassFreq: 1150,
      bandpassQ: 0.62,
      highpassFreq: 320,
      gain: 0.41,
      crackle: 0.08,
    },
    awm: {
      duration: 0.095,
      bandpassFreq: 620,
      bandpassQ: 0.45,
      highpassFreq: 180,
      gain: 0.48,
      crackle: 0.04,
    },
    mp7: {
      duration: 0.036,
      bandpassFreq: 3100,
      bandpassQ: 0.98,
      highpassFreq: 720,
      gain: 0.33,
      crackle: 0.17,
    },
    beretta92f: {
      duration: 0.03,
      bandpassFreq: 4100,
      bandpassQ: 1.05,
      highpassFreq: 880,
      gain: 0.31,
      crackle: 0.2,
    },
    deagle: {
      duration: 0.055,
      bandpassFreq: 1650,
      bandpassQ: 0.72,
      highpassFreq: 420,
      gain: 0.43,
      crackle: 0.1,
    },
    glock18: {
      duration: 0.026,
      bandpassFreq: 4800,
      bandpassQ: 1.2,
      highpassFreq: 1100,
      gain: 0.29,
      crackle: 0.24,
    },
    ak47: {
      duration: 0.078,
      bandpassFreq: 980,
      bandpassQ: 0.55,
      highpassFreq: 280,
      gain: 0.44,
      crackle: 0.06,
    },
  };
})();

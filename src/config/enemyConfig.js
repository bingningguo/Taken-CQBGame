// Enemy archetypes are intentionally simple in this stage.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  TheGame.EnemyConfig = {
    defender: {
      id: "defender",
      name: "Defender",
      hp: 100,
      alertRadius: 4,
      activationRadius: 2.25,
      hearingRadius: 8,
      fireWindup: 0.5,
      fireRate: 1.15,
      accuracy: 0.42,
      damage: 12,
      turnSpeed: 5.5,
      eyeHeight: 1.35,
      fireSoundId: "ak47",
      stateColors: {
        idle: 0x54615a,
        alert: 0xd6b13d,
        activated: 0xf07a24,
        attack: 0xff2e2e,
        dead: 0x252525,
      },
    },
    rangeTarget: {
      id: "rangeTarget",
      name: "Paper target",
      hp: 520,
      passive: true,
      alertRadius: 0,
      activationRadius: 0,
      hearingRadius: 0,
      fireWindup: 999,
      fireRate: 999,
      accuracy: 0,
      damage: 0,
      turnSpeed: 0,
      eyeHeight: 0,
      fireSoundId: "ak47",
      stateColors: {
        idle: 0xe8e4d8,
        alert: 0xe8e4d8,
        activated: 0xd8d4c8,
        attack: 0xd8d4c8,
        dead: 0x3a3a36,
      },
    },
  };
})();

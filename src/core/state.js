// Shared runtime state. Systems read and write through this object instead of
// scattering gameplay values through main.js.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  function buildWeaponInventory(primaryId, secondaryId) {
    const p = TheGame.WeaponConfig[primaryId];
    const s = TheGame.WeaponConfig[secondaryId];
    if (!p || !s || p.slot !== "primary" || s.slot !== "secondary") {
      throw new Error("Invalid loadout: need one primary and one secondary id.");
    }
    return {
      primaryId: p.id,
      secondaryId: s.id,
      currentId: p.id,
      name: p.name,
      status: "READY",
      adsActive: false,
      scopeMagLabel: "",
      inventory: {
        [p.id]: { ammoInMag: p.magazineSize, reserveAmmo: p.reserveAmmo },
        [s.id]: { ammoInMag: s.magazineSize, reserveAmmo: s.reserveAmmo },
      },
    };
  }

  /**
   * @param {string} [primaryId]
   * @param {string} [secondaryId]
   * @param {object} [options]
   * @param {boolean} [options.seriousMode] One-life / fail on player HP 0
   */
  function createGameState(primaryId, secondaryId, options = {}) {
    const mission = TheGame.MissionConfig.defaultMission;
    const pId = primaryId || "m4a1";
    const sId = secondaryId || "beretta92f";
    const weapon = buildWeaponInventory(pId, sId);

    return {
      mode: "mission",
      run: {
        seriousMode: !!options.seriousMode,
      },
      player: {
        hp: 100,
        score: 0,
        carryingHostage: false,
        casualDownTriggered: false,
      },
      weapon,
      enemy: {
        activeCount: 0,
      },
      hostage: {
        status: "waiting",
        prompt: "",
        carrying: false,
        extractionCountdown: null,
        hp: 50,
        maxHp: 50,
      },
      mission: {
        id: mission.id,
        name: mission.name,
        status: mission.status,
      },
      ui: {
        pointerLocked: false,
        statusText: "CLICK TO LOCK MOUSE",
        casualDownShown: false,
        playerDeathShown: false,
        gameplayFrozen: false,
      },
    };
  }

  function createRangeGameState() {
    const mission = TheGame.MissionConfig.defaultMission;
    const order = Object.values(TheGame.WeaponConfig)
      .slice()
      .sort((a, b) => {
        if (a.slot !== b.slot) return a.slot === "primary" ? -1 : 1;
        return a.id.localeCompare(b.id);
      })
      .map((w) => w.id);

    const inventory = {};
    order.forEach((id) => {
      const w = TheGame.WeaponConfig[id];
      inventory[id] = {
        ammoInMag: w.magazineSize,
        reserveAmmo: w.reserveAmmo,
      };
    });

    const firstPrimary = order.find((id) => TheGame.WeaponConfig[id].slot === "primary");
    const firstSecondary = order.find((id) => TheGame.WeaponConfig[id].slot === "secondary");
    const startId = order[0];
    const startW = TheGame.WeaponConfig[startId];

    const weapon = {
      primaryId: firstPrimary,
      secondaryId: firstSecondary,
      currentId: startId,
      name: startW.name,
      status: "READY",
      adsActive: false,
      scopeMagLabel: "",
      inventory,
      rangeWeaponOrder: order,
    };

    return {
      mode: "range",
      run: {
        seriousMode: false,
      },
      player: {
        hp: 100,
        score: 0,
        carryingHostage: false,
        casualDownTriggered: false,
      },
      weapon,
      enemy: {
        activeCount: 0,
      },
      hostage: {
        status: "waiting",
        prompt: "",
        carrying: false,
        extractionCountdown: null,
        hp: 50,
        maxHp: 50,
      },
      mission: {
        id: mission.id,
        name: "Shooting range",
        status: mission.status,
      },
      ui: {
        pointerLocked: false,
        statusText: "RANGE",
        casualDownShown: false,
        playerDeathShown: false,
        gameplayFrozen: false,
      },
    };
  }

  TheGame.createGameState = createGameState;
  TheGame.createRangeGameState = createRangeGameState;
  TheGame.buildWeaponInventory = buildWeaponInventory;
})();

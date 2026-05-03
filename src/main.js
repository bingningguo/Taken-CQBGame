// Application entry point: main menu → mission / range → game loop.
(function () {
  const canvas = document.getElementById("game");
  const sensitivityEl = document.getElementById("sensitivity");
  const helpEl = document.getElementById("help");
  const menu = document.getElementById("mainMenu");
  const menuPrimaryGrid = document.getElementById("menuPrimaryGrid");
  const menuSecondaryGrid = document.getElementById("menuSecondaryGrid");
  const menuPrimaryDetail = document.getElementById("menuPrimaryDetail");
  const menuSecondaryDetail = document.getElementById("menuSecondaryDetail");
  const menuStart = document.getElementById("menuStart");
  const menuRange = document.getElementById("menuRange");
  const backToMenuBtn = document.getElementById("backToMenuBtn");
  const rangeWeaponHud = document.getElementById("rangeWeaponHud");
  const rangeWeaponList = document.getElementById("rangeWeaponList");
  const menuSerious = document.getElementById("menuSerious");
  const seriousModeHint = document.getElementById("seriousModeHint");
  const playerDownBanner = document.getElementById("playerDownBanner");

  /** Set only from showCasualPlayerDown (normal mission, HP reached 0 once). */
  /** Tab session only: closing the tab clears; new visit must earn unlock again. */
  const SS_FOR_REAL_UNLOCK = "taken_unlock_for_real_after_casual_down";

  const HELP_MISSION =
    "Click to lock mouse · WASD move · Space jump · Q/E lean · O door · LMB fire · R reload · 1/2 primary/secondary · AWM: RMB scope, wheel 2x/4x";
  const HELP_RANGE =
    "Range: number keys above to swap (refills ammo) · LMB fire · R reload · AWM: RMB scope, wheel zoom · click to lock mouse";

  let selectedPrimaryId = "m4a1";
  let selectedSecondaryId = "beretta92f";

  let gameStarted = false;
  let rafId = 0;
  let state = null;
  let audio = null;
  let context = null;
  let level = null;
  let meshCollisionSystem = null;
  let glbMapLoader = null;
  let input = null;
  let player = null;
  let enemyView = null;
  let effectsView = null;
  let weaponView = null;
  let enemySystem = null;
  let weaponSystem = null;
  let hostageSystem = null;
  let missionSystem = null;
  let colliderEditorSystem = null;
  let uiSystem = null;
  let lastTime = performance.now();
  let doorToggleWasDown = false;

  const isColliderEditorEnabled = () =>
    TheGame.GameConfig.colliderEditor && TheGame.GameConfig.colliderEditor.enabled;

  function formatWeaponDetailHtml(w) {
    if (!w) return "";
    const rpmLine =
      w.fireRateRPM != null
        ? `<li>Fire rate: <strong>${w.fireRateRPM}</strong> RPM`
          + (w.fireMode === "burst" ? " (3-round burst)" : "")
          + "</li>"
        : "";
    const roleLine = w.role ? `<li>Role: <span>${w.role}</span></li>` : "";
    return (
      `<div class="weapon-detail-name">${w.name}</div>` +
      "<ul class=\"weapon-detail-stats\">" +
      rpmLine +
      `<li>Reload: <strong>${w.reloadTime.toFixed(2)}</strong> s</li>` +
      `<li>Damage: <strong>${w.damage}</strong></li>` +
      `<li>Reserve: <strong>${w.reserveAmmo}</strong> (mag ${w.magazineSize})</li>` +
      roleLine +
      "</ul>"
    );
  }

  function refreshPrimaryDetail() {
    const w = TheGame.WeaponConfig[selectedPrimaryId];
    menuPrimaryDetail.innerHTML = formatWeaponDetailHtml(w);
  }

  function refreshSecondaryDetail() {
    const w = TheGame.WeaponConfig[selectedSecondaryId];
    menuSecondaryDetail.innerHTML = formatWeaponDetailHtml(w);
  }

  function selectPrimaryWeapon(id) {
    if (!TheGame.WeaponConfig[id] || TheGame.WeaponConfig[id].slot !== "primary") return;
    selectedPrimaryId = id;
    menuPrimaryGrid.querySelectorAll(".weapon-card").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.weaponId === id);
    });
    refreshPrimaryDetail();
  }

  function selectSecondaryWeapon(id) {
    if (!TheGame.WeaponConfig[id] || TheGame.WeaponConfig[id].slot !== "secondary") return;
    selectedSecondaryId = id;
    menuSecondaryGrid.querySelectorAll(".weapon-card").forEach((el) => {
      el.classList.toggle("is-selected", el.dataset.weaponId === id);
    });
    refreshSecondaryDetail();
  }

  function populateLoadoutMenu() {
    menuPrimaryGrid.innerHTML = "";
    menuSecondaryGrid.innerHTML = "";

    Object.values(TheGame.WeaponConfig).forEach((w) => {
      if (w.slot !== "primary") return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "weapon-card";
      btn.dataset.weaponId = w.id;
      btn.innerHTML = `<span class="weapon-card-name">${w.name}</span>`;
      btn.addEventListener("click", () => selectPrimaryWeapon(w.id));
      menuPrimaryGrid.appendChild(btn);
    });

    Object.values(TheGame.WeaponConfig).forEach((w) => {
      if (w.slot !== "secondary") return;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "weapon-card";
      btn.dataset.weaponId = w.id;
      btn.innerHTML = `<span class="weapon-card-name">${w.name}</span>`;
      btn.addEventListener("click", () => selectSecondaryWeapon(w.id));
      menuSecondaryGrid.appendChild(btn);
    });

    selectPrimaryWeapon(selectedPrimaryId);
    selectSecondaryWeapon(selectedSecondaryId);
  }

  function teardownGame() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    if (input) {
      input.destroy();
      input = null;
    }
    if (typeof document.exitPointerLock === "function") {
      document.exitPointerLock();
    }
    if (context && typeof context.dispose === "function") {
      context.dispose();
    }
    context = null;
    level = null;
    meshCollisionSystem = null;
    glbMapLoader = null;
    player = null;
    enemyView = null;
    effectsView = null;
    weaponView = null;
    enemySystem = null;
    weaponSystem = null;
    hostageSystem = null;
    missionSystem = null;
    colliderEditorSystem = null;
    uiSystem = null;
    state = null;
    audio = null;
    gameStarted = false;
    doorToggleWasDown = false;
    hideRangeWeaponLegend();
    if (playerDownBanner) playerDownBanner.classList.add("is-hidden");
    document.querySelectorAll(".overlay.victory, .overlay.defeat").forEach((el) => el.remove());
  }

  function syncSeriousModeMenu() {
    const unlocked =
      typeof sessionStorage !== "undefined" &&
      sessionStorage.getItem(SS_FOR_REAL_UNLOCK) === "1";
    if (menuSerious) menuSerious.classList.toggle("is-hidden", !unlocked);
    if (seriousModeHint) seriousModeHint.classList.toggle("is-hidden", !unlocked);
  }

  function showCasualPlayerDown() {
    if (!state || state.mode !== "mission" || state.run.seriousMode) return;
    if (state.ui.casualDownShown) return;
    state.ui.casualDownShown = true;
    state.player.casualDownTriggered = true;
    try {
      sessionStorage.setItem(SS_FOR_REAL_UNLOCK, "1");
    } catch (_e) {
      /* ignore */
    }
    syncSeriousModeMenu();
    if (playerDownBanner) playerDownBanner.classList.remove("is-hidden");
  }

  function showSeriousPlayerDeath() {
    if (!state || !state.run.seriousMode || state.ui.playerDeathShown) return;
    state.ui.playerDeathShown = true;
    state.ui.gameplayFrozen = true;
    state.mission.status = "FAILED";

    if (typeof document.exitPointerLock === "function") document.exitPointerLock();

    const overlay = document.createElement("div");
    overlay.className = "overlay defeat player-death";
    overlay.innerHTML = `
      <div class="panel">
        <p class="eyebrow">Mission failed</p>
        <h1>Operator down</h1>
        <p id="overlayText">No retakes. Serious mode does not cut away.</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  function handlePlayerVitals() {
    if (!state || state.mode !== "mission" || state.player.hp > 0) return;
    if (state.run.seriousMode) showSeriousPlayerDeath();
    else showCasualPlayerDown();
  }

  function showRangeWeaponLegend() {
    if (!rangeWeaponHud || !rangeWeaponList || !state || !state.weapon.rangeWeaponOrder) return;
    rangeWeaponList.innerHTML = "";
    state.weapon.rangeWeaponOrder.forEach((weaponId, i) => {
      const w = TheGame.WeaponConfig[weaponId];
      if (!w) return;
      const li = document.createElement("li");
      const slotShort = w.slot === "primary" ? "PRI" : "SEC";
      li.innerHTML =
        `<span class="range-key">${i + 1}</span>` +
        `<span class="range-name">${w.name}</span>` +
        `<span class="range-slot">${slotShort}</span>`;
      rangeWeaponList.appendChild(li);
    });
    rangeWeaponHud.classList.remove("is-hidden");
  }

  function hideRangeWeaponLegend() {
    if (rangeWeaponHud) rangeWeaponHud.classList.add("is-hidden");
    if (rangeWeaponList) rangeWeaponList.innerHTML = "";
  }

  function startOrRestartSession(setupFn) {
    teardownGame();
    setupFn();
    gameStarted = true;
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  function wireInput() {
    input = new TheGame.InputController(canvas, {
      pointerLockEnabled: !isColliderEditorEnabled(),
      mouseSensitivity:
        TheGame.GameConfig.mouseSensitivity.base +
        Number(sensitivityEl.value) * TheGame.GameConfig.mouseSensitivity.step,
      onPointerLockChange(isLocked) {
        state.ui.pointerLocked = isLocked;
      },
    });
  }

  function wireCombatAndUi() {
    enemyView = new TheGame.EnemyView();
    effectsView = new TheGame.EffectsView();
    weaponView = new TheGame.WeaponView(context.scene, context.camera);
    weaponView.setWeapon(state.weapon.currentId);

    enemySystem = new TheGame.EnemySystem(level.enemies, state, enemyView, audio, {
      player,
      meshCollisionSystem,
      effectsView,
    });

    hostageSystem = new TheGame.HostageSystem(state, level, player, enemySystem, context.scene, effectsView);

    weaponSystem = new TheGame.WeaponSystem(
      context.camera,
      enemySystem,
      state,
      effectsView,
      audio,
      weaponView,
      player,
      hostageSystem
    );

    missionSystem = new TheGame.MissionSystem(state);
    colliderEditorSystem = new TheGame.ColliderEditorSystem(
      context.scene,
      context.camera,
      context.renderer
    );
    colliderEditorSystem.init();

    uiSystem = new TheGame.UiSystem(
      {
        health: document.getElementById("health"),
        ammo: document.getElementById("ammoPanel"),
        weapon: document.getElementById("weapon"),
        hostage: document.getElementById("hostageStatus"),
        mouse: document.getElementById("mouseStatus"),
        prompt: document.getElementById("interactionPrompt"),
        countdown: document.getElementById("extractionCountdown"),
        scopeHint: document.getElementById("scopeHint"),
      },
      state,
      level,
      player
    );

    uiSystem.update();
  }

  function initMissionGame(primaryId, secondaryId, seriousMode = false) {
    state = TheGame.createGameState(primaryId, secondaryId, { seriousMode });
    audio = new TheGame.AudioSystem();

    context = TheGame.createThreeContext(canvas);
    level = TheGame.buildCQBLevel(context.scene);
    if (TheGame.GameConfig.clearLevelEnemiesOnStart) {
      clearLevelEnemies(level, context.scene);
    }
    meshCollisionSystem = new TheGame.MeshCollisionSystem();
    glbMapLoader = new TheGame.GlbMapLoader(context.scene, level);
    glbMapLoader.load().then((map) => {
      if (map) meshCollisionSystem.buildFromMap(map);
    });

    wireInput();

    player = new TheGame.PlayerSystem(context.camera, input, level.colliders, level.spawn, {
      getFloorHeightAt: level.getFloorHeightAt,
      meshCollisionSystem,
    });
    applyPlayerConfig(player);

    wireCombatAndUi();

    if (helpEl) {
      helpEl.textContent = seriousMode
        ? `${HELP_MISSION} · Serious run: HP 0 ends the mission.`
        : HELP_MISSION;
    }
    console.info("Mission started", { primaryId, secondaryId, seriousMode, state: state.weapon });
  }

  function initRangeGame() {
    state = TheGame.createRangeGameState();
    audio = new TheGame.AudioSystem();

    context = TheGame.createThreeContext(canvas);
    level = TheGame.buildShootingRangeLevel(context.scene);

    meshCollisionSystem = new TheGame.MeshCollisionSystem();
    const glbCfg = TheGame.GameConfig.glbMap;
    const prevGlbEnabled = glbCfg.enabled;
    glbCfg.enabled = false;
    glbMapLoader = new TheGame.GlbMapLoader(context.scene, level);
    glbMapLoader.load().then((map) => {
      if (map) meshCollisionSystem.buildFromMap(map);
    });
    glbCfg.enabled = prevGlbEnabled;

    wireInput();

    player = new TheGame.PlayerSystem(context.camera, input, level.colliders, level.spawn, {
      getFloorHeightAt: level.getFloorHeightAt,
      meshCollisionSystem,
    });
    applyPlayerConfig(player, level.spawn);

    wireCombatAndUi();

    if (helpEl) helpEl.textContent = HELP_RANGE;
    showRangeWeaponLegend();
    console.info("Range started", state.weapon.rangeWeaponOrder);
  }

  function handleDoorToggle() {
    const doorToggleDown = input.isDown("KeyO");
    if (doorToggleDown && !doorToggleWasDown) {
      level.toggleNearestDoor(player.position);
    }
    doorToggleWasDown = doorToggleDown;
  }

  function update(deltaTime) {
    if (!gameStarted || !input) return;

    input.mouseSensitivity =
      TheGame.GameConfig.mouseSensitivity.base +
      Number(sensitivityEl.value) * TheGame.GameConfig.mouseSensitivity.step;

    const frozen = state && state.ui && state.ui.gameplayFrozen;

    if (!isColliderEditorEnabled()) {
      if (!frozen) {
        handleDoorToggle();
        weaponSystem.update(deltaTime, input);
        player.update(deltaTime);
      }
    }

    if (!frozen) {
      level.update(deltaTime, player.position);
      enemySystem.update(deltaTime);
      hostageSystem.update(deltaTime, input);
    }

    missionSystem.update(deltaTime);
    weaponView.update(deltaTime);
    colliderEditorSystem.update(deltaTime);
    handlePlayerVitals();
    uiSystem.update();
  }

  function render() {
    if (!context) return;
    context.renderer.render(context.scene, context.camera);
  }

  function loop(time) {
    const deltaTime = Math.min(0.05, (time - lastTime) / 1000);
    lastTime = time;

    update(deltaTime);
    render();
    rafId = requestAnimationFrame(loop);
  }

  function clearLevelEnemies(lvl, scene) {
    lvl.enemies.forEach((enemy) => {
      scene.remove(enemy);
    });
    lvl.enemies.length = 0;
  }

  /** @param {object} [spawnOverride] Same shape as level.spawn: eye position, yaw. */
  function applyPlayerConfig(pl, spawnOverride) {
    const config = TheGame.GameConfig.player || {};
    if (config.height) pl.config.height = config.height;
    if (config.radius) pl.config.radius = config.radius;

    if (spawnOverride && spawnOverride.position) {
      const p = spawnOverride.position;
      const eyeY = p.y;
      pl.position.set(p.x, eyeY, p.z);
      pl.groundHeight = eyeY - pl.config.height;
      pl.velocityY = 0;
      pl.onGround = true;
      if (typeof spawnOverride.yaw === "number") pl.yaw = spawnOverride.yaw;
      pl.updateCamera();
      return;
    }

    if (config.spawn && config.spawn.position) {
      const position = config.spawn.position;
      pl.position.set(position.x, position.y + pl.config.height, position.z);
      pl.groundHeight = position.y;
      pl.velocityY = 0;
      pl.onGround = true;
    }

    if (config.spawn && typeof config.spawn.yaw === "number") {
      pl.yaw = config.spawn.yaw;
    }
    pl.updateCamera();
  }

  function returnToMainMenu() {
    teardownGame();
    menu.classList.remove("is-hidden");
    document.body.classList.add("menu-open");
    syncSeriousModeMenu();
  }

  populateLoadoutMenu();
  syncSeriousModeMenu();
  document.body.classList.add("menu-open");

  menuStart.addEventListener("click", () => {
    menu.classList.add("is-hidden");
    document.body.classList.remove("menu-open");
    startOrRestartSession(() => initMissionGame(selectedPrimaryId, selectedSecondaryId, false));
  });

  if (menuSerious) {
    menuSerious.addEventListener("click", () => {
      menu.classList.add("is-hidden");
      document.body.classList.remove("menu-open");
      startOrRestartSession(() => initMissionGame(selectedPrimaryId, selectedSecondaryId, true));
    });
  }

  menuRange.addEventListener("click", () => {
    menu.classList.add("is-hidden");
    document.body.classList.remove("menu-open");
    startOrRestartSession(() => initRangeGame());
  });

  backToMenuBtn.addEventListener("click", () => {
    returnToMainMenu();
  });
})();

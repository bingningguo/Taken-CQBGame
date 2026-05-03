// Hostage rescue core loop: secure the hostage, extract at spawn, win.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class HostageSystem {
    constructor(state, level, player, enemySystem, scene, effectsView) {
      this.state = state;
      this.level = level;
      this.player = player;
      this.enemySystem = enemySystem;
      this.scene = scene;
      this.effectsView = effectsView || null;
      this.eWasDown = false;
      this.hostage = level.hostages && level.hostages.length > 0 ? level.hostages[0] : null;
      this.extractionMarker = null;
      this.reinforcementsSpawned = false;
      this.extractTimer = 0;
      this.config = {
        secureDistance: 2.2,
        extractionRadius: 3.2,
        extractionTime: 5,
      };
      this.initializeHostage();
    }

    initializeHostage() {
      this.state.hostage.status = "waiting";
      this.state.hostage.prompt = "";
      this.state.hostage.carrying = false;
      this.state.hostage.extractionCountdown = null;
      const max = this.state.hostage.maxHp != null ? this.state.hostage.maxHp : 50;
      if (this.state.hostage.hp == null) this.state.hostage.hp = max;
      this.state.hostage.maxHp = max;

      if (!this.hostage) return;
      this.hostage.userData.hostage = {
        ...(this.hostage.userData.hostage || {}),
        status: "waiting",
        alive: true,
      };
    }

    isHostageObject(object) {
      if (!this.hostage || !object) return false;
      let cur = object;
      while (cur) {
        if (cur === this.hostage) return true;
        cur = cur.parent;
      }
      return false;
    }

    damageHostage(amount) {
      if (
        this.state.mode !== "mission" ||
        !this.hostage ||
        this.state.hostage.status === "dead" ||
        this.state.hostage.status === "extracted"
      ) {
        return;
      }
      if (!this.hostage.visible) return;

      const dmg = Math.max(0, Number(amount) || 0);
      this.state.hostage.hp = Math.max(0, (this.state.hostage.hp ?? this.state.hostage.maxHp) - dmg);
      if (this.effectsView) this.effectsView.enemyHitBody();

      if (this.state.hostage.hp <= 0) {
        this.state.hostage.status = "dead";
        this.state.hostage.hp = 0;
        if (this.hostage.userData.hostage) this.hostage.userData.hostage.alive = false;
        this.state.mission.status = "FAILED";
        this.hostage.visible = false;
        this.showFailureOverlay();
      }
    }

    update(deltaTime, input) {
      this.state.hostage.prompt = "";
      if (
        !this.hostage ||
        this.state.hostage.status === "extracted" ||
        this.state.hostage.status === "dead"
      ) {
        return;
      }

      const eDown = input.isDown("KeyE");
      if (this.state.hostage.status === "waiting") {
        this.updateWaiting(eDown);
      } else if (this.state.hostage.status === "secured") {
        this.updateExtraction(deltaTime);
      }
      this.eWasDown = eDown;
    }

    updateWaiting(eDown) {
      const distance = this.hostage.position.distanceTo(this.player.position);
      const hostageData = this.hostage.userData.hostage;
      if (distance > this.config.secureDistance || hostageData.alive === false) return;

      this.state.hostage.prompt = "Press E to secure hostage";
      if (eDown && !this.eWasDown) this.secureHostage();
    }

    secureHostage() {
      this.state.hostage.status = "secured";
      this.state.hostage.carrying = true;
      this.state.player.carryingHostage = true;
      this.state.mission.status = "EXTRACT THE HOSTAGE to where you come from";

      this.hostage.userData.hostage.status = "secured";
      this.hostage.visible = false;
      this.createExtractionMarker();
      this.spawnReinforcements();
    }

    updateExtraction(deltaTime) {
      const extractionPoint = this.getExtractionPoint();
      const playerFeet = this.getPlayerFeetPosition();
      const distance = playerFeet.distanceTo(extractionPoint);

      if (distance <= this.config.extractionRadius) {
        this.extractTimer += deltaTime;
        const remaining = Math.max(0, this.config.extractionTime - this.extractTimer);
        this.state.hostage.extractionCountdown = remaining;
        this.state.hostage.prompt = `EXTRACTING ${Math.ceil(remaining)}`;
        if (this.extractTimer >= this.config.extractionTime) this.extractHostage();
      } else {
        this.extractTimer = 0;
        this.state.hostage.extractionCountdown = null;
        this.state.hostage.prompt = "Carry hostage to extraction point";
      }
    }

    extractHostage() {
      this.state.hostage.status = "extracted";
      this.state.hostage.carrying = false;
      this.state.player.carryingHostage = false;
      this.state.mission.status = "HOSTAGE EXTRACTED";
      this.state.player.score += 1000;
      this.showVictoryOverlay();
    }

    createExtractionMarker() {
      if (this.extractionMarker) return;

      const point = this.getExtractionPoint();
      const group = new THREE.Group();
      group.name = "hostage_extraction_marker";

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(this.config.extractionRadius - 0.15, this.config.extractionRadius, 48),
        new THREE.MeshBasicMaterial({ color: 0x45ff6a, transparent: true, opacity: 0.82, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      group.add(ring);

      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 2.4, 12),
        new THREE.MeshBasicMaterial({ color: 0x45ff6a, transparent: true, opacity: 0.45 })
      );
      pillar.position.y = 1.2;
      group.add(pillar);

      group.position.copy(point);
      this.scene.add(group);
      this.extractionMarker = group;
    }

    spawnReinforcements() {
      if (this.reinforcementsSpawned || !this.level.addEnemy) return;

      const extractionPoint = this.getExtractionPoint();
      const points = [
        { x: extractionPoint.x + 4.5, y: extractionPoint.y, z: extractionPoint.z + 5.5 },
        { x: extractionPoint.x - 5.5, y: extractionPoint.y, z: extractionPoint.z + 4.5 },
        { x: extractionPoint.x + 1.5, y: extractionPoint.y, z: extractionPoint.z - 6.5 },
      ];

      points.forEach((point, index) => {
        const enemy = this.level.addEnemy(`reinforcement_${index + 1}`, point.x, point.y, point.z);
        if (enemy && enemy.userData.enemy) enemy.userData.enemy.holdFireUntilOutside = true;
      });
      if (this.enemySystem) this.enemySystem.initializeEnemies();
      this.reinforcementsSpawned = true;
    }

    getExtractionPoint() {
      const spawn = TheGame.GameConfig.player.spawn.position;
      return new THREE.Vector3(spawn.x, spawn.y + 0.03, spawn.z);
    }

    getPlayerFeetPosition() {
      return new THREE.Vector3(
        this.player.position.x,
        this.player.position.y - this.player.config.height,
        this.player.position.z
      );
    }

    showVictoryOverlay() {
      const overlay = document.createElement("div");
      overlay.className = "overlay victory";
      overlay.innerHTML = `
        <div class="panel">
          <p class="eyebrow">Mission Complete</p>
          <h1>Hostage Extracted</h1>
          <p id="overlayText">The hostage is secure. Area cleared for extraction.</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    showFailureOverlay() {
      const overlay = document.createElement("div");
      overlay.className = "overlay defeat";
      overlay.innerHTML = `
        <div class="panel">
          <p class="eyebrow">Mission failed</p>
          <h1>Hostage KIA</h1>
          <p id="overlayText">The hostage is lost. Operation aborted.</p>
        </div>
      `;
      document.body.appendChild(overlay);
    }
  }

  TheGame.HostageSystem = HostageSystem;
})();

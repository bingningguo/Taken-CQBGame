// CQB defender AI: mostly stationary guards that react to proximity, sound,
// and line of sight instead of chasing like arena shooter enemies.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class EnemySystem {
    constructor(enemies, state, view, audio, options = {}) {
      this.enemies = enemies;
      this.state = state;
      this.view = view;
      this.audio = audio;
      this.player = options.player || null;
      this.meshCollisionSystem = options.meshCollisionSystem || null;
      this.effectsView = options.effectsView || null;
      this.raycaster = new THREE.Raycaster();
      this.tempDirection = new THREE.Vector3();
      this.initializeEnemies();
      this.updateActiveCount();
    }

    initializeEnemies() {
      this.enemies.forEach((enemy) => {
        const data = this.getEnemyData(enemy);
        if (!data) return;

        const config = this.getConfig(data);
        data.hp = data.hp ?? config.hp;
        data.state = data.state || "idle";
        data.active = data.active !== false;
        data.fireCooldown = Math.random() * config.fireRate;
        data.fireWindupProgress = 0;
        data.lastState = null;
        this.view.ensureModel(enemy);
      });
    }

    update(deltaTime) {
      this.enemies.forEach((enemy) => {
        this.updateEnemy(enemy, deltaTime);
        this.view.tickMuzzleFlash(enemy, deltaTime);
      });
      this.updateActiveCount();
    }

    updateEnemy(enemy, deltaTime) {
      const data = this.getEnemyData(enemy);
      if (!data || data.state === "dead" || data.hp <= 0 || !this.player) return;

      const configEarly = this.getConfig(data);
      if (configEarly.passive) return;

      if (!enemy.userData.modelReady) this.view.ensureModel(enemy);

      const config = this.getConfig(data);
      const distance = enemy.position.distanceTo(this.player.position);
      const hasLos = this.hasLineOfSight(enemy);

      if (hasLos || distance <= config.activationRadius) {
        data.state = "activated";
      } else if (distance <= config.alertRadius && data.state === "idle") {
        data.state = "alert";
      } else if (distance > config.alertRadius && data.state === "alert") {
        data.state = "idle";
      }

      if (data.state === "activated" || data.state === "attack") {
        this.view.faceTarget(enemy, this.player.position, deltaTime, config.turnSpeed);
      }

      data.fireCooldown = Math.max(0, data.fireCooldown - deltaTime);
      const windupNeeded = config.fireWindup != null ? config.fireWindup : 0;
      let wu = data.fireWindupProgress;
      if (wu == null || Number.isNaN(wu)) wu = 0;
      const mayShootReinforcement = !this.shouldHoldReinforcementFire(data);
      if (
        mayShootReinforcement &&
        (data.state === "activated" || data.state === "attack") &&
        hasLos
      ) {
        data.state = "attack";
        data.fireWindupProgress = Math.min(windupNeeded, wu + deltaTime);
        if (data.fireWindupProgress >= windupNeeded) this.tryShootPlayer(enemy, data, config);
      } else {
        data.fireWindupProgress = 0;
        if (data.state === "attack") data.state = "activated";
      }

      if (data.lastState !== data.state) {
        this.view.setState(enemy, data.state);
        data.lastState = data.state;
      }
    }

    tryShootPlayer(enemy, data, config) {
      if (data.fireCooldown > 0) return;
      if (this.state.mode === "mission") {
        if (this.state.ui && this.state.ui.gameplayFrozen) return;
        if (this.state.player.hp <= 0) return;
      }

      data.fireCooldown = config.fireRate;
      this.view.playMuzzleFlash(enemy);
      this.audio.playWeaponFire(config.fireSoundId || "ak47");
      if (Math.random() > config.accuracy) return;

      this.state.player.hp = Math.max(0, this.state.player.hp - config.damage);
      if (this.effectsView) this.effectsView.playerDamaged();
    }

    notifyGunshot(position, loudness = 1) {
      this.enemies.forEach((enemy) => {
        const data = this.getEnemyData(enemy);
        if (!data || data.state === "dead" || data.hp <= 0) return;

        const config = this.getConfig(data);
        const distance = enemy.position.distanceTo(position);
        if (distance > config.hearingRadius * loudness) return;

        data.state = distance <= config.activationRadius * 1.5 ? "activated" : "alert";
        this.view.setState(enemy, data.state);
        data.lastState = data.state;
      });
    }

    hasLineOfSight(enemy) {
      if (!this.player) return false;

      const data = this.getEnemyData(enemy);
      const config = this.getConfig(data);
      const origin = enemy.position.clone();
      origin.y += config.eyeHeight;
      const target = this.player.position.clone();
      target.y -= 0.15;

      this.tempDirection.copy(target).sub(origin);
      const distance = this.tempDirection.length();
      if (distance <= 0.001) return true;
      this.tempDirection.normalize();

      this.raycaster.set(origin, this.tempDirection);
      this.raycaster.far = distance;

      const blockers = this.getLosBlockers();
      if (blockers.length === 0) return true;

      const hits = this.raycaster.intersectObjects(blockers, true);
      return hits.length === 0 || hits[0].distance >= distance - 0.15;
    }

    getLosBlockers() {
      if (this.meshCollisionSystem && this.meshCollisionSystem.ready) {
        return this.meshCollisionSystem.meshes;
      }
      return [];
    }

    shouldHoldReinforcementFire(data) {
      if (!data || !data.holdFireUntilOutside) return false;
      const h = TheGame.GameConfig.hostage;
      if (!h || h.reinforcementHoldFireUntilOutside === false) return false;
      return this.isPlayerInsideHouseBounds();
    }

    isPlayerInsideHouseBounds() {
      const b = TheGame.GameConfig.hostage && TheGame.GameConfig.hostage.houseInteriorBounds;
      if (!b || !b.min || !b.max) return false;

      const p = this.player.position;
      const feetY = p.y - this.player.config.height;
      return (
        p.x >= b.min.x &&
        p.x <= b.max.x &&
        feetY >= b.min.y &&
        feetY <= b.max.y &&
        p.z >= b.min.z &&
        p.z <= b.max.z
      );
    }

    getTargets() {
      return this.enemies;
    }

    damageEnemy(enemy, damage, hitObject = null) {
      const data = this.getEnemyData(enemy);
      if (!data || data.hp <= 0) return { hit: false, killed: false, headshot: false };

      const headshot = this.isHeadshot(hitObject);
      data.hp -= headshot ? data.hp : damage;
      data.state = data.hp <= 0 ? "dead" : "activated";
      this.view.flashHit(enemy);
      this.audio.playEnemyHit();

      if (data.hp <= 0) {
        data.active = false;
        this.view.setState(enemy, "dead");
        this.updateActiveCount();
        return { hit: true, killed: true, headshot };
      }

      this.view.setState(enemy, data.state);
      return { hit: true, killed: false, headshot };
    }

    isHeadshot(hitObject) {
      if (!hitObject || !hitObject.name) return false;
      return /_(head|helmet|visor)$/.test(hitObject.name);
    }

    findEnemyFromObject(object) {
      let current = object;
      while (current) {
        if (this.getEnemyData(current)) return current;
        current = current.parent;
      }
      return null;
    }

    updateActiveCount() {
      this.state.enemy.activeCount = this.enemies.filter((enemy) => {
        const data = this.getEnemyData(enemy);
        return data && data.active !== false && data.hp > 0;
      }).length;
    }

    getEnemyData(enemy) {
      return enemy && enemy.userData ? enemy.userData.enemy : null;
    }

    getConfig(data) {
      return TheGame.EnemyConfig[data.type] || TheGame.EnemyConfig.defender;
    }
  }

  TheGame.EnemySystem = EnemySystem;
})();

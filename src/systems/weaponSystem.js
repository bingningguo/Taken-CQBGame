// Config-driven weapon system: switching, firing, reloads, ADS, bolt, burst.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class WeaponSystem {
    constructor(camera, enemySystem, state, effectsView, audio, weaponView, player, hostageSystem) {
      this.camera = camera;
      this.enemySystem = enemySystem;
      this.state = state;
      this.effectsView = effectsView;
      this.audio = audio;
      this.weaponView = weaponView;
      this.player = player;
      this.hostageSystem = hostageSystem || null;
      this.raycaster = new THREE.Raycaster();
      this.fireCooldown = 0;
      this.reloadTimer = 0;
      this.switchTimer = 0;
      this.pendingWeaponId = null;
      this.rWasDown = false;
      this.oneWasDown = false;
      this.twoWasDown = false;
      this.burstRemaining = 0;
      this.burstCooldown = 0;
      this.scopeIndex = 0;
      this.rangeDigitWasDown = [];
      this.syncState();
    }

    update(deltaTime, input) {
      this.fireCooldown = Math.max(0, this.fireCooldown - deltaTime);
      this.burstCooldown = Math.max(0, this.burstCooldown - deltaTime);
      this.updateAds(input);
      this.enforceHostageWeaponRule();
      this.updateSwitch(deltaTime);
      this.updateReload(deltaTime);
      this.handleSwitchInput(input);
      this.handleReloadInput(input);
      this.handleFireInput(input);
      this.tickBurst(input);
      this.syncState();
    }

    updateAds(input) {
      const config = this.getCurrentConfig();
      const base = this.camera.userData.baseFov || 75;
      const hasScopes = config && config.scopes && config.scopes.length > 0;

      if (hasScopes && input.isMouseDown(2)) {
        this.state.weapon.adsActive = true;
        const step = input.consumeWheelStep();
        if (step !== 0) {
          const n = config.scopes.length;
          this.scopeIndex = (this.scopeIndex + (step > 0 ? 1 : -1) + n * 8) % n;
        }
        const mag = config.scopes[this.scopeIndex];
        this.camera.fov = base / mag;
        this.camera.updateProjectionMatrix();
        this.state.weapon.scopeMagLabel = mag + "x";
        if (this.player) {
          this.player.setAdsMouseFactor(0.55);
        }
      } else {
        this.state.weapon.adsActive = false;
        this.state.weapon.scopeMagLabel = "";
        this.camera.fov = base;
        this.camera.updateProjectionMatrix();
        if (this.player) this.player.setAdsMouseFactor(1);
        if (!hasScopes) {
          this.scopeIndex = 0;
        }
      }
    }

    handleSwitchInput(input) {
      const order = this.state.mode === "range" && this.state.weapon.rangeWeaponOrder;
      if (order && order.length) {
        for (let i = 0; i < order.length; i++) {
          const code = `Digit${i + 1}`;
          const down = input.isDown(code);
          if (down && !this.rangeDigitWasDown[i]) {
            this.startSwitch(order[i]);
          }
          this.rangeDigitWasDown[i] = down;
        }
        return;
      }

      const prim = this.state.weapon.primaryId;
      const sec = this.state.weapon.secondaryId;
      const oneDown = input.isDown("Digit1");
      const twoDown = input.isDown("Digit2");
      if (oneDown && !this.oneWasDown) this.startSwitch(prim);
      if (twoDown && !this.twoWasDown) this.startSwitch(sec);
      this.oneWasDown = oneDown;
      this.twoWasDown = twoDown;
    }

    handleReloadInput(input) {
      const rDown = input.isDown("KeyR");
      if (rDown && !this.rWasDown) this.startReload();
      this.rWasDown = rDown;
    }

    handleFireInput(input) {
      const config = this.getCurrentConfig();
      if (!config || this.isBusy()) {
        input.consumeFirePressed();
        return;
      }
      if (config.fireMode === "burst") {
        if (
          this.burstRemaining <= 0 &&
          this.burstCooldown <= 0 &&
          input.consumeFirePressed()
        ) {
          this.burstRemaining = config.burstCount || 3;
        }
        return;
      }

      let wantsFire = false;
      if (config.fireMode === "auto") {
        wantsFire = input.isMouseDown(0);
      } else {
        wantsFire = input.consumeFirePressed();
      }
      if (wantsFire) this.tryFire();
    }

    tickBurst(input) {
      const config = this.getCurrentConfig();
      if (!config || config.fireMode !== "burst") return;
      if (this.isBusy() || this.fireCooldown > 0) return;
      if (this.burstRemaining <= 0) return;

      const ammo = this.getCurrentAmmo();
      if (ammo.ammoInMag <= 0) {
        this.burstRemaining = 0;
        return;
      }
      this.tryFire();
      this.burstRemaining -= 1;
      if (this.burstRemaining > 0) {
        this.fireCooldown = config.burstInterval || 0.06;
      } else {
        this.burstCooldown = config.fireInterval || 0.35;
      }
    }

    startSwitch(nextWeaponId) {
      if (nextWeaponId === this.state.weapon.currentId || this.switchTimer > 0) return;
      if (!TheGame.WeaponConfig[nextWeaponId]) return;
      if (!this.state.weapon.inventory[nextWeaponId]) return;
      if (this.state.player.carryingHostage && TheGame.WeaponConfig[nextWeaponId].slot !== "secondary")
        return;

      if (this.state.mode === "range") {
        const inv = this.state.weapon.inventory[nextWeaponId];
        const cfg = TheGame.WeaponConfig[nextWeaponId];
        if (inv && cfg) {
          inv.ammoInMag = cfg.magazineSize;
          inv.reserveAmmo = cfg.reserveAmmo;
        }
      }

      this.pendingWeaponId = nextWeaponId;
      this.reloadTimer = 0;
      this.burstRemaining = 0;
      this.switchTimer = Math.max(
        this.getCurrentConfig().switchTime,
        TheGame.WeaponConfig[nextWeaponId].switchTime
      );
      this.state.weapon.status = "SWITCHING";
      this.weaponView.startSwitch(nextWeaponId, this.switchTimer);
    }

    enforceHostageWeaponRule() {
      if (!this.state.player.carryingHostage) return;
      const current = this.getCurrentConfig();
      const sec = this.state.weapon.secondaryId;
      if (current && current.slot !== "secondary" && this.switchTimer <= 0) {
        this.startSwitch(sec);
      }
    }

    updateSwitch(deltaTime) {
      if (this.switchTimer <= 0) return;

      this.switchTimer = Math.max(0, this.switchTimer - deltaTime);
      if (this.switchTimer === 0 && this.pendingWeaponId) {
        this.state.weapon.currentId = this.pendingWeaponId;
        this.pendingWeaponId = null;
        const cfg = this.getCurrentConfig();
        if (cfg && cfg.scopes && cfg.scopes.length) this.scopeIndex = 0;
        this.weaponView.setWeapon(this.state.weapon.currentId);
      }
    }

    startReload() {
      const config = this.getCurrentConfig();
      const ammo = this.getCurrentAmmo();
      if (!config || this.isBusy()) return;
      if (ammo.ammoInMag >= config.magazineSize || ammo.reserveAmmo <= 0) return;

      this.reloadTimer = config.reloadTime;
      this.state.weapon.status = "RELOADING";
      this.weaponView.startReload(this.reloadTimer);
    }

    updateReload(deltaTime) {
      if (this.reloadTimer <= 0) return;

      this.reloadTimer = Math.max(0, this.reloadTimer - deltaTime);
      if (this.reloadTimer === 0) this.finishReload();
    }

    finishReload() {
      const config = this.getCurrentConfig();
      const ammo = this.getCurrentAmmo();
      const needed = config.magazineSize - ammo.ammoInMag;
      const loaded = Math.min(needed, ammo.reserveAmmo);

      ammo.ammoInMag += loaded;
      ammo.reserveAmmo -= loaded;
    }

    isPlayerIncapacitated() {
      if (this.state.ui && this.state.ui.gameplayFrozen) return true;
      if (this.state.mode !== "mission") return false;
      return this.state.player.hp <= 0;
    }

    tryFire() {
      if (this.isPlayerIncapacitated()) return;
      const config = this.getCurrentConfig();
      const ammo = this.getCurrentAmmo();
      if (!config || this.fireCooldown > 0 || this.isBusy()) return;

      if (ammo.ammoInMag <= 0) {
        this.state.weapon.status = ammo.reserveAmmo > 0 ? "RELOAD" : "NO AMMO";
        return;
      }

      ammo.ammoInMag -= 1;
      if (config.fireMode !== "burst") {
        this.fireCooldown = config.fireInterval;
      }

      const recoil = config.recoilPitch != null ? config.recoilPitch : 0.004;
      if (this.player) this.player.applyRecoilPitch(recoil);

      this.effectsView.weaponFired();
      this.audio.playWeaponFire(config.fireSoundId);
      this.weaponView.startFire();

      const loud = config.slot === "primary" ? (config.id === "awm" ? 1.45 : 1.15) : 0.85;
      this.enemySystem.notifyGunshot(this.camera.position, loud);

      const direction = new THREE.Vector3();
      this.camera.getWorldDirection(direction);
      let spread =
        config.spreadRad != null ? config.spreadRad : 0;
      if (spread > 0 && this.state.weapon.adsActive && config.scopes && config.scopes.length) {
        spread *= 0.35;
      }
      if (spread > 0) {
        direction.x += (Math.random() * 2 - 1) * spread;
        direction.y += (Math.random() * 2 - 1) * spread;
        direction.z += (Math.random() * 2 - 1) * spread;
        direction.normalize();
      }
      this.raycaster.set(this.camera.position, direction);
      this.raycaster.far = config.range;

      const shootRoots = this.enemySystem.getTargets().slice();
      if (
        this.hostageSystem &&
        this.hostageSystem.hostage &&
        this.state.mode === "mission" &&
        this.state.hostage.status !== "dead" &&
        this.state.hostage.status !== "extracted" &&
        this.hostageSystem.hostage.visible
      ) {
        shootRoots.push(this.hostageSystem.hostage);
      }

      const hits = this.raycaster.intersectObjects(shootRoots, true);
      if (hits.length > 0) {
        const hitObject = hits[0].object;
        if (this.hostageSystem && this.hostageSystem.isHostageObject(hitObject)) {
          this.hostageSystem.damageHostage(config.damage);
        } else {
          const enemy = this.enemySystem.findEnemyFromObject(hitObject);
          const result = this.enemySystem.damageEnemy(enemy, config.damage, hitObject);
          if (result.hit) {
            if (result.headshot) this.effectsView.enemyHitHeadshot();
            else this.effectsView.enemyHitBody();
          }

          if (result.killed) {
            this.state.player.score += config.killScore;
          } else if (result.hit) {
            this.state.player.score += config.hitScore;
          }
        }
      }

      if (config.fireMode === "bolt" && ammo.ammoInMag === 0 && ammo.reserveAmmo > 0) {
        this.reloadTimer = config.reloadTime;
        this.state.weapon.status = "RELOADING";
        this.weaponView.startReload(this.reloadTimer);
      }
    }

    isBusy() {
      return this.reloadTimer > 0 || this.switchTimer > 0;
    }

    syncState() {
      const config = this.getCurrentConfig();
      const ammo = this.getCurrentAmmo();
      if (!config || !ammo) return;

      this.state.weapon.name = config.name;
      this.state.weapon.slot = config.slot;
      this.state.weapon.ammoInMag = ammo.ammoInMag;
      this.state.weapon.reserveAmmo = ammo.reserveAmmo;
      this.state.weapon.magazineSize = config.magazineSize;
      this.state.weapon.fireMode = config.fireMode;

      if (this.switchTimer > 0) {
        this.state.weapon.status = "SWITCHING";
      } else if (this.reloadTimer > 0) {
        this.state.weapon.status = "RELOADING";
      } else if (ammo.ammoInMag <= 0) {
        this.state.weapon.status = ammo.reserveAmmo > 0 ? "RELOAD" : "NO AMMO";
      } else {
        this.state.weapon.status = "READY";
      }
    }

    getCurrentConfig() {
      return TheGame.WeaponConfig[this.state.weapon.currentId];
    }

    getCurrentAmmo() {
      return this.state.weapon.inventory[this.state.weapon.currentId];
    }
  }

  TheGame.WeaponSystem = WeaponSystem;
})();

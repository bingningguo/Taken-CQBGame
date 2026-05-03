// Enemy presentation helpers. Gameplay state remains in enemySystem.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class EnemyView {
    ensureModel(enemy) {
      if (!enemy || enemy.userData.modelReady) return;

      const mats = {
        uniform: mat(0x23302a, 0.86, 0.08),
        vest: mat(0x101411, 0.9, 0.18),
        helmet: mat(0x161b18, 0.82, 0.16),
        skin: mat(0x7a573f, 0.9, 0.02),
        visor: mat(0x050807, 0.42, 0.55),
        rifleBlack: mat(0x15181c, 0.72, 0.35),
        rifleOrange: mat(0xdc5a18, 0.55, 0.12),
        rifleWood: mat(0xa85a28, 0.78, 0.06),
        pouches: mat(0x3d3422, 0.88, 0.06),
      };

      enemy.geometry.dispose();
      enemy.geometry = new THREE.BoxGeometry(0.38, 0.92, 0.28);
      enemy.material = mats.uniform;
      enemy.position.y += 0.36;

      this.addBox(enemy, "plate_carrier", 0, 0.08, -0.02, 0.44, 0.52, 0.31, mats.vest);
      this.addBox(enemy, "chest_rig", 0, 0.15, -0.19, 0.39, 0.18, 0.06, mats.pouches);
      this.addBox(enemy, "left_pouch", -0.14, -0.04, -0.2, 0.09, 0.13, 0.06, mats.pouches);
      this.addBox(enemy, "right_pouch", 0.14, -0.04, -0.2, 0.09, 0.13, 0.06, mats.pouches);

      const neck = this.addBox(enemy, "neck", 0, 0.59, 0, 0.11, 0.1, 0.11, mats.skin);
      neck.rotation.x = 0.08;

      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8), mats.skin);
      head.name = `${enemy.name}_head`;
      head.position.set(0, 0.79, 0);
      enemy.add(head);

      const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.58), mats.helmet);
      helmet.name = `${enemy.name}_helmet`;
      helmet.position.set(0, 0.86, 0);
      enemy.add(helmet);

      this.addBox(enemy, "visor", 0, 0.79, -0.17, 0.2, 0.055, 0.028, mats.visor);
      this.addBox(enemy, "sunglasses", 0, 0.82, -0.19, 0.24, 0.055, 0.035, mats.visor);
      this.addBox(enemy, "left_arm", -0.3, 0.13, -0.02, 0.1, 0.58, 0.12, mats.uniform, 0, 0, -0.08);
      this.addBox(enemy, "right_arm", 0.3, 0.13, -0.02, 0.1, 0.58, 0.12, mats.uniform, 0, 0, 0.08);
      this.addBox(enemy, "left_glove", -0.32, -0.19, -0.16, 0.1, 0.1, 0.1, mats.helmet);
      this.addBox(enemy, "right_glove", 0.32, -0.19, -0.16, 0.1, 0.1, 0.1, mats.helmet);
      this.addBox(enemy, "left_leg", -0.105, -0.6, 0, 0.12, 0.48, 0.15, mats.uniform);
      this.addBox(enemy, "right_leg", 0.105, -0.6, 0, 0.12, 0.48, 0.15, mats.uniform);
      this.addBox(enemy, "left_boot", -0.105, -0.87, -0.04, 0.14, 0.1, 0.22, mats.helmet);
      this.addBox(enemy, "right_boot", 0.105, -0.87, -0.04, 0.14, 0.1, 0.22, mats.helmet);

      this.addBox(enemy, "rifle_body", 0.18, -0.45, -0.08, 0.15, 0.095, 0.95, mats.rifleBlack, 0.85, 0, 0);
      this.addBox(enemy, "rifle_handguard", 0.17, -0.46, -0.26, 0.12, 0.09, 0.42, mats.rifleOrange, 0.82, 0, 0);
      this.addBox(enemy, "rifle_mag", 0.16, -0.52, 0.02, 0.095, 0.22, 0.095, mats.rifleOrange, 1.0, 0, 0);
      const barrel = this.addCylinder(enemy, "rifle_barrel", 0.18, -0.72, -0.36, 0.032, 0.58, mats.rifleBlack, 2.45);
      this.addBox(enemy, "rifle_stock", 0.2, -0.38, 0.12, 0.13, 0.12, 0.34, mats.rifleWood, 0.75, 0, 0);

      const muzzleFlash = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.26, 7),
        new THREE.MeshBasicMaterial({ color: 0xffe8a8, transparent: true, opacity: 0.92 })
      );
      muzzleFlash.name = `${enemy.name}_muzzle_flash`;
      muzzleFlash.position.set(0, 0, 0.36);
      muzzleFlash.rotation.x = Math.PI / 2;
      muzzleFlash.visible = false;
      muzzleFlash.renderOrder = 5;
      barrel.add(muzzleFlash);

      enemy.userData.muzzleFlashTime = 0;
      this.setWeaponDrawn(enemy, false);

      enemy.userData.modelReady = true;
    }

    setState(enemy, state) {
      if (!enemy) return;
      this.ensureModel(enemy);

      if (state === "dead" && !enemy.userData.deadPoseApplied) {
        enemy.userData.deadPoseApplied = true;
        this.hideMuzzleFlash(enemy);
        enemy.rotation.x = Math.PI / 2;
        enemy.rotation.z = -0.35;
        enemy.position.y -= 0.55;
        enemy.traverse((child) => {
          if (child.material && child.material.color) child.material.color.multiplyScalar(0.45);
        });
      } else if (state !== "dead") {
        this.setWeaponDrawn(enemy, state === "attack" || state === "activated");
      }
    }

    faceTarget(enemy, targetPosition, deltaTime, turnSpeed) {
      if (!enemy || !targetPosition) return;

      const dx = targetPosition.x - enemy.position.x;
      const dz = targetPosition.z - enemy.position.z;
      // Local -Z is forward; R_y(theta) maps (0,0,-1) to (-sin(theta),-cos(theta)), match (dx,dz) => theta = atan2(-dx,-dz).
      const targetYaw = Math.atan2(-dx, -dz);
      const currentYaw = enemy.rotation.y;
      const deltaYaw = normalizeAngle(targetYaw - currentYaw);
      enemy.rotation.y += deltaYaw * Math.min(1, deltaTime * turnSpeed);
    }

    flashHit(enemy) {
      // Hit marker is handled by EffectsView; the model no longer flashes white.
    }

    playMuzzleFlash(enemy) {
      if (!enemy || !enemy.userData.modelReady) return;
      const flash = enemy.getObjectByName(`${enemy.name}_muzzle_flash`);
      if (!flash) return;
      flash.visible = true;
      flash.rotation.z = Math.random() * Math.PI * 2;
      flash.scale.setScalar(1.05 + Math.random() * 0.35);
      enemy.userData.muzzleFlashTime = 0.078;
    }

    tickMuzzleFlash(enemy, deltaTime) {
      const t = enemy && enemy.userData && enemy.userData.muzzleFlashTime;
      if (!t || t <= 0) return;
      enemy.userData.muzzleFlashTime = Math.max(0, t - deltaTime);
      if (enemy.userData.muzzleFlashTime <= 0) this.hideMuzzleFlash(enemy);
    }

    hideMuzzleFlash(enemy) {
      if (enemy && enemy.userData) enemy.userData.muzzleFlashTime = 0;
      const flash = enemy && enemy.getObjectByName(`${enemy.name}_muzzle_flash`);
      if (flash) flash.visible = false;
    }

    setWeaponDrawn(enemy, isDrawn) {
      const parts = ["rifle_body", "rifle_handguard", "rifle_mag", "rifle_barrel", "rifle_stock"];
      parts.forEach((part) => {
        const mesh = enemy.getObjectByName(`${enemy.name}_${part}`);
        if (!mesh) return;

        mesh.visible = true;
        if (part === "rifle_body") {
          mesh.position.set(isDrawn ? 0.16 : 0.18, isDrawn ? 0.1 : -0.45, isDrawn ? -0.42 : -0.08);
          mesh.rotation.set(isDrawn ? -0.08 : 0.85, 0, 0);
        } else if (part === "rifle_handguard") {
          mesh.position.set(isDrawn ? 0.15 : 0.17, isDrawn ? 0.05 : -0.46, isDrawn ? -0.58 : -0.26);
          mesh.rotation.set(isDrawn ? -0.06 : 0.82, 0, 0);
        } else if (part === "rifle_mag") {
          mesh.position.set(isDrawn ? 0.14 : 0.16, isDrawn ? -0.02 : -0.52, isDrawn ? -0.3 : 0.02);
          mesh.rotation.set(isDrawn ? 0.18 : 1.0, 0, 0);
        } else if (part === "rifle_barrel") {
          mesh.position.set(isDrawn ? 0.16 : 0.18, isDrawn ? 0.08 : -0.74, isDrawn ? -0.98 : -0.36);
          mesh.rotation.set(isDrawn ? Math.PI / 2 : 2.45, 0, 0);
        } else if (part === "rifle_stock") {
          mesh.position.set(isDrawn ? 0.12 : 0.2, isDrawn ? 0.12 : -0.38, isDrawn ? -0.14 : 0.12);
          mesh.rotation.set(isDrawn ? -0.12 : 0.75, 0, 0);
        }
      });

      const leftArm = enemy.getObjectByName(`${enemy.name}_left_arm`);
      const rightArm = enemy.getObjectByName(`${enemy.name}_right_arm`);
      const leftGlove = enemy.getObjectByName(`${enemy.name}_left_glove`);
      const rightGlove = enemy.getObjectByName(`${enemy.name}_right_glove`);

      if (leftArm) {
        leftArm.position.set(isDrawn ? -0.18 : -0.3, isDrawn ? 0.12 : 0.13, isDrawn ? -0.24 : -0.02);
        leftArm.rotation.set(isDrawn ? 1.25 : 0, 0, isDrawn ? -0.35 : -0.08);
      }

      if (rightArm) {
        rightArm.position.set(isDrawn ? 0.18 : 0.3, isDrawn ? 0.12 : 0.13, isDrawn ? -0.24 : -0.02);
        rightArm.rotation.set(isDrawn ? 1.25 : 0, 0, isDrawn ? 0.35 : 0.08);
      }

      if (leftGlove) {
        leftGlove.position.set(isDrawn ? -0.08 : -0.32, isDrawn ? -0.04 : -0.19, isDrawn ? -0.42 : -0.16);
      }

      if (rightGlove) {
        rightGlove.position.set(isDrawn ? 0.18 : 0.32, isDrawn ? -0.04 : -0.19, isDrawn ? -0.42 : -0.16);
      }

      if (!isDrawn) this.hideMuzzleFlash(enemy);
    }

    addBox(parent, name, x, y, z, sx, sy, sz, material, rx = 0, ry = 0, rz = 0) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
      mesh.name = `${parent.name}_${name}`;
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      parent.add(mesh);
      return mesh;
    }

    addCylinder(parent, name, x, y, z, radius, length, material, rx = 0, ry = 0, rz = 0) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 10), material);
      mesh.name = `${parent.name}_${name}`;
      mesh.position.set(x, y, z);
      mesh.rotation.set(rx, ry, rz);
      parent.add(mesh);
      return mesh;
    }
  }

  function mat(color, roughness, metalness) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  function normalizeAngle(angle) {
    return Math.atan2(Math.sin(angle), Math.cos(angle));
  }

  TheGame.EnemyView = EnemyView;
})();

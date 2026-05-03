// Stylized first-person weapon view built from simple Three.js primitives.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class WeaponView {
    constructor(scene, camera) {
      this.scene = scene;
      this.camera = camera;
      this.weaponId = "m4a1";
      this.group = new THREE.Group();
      this.group.name = "first_person_weapon";
      this.scene.add(this.group);
      this.action = "idle";
      this.actionTime = 0;
      this.actionDuration = 0;
      this.muzzleFlash = null;
      this.rebuildWeapon();
    }

    setWeapon(weaponId) {
      if (this.weaponId === weaponId) return;
      this.weaponId = weaponId;
      this.rebuildWeapon();
    }

    startFire() {
      this.action = "fire";
      this.actionTime = 0;
      this.actionDuration = 0.1;
      if (this.muzzleFlash) this.muzzleFlash.visible = true;
    }

    startReload(duration) {
      this.action = "reload";
      this.actionTime = 0;
      this.actionDuration = duration;
      if (this.muzzleFlash) this.muzzleFlash.visible = false;
    }

    startSwitch(nextWeaponId, duration) {
      this.weaponId = nextWeaponId;
      this.rebuildWeapon();
      this.action = "switch";
      this.actionTime = 0;
      this.actionDuration = duration;
    }

    update(deltaTime) {
      this.actionTime += deltaTime;
      if (this.muzzleFlash && this.actionTime > 0.045) this.muzzleFlash.visible = false;
      if (this.actionTime >= this.actionDuration && this.action !== "idle") {
        this.action = "idle";
      }

      this.group.position.copy(this.camera.position);
      this.group.quaternion.copy(this.camera.quaternion);

      const offset = this.getAnimatedOffset();
      this.group.translateX(offset.x);
      this.group.translateY(offset.y);
      this.group.translateZ(offset.z);
      this.group.rotateX(offset.rx);
      this.group.rotateY(offset.ry);
      this.group.rotateZ(offset.rz);
    }

    rebuildWeapon() {
      this.group.clear();
      this.muzzleFlash = null;

      switch (this.weaponId) {
        case "ak74":
          this.buildAk74();
          break;
        case "awm":
          this.buildAwm();
          break;
        case "mp7":
          this.buildMp7();
          break;
        case "beretta92f":
          this.buildBeretta92f();
          break;
        case "deagle":
          this.buildDeagle();
          break;
        case "glock18":
          this.buildGlock18();
          break;
        default:
          this.buildM4A1();
      }
    }

    buildM4A1() {
      const gun = {
        black: mat(0x111315, 0.82, 0.2),
        dark: mat(0x20262a, 0.7, 0.32),
        metal: mat(0x3f484d, 0.58, 0.42),
        tan: mat(0x4a3b29, 0.78, 0.08),
        skin: mat(0x8b5f3d, 0.9, 0.02),
        rubber: mat(0x080909, 0.9, 0.05),
      };

      this.addBox("upper_receiver", 0.24, -0.25, -0.78, 0.3, 0.15, 0.14, gun.metal);
      this.addBox("lower_receiver", 0.24, -0.35, -0.72, 0.25, 0.115, 0.14, gun.dark);
      this.addBox("top_rail", 0.24, -0.165, -0.82, 0.34, 0.026, 0.055, gun.black);
      this.addBox("handguard", 0.24, -0.24, -1.12, 0.145, 0.13, 0.46, gun.black);
      this.addBox("rail_front", 0.24, -0.162, -1.12, 0.16, 0.026, 0.38, gun.metal);
      this.addCylinder("barrel", 0.24, -0.24, -1.48, 0.03, 0.62, gun.black, Math.PI / 2);
      this.addCylinder("muzzle", 0.24, -0.24, -1.82, 0.046, 0.12, gun.metal, Math.PI / 2);
      this.addBox("stock_tube", 0.26, -0.25, -0.35, 0.12, 0.1, 0.44, gun.black);
      this.addBox("stock", 0.24, -0.24, -0.12, 0.24, 0.18, 0.17, gun.rubber);
      this.addBox("magazine", 0.24, -0.55, -0.7, 0.13, 0.4, 0.13, gun.tan, 0.16);
      this.addBox("pistol_grip", 0.18, -0.53, -0.58, 0.1, 0.32, 0.115, gun.rubber, -0.22);
      this.addBox("trigger_guard", 0.25, -0.45, -0.6, 0.14, 0.032, 0.085, gun.black);
      this.addBox("optic_base", 0.24, -0.118, -0.78, 0.13, 0.046, 0.105, gun.black);
      this.addCylinder("optic", 0.24, -0.058, -0.8, 0.062, 0.17, gun.dark, Math.PI / 2);
      this.addCylinder("front_sight", 0.24, -0.105, -1.42, 0.032, 0.07, gun.black, 0);
      this.addBox("support_hand", 0.07, -0.42, -1.1, 0.19, 0.155, 0.24, gun.skin, -0.1);
      this.addBox("trigger_hand", 0.3, -0.58, -0.5, 0.19, 0.165, 0.25, gun.skin, -0.15);
      this.addBox("left_sleeve", -0.01, -0.45, -0.98, 0.13, 0.17, 0.29, gun.black, -0.2);
      this.addBox("right_sleeve", 0.4, -0.62, -0.38, 0.13, 0.17, 0.31, gun.black, -0.25);
      this.muzzleFlash = this.addMuzzleFlash(0.24, -0.24, -1.92, 0.24);
    }

    buildAk74() {
      const gun = {
        black: mat(0x111315, 0.82, 0.2),
        dark: mat(0x20262a, 0.7, 0.32),
        metal: mat(0x3f484d, 0.58, 0.42),
        orange: mat(0xc45a18, 0.65, 0.15),
        wood: mat(0x5c3d22, 0.78, 0.04),
        skin: mat(0x8b5f3d, 0.9, 0.02),
        rubber: mat(0x080909, 0.9, 0.05),
      };

      this.addBox("ak_receiver", 0.24, -0.27, -0.76, 0.28, 0.16, 0.15, gun.metal);
      this.addBox("ak_top", 0.24, -0.16, -0.8, 0.32, 0.035, 0.075, gun.black);
      this.addBox("ak_handguard", 0.24, -0.25, -1.18, 0.16, 0.14, 0.52, gun.orange, 0.04);
      this.addCylinder("ak_barrel", 0.24, -0.24, -1.55, 0.032, 0.55, gun.black, Math.PI / 2);
      this.addCylinder("ak_muzzle", 0.24, -0.24, -1.86, 0.048, 0.11, gun.dark, Math.PI / 2);
      this.addBox("ak_stock", 0.28, -0.22, -0.08, 0.22, 0.15, 0.22, gun.wood, 0.12);
      this.addBox("ak_grip", 0.18, -0.52, -0.55, 0.105, 0.34, 0.12, gun.rubber, -0.24);
      this.addBox("ak_mag", 0.22, -0.52, -0.68, 0.1, 0.38, 0.12, gun.orange, 0.1);
      this.addBox("aksight", 0.24, -0.12, -0.82, 0.12, 0.04, 0.09, gun.black);
      this.addBox("support_hand", 0.07, -0.42, -1.12, 0.19, 0.155, 0.24, gun.skin, -0.1);
      this.addBox("trigger_hand", 0.3, -0.58, -0.5, 0.19, 0.165, 0.25, gun.skin, -0.15);
      this.addBox("left_sleeve", -0.01, -0.45, -0.98, 0.13, 0.17, 0.29, gun.black, -0.2);
      this.addBox("right_sleeve", 0.4, -0.62, -0.38, 0.13, 0.17, 0.31, gun.black, -0.25);
      this.muzzleFlash = this.addMuzzleFlash(0.24, -0.24, -1.96, 0.26);
    }

    buildAwm() {
      const gun = {
        body: mat(0x2a3d28, 0.82, 0.12),
        black: mat(0x0a0c0b, 0.88, 0.18),
        metal: mat(0x4a5550, 0.55, 0.48),
        glass: mat(0x1a2030, 0.2, 0.5),
        skin: mat(0x8b5f3d, 0.9, 0.02),
      };

      this.addBox("awm_body", 0.22, -0.28, -0.82, 0.32, 0.17, 0.42, gun.body);
      this.addCylinder("awm_barrel", 0.22, -0.22, -1.72, 0.038, 1.35, gun.black, Math.PI / 2);
      this.addCylinder("awm_brake", 0.22, -0.22, -2.45, 0.052, 0.14, gun.metal, Math.PI / 2);
      this.addBox("awm_stock", 0.26, -0.2, -0.12, 0.18, 0.14, 0.26, gun.body, 0.08);
      this.addCylinder("scope_main", 0.22, -0.05, -0.78, 0.07, 0.32, gun.black, Math.PI / 2);
      this.addCylinder("scope_obj", 0.22, -0.05, -0.62, 0.055, 0.08, gun.glass, Math.PI / 2);
      this.addBox("awm_mag", 0.18, -0.52, -0.72, 0.09, 0.28, 0.11, gun.black, 0.06);
      this.addBox("bolt_knob", 0.42, -0.3, -0.65, 0.06, 0.06, 0.1, gun.metal);
      this.addBox("trigger_hand", 0.32, -0.55, -0.52, 0.19, 0.17, 0.26, gun.skin, -0.12);
      this.addBox("support_hand", 0.05, -0.38, -1.35, 0.18, 0.16, 0.28, gun.skin, -0.08);
      this.addBox("right_sleeve", 0.42, -0.62, -0.35, 0.13, 0.17, 0.3, gun.black, -0.22);
      this.muzzleFlash = this.addMuzzleFlash(0.22, -0.22, -2.55, 0.28);
    }

    buildMp7() {
      const gun = {
        black: mat(0x101418, 0.84, 0.22),
        poly: mat(0x343c44, 0.68, 0.28),
        metal: mat(0x5c646c, 0.48, 0.52),
        skin: mat(0x8b5f3d, 0.9, 0.02),
      };

      this.addBox("mp7_receiver", 0.24, -0.26, -0.7, 0.2, 0.125, 0.36, gun.poly);
      this.addBox("mp7_top", 0.24, -0.188, -0.74, 0.18, 0.024, 0.38, gun.black);
      this.addBox("mp7_handguard", 0.24, -0.255, -1.02, 0.115, 0.115, 0.42, gun.black);
      this.addCylinder("mp7_barrel", 0.24, -0.25, -1.34, 0.022, 0.52, gun.metal, Math.PI / 2);
      this.addBox("mp7_stock", 0.27, -0.23, -0.36, 0.095, 0.11, 0.26, gun.poly, 0.06);
      this.addBox("mp7_mag", 0.21, -0.52, -0.66, 0.095, 0.4, 0.14, gun.black, 0.1);
      this.addBox("mp7_grip", 0.17, -0.5, -0.56, 0.085, 0.29, 0.095, gun.poly, -0.2);
      this.addBox("mp7_trigguard", 0.25, -0.42, -0.62, 0.11, 0.028, 0.072, gun.black);
      this.addBox("mp7_iron_f", 0.24, -0.178, -1.18, 0.04, 0.032, 0.03, gun.black);
      this.addBox("mp7_iron_r", 0.24, -0.178, -0.58, 0.055, 0.028, 0.025, gun.black);
      this.addBox("support_hand", 0.07, -0.4, -1.02, 0.17, 0.145, 0.22, gun.skin, -0.08);
      this.addBox("trigger_hand", 0.3, -0.57, -0.5, 0.18, 0.16, 0.24, gun.skin, -0.14);
      this.addBox("left_sleeve", 0, -0.44, -0.9, 0.12, 0.16, 0.26, gun.black, -0.18);
      this.addBox("right_sleeve", 0.39, -0.6, -0.4, 0.125, 0.16, 0.3, gun.black, -0.22);
      this.muzzleFlash = this.addMuzzleFlash(0.24, -0.25, -1.64, 0.18);
    }

    buildBeretta92f() {
      const gun = {
        black: mat(0x0d0e10, 0.84, 0.18),
        metal: mat(0x3d444a, 0.5, 0.52),
        sight: mat(0x050505, 0.9, 0.1),
        skin: mat(0x8b5f3d, 0.9, 0.02),
      };

      this.addBox("slide", 0.29, -0.25, -0.72, 0.22, 0.115, 0.34, gun.metal);
      this.addBox("slide_front_cut", 0.29, -0.21, -0.94, 0.14, 0.05, 0.065, gun.black);
      this.addCylinder("barrel", 0.29, -0.24, -0.98, 0.028, 0.24, gun.black, Math.PI / 2);
      this.addBox("frame", 0.29, -0.36, -0.69, 0.19, 0.105, 0.23, gun.black);
      this.addBox("grip", 0.24, -0.55, -0.56, 0.1, 0.35, 0.115, gun.black, -0.25);
      this.addBox("mag_floorplate", 0.21, -0.76, -0.5, 0.105, 0.032, 0.13, gun.metal, -0.25);
      this.addBox("trigger_guard", 0.3, -0.43, -0.62, 0.09, 0.032, 0.07, gun.black);
      this.addBox("front_sight", 0.29, -0.15, -0.9, 0.04, 0.035, 0.03, gun.sight);
      this.addBox("rear_sight", 0.29, -0.15, -0.54, 0.06, 0.032, 0.028, gun.sight);
      this.addBox("right_hand", 0.32, -0.62, -0.48, 0.17, 0.16, 0.23, gun.skin, -0.15);
      this.addBox("left_hand", 0.16, -0.58, -0.62, 0.145, 0.14, 0.2, gun.skin, 0.08);
      this.muzzleFlash = this.addMuzzleFlash(0.29, -0.24, -1.15, 0.16);
    }

    buildDeagle() {
      const gun = {
        black: mat(0x0d0e10, 0.84, 0.18),
        metal: mat(0xc0b8a8, 0.45, 0.65),
        sight: mat(0x050505, 0.9, 0.1),
        skin: mat(0x8b5f3d, 0.9, 0.02),
      };

      this.addBox("slide", 0.29, -0.26, -0.74, 0.26, 0.14, 0.38, gun.metal);
      this.addCylinder("barrel", 0.29, -0.24, -1.02, 0.036, 0.32, gun.black, Math.PI / 2);
      this.addBox("frame", 0.29, -0.38, -0.68, 0.21, 0.11, 0.25, gun.black);
      this.addBox("grip", 0.23, -0.58, -0.54, 0.115, 0.38, 0.12, gun.black, -0.28);
      this.addBox("trigger_guard", 0.31, -0.44, -0.63, 0.1, 0.035, 0.075, gun.black);
      this.addBox("front_sight", 0.29, -0.16, -0.94, 0.045, 0.038, 0.035, gun.sight);
      this.addBox("rear_sight", 0.29, -0.16, -0.52, 0.065, 0.035, 0.03, gun.sight);
      this.addBox("right_hand", 0.33, -0.64, -0.49, 0.18, 0.17, 0.24, gun.skin, -0.16);
      this.addBox("left_hand", 0.15, -0.6, -0.64, 0.15, 0.15, 0.2, gun.skin, 0.08);
      this.muzzleFlash = this.addMuzzleFlash(0.29, -0.24, -1.22, 0.2);
    }

    buildGlock18() {
      const gun = {
        desert: mat(0xd8c4a4, 0.62, 0.38),
        desertDeep: mat(0xb8955a, 0.7, 0.32),
        slide: mat(0xc9aa72, 0.52, 0.45),
        barrel: mat(0x7a6348, 0.82, 0.22),
        sight: mat(0x1c1812, 0.88, 0.12),
        skin: mat(0x8b5f3d, 0.9, 0.02),
      };

      this.addBox("slide", 0.29, -0.24, -0.7, 0.21, 0.12, 0.32, gun.slide);
      this.addBox("slide_top", 0.29, -0.18, -0.78, 0.15, 0.05, 0.2, gun.desertDeep);
      this.addCylinder("barrel", 0.29, -0.23, -0.95, 0.026, 0.22, gun.barrel, Math.PI / 2);
      this.addBox("frame", 0.29, -0.35, -0.66, 0.18, 0.1, 0.22, gun.desert);
      this.addBox("grip", 0.24, -0.54, -0.54, 0.095, 0.34, 0.115, gun.desertDeep, -0.22);
      this.addBox("mag_ext", 0.21, -0.72, -0.52, 0.09, 0.2, 0.1, gun.desertDeep, -0.22);
      this.addBox("trigger_guard", 0.3, -0.42, -0.61, 0.09, 0.03, 0.068, gun.desertDeep);
      this.addBox("front_sight", 0.29, -0.14, -0.88, 0.038, 0.032, 0.028, gun.sight);
      this.addBox("rear_sight", 0.29, -0.14, -0.55, 0.055, 0.03, 0.026, gun.sight);
      this.addBox("right_hand", 0.32, -0.61, -0.47, 0.17, 0.16, 0.23, gun.skin, -0.14);
      this.addBox("left_hand", 0.17, -0.57, -0.62, 0.14, 0.14, 0.19, gun.skin, 0.08);
      this.muzzleFlash = this.addMuzzleFlash(0.29, -0.23, -1.1, 0.14);
    }

    addBox(name, x, y, z, sx, sy, sz, material, rz = 0) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.rotation.z = rz;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      this.group.add(mesh);
      return mesh;
    }

    addCylinder(name, x, y, z, radius, length, material, rotationX = 0) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, length, 16), material);
      mesh.name = name;
      mesh.position.set(x, y, z);
      mesh.rotation.x = rotationX;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      this.group.add(mesh);
      return mesh;
    }

    addMuzzleFlash(x, y, z, size) {
      const flash = new THREE.Mesh(
        new THREE.ConeGeometry(size * 0.45, size, 7),
        new THREE.MeshBasicMaterial({ color: 0xffc14a, transparent: true, opacity: 0.82 })
      );
      flash.name = "muzzle_flash";
      flash.position.set(x, y, z);
      flash.rotation.x = Math.PI / 2;
      flash.visible = false;
      this.group.add(flash);
      return flash;
    }

    getAnimatedOffset() {
      const t = this.actionDuration > 0 ? Math.min(1, this.actionTime / this.actionDuration) : 1;
      const idle = performance.now() * 0.0035;
      const offset = {
        x: 0.035,
        y: Math.sin(idle) * 0.008,
        z: 0,
        rx: Math.sin(idle * 0.7) * 0.004,
        ry: 0,
        rz: Math.sin(idle * 0.8) * 0.005,
      };

      if (this.action === "fire") {
        const kick = 1 - t;
        offset.z += 0.1 * kick;
        offset.y += 0.035 * kick;
        offset.rx += 0.1 * kick;
        const pistolKick =
          this.weaponId === "beretta92f" ||
          this.weaponId === "deagle" ||
          this.weaponId === "glock18";
        const rzKick = pistolKick
          ? 0.05
          : this.weaponId === "awm"
            ? 0.038
            : this.weaponId === "mp7"
              ? 0.018
              : 0.025;
        offset.rz += rzKick * kick;
      } else if (this.action === "reload") {
        const phase = Math.sin(t * Math.PI);
        const settle = Math.sin(t * Math.PI * 2);
        offset.y -= 0.42 * phase;
        offset.x += 0.16 * phase;
        offset.z += 0.12 * phase;
        offset.rz += 0.55 * phase;
        offset.rx += 0.28 * phase + 0.08 * settle;
      } else if (this.action === "switch") {
        const phase = Math.sin(t * Math.PI);
        offset.y -= 0.5 * phase;
        offset.z += 0.22 * phase;
        offset.rz -= 0.34 * phase;
      }

      return offset;
    }
  }

  function mat(color, roughness, metalness) {
    return new THREE.MeshStandardMaterial({ color, roughness, metalness });
  }

  TheGame.WeaponView = WeaponView;
})();

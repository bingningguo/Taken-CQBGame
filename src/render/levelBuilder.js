// Builds the CQB villa level and exposes map queries used by movement, doors,
// enemies, and HUD. This stays as a browser global to avoid a build step.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  function buildCQBLevel(scene) {
    const level = {
      spawn: {
        // position.y is camera/eye height; feet at 1.464, height 2.1.
        position: new THREE.Vector3(-44.781, 3.564, -47.523),
        yaw: 3.134393,
      },
      colliders: [],
      doors: [],
      enemies: [],
      hostageSpawns: [],
      hostages: [],
      interactables: [],
      visualMeshes: [],
      prototypeVisualsVisible: true,
      zones: [],
      metadata: {
        name: "R6 Siege House Prototype",
        floors: ["Basement", "Ground Floor", "Second Floor"],
        theme: "Classic tactical residential house with garage, master bedroom, and tight corridors",
      },
    };

    const materials = createMaterials();
    const BY = -3.2; // basement height
    const GY = 0;    // ground floor height
    const SY = 3.4;  // second floor height

    function v(x, y, z) {
      return new THREE.Vector3(x, y, z);
    }

    function refreshCollider(collider) {
      collider.box.setFromObject(collider.mesh);
      collider.minX = collider.box.min.x;
      collider.maxX = collider.box.max.x;
      collider.minY = collider.box.min.y;
      collider.maxY = collider.box.max.y;
      collider.minZ = collider.box.min.z;
      collider.maxZ = collider.box.max.z;
    }

    function addBox({ name, pos, size, mat, collider = true, receiveShadow = true, castShadow = true, userData = {} }) {
      const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
      const mesh = new THREE.Mesh(geometry, mat || materials.wall);
      mesh.position.copy(pos);
      mesh.name = name || "box";
      mesh.castShadow = castShadow;
      mesh.receiveShadow = receiveShadow;
      mesh.userData = { ...userData, size: size.clone() };
      scene.add(mesh);
      level.visualMeshes.push(mesh);

      if (collider) {
        const colliderEntry = {
          name: mesh.name,
          mesh,
          type: userData.type || "static",
          enabled: true,
          box: new THREE.Box3(),
        };
        refreshCollider(colliderEntry);
        level.colliders.push(colliderEntry);
        mesh.userData.collider = colliderEntry;
      }

      return mesh;
    }

    function addFloor(name, x, y, z, w, d, mat = materials.floor) {
      return addBox({
        name,
        pos: v(x, y - 0.1, z),
        size: v(w, 0.2, d),
        mat,
        collider: true,
        userData: { type: "floor" },
      });
    }

    function addWall(name, x, y, z, w, h, d, mat = materials.wall) {
      return addBox({
        name,
        pos: v(x, y + h / 2, z),
        size: v(w, h, d),
        mat,
        collider: true,
        userData: { type: "wall" },
      });
    }

    function addHalfWall(name, x, y, z, w, h, d) {
      return addBox({
        name,
        pos: v(x, y + h / 2, z),
        size: v(w, h, d),
        mat: materials.halfWall,
        collider: true,
        userData: { type: "cover" },
      });
    }

    function addDoor({ name, x, y, z, width = 1.15, height = 2.2, thickness = 0.18, axis = "x", initiallyOpen = false, locked = false }) {
      const size = axis === "x" ? v(width, height, thickness) : v(thickness, height, width);
      const door = addBox({
        name,
        pos: v(x, y + height / 2, z),
        size,
        mat: locked ? materials.lockedDoor : materials.door,
        collider: !initiallyOpen,
        userData: { type: "door" },
      });
      const collider = door.userData.collider;
      if (collider) collider.enabled = !initiallyOpen;

      const doorData = {
        id: name,
        name,
        mesh: door,
        collider,
        locked,
        opened: initiallyOpen,
        axis,
        interactDistance: 2.2,
        closedPosition: door.position.clone(),
      };

      door.userData.door = doorData;
      level.doors.push(doorData);
      return door;
    }

    function addWindow({ name, x, y, z, width = 1.5, height = 1.1, axis = "x" }) {
      const sillHeight = 1.0;
      const midY = y + sillHeight + height / 2;
      const size = axis === "x" ? v(width, height, 0.04) : v(0.04, height, width);
      addBox({
        name: `${name}_glass`,
        pos: v(x, midY, z),
        size,
        mat: materials.glass,
        collider: false,
        castShadow: false,
        userData: { type: "window" },
      });
    }

    function addEnemy(name, x, y, z, patrol = []) {
      const config = TheGame.EnemyConfig ? TheGame.EnemyConfig.defender : { id: "def", hp: 100 };
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 1.15, 6, 12), materials.enemy);
      body.position.set(x, y + 0.95, z);
      body.name = name;
      body.castShadow = true;
      body.userData.enemy = {
        id: name,
        type: config.id,
        hp: config.hp,
        active: true,
        patrol: patrol.map((point) => new THREE.Vector3(point[0], y, point[1])),
      };
      scene.add(body);
      level.enemies.push(body);
      return body;
    }

    level.addEnemy = addEnemy;

    function addHostageSpawn(name, x, y, z) {
      level.hostageSpawns.push({ name, x, y, z });
    }

    /** Grey hostage figure from boxes: kneeling, slight lean, arms behind back. */
    function buildKneelingHostageFigure(mat) {
      const group = new THREE.Group();

      function part(geom, px, py, pz, rx, ry, rz) {
        const mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(px, py, pz);
        if (rx || ry || rz) mesh.rotation.set(rx, ry, rz);
        group.add(mesh);
        return mesh;
      }

      part(new THREE.BoxGeometry(0.36, 0.08, 0.46), 0, 0.04, -0.05, 0, 0, 0);
      part(new THREE.BoxGeometry(0.15, 0.08, 0.4), 0.22, 0.06, -0.2, 0.08, 0.12, 0);
      part(new THREE.BoxGeometry(0.15, 0.08, 0.4), -0.22, 0.06, -0.2, 0.08, -0.12, 0);
      part(new THREE.BoxGeometry(0.16, 0.34, 0.16), 0.2, 0.28, 0.02, -0.72, 0, -0.08);
      part(new THREE.BoxGeometry(0.16, 0.34, 0.16), -0.2, 0.28, 0.02, -0.72, 0, 0.08);
      part(new THREE.BoxGeometry(0.34, 0.18, 0.28), 0, 0.42, 0.04);
      part(new THREE.BoxGeometry(0.36, 0.42, 0.24), 0, 0.72, -0.02, 0.2, 0, 0);
      part(new THREE.BoxGeometry(0.22, 0.1, 0.28), -0.24, 0.7, -0.16, 0.12, 0.4, 0.06);
      part(new THREE.BoxGeometry(0.4, 0.15, 0.22), 0, 0.92, -0.04, 0.1, 0, 0);
      part(new THREE.BoxGeometry(0.14, 0.08, 0.12), 0, 1.05, 0);
      part(new THREE.BoxGeometry(0.2, 0.24, 0.2), 0, 1.18, 0.04, 0.08, 0, 0);

      return group;
    }

    function spawnRandomHostage() {
      if (level.hostageSpawns.length === 0) return null;

      const spawn = level.hostageSpawns[Math.floor(Math.random() * level.hostageSpawns.length)];
      const hostage = buildKneelingHostageFigure(materials.hostage);
      hostage.name = "hostage";
      hostage.position.set(spawn.x, spawn.y + 0.02, spawn.z);
      hostage.rotation.y = Math.random() * Math.PI * 2;
      hostage.userData.hostage = {
        id: spawn.name,
        rescued: false,
        alive: true,
      };
      scene.add(hostage);
      level.hostages.push(hostage);
      return hostage;
    }

    function addStairs({ name, start, steps, stepSize, direction = "z+", mat = materials.stairs }) {
      const dir = direction === "z+" ? v(0, 0, 1) : direction === "z-" ? v(0, 0, -1) : direction === "x+" ? v(1, 0, 0) : v(-1, 0, 0);
      for (let i = 0; i < steps; i += 1) {
        addBox({
          name: `${name}_step_${i}`,
          pos: v(start.x + dir.x * stepSize.z * i, start.y + stepSize.y * i, start.z + dir.z * stepSize.z * i),
          size: v(stepSize.x, Math.abs(stepSize.y), stepSize.z),
          mat,
          collider: true,
          userData: { type: "stairs" },
        });
      }
    }

    function addLight(name, x, y, z, intensity = 1.1, distance = 11, color = 0xfff3d6) {
      const light = new THREE.PointLight(color, intensity, distance, 1.7);
      light.name = name;
      light.position.set(x, y, z);
      light.castShadow = true;
      scene.add(light);
      return light;
    }

    function addZone(name, x, z, width, depth, floorY) {
      level.zones.push({
        name,
        xMin: x - width / 2,
        xMax: x + width / 2,
        zMin: z - depth / 2,
        zMax: z + depth / 2,
        floorY,
      });
    }

    // ==========================================
    // Core layout & exterior
    // ==========================================
    scene.background = new THREE.Color(0x0a0c0f);
    addFloor("outer_ground", 0, -0.05, 0, 80, 80, materials.outdoor);
    
    // House footprint: width 28 (x: -14..14), depth 20 (z: -10..10)
    addFloor("basement_slab", 0, BY, 0, 28, 20, materials.basementFloor);
    addFloor("ground_slab", 0, GY, 0, 28, 20, materials.floor);
    addFloor("second_slab", 0, SY, 0, 28, 20, materials.secondFloor);

    // Exterior walls
    addWall("exterior_north", 0, GY, -10, 28.6, 6.6, 0.6, materials.exteriorWall);
    addWall("exterior_south_left", -9, GY, 10, 10, 6.6, 0.6, materials.exteriorWall);
    addWall("exterior_south_right", 9, GY, 10, 10, 6.6, 0.6, materials.exteriorWall);
    addWall("exterior_west", -14, GY, 0, 0.6, 6.6, 20.6, materials.exteriorWall);
    addWall("exterior_east", 14, GY, 0, 0.6, 6.6, 20.6, materials.exteriorWall);

    // ==========================================
    // Ground floor — living, office, kitchen, dining
    // ==========================================
    // Front foyer
    addDoor({ name: "main_front_door", x: 0, y: GY, z: 10, width: 2.2, axis: "x" });
    addWall("foyer_wall_west", -3, GY, 6, 0.3, 3.2, 8);
    addWall("foyer_wall_east", 3, GY, 6, 0.3, 3.2, 8);
    addDoor({ name: "foyer_to_living", x: -3, y: GY, z: 5, width: 1.5, axis: "z" });
    addDoor({ name: "foyer_to_dining", x: 3, y: GY, z: 5, width: 1.5, axis: "z" });

    // West: living (front) & office (back)
    addWall("living_office_divider", -8.5, GY, 0, 11, 3.2, 0.3);
    addDoor({ name: "living_to_office", x: -5, y: GY, z: 0, width: 1.2, axis: "x" });
    addHalfWall("living_sofa", -9, GY, 5, 4, 0.9, 1.5);
    addWindow({ name: "living_huge_window", x: -9, y: GY, z: 10, width: 4, axis: "x" }); // wide firefight window

    // East: dining (front) & kitchen (back)
    addWall("dining_kitchen_divider", 8.5, GY, 0, 11, 3.2, 0.3);
    addDoor({ name: "dining_to_kitchen", x: 5, y: GY, z: 0, width: 1.2, axis: "x" });
    addHalfWall("kitchen_island", 9, GY, -5, 5, 1.1, 1.5);
    addDoor({ name: "kitchen_back_door", x: 14, y: GY, z: -5, width: 1.2, axis: "z" }); // kitchen rear exit

    // ==========================================
    // Second floor — master, kids room, bath
    // ==========================================
    // Hallway divider walls
    addWall("hallway_wall_west", -3, SY, 0, 0.3, 3.2, 20);
    addWall("hallway_wall_east", 3, SY, 0, 0.3, 3.2, 20);

    // West: master (front) & bath (back)
    addWall("master_bath_divider", -8.5, SY, 0, 11, 3.2, 0.3);
    addDoor({ name: "hall_to_master", x: -3, y: SY, z: 5, width: 1.2, axis: "z" });
    addDoor({ name: "hall_to_bath", x: -3, y: SY, z: -5, width: 1.2, axis: "z" });
    addHalfWall("master_bed", -11, SY, 5, 3, 0.7, 4);
    
    // Master balcony (breach line)
    addFloor("master_balcony_floor", -17, SY, 5, 6, 8, materials.balcony);
    addHalfWall("master_balcony_rail", -19.9, SY, 5, 0.2, 1.1, 8);
    addDoor({ name: "master_balcony_door", x: -14, y: SY, z: 5, width: 1.5, axis: "z" });

    // East: kids room (front) & workshop (back)
    addWall("kids_workshop_divider", 8.5, SY, 0, 11, 3.2, 0.3);
    addDoor({ name: "hall_to_kids", x: 3, y: SY, z: 5, width: 1.2, axis: "z", initiallyOpen: true });
    addDoor({ name: "hall_to_workshop", x: 3, y: SY, z: -5, width: 1.2, axis: "z" });
    addWindow({ name: "kids_room_window", x: 9, y: SY, z: 10, width: 2, axis: "x" }); // small window angle

    // ==========================================
    // Basement — garage & gym
    // ==========================================
    addWall("basement_center_wall", 0, BY, 0, 0.5, 3.2, 20, materials.basementWall);
    addDoor({ name: "garage_to_gym", x: 0, y: BY, z: -5, width: 1.2, axis: "z" });

    // Garage (west)
    addWall("garage_door_metal", -7, BY, 10, 10, 3.2, 0.4, materials.darkMetal); // closed garage door mass
    addBox({ name: "garage_car_cover", pos: v(-7, BY + 0.8, 2), size: v(4, 1.6, 6), mat: materials.darkMetal });

    // Gym / laundry (east)
    addHalfWall("gym_equipment", 7, BY, 5, 3, 1.2, 3);
    addBox({ name: "laundry_machine", pos: v(12, BY + 0.5, -8), size: v(2, 1, 1.5), mat: materials.wall });

    // ==========================================
    // Vertical circulation — central rear of house
    // ==========================================
    // B1 -> 1F stairs
    addStairs({
      name: "stairs_b1_to_1f",
      start: v(0, GY - 0.2, 4),
      steps: 16,
      stepSize: v(2.5, -0.21, -0.5), // down toward -Z
      direction: "z-",
      mat: materials.basementStairs,
    });

    // 1F -> 2F stairs (stacked above)
    addStairs({
      name: "stairs_1f_to_2f",
      start: v(0, GY, 4),
      steps: 16,
      stepSize: v(2.5, 0.21, -0.5), // up toward -Z
      direction: "z-",
    });

    // ==========================================
    // Lights, enemies, zones
    // ==========================================
    addLight("foyer_light", 0, GY + 2.8, 5, 1.5, 15);
    addLight("kitchen_light", 9, GY + 2.8, -5, 1.2, 12);
    addLight("master_light", -8, SY + 2.8, 5, 1.2, 12);
    addLight("garage_light", -7, BY + 2.8, 2, 1.5, 18, 0x99bbff);

    // Saved enemy placements.
    addEnemy("debug_enemy_1", -43.548, 5.507, -9.554);
    addEnemy("debug_enemy_2", -43.969, 5.507, -16.563);
    addEnemy("debug_enemy_3", -49.861, 5.507, -17.149);
    addEnemy("debug_enemy_4", -51.776, 5.507, -14.314);
    addEnemy("debug_enemy_5", -53.247, 5.507, -3.14);
    addEnemy("debug_enemy_6", -53.048, 5.507, 6.973);
    addEnemy("debug_enemy_7", -47.821, 5.507, 10.304);
    addEnemy("debug_enemy_8", -19.843, 5.507, 2.999);
    addEnemy("debug_enemy_9", -23.921, 5.507, 5.645);
    addEnemy("debug_enemy_10", -23.56, 5.507, -11.436);
    addEnemy("debug_enemy_11", -22.776, 5.507, -9.661);
    addEnemy("debug_enemy_12", -22.623, 5.507, 2.622);
    addEnemy("debug_enemy_13", -50.231, 1.464, -16.214);
    addEnemy("debug_enemy_14", -51.99, 1.464, -15.069);
    addEnemy("debug_enemy_15", -52.073, 1.385, -12.195);
    addEnemy("debug_enemy_16", -20.455, 1.385, 3.807);
    addEnemy("debug_enemy_17", -21.722, 1.385, 5.493);
    addEnemy("debug_enemy_18", -27.376, 1.385, -5.96);
    addEnemy("debug_enemy_19", -43.904, -4.493, -0.505);
    addEnemy("debug_enemy_20", -36.403, -4.493, 3.651);
    addEnemy("debug_enemy_21", -25.282, -4.493, 1.243);
    addEnemy("debug_enemy_22", -20.203, -4.493, 2.403);
    addEnemy("debug_enemy_23", -44.055, -4.493, -14.26);
    addEnemy("debug_enemy_24", -54.345, -4.493, -2.458);

    // Pick one random hostage spawn.
    addHostageSpawn("hostage_spawn_1", -52.144, 5.507, -16.621);
    addHostageSpawn("hostage_spawn_2", -20.38, 5.507, 5.397);
    addHostageSpawn("hostage_spawn_3", -18.636, 1.464, 6.343);
    addHostageSpawn("hostage_spawn_4", -19.721, -4.493, -2.096);
    spawnRandomHostage();

    // Objective markers (placeholder)
    level.visualMeshes.push(addZoneMarker("obj_garage", -7, BY + 0.05, 0, 4, 4, 0xff0000, scene));
    level.visualMeshes.push(addZoneMarker("obj_kids_room", 8, SY + 0.05, 5, 3, 3, 0xff0000, scene));

    // Zone layout
    addZone("Outside", 0, 0, 80, 80, 0);
    addZone("Basement Garage", -7, 0, 14, 20, BY);
    addZone("Basement Gym", 7, 0, 14, 20, BY);
    addZone("1F West Wing", -7, 0, 14, 20, GY);
    addZone("1F East Wing", 7, 0, 14, 20, GY);
    addZone("2F West Wing", -7, 0, 14, 20, SY);
    addZone("2F East Wing", 7, 0, 14, 20, SY);
    addZone("Master Balcony", -17, 5, 6, 8, SY);

    // ==========================================
    // Level API: floor height & navigation
    // ==========================================
    level.getFloorHeightAt = function getFloorHeightAt(x, z, currentEyeY) {
      // Stair volume (X: -1.25..1.25, Z: -4..4)
      if (x > -1.25 && x < 1.25 && z > -4 && z < 4) {
        // Interpolate run along stairs (Z from 4 toward -4)
        const t = THREE.MathUtils.clamp((4 - z) / 8, 0, 1);
        // Eye high → 1F->2F stair
        if (currentEyeY > 1.8) {
          return t * SY; // 0 .. 3.4
        }
        // Else B1->1F stair
        return GY - (1 - t) * Math.abs(BY); // from 0 down to -3.2
      }

      // Interior box (28x20)
      if (x >= -14 && x <= 14 && z >= -10 && z <= 10) {
        if (currentEyeY > 2.0) return SY; // 2F
        if (currentEyeY < -1.0) return BY; // B1
        return GY; // 1F
      }

      // Balcony zone
      if (x >= -20 && x < -14 && z >= 1 && z <= 9 && currentEyeY > 2.0) return SY;

      return 0; // outdoor ground
    };

    level.getZoneForPosition = function getZoneForPosition(position) {
      const floorY = position.y - 1.7;
      const candidates = level.zones.filter((zone) => (
        position.x >= zone.xMin &&
        position.x <= zone.xMax &&
        position.z >= zone.zMin &&
        position.z <= zone.zMax
      ));

      if (candidates.length === 0) return null;
      return candidates.reduce((best, zone) => (
        Math.abs(zone.floorY - floorY) < Math.abs(best.floorY - floorY) ? zone : best
      ), candidates[0]);
    };

    level.getNearestDoor = function getNearestDoor(position) {
      let nearest = null;
      level.doors.forEach((door) => {
        const distance = position.distanceTo(door.mesh.position);
        if (!nearest || distance < nearest.distance) nearest = { door, distance };
      });
      return nearest;
    };

    level.toggleNearestDoor = function toggleNearestDoor(position) {
      const nearest = level.getNearestDoor(position);
      if (!nearest || nearest.distance > nearest.door.interactDistance || nearest.door.locked) return false;

      const door = nearest.door;
      door.opened = !door.opened;
      if (door.collider) door.collider.enabled = !door.opened;
      door.mesh.visible = !door.opened && level.prototypeVisualsVisible;
      return true;
    };

    level.update = function updateLevel() {
      level.doors.forEach((door) => {
        if (door.collider) refreshCollider(door.collider);
      });
    };

    level.setPrototypeVisualsVisible = function setPrototypeVisualsVisible(isVisible) {
      level.prototypeVisualsVisible = isVisible;
      level.visualMeshes.forEach((mesh) => {
        mesh.visible = isVisible;
      });
      level.doors.forEach((door) => {
        door.mesh.visible = !door.opened && isVisible;
      });
    };

    return level;
  }

  function createMaterials() {
    const mat = (color, roughness = 0.8, metalness = 0.1) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
    return {
      outdoor: mat(0x1a1c20, 0.9, 0),
      floor: mat(0x665544, 0.7), // wood
      secondFloor: mat(0x554433, 0.7),
      basementFloor: mat(0x444444, 0.8), // concrete
      balcony: mat(0x556655, 0.6),
      wall: mat(0xddddcc, 0.9),
      exteriorWall: mat(0x994433, 0.95, 0), // brick
      basementWall: mat(0x555566, 0.9),
      door: mat(0x442211, 0.8),
      lockedDoor: mat(0x222222, 0.8),
      glass: new THREE.MeshStandardMaterial({ color: 0x88ccff, transparent: true, opacity: 0.3 }),
      halfWall: mat(0x889988, 0.9),
      stairs: mat(0x443322, 0.8),
      basementStairs: mat(0x222222, 0.9),
      darkMetal: mat(0x222222, 0.4, 0.8),
      enemy: mat(0xff0000, 0.5),
      hostage: new THREE.MeshStandardMaterial({
        color: 0x8a8a8a,
        roughness: 0.88,
        metalness: 0.06,
      }),
    };
  }

  function addZoneMarker(name, x, y, z, w, d, color, scene) {
    const geometry = new THREE.PlaneGeometry(w, d);
    const material = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.3, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  TheGame.buildCQBLevel = buildCQBLevel;
})();
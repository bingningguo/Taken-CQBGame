// Indoor range: flat floor, berms, paper targets; API aligned with CQB level.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  function v3(x, y, z) {
    return new THREE.Vector3(x, y, z);
  }

  function buildShootingRangeLevel(scene) {
    const level = {
      spawn: {
        position: new THREE.Vector3(0, 2.1, 12),
        yaw: 0,
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
      metadata: { name: "Shooting Range", theme: "indoor_lane" },
    };

    function refreshCollider(collider) {
      collider.box.setFromObject(collider.mesh);
      collider.minX = collider.box.min.x;
      collider.maxX = collider.box.max.x;
      collider.minY = collider.box.min.y;
      collider.maxY = collider.box.max.y;
      collider.minZ = collider.box.min.z;
      collider.maxZ = collider.box.max.z;
    }

    function addStaticBox(name, pos, sizeVec, material) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(sizeVec.x, sizeVec.y, sizeVec.z), material);
      mesh.position.copy(pos);
      mesh.name = name;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      level.visualMeshes.push(mesh);
      const colliderEntry = {
        name,
        mesh,
        type: "static",
        enabled: true,
        box: new THREE.Box3(),
      };
      refreshCollider(colliderEntry);
      level.colliders.push(colliderEntry);
      return mesh;
    }

    const baseGround = scene.getObjectByName("base_ground");
    if (baseGround) baseGround.visible = false;

    const floorMat = new THREE.MeshStandardMaterial({ color: 0x5c5c54, roughness: 0.92 });
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x8e8e82, roughness: 0.88 });

    addStaticBox("range_floor", v3(0, -0.12, -2), v3(42, 0.24, 52), floorMat);
    addStaticBox("wall_back", v3(0, 2.2, -18), v3(42, 4.6, 0.45), wallMat);
    addStaticBox("wall_left", v3(-13, 2.2, -2), v3(0.45, 4.6, 48), wallMat);
    addStaticBox("wall_right", v3(13, 2.2, -2), v3(0.45, 4.6, 48), wallMat);
    addStaticBox("wall_front", v3(0, 2.2, 14), v3(42, 4.6, 0.45), wallMat);

    const targetXs = [-7.5, -3.75, 0, 3.75, 7.5];
    targetXs.forEach((x, i) => {
      const group = new THREE.Group();
      group.name = `range_target_${i + 1}`;
      group.position.set(x, 1.35, -14.5);

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(1.15, 1.55, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xf2efe6, roughness: 0.75 })
      );
      board.name = `range_target_${i + 1}_board`;
      board.position.z = 0;
      group.add(board);

      const bull = new THREE.Mesh(
        new THREE.CircleGeometry(0.18, 24),
        new THREE.MeshStandardMaterial({ color: 0xc41e1e, roughness: 0.6 })
      );
      bull.name = `range_target_${i + 1}_bull`;
      bull.position.set(0, 0.12, 0.066);
      group.add(bull);

      const ring = new THREE.Mesh(
        new THREE.RingGeometry(0.28, 0.38, 32),
        new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.7 })
      );
      ring.name = `range_target_${i + 1}_ring`;
      ring.position.set(0, 0.12, 0.065);
      group.add(ring);

      scene.add(group);
      level.visualMeshes.push(group);

      group.userData.enemy = {
        type: "rangeTarget",
        hp: 520,
        state: "idle",
        active: true,
      };

      group.userData.modelReady = true;

      level.enemies.push(group);
    });

    level.getFloorHeightAt = function getFloorHeightAt() {
      return 0;
    };

    level.getNearestDoor = function getNearestDoor() {
      return null;
    };

    level.toggleNearestDoor = function toggleNearestDoor() {
      return false;
    };

    level.update = function updateRangeLevel() {};

    level.setPrototypeVisualsVisible = function setPrototypeVisualsVisible(isVisible) {
      level.prototypeVisualsVisible = isVisible;
      level.visualMeshes.forEach((mesh) => {
        mesh.visible = isVisible;
      });
    };

    return level;
  }

  TheGame.buildShootingRangeLevel = buildShootingRangeLevel;
})();

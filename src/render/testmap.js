(function () {
    const TheGame = (window.TheGame = window.TheGame || {});
  
    function buildCQBLevel(scene) {
      const level = {
        spawn: {
          position: new THREE.Vector3(0, 1.7, -12), // spawn: front yard outside main door
          yaw: Math.PI,
        },
        colliders: [],
        doors: [], // test map: no doors; empty array keeps shared system API
        enemies: [],
        interactables: [],
        visualMeshes: [],
        prototypeVisualsVisible: true,
        zones: [],
        metadata: {
          name: "R6 House 1F Prototype (Door Frames Only)",
        },
      };
  
      const materials = createMaterials();
      const GY = 0; // floor height
      const WALL_H = 3.2; // full wall height
      const DOOR_H = 2.2; // door opening height
  
      function v(x, y, z) { return new THREE.Vector3(x, y, z); }
  
      function refreshCollider(collider) {
        collider.box.setFromObject(collider.mesh);
        collider.minX = collider.box.min.x; collider.maxX = collider.box.max.x;
        collider.minY = collider.box.min.y; collider.maxY = collider.box.max.y;
        collider.minZ = collider.box.min.z; collider.maxZ = collider.box.max.z;
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
          const colliderEntry = { name: mesh.name, mesh, type: userData.type || "static", enabled: true, box: new THREE.Box3() };
          refreshCollider(colliderEntry);
          level.colliders.push(colliderEntry);
          mesh.userData.collider = colliderEntry;
        }
        return mesh;
      }
  
      function addFloor(name, x, y, z, w, d, mat = materials.floor) {
        return addBox({ name, pos: v(x, y - 0.1, z), size: v(w, 0.2, d), mat, collider: true, userData: { type: "floor" } });
      }
  
      function addWall(name, x, y, z, w, h, d, mat = materials.wall) {
        return addBox({ name, pos: v(x, y + h / 2, z), size: v(w, h, d), mat, collider: true, userData: { type: "wall" } });
      }
  
      function addHalfWall(name, x, y, z, w, h, d) {
        return addBox({ name, pos: v(x, y + h / 2, z), size: v(w, h, d), mat: materials.halfWall, collider: true, userData: { type: "cover" } });
      }
  
      // ==========================================
      // Smart wall builder with door openings
      // ==========================================
      
      // Wall along X at fixed z; holeStart/holeEnd = door span on X
      function addWallX(name, x1, x2, z, h, thickness, holeStart, holeEnd, holeH, mat) {
        if (holeStart !== undefined && holeStart !== null) {
          // left segment
          if (holeStart > x1) addWall(name + "_left", x1 + (holeStart - x1)/2, GY, z, holeStart - x1, h, thickness, mat);
          // right segment
          if (x2 > holeEnd) addWall(name + "_right", holeEnd + (x2 - holeEnd)/2, GY, z, x2 - holeEnd, h, thickness, mat);
          // lintel above door
          if (h > holeH) {
            // y passed to addWall is holeH; addWall centers by adding (h - holeH)/2
            addWall(name + "_top", holeStart + (holeEnd - holeStart)/2, GY + holeH, z, holeEnd - holeStart, h - holeH, thickness, mat);
          }
        } else {
          // solid wall, no opening
          addWall(name, x1 + (x2 - x1)/2, GY, z, x2 - x1, h, thickness, mat);
        }
      }
  
      // Wall along Z at fixed x
      function addWallZ(name, z1, z2, x, h, thickness, holeStart, holeEnd, holeH, mat) {
        if (holeStart !== undefined && holeStart !== null) {
          // front segment
          if (holeStart > z1) addWall(name + "_front", x, GY, z1 + (holeStart - z1)/2, thickness, h, holeStart - z1, mat);
          // back segment
          if (z2 > holeEnd) addWall(name + "_back", x, GY, holeEnd + (z2 - holeEnd)/2, thickness, h, z2 - holeEnd, mat);
          // lintel
          if (h > holeH) {
            addWall(name + "_top", x, GY + holeH, holeStart + (holeEnd - holeStart)/2, thickness, h - holeH, holeEnd - holeStart, mat);
          }
        } else {
          addWall(name, x, GY, z1 + (z2 - z1)/2, thickness, h, z2 - z1, mat);
        }
      }
  
  
      // ==========================================
      // House shell
      // ==========================================
      scene.background = new THREE.Color(0x1a1c20);
      addFloor("outer_ground", 0, -0.05, 0, 40, 40, materials.outdoor);
      addFloor("house_1f_slab", 0, GY, 0, 22, 14, materials.floor); // 22 x 14 footprint
  
      // 1. Exterior
      // North face: 2m wide door frame, X from -0.5 to 1.5
      addWallX("ext_north", -11, 11, -7, WALL_H, 0.4, -0.5, 1.5, DOOR_H, materials.exteriorWall);
      // South: solid
      addWallX("ext_south", -11, 11, 7, WALL_H, 0.4, null, null, null, materials.exteriorWall);
      // West
      addWallZ("ext_west", -7, 7, -11, WALL_H, 0.4, null, null, null, materials.exteriorWall);
      // East
      addWallZ("ext_east", -7, 7, 11, WALL_H, 0.4, null, null, null, materials.exteriorWall);
  
  
      // 2. Interior walls & door openings
      
      // Living / foyer divider (Z -7..0 at X = -2); opening Z -3 .. -1.5
      addWallZ("wall_liv_lob", -7, 0, -2, WALL_H, 0.3, -3, -1.5, DOOR_H, materials.destructibleWall);
  
      // Foyer / office divider (Z -7..0 at X = 4.5); opening Z -4 .. -2.5
      addWallZ("wall_lob_off", -7, 0, 4.5, WALL_H, 0.3, -4, -2.5, DOOR_H, materials.destructibleWall);
  
      // Central spine at Z = 0
      // Living back wall toward stairs; opening X -4.5 .. -3
      addWallX("wall_liv_back", -11, -2, 0, WALL_H, 0.3, -4.5, -3, DOOR_H, materials.wall);
      
      // Open run X -2 .. 1.5 for main hall / stair access
      
      // Foyer back wall (kitchen side)
      addWallX("wall_lob_kit", 1.5, 4.5, 0, WALL_H, 0.3, null, null, null, materials.wall);
      
      // Office back wall to dining; opening X 6 .. 7.5
      addWallX("wall_off_din", 4.5, 11, 0, WALL_H, 0.3, 6, 7.5, DOOR_H, materials.destructibleWall);
  
      // Kitchen / dining divider (Z 0..7 at X = 4.5); double opening Z 1.5 .. 3.5
      addWallZ("wall_kit_din", 0, 7, 4.5, WALL_H, 0.3, 1.5, 3.5, DOOR_H, materials.destructibleWall);
  
      // Kitchen / side-stair divider (Z 0..7 at X = -3); opening Z 1 .. 2.5
      addWallZ("wall_kit_back", 0, 7, -3, WALL_H, 0.3, 1, 2.5, DOOR_H, materials.wall);
  
  
      // 3. Interior cover props
      addHalfWall("living_sofa", -6.5, GY, -3, 3.5, 0.9, 1.2);
      addBox({ name: "living_tv_stand", pos: v(-10.5, GY+0.5, -3), size: v(0.6, 1.0, 3.0), mat: materials.wood });
      addHalfWall("kitchen_island", 1, GY, 3.5, 3.5, 1.0, 1.5);
      addHalfWall("dining_table", 8, GY, 4, 3.0, 0.85, 1.5);
      addHalfWall("office_desk", 8, GY, -5, 2.0, 0.9, 1.0);
  
      // Blocked stair volumes (no playable stairs)
      addBox({ name: "main_stairs_block", pos: v(0, GY+1.6, -1), size: v(3, WALL_H, 2), mat: materials.wall });
      addBox({ name: "side_stairs_block", pos: v(-7, GY+1.6, 4), size: v(7, WALL_H, 5), mat: materials.wall });
  
      // 4. Fill lights
      const addLight = (name, x, y, z) => {
          const l = new THREE.PointLight(0xfff3d6, 1.2, 10, 1.5);
          l.position.set(x, y, z);
          l.castShadow = true;
          scene.add(l);
      };
      addLight("light_lobby", 1, GY + 2.8, -4);
      addLight("light_kitchen", 1, GY + 2.8, 4);
      addLight("light_living", -6, GY + 2.8, -3);
      addLight("light_dining", 8, GY + 2.8, 4);

      level.getFloorHeightAt = function getFloorHeightAt() {
        return GY;
      };

      level.getZoneForPosition = function getZoneForPosition(position) {
        const candidates = level.zones.filter((zone) => (
          position.x >= zone.xMin &&
          position.x <= zone.xMax &&
          position.z >= zone.zMin &&
          position.z <= zone.zMax
        ));

        return candidates.length > 0 ? candidates[0] : null;
      };

      level.getNearestDoor = function getNearestDoor() {
        return null;
      };

      level.toggleNearestDoor = function toggleNearestDoor() {
        return false;
      };

      level.update = function updateLevel() {};

      level.setPrototypeVisualsVisible = function setPrototypeVisualsVisible(isVisible) {
        level.prototypeVisualsVisible = isVisible;
        level.visualMeshes.forEach((mesh) => {
          mesh.visible = isVisible;
        });
      };
  
      return level;
    }
  
    function createMaterials() {
      const mat = (color, r = 0.8) => new THREE.MeshStandardMaterial({ color, roughness: r });
      return {
        outdoor: mat(0x222222, 0.9),
        floor: mat(0x554433, 0.7), 
        wall: mat(0xddddcc, 0.9), 
        destructibleWall: mat(0xcc5544, 0.9), // soft wall highlight
        exteriorWall: mat(0x777788, 0.9),
        halfWall: mat(0xaaaa99, 0.9),
        wood: mat(0x664422, 0.8),
      };
    }
  
    TheGame.buildCQBLevel = buildCQBLevel;
  })();
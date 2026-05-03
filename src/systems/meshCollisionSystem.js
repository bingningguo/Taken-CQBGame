// GLB mesh collision powered by three-mesh-bvh. This is intended for static
// map walls and floors; doors and gameplay objects stay as separate logic.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class MeshCollisionSystem {
    constructor(config = TheGame.GameConfig.meshCollision) {
      this.config = config;
      this.enabled = Boolean(config && config.enabled);
      this.ready = false;
      this.meshes = [];
      this.raycaster = new THREE.Raycaster();
      this.down = new THREE.Vector3(0, -1, 0);
    }

    async buildFromMap(map) {
      if (!this.enabled || !map) return;

      try {
        const { MeshBVH, acceleratedRaycast } = await import("https://esm.sh/three-mesh-bvh@0.7.8?deps=three@0.160.0");
        const meshes = [];

        map.updateMatrixWorld(true);
        map.traverse((object) => {
          if (!object.isMesh || !object.geometry || !this.shouldUseMesh(object)) return;

          object.geometry.boundsTree = new MeshBVH(object.geometry);
          object.raycast = acceleratedRaycast;
          object.updateMatrixWorld(true);
          meshes.push(object);
        });

        this.meshes = meshes;
        this.ready = meshes.length > 0;
        console.info(`Mesh collision ready: ${meshes.length} GLB meshes indexed.`);
      } catch (error) {
        console.warn("Mesh collision failed to initialize.", error);
      }
    }

    resolveHorizontalCollision(current, desired, radius, playerHeight) {
      if (!this.ready) return desired;

      const resolved = { x: current.x, z: current.z };
      const y = current.y;

      if (!this.blocksMove({ x: current.x, y, z: current.z }, { x: desired.x, y, z: current.z }, radius, playerHeight)) {
        resolved.x = desired.x;
      }

      if (!this.blocksMove({ x: resolved.x, y, z: current.z }, { x: resolved.x, y, z: desired.z }, radius, playerHeight)) {
        resolved.z = desired.z;
      }

      return resolved;
    }

    blocksMove(from, to, radius, playerHeight) {
      const delta = new THREE.Vector3(to.x - from.x, 0, to.z - from.z);
      const distance = delta.length();
      if (distance <= 0.0001) return false;

      const direction = delta.normalize();
      const feetY = from.y - playerHeight;
      const sampleHeights = [0.35, playerHeight * 0.55, playerHeight - 0.15];

      return sampleHeights.some((heightOffset) => {
        const origin = new THREE.Vector3(from.x, feetY + heightOffset, from.z);
        return this.raycastFirst(origin, direction, distance + radius) !== null;
      });
    }

    getFloorHeightAt(x, z, currentEyeY) {
      if (!this.ready) return null;

      const startOffset = this.config.floorRayStartOffset ?? 0.25;
      const rayLength = this.config.floorRayLength ?? 6;
      const origin = new THREE.Vector3(x, currentEyeY + startOffset, z);
      const hits = this.raycastAll(origin, this.down, rayLength);

      for (const hit of hits) {
        if (this.isFloorHit(hit)) return hit.point.y;
      }

      return null;
    }

    raycastFirst(origin, direction, far) {
      this.raycaster.set(origin, direction);
      this.raycaster.far = far;

      for (const mesh of this.meshes) {
        const hits = this.raycaster.intersectObject(mesh, false);
        if (hits.length > 0) return hits[0];
      }

      return null;
    }

    raycastAll(origin, direction, far) {
      this.raycaster.set(origin, direction);
      this.raycaster.far = far;

      const hits = [];
      this.meshes.forEach((mesh) => {
        hits.push(...this.raycaster.intersectObject(mesh, false));
      });
      hits.sort((a, b) => a.distance - b.distance);
      return hits;
    }

    isFloorHit(hit) {
      if (!hit.face) return true;

      const normal = hit.face.normal.clone();
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
      normal.applyMatrix3(normalMatrix).normalize();

      return normal.y >= (this.config.minFloorNormalY ?? 0.45);
    }

    shouldUseMesh(mesh) {
      const name = mesh.name.toLowerCase();
      const includePrefixes = this.config.includeNamePrefixes || [];
      const excludePrefixes = this.config.excludeNamePrefixes || [];

      if (excludePrefixes.some((prefix) => name.startsWith(prefix.toLowerCase()))) return false;
      if (includePrefixes.length === 0) return true;

      return includePrefixes.some((prefix) => name.startsWith(prefix.toLowerCase()));
    }
  }

  TheGame.MeshCollisionSystem = MeshCollisionSystem;
})();

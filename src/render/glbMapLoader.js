// Optional GLB map loading for downloaded visual maps. The current hand-built
// colliders and floor logic remain active, so a missing GLB will not break play.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class GlbMapLoader {
    constructor(scene, level, config = TheGame.GameConfig.glbMap) {
      this.scene = scene;
      this.level = level;
      this.config = config;
      this.map = null;
    }

    async load() {
      if (!this.config || !this.config.enabled || !this.config.path) return null;

      try {
        const { GLTFLoader } = await import("https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js?deps=three@0.160.0");
        const loader = new GLTFLoader();
        const gltf = await loader.loadAsync(this.config.path);

        this.map = gltf.scene;
        this.map.name = "external_glb_map";
        this.applyTransform(this.map);
        this.scene.add(this.map);
        if (this.config.hidePrototypeVisualsOnLoad && this.level && this.level.setPrototypeVisualsVisible) {
          this.level.setPrototypeVisualsVisible(false);
          const baseGround = this.scene.getObjectByName("base_ground");
          if (baseGround) baseGround.visible = false;
        }

        console.info(`GLB map loaded from ${this.config.path}.`);
        return this.map;
      } catch (error) {
        console.warn(`GLB map not loaded from ${this.config.path}. Replace the placeholder with a real .glb file when ready.`, error);
        return null;
      }
    }

    applyTransform(map) {
      const position = this.config.position || { x: 0, y: 0, z: 0 };
      const rotation = this.config.rotation || { x: 0, y: 0, z: 0 };
      const scale = this.config.scale || { x: 1, y: 1, z: 1 };

      map.position.set(position.x, position.y, position.z);
      map.rotation.set(rotation.x, rotation.y, rotation.z);
      map.scale.set(scale.x, scale.y, scale.z);
    }
  }

  TheGame.GlbMapLoader = GlbMapLoader;
})();

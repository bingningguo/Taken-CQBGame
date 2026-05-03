// Browser-only collider authoring helper. It uses TransformControls and lil-gui
// at runtime so downloaded GLB maps can be aligned without a build step.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class ColliderEditorSystem {
    constructor(scene, camera, renderer, config = TheGame.GameConfig.colliderEditor) {
      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
      this.config = config;
      this.mesh = null;
      this.controls = null;
      this.orbitControls = null;
      this.gui = null;
      this.params = null;
    }

    async init() {
      if (!this.config || !this.config.enabled) return;

      try {
        const [{ TransformControls }, { OrbitControls }, { GUI }] = await Promise.all([
          import("https://esm.sh/three@0.160.0/examples/jsm/controls/TransformControls.js?deps=three@0.160.0"),
          import("https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js?deps=three@0.160.0"),
          import("https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm"),
        ]);

        this.createOrbitControls(OrbitControls);
        this.createColliderMesh();
        this.createTransformControls(TransformControls);
        this.createGui(GUI);
        this.exportData();
      } catch (error) {
        console.warn("Collider editor failed to load.", error);
      }
    }

    update() {
      if (!this.mesh || !this.params) return;
      if (this.orbitControls) this.orbitControls.update();

      this.params.x = round(this.mesh.position.x);
      this.params.y = round(this.mesh.position.y);
      this.params.z = round(this.mesh.position.z);
      this.params.width = round(Math.abs(this.mesh.scale.x));
      this.params.height = round(Math.abs(this.mesh.scale.y));
      this.params.depth = round(Math.abs(this.mesh.scale.z));
    }

    createColliderMesh() {
      const position = this.config.position || { x: 0, y: 1.6, z: 0 };
      const size = this.config.size || { x: 4, y: 3.2, z: 0.3 };
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff55,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      });

      this.mesh = new THREE.Mesh(geometry, material);
      this.mesh.name = this.config.defaultName || "glb_collider_01";
      this.mesh.position.set(position.x, position.y, position.z);
      this.mesh.scale.set(size.x, size.y, size.z);
      this.mesh.renderOrder = 20;
      this.scene.add(this.mesh);

      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: 0x00ff55 })
      );
      this.mesh.add(edges);
    }

    createTransformControls(TransformControls) {
      this.controls = new TransformControls(this.camera, this.renderer.domElement);
      this.controls.setMode("translate");
      this.controls.setSize(0.85);
      this.controls.attach(this.mesh);
      this.controls.addEventListener("dragging-changed", (event) => {
        if (this.orbitControls) this.orbitControls.enabled = !event.value;
      });
      this.scene.add(this.controls);
    }

    createOrbitControls(OrbitControls) {
      const cameraPosition = this.config.cameraPosition || { x: 10, y: 8, z: 18 };
      const cameraTarget = this.config.cameraTarget || { x: 0, y: 1.6, z: 0 };

      this.camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
      this.camera.lookAt(cameraTarget.x, cameraTarget.y, cameraTarget.z);

      this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
      this.orbitControls.target.set(cameraTarget.x, cameraTarget.y, cameraTarget.z);
      this.orbitControls.enableDamping = true;
      this.orbitControls.dampingFactor = 0.08;
      this.orbitControls.update();
    }

    createGui(GUI) {
      this.params = {
        name: this.config.defaultName || "glb_collider_01",
        type: this.config.defaultType || "wall",
        mode: "translate",
        x: this.mesh.position.x,
        y: this.mesh.position.y,
        z: this.mesh.position.z,
        width: this.mesh.scale.x,
        height: this.mesh.scale.y,
        depth: this.mesh.scale.z,
        visible: true,
        exportData: () => this.exportData(),
      };

      this.gui = new GUI({ title: "Collider Editor" });
      this.gui.add(this.params, "name").name("Name");
      this.gui.add(this.params, "type", ["wall", "cover", "door", "static"]).name("Type");
      this.gui.add(this.params, "mode", ["translate", "scale"]).name("Mode").onChange((mode) => {
        this.controls.setMode(mode);
      });
      this.gui.add(this.params, "visible").name("Show boxes").onChange((visible) => {
        this.mesh.visible = visible;
        this.controls.visible = visible;
      });

      const transformFolder = this.gui.addFolder("Fine tune");
      transformFolder.add(this.params, "x", -80, 80, 0.01).onChange((value) => { this.mesh.position.x = value; });
      transformFolder.add(this.params, "y", -20, 20, 0.01).onChange((value) => { this.mesh.position.y = value; });
      transformFolder.add(this.params, "z", -80, 80, 0.01).onChange((value) => { this.mesh.position.z = value; });
      transformFolder.add(this.params, "width", 0.05, 80, 0.01).onChange((value) => { this.mesh.scale.x = value; });
      transformFolder.add(this.params, "height", 0.05, 20, 0.01).onChange((value) => { this.mesh.scale.y = value; });
      transformFolder.add(this.params, "depth", 0.05, 80, 0.01).onChange((value) => { this.mesh.scale.z = value; });

      this.gui.add(this.params, "exportData").name("Export data");
    }

    exportData() {
      if (!this.mesh || !this.params) return;

      const name = sanitizeName(this.params.name);
      const type = sanitizeName(this.params.type);
      const x = format(this.mesh.position.x);
      const y = format(this.mesh.position.y);
      const z = format(this.mesh.position.z);
      const width = format(Math.abs(this.mesh.scale.x));
      const height = format(Math.abs(this.mesh.scale.y));
      const depth = format(Math.abs(this.mesh.scale.z));
      const snippet = `addBox({ name: "${name}", pos: v(${x}, ${y}, ${z}), size: v(${width}, ${height}, ${depth}), mat: materials.debugCollider || materials.halfWall, collider: true, userData: { type: "${type}" } });`;

      console.log("Collider export:");
      console.log(snippet);
    }
  }

  function round(value) {
    return Math.round(value * 100) / 100;
  }

  function format(value) {
    return Number(value.toFixed(2));
  }

  function sanitizeName(value) {
    return String(value || "").replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  TheGame.ColliderEditorSystem = ColliderEditorSystem;
})();

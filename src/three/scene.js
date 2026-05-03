(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  function createThreeContext(canvas) {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8ca6c8);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
    camera.rotation.order = "YXZ";
    camera.userData.baseFov = 75;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.42);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.85);
    directionalLight.position.set(12, 24, 10);
    scene.add(directionalLight);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 90),
      new THREE.MeshStandardMaterial({ color: 0x5f6b58, roughness: 0.95 })
    );
    ground.name = "base_ground";
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    scene.add(ground);

    function resize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight, false);
    }

    window.addEventListener("resize", resize);

    function dispose() {
      window.removeEventListener("resize", resize);
      scene.traverse((obj) => {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
        if (obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if (m && m.dispose) m.dispose();
          });
        }
      });
      renderer.dispose();
    }

    return {
      scene,
      camera,
      renderer,
      resize,
      dispose,
    };
  }

  TheGame.createThreeContext = createThreeContext;
})();

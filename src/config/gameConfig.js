// Global tuning values for the browser-only prototype.
(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  TheGame.GameConfig = {
    player: {
      height: 2.1,
      radius: 0.38,
      jumpVelocity: 6.8,
      spawn: {
        position: { x: -44.781, y: 1.464, z: -47.523 },
        yaw: 3.134393,
      },
    },
    clearLevelEnemiesOnStart: false,
    glbMap: {
      enabled: true,
      path: "assets/maps/villa.glb",
      hidePrototypeVisualsOnLoad: true,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
    colliderEditor: {
      enabled: false,
      defaultName: "glb_wall_01",
      defaultType: "wall",
      position: { x: 0, y: 1.6, z: 0 },
      size: { x: 4, y: 3.2, z: 0.3 },
      cameraPosition: { x: 10, y: 8, z: 18 },
      cameraTarget: { x: 0, y: 1.6, z: 0 },
    },
    meshCollision: {
      enabled: true,
      includeNamePrefixes: [],
      excludeNamePrefixes: ["enemy", "weapon", "door", "glass"],
      floorRayStartOffset: 0.25,
      floorRayLength: 6,
      minFloorNormalY: 0.45,
    },
    /** Hostage: reinforcements hold fire while player feet are inside house AABB. Adjust houseInteriorBounds if misaligned with GLB. */
    hostage: {
      reinforcementHoldFireUntilOutside: true,
      houseInteriorBounds: {
        min: { x: -58, y: -5.8, z: -22 },
        max: { x: -15, y: 8.5, z: 12 },
      },
    },
    mouseSensitivity: {
      base: 0.0012,
      step: 0.00024,
      defaultSliderValue: 5,
    },
  };
})();

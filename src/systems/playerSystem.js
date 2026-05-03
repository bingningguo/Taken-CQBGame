(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class PlayerSystem {
    constructor(camera, input, colliders, spawn, options = {}) {
      this.camera = camera;
      this.input = input;
      this.colliders = colliders;
      this.getFloorHeightAt = options.getFloorHeightAt || (() => 0);
      this.meshCollisionSystem = options.meshCollisionSystem || null;
      const spawnPosition = spawn.position || spawn;
      this.position = new THREE.Vector3(spawnPosition.x, spawnPosition.y, spawnPosition.z);
      this.velocityY = 0;
      this.yaw = spawn.yaw || 0;
      this.pitch = spawn.pitch || 0;
      this.onGround = true;
      this.lean = 0;
      this.headLeanOffset = new THREE.Vector3();
      const playerConfig = TheGame.GameConfig.player || {};
      this.groundHeight = spawnPosition.y - (playerConfig.height || 1.7);

      this.config = {
        height: playerConfig.height || 1.7,
        radius: playerConfig.radius || 0.38,
        walkSpeed: 6.2,
        sprintSpeed: 9.2,
        jumpVelocity: playerConfig.jumpVelocity || 6.8,
        gravity: 18,
        mouseSensitivity: input.mouseSensitivity,
        maxPitch: THREE.MathUtils.degToRad(80),
        leanAmount: 0.62,
        leanSpeed: 9,
        maxStepHeight: 1.4,
      };

      this.adsMouseFactor = 1;
      this.camera.position.copy(this.position);
    }

    applyRecoilPitch(deltaRad) {
      this.pitch += deltaRad;
      this.pitch = Math.max(-this.config.maxPitch, Math.min(this.config.maxPitch, this.pitch));
    }

    setAdsMouseFactor(factor) {
      this.adsMouseFactor = factor;
    }

    update(deltaTime) {
      this.updateLook();
      this.updateMovement(deltaTime);
      this.updateCamera();
    }

    updateLook() {
      const mouseDelta = this.input.consumeMouseDelta();
      const sens = this.adsMouseFactor != null ? this.adsMouseFactor : 1;
      this.yaw -= mouseDelta.x * this.input.mouseSensitivity * sens;
      this.pitch -= mouseDelta.y * this.input.mouseSensitivity * sens;
      this.pitch = Math.max(-this.config.maxPitch, Math.min(this.config.maxPitch, this.pitch));
    }

    updateMovement(deltaTime) {
      // Three.js cameras face local -Z, so movement must follow that rotated direction.
      const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      const move = new THREE.Vector3();

      if (this.input.isDown("KeyW")) move.add(forward);
      if (this.input.isDown("KeyS")) move.sub(forward);
      if (this.input.isDown("KeyD")) move.add(right);
      if (this.input.isDown("KeyA")) move.sub(right);

      if (move.lengthSq() > 0) move.normalize();

      const speed = this.input.isDown("ShiftLeft") || this.input.isDown("ShiftRight")
        ? this.config.sprintSpeed
        : this.config.walkSpeed;

      const desired = {
        x: this.position.x + move.x * speed * deltaTime,
        z: this.position.z + move.z * speed * deltaTime,
      };
      const resolved = this.resolveHorizontalMovement(desired);

      this.position.x = resolved.x;
      this.position.z = resolved.z;

      const meshFloorHeight = this.meshCollisionSystem && this.meshCollisionSystem.getFloorHeightAt
        ? this.meshCollisionSystem.getFloorHeightAt(this.position.x, this.position.z, this.position.y)
        : null;
      const candidateFloorHeight = meshFloorHeight ?? this.getFloorHeightAt(this.position.x, this.position.z, this.position.y);
      const floorHeight = this.resolveFloorHeight(candidateFloorHeight);

      if (this.input.isDown("Space") && this.onGround) {
        this.velocityY = this.config.jumpVelocity;
        this.onGround = false;
      }

      this.velocityY -= this.config.gravity * deltaTime;
      this.position.y += this.velocityY * deltaTime;

      if (this.position.y <= floorHeight + this.config.height) {
        this.position.y = floorHeight + this.config.height;
        this.velocityY = 0;
        this.onGround = true;
        this.groundHeight = floorHeight;
      }

      const targetLean = (this.input.isDown("KeyQ") ? -1 : 0) + (this.input.isDown("KeyE") ? 1 : 0);
      this.lean += (targetLean - this.lean) * Math.min(1, deltaTime * this.config.leanSpeed);
    }

    resolveHorizontalMovement(desired) {
      if (this.meshCollisionSystem && this.meshCollisionSystem.ready) {
        return this.meshCollisionSystem.resolveHorizontalCollision(
          { x: this.position.x, y: this.position.y, z: this.position.z },
          desired,
          this.config.radius,
          this.config.height
        );
      }

      return TheGame.CollisionSystem.resolveHorizontalCollision(
        { x: this.position.x, z: this.position.z },
        desired,
        this.config.radius,
        this.colliders,
        this.position.y - this.config.height,
        this.position.y + 0.2
      );
    }

    resolveFloorHeight(candidateFloorHeight) {
      const currentFeetY = this.position.y - this.config.height;
      const currentGround = this.onGround ? this.groundHeight : currentFeetY;
      const climbDelta = candidateFloorHeight - currentGround;

      if (this.onGround && climbDelta > this.config.maxStepHeight) {
        return this.groundHeight;
      }

      if (!this.onGround && candidateFloorHeight > currentFeetY + this.config.maxStepHeight) {
        return currentFeetY;
      }

      return candidateFloorHeight;
    }

    updateCamera() {
      // Body/collision stays at this.position. Only the head camera leans out.
      this.headLeanOffset
        .set(Math.cos(this.yaw), 0, -Math.sin(this.yaw))
        .multiplyScalar(this.lean * this.config.leanAmount);

      this.camera.position.copy(this.position).add(this.headLeanOffset);
      this.camera.rotation.y = this.yaw;
      this.camera.rotation.x = this.pitch;
      this.camera.rotation.z = -this.lean * 0.16;
      this.camera.userData.bodyPosition = this.position;
      this.camera.userData.headLean = this.lean;
    }
  }

  TheGame.PlayerSystem = PlayerSystem;
})();

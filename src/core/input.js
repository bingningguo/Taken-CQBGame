(function () {
  const TheGame = (window.TheGame = window.TheGame || {});

  class InputController {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.keys = new Set();
      this.pointerLocked = false;
      this.pointerLockEnabled = options.pointerLockEnabled !== false;
      this.mouseSensitivity = options.mouseSensitivity || 0.0024;
      this.mouseDelta = { x: 0, y: 0 };
      this.firePressed = false;
      this.mouseButtons = new Set();
      this.wheelStep = 0;
      this.onPointerLockChange = options.onPointerLockChange || (() => {});

      this.bindEvents();
    }

    bindEvents() {
      this._onKeyDown = (event) => {
        this.keys.add(event.code);
        if (event.code === "Space") event.preventDefault();
      };
      this._onKeyUp = (event) => {
        this.keys.delete(event.code);
      };
      this._onClick = () => {
        if (!this.pointerLockEnabled) return;
        if (document.pointerLockElement !== this.canvas) {
          this.canvas.requestPointerLock();
        }
      };
      this._onContextMenu = (event) => {
        event.preventDefault();
      };
      this._onMouseDown = (event) => {
        if (!this.pointerLocked) return;
        this.mouseButtons.add(event.button);
        if (event.button === 0) this.firePressed = true;
      };
      this._onWheel = (event) => {
        if (!this.pointerLocked) return;
        event.preventDefault();
        this.wheelStep += Math.sign(event.deltaY);
      };
      this._onMouseUp = (event) => {
        this.mouseButtons.delete(event.button);
      };
      this._onPointerLockChange = () => {
        this.pointerLocked = document.pointerLockElement === this.canvas;
        if (!this.pointerLocked) this.mouseButtons.clear();
        this.onPointerLockChange(this.pointerLocked);
      };
      this._onMouseMove = (event) => {
        if (!this.pointerLocked) return;
        this.mouseDelta.x += event.movementX;
        this.mouseDelta.y += event.movementY;
      };

      window.addEventListener("keydown", this._onKeyDown);
      window.addEventListener("keyup", this._onKeyUp);
      this.canvas.addEventListener("click", this._onClick);
      this.canvas.addEventListener("contextmenu", this._onContextMenu);
      this.canvas.addEventListener("mousedown", this._onMouseDown);
      this.canvas.addEventListener("wheel", this._onWheel, { passive: false });
      window.addEventListener("mouseup", this._onMouseUp);
      document.addEventListener("pointerlockchange", this._onPointerLockChange);
      window.addEventListener("mousemove", this._onMouseMove);
    }

    destroy() {
      if (!this._onKeyDown) return;
      window.removeEventListener("keydown", this._onKeyDown);
      window.removeEventListener("keyup", this._onKeyUp);
      this.canvas.removeEventListener("click", this._onClick);
      this.canvas.removeEventListener("contextmenu", this._onContextMenu);
      this.canvas.removeEventListener("mousedown", this._onMouseDown);
      this.canvas.removeEventListener("wheel", this._onWheel);
      window.removeEventListener("mouseup", this._onMouseUp);
      document.removeEventListener("pointerlockchange", this._onPointerLockChange);
      window.removeEventListener("mousemove", this._onMouseMove);
      this._onKeyDown = null;
    }

    isDown(code) {
      return this.keys.has(code);
    }

    isMouseDown(button = 0) {
      return this.mouseButtons.has(button);
    }

    consumeMouseDelta() {
      const delta = { ...this.mouseDelta };
      this.mouseDelta.x = 0;
      this.mouseDelta.y = 0;
      return delta;
    }

    consumeFirePressed() {
      const wasPressed = this.firePressed;
      this.firePressed = false;
      return wasPressed;
    }

    consumeWheelStep() {
      const s = this.wheelStep;
      this.wheelStep = 0;
      if (s > 0) return 1;
      if (s < 0) return -1;
      return 0;
    }
  }

  TheGame.InputController = InputController;
})();

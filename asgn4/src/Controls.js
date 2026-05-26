class Controls {
  constructor(canvas, camera, world, renderCallback) {
    this.canvas = canvas;
    this.camera = camera;
    this.world = world;
    this.renderCallback = renderCallback;

    this.keys = {};

    this.setupKeyboard();
    this.setupMouse();
  }

  setupKeyboard() {
    document.addEventListener("keydown", (event) => {
      this.keys[event.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (event) => {
      this.keys[event.key.toLowerCase()] = false;
    });
  }

  setupMouse() {
    this.canvas.addEventListener("click", () => {
      this.canvas.focus();

      if (this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
      }
    });

    document.addEventListener("mousemove", (event) => {
      if (document.pointerLockElement === this.canvas) {
        this.camera.lookWithMouse(event.movementX, event.movementY);
      }
    });
  }

  update() {
    if (this.keys["w"]) this.camera.moveForward();
    if (this.keys["s"]) this.camera.moveBackwards();
    if (this.keys["a"]) this.camera.moveLeft();
    if (this.keys["d"]) this.camera.moveRight();

    if (this.keys["q"]) this.camera.panLeft();
    if (this.keys["e"]) this.camera.panRight();

    if (this.keys["z"]) this.camera.moveUp();
    if (this.keys["x"]) this.camera.moveDown();

    if (this.keys["c"]) this.camera.lookUp();
    if (this.keys["v"]) this.camera.lookDown();
  }
}
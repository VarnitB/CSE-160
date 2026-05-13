// Controls.js
// Handles keyboard movement, mouse camera rotation, and add/delete blocks

class Controls {
  constructor(canvas, camera, world, renderScene) {
    this.canvas = canvas;
    this.camera = camera;
    this.world = world;
    this.renderScene = renderScene;

    this.isDragging = false;
    this.lastMouseX = 0;

    this.keys = {};

    // Make sure canvas can receive focus
    this.canvas.setAttribute("tabindex", "0");
    this.canvas.focus();

    this.initKeyboardControls();
    this.initMouseControls();
  }

  initKeyboardControls() {
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();

      // Prevent browser shortcuts/scrolling from interfering
      if (["w", "a", "s", "d", "q", "e", "f", "r"].includes(key)) {
        event.preventDefault();
      }

      switch (key) {
        case "w":
          this.camera.moveForward();
          break;

        case "s":
          this.camera.moveBackwards();
          break;

        case "a":
          this.camera.moveLeft();
          break;

        case "d":
          this.camera.moveRight();
          break;

        case "q":
          this.camera.panLeft();
          break;

        case "e":
          this.camera.panRight();
          break;

        case "f":
          this.world.addBlockInFront(this.camera);
          break;

        case "r":
          this.world.removeBlockInFront(this.camera);
          break;

        default:
          return;
      }

      this.renderScene();
    });
  }

  initMouseControls() {
    this.canvas.addEventListener("click", () => {
      this.canvas.focus();
    });

    this.canvas.addEventListener("mousedown", (event) => {
      this.canvas.focus();
      this.isDragging = true;
      this.lastMouseX = event.clientX;
    });

    window.addEventListener("mouseup", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mouseleave", () => {
      this.isDragging = false;
    });

    this.canvas.addEventListener("mousemove", (event) => {
      if (!this.isDragging) return;

      const deltaX = event.clientX - this.lastMouseX;
      this.lastMouseX = event.clientX;

      this.camera.panByMouse(deltaX);
      this.renderScene();
    });
  }
}
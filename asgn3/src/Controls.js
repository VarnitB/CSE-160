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

    this.initKeyboardControls();
    this.initMouseControls();
  }

  initKeyboardControls() {
    document.onkeydown = (event) => {
      switch (event.key.toLowerCase()) {
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
    };
  }

  initMouseControls() {
    this.canvas.onmousedown = (event) => {
      this.isDragging = true;
      this.lastMouseX = event.clientX;
    };

    this.canvas.onmouseup = () => {
      this.isDragging = false;
    };

    this.canvas.onmouseleave = () => {
      this.isDragging = false;
    };

    this.canvas.onmousemove = (event) => {
      if (!this.isDragging) return;

      const deltaX = event.clientX - this.lastMouseX;
      this.lastMouseX = event.clientX;

      this.camera.panByMouse(deltaX);
      this.renderScene();
    };
  }
}
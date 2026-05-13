// Controls.js
// Handles keyboard movement, mouse pointer-lock camera rotation, and add/delete blocks

class Controls {
  constructor(canvas, camera, world, renderScene) {
    this.canvas = canvas;
    this.camera = camera;
    this.world = world;
    this.renderScene = renderScene;

    this.keys = {};
    this.pointerLocked = false;

    this.canvas.setAttribute("tabindex", "0");
    this.canvas.focus();

    this.initKeyboardControls();
    this.initMouseControls();
  }

  initKeyboardControls() {
    window.addEventListener(
      "keydown",
      (event) => {
        const key = event.key.toLowerCase();

        if (
          ["w", "a", "s", "d", "q", "e", "z", "x", "c", "v", "f", "r"].includes(
            key
          )
        ) {
          event.preventDefault();
          this.keys[key] = true;
          this.updateStatus("Key pressed: " + key.toUpperCase());
        }

        if (key === "w") {
          this.camera.moveForward();
          this.renderScene();
        } else if (key === "s") {
          this.camera.moveBackwards();
          this.renderScene();
        } else if (key === "a") {
          this.camera.moveLeft();
          this.renderScene();
        } else if (key === "d") {
          this.camera.moveRight();
          this.renderScene();
        } else if (key === "q") {
          this.camera.panLeft();
          this.renderScene();
        } else if (key === "e") {
          this.camera.panRight();
          this.renderScene();
        } else if (key === "z") {
          this.camera.moveUp();
          this.renderScene();
        } else if (key === "x") {
          this.camera.moveDown();
          this.renderScene();
        } else if (key === "c") {
          this.camera.lookUp();
          this.renderScene();
        } else if (key === "v") {
          this.camera.lookDown();
          this.renderScene();
        } else if (key === "f") {
          this.world.addBlockInFront(this.camera);
          this.renderScene();
        } else if (key === "r") {
          this.world.removeBlockInFront(this.camera);
          this.renderScene();
        }
      },
      true
    );

    window.addEventListener(
      "keyup",
      (event) => {
        const key = event.key.toLowerCase();

        if (
          ["w", "a", "s", "d", "q", "e", "z", "x", "c", "v", "f", "r"].includes(
            key
          )
        ) {
          event.preventDefault();
          this.keys[key] = false;
        }
      },
      true
    );
  }

  initMouseControls() {
    this.canvas.addEventListener("click", () => {
      this.canvas.focus();

      if (this.canvas.requestPointerLock) {
        this.canvas.requestPointerLock();
      }

      this.updateStatus("Mouse locked. Press ESC to unlock.");
    });

    document.addEventListener("pointerlockchange", () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;

      if (this.pointerLocked) {
        this.updateStatus("Mouse locked. Press ESC to unlock.");
      } else {
        this.updateStatus("Mouse unlocked.");
      }
    });

    document.addEventListener("mousemove", (event) => {
      if (!this.pointerLocked) return;

      const deltaX = event.movementX || 0;
      const deltaY = event.movementY || 0;

      this.camera.lookWithMouse(deltaX, deltaY);
      this.renderScene();
    });
  }

  update() {
    let moved = false;

    if (this.keys["w"]) {
      this.camera.moveForward();
      moved = true;
    }

    if (this.keys["s"]) {
      this.camera.moveBackwards();
      moved = true;
    }

    if (this.keys["a"]) {
      this.camera.moveLeft();
      moved = true;
    }

    if (this.keys["d"]) {
      this.camera.moveRight();
      moved = true;
    }

    if (this.keys["q"]) {
      this.camera.panLeft();
      moved = true;
    }

    if (this.keys["e"]) {
      this.camera.panRight();
      moved = true;
    }

    if (this.keys["z"]) {
      this.camera.moveUp();
      moved = true;
    }

    if (this.keys["x"]) {
      this.camera.moveDown();
      moved = true;
    }

    if (this.keys["c"]) {
      this.camera.lookUp();
      moved = true;
    }

    if (this.keys["v"]) {
      this.camera.lookDown();
      moved = true;
    }

    if (moved) {
      this.renderScene();
    }
  }

  updateStatus(text) {
    const message = document.getElementById("message");

    if (message) {
      message.textContent = "Status: " + text;
    }
  }
}
// Controls.js
// Handles keyboard movement, mouse camera rotation, and add/delete blocks

class Controls {
  constructor(canvas, camera, world, renderScene) {
    this.canvas = canvas;
    this.camera = camera;
    this.world = world;
    this.renderScene = renderScene;

    this.keys = {};
    this.isDragging = false;
    this.lastMouseX = 0;

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

        if (["w", "a", "s", "d", "q", "e", "z", "x", "f", "r"].includes(key)) {
          event.preventDefault();
          this.keys[key] = true;
          this.updateStatus("Key pressed: " + key.toUpperCase());
        }

        // Move immediately on key press
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
          // swapped so Q turns left visually
          this.camera.panRight();
          this.renderScene();
        } else if (key === "e") {
          // swapped so E turns right visually
          this.camera.panLeft();
          this.renderScene();
        } else if (key === "z") {
          this.camera.lookUp();
          this.renderScene();
        } else if (key === "x") {
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

        if (["w", "a", "s", "d", "q", "e", "z", "x", "f", "r"].includes(key)) {
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
      this.updateStatus("Canvas focused. Controls active.");
    });

    this.canvas.addEventListener("mousedown", (event) => {
      this.canvas.focus();
      this.isDragging = true;
      this.lastMouseX = event.clientX;
      this.updateStatus("Mouse look active.");
    });

    window.addEventListener("mouseup", () => {
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
      this.camera.panRight();
      moved = true;
    }

    if (this.keys["e"]) {
      this.camera.panLeft();
      moved = true;
    }

    if (this.keys["z"]) {
      this.camera.lookUp();
      moved = true;
    }

    if (this.keys["x"]) {
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
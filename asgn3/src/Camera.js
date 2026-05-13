// Camera.js
// First-person camera for Assignment 3 virtual world

class Camera {
  constructor(canvas) {
    this.fov = 60;

    // Start near a path, not inside a wall
    this.eye = new Vector3([-14, 2, -14]);
    this.at = new Vector3([-13, 2, -14]);
    this.up = new Vector3([0, 1, 0]);

    this.speed = 0.18;
    this.verticalSpeed = 0.18;
    this.panSpeed = 3;
    this.lookSpeed = 0.08;

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();

    this.canvas = canvas;

    this.updateViewMatrix();
    this.updateProjectionMatrix();
  }

  updateViewMatrix() {
    this.viewMatrix.setLookAt(
      this.eye.elements[0],
      this.eye.elements[1],
      this.eye.elements[2],
      this.at.elements[0],
      this.at.elements[1],
      this.at.elements[2],
      this.up.elements[0],
      this.up.elements[1],
      this.up.elements[2]
    );
  }

  updateProjectionMatrix() {
    const aspect = this.canvas.width / this.canvas.height;
    this.projectionMatrix.setPerspective(this.fov, aspect, 0.1, 1000);
  }

  getForwardVector() {
    const ex = this.eye.elements[0];
    const ey = this.eye.elements[1];
    const ez = this.eye.elements[2];

    const ax = this.at.elements[0];
    const ay = this.at.elements[1];
    const az = this.at.elements[2];

    let fx = ax - ex;
    let fy = ay - ey;
    let fz = az - ez;

    const length = Math.sqrt(fx * fx + fy * fy + fz * fz);

    if (length === 0) {
      return new Vector3([0, 0, -1]);
    }

    fx /= length;
    fy /= length;
    fz /= length;

    return new Vector3([fx, fy, fz]);
  }

  moveForward() {
    const f = this.getForwardVector();

    // Move horizontally only, like walking
    const dx = f.elements[0] * this.speed;
    const dz = f.elements[2] * this.speed;

    this.eye.elements[0] += dx;
    this.eye.elements[2] += dz;

    this.at.elements[0] += dx;
    this.at.elements[2] += dz;

    this.updateViewMatrix();
  }

  moveBackwards() {
    const f = this.getForwardVector();

    const dx = f.elements[0] * this.speed;
    const dz = f.elements[2] * this.speed;

    this.eye.elements[0] -= dx;
    this.eye.elements[2] -= dz;

    this.at.elements[0] -= dx;
    this.at.elements[2] -= dz;

    this.updateViewMatrix();
  }

  moveLeft() {
    const f = this.getForwardVector();

    // Left vector = up x forward
    let sx =
      this.up.elements[1] * f.elements[2] -
      this.up.elements[2] * f.elements[1];

    let sz =
      this.up.elements[0] * f.elements[1] -
      this.up.elements[1] * f.elements[0];

    const length = Math.sqrt(sx * sx + sz * sz);

    if (length !== 0) {
      sx /= length;
      sz /= length;
    }

    const dx = sx * this.speed;
    const dz = sz * this.speed;

    this.eye.elements[0] += dx;
    this.eye.elements[2] += dz;

    this.at.elements[0] += dx;
    this.at.elements[2] += dz;

    this.updateViewMatrix();
  }

  moveRight() {
    const f = this.getForwardVector();

    // Right vector = forward x up
    let sx =
      f.elements[1] * this.up.elements[2] -
      f.elements[2] * this.up.elements[1];

    let sz =
      f.elements[0] * this.up.elements[1] -
      f.elements[1] * this.up.elements[0];

    const length = Math.sqrt(sx * sx + sz * sz);

    if (length !== 0) {
      sx /= length;
      sz /= length;
    }

    const dx = sx * this.speed;
    const dz = sz * this.speed;

    this.eye.elements[0] += dx;
    this.eye.elements[2] += dz;

    this.at.elements[0] += dx;
    this.at.elements[2] += dz;

    this.updateViewMatrix();
  }

  moveUp() {
    this.eye.elements[1] += this.verticalSpeed;
    this.at.elements[1] += this.verticalSpeed;

    this.updateViewMatrix();
  }

  moveDown() {
    this.eye.elements[1] -= this.verticalSpeed;
    this.at.elements[1] -= this.verticalSpeed;

    // Optional floor limit so you don't go way underground
    if (this.eye.elements[1] < 0.5) {
      const diff = 0.5 - this.eye.elements[1];
      this.eye.elements[1] += diff;
      this.at.elements[1] += diff;
    }

    this.updateViewMatrix();
  }

  panLeft(alpha = this.panSpeed) {
    const f = this.getForwardVector();

    const angle = (alpha * Math.PI) / 180.0;
    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);

    const fx = f.elements[0];
    const fy = f.elements[1];
    const fz = f.elements[2];

    // Rotate around y-axis
    const newFx = fx * cosA - fz * sinA;
    const newFz = fx * sinA + fz * cosA;

    this.at.elements[0] = this.eye.elements[0] + newFx;
    this.at.elements[1] = this.eye.elements[1] + fy;
    this.at.elements[2] = this.eye.elements[2] + newFz;

    this.updateViewMatrix();
  }

  panRight(alpha = this.panSpeed) {
    this.panLeft(-alpha);
  }

  lookUp() {
    const f = this.getForwardVector();

    let newY = f.elements[1] + this.lookSpeed;

    // Limit so camera does not flip
    if (newY > 0.95) {
      newY = 0.95;
    }

    this.at.elements[1] = this.eye.elements[1] + newY;

    this.updateViewMatrix();
  }

  lookDown() {
    const f = this.getForwardVector();

    let newY = f.elements[1] - this.lookSpeed;

    // Limit so camera does not flip
    if (newY < -0.95) {
      newY = -0.95;
    }

    this.at.elements[1] = this.eye.elements[1] + newY;

    this.updateViewMatrix();
  }

  panByMouse(deltaX) {
    const sensitivity = 0.18;

    // Mouse drag left/right only
    this.panRight(deltaX * sensitivity);
  }

  getPosition() {
    return {
      x: this.eye.elements[0],
      y: this.eye.elements[1],
      z: this.eye.elements[2],
    };
  }

  getLookDirection() {
    return this.getForwardVector();
  }
}
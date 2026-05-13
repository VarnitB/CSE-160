// Camera.js
// First-person camera for Assignment 3 virtual world

class Camera {
  constructor(canvas) {
    this.fov = 60;

    this.eye = new Vector3([-14, 2, -14]);
    this.at = new Vector3([-13, 2, -14]);
    this.up = new Vector3([0, 1, 0]);

    this.speed = 0.18;
    this.verticalSpeed = 0.18;

    // FPS-style camera angles
    this.yaw = 0; // left/right
    this.pitch = 0; // up/down

    this.panSpeed = 3;
    this.lookSpeed = 0.08;
    this.mouseSensitivity = 0.0025;

    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();

    this.canvas = canvas;

    this.updateAtFromAngles();
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

  updateAtFromAngles() {
    const cosPitch = Math.cos(this.pitch);

    const fx = Math.cos(this.yaw) * cosPitch;
    const fy = Math.sin(this.pitch);
    const fz = Math.sin(this.yaw) * cosPitch;

    this.at.elements[0] = this.eye.elements[0] + fx;
    this.at.elements[1] = this.eye.elements[1] + fy;
    this.at.elements[2] = this.eye.elements[2] + fz;

    this.updateViewMatrix();
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
      return new Vector3([1, 0, 0]);
    }

    fx /= length;
    fy /= length;
    fz /= length;

    return new Vector3([fx, fy, fz]);
  }

  getHorizontalForwardVector() {
    const f = this.getForwardVector();

    let fx = f.elements[0];
    let fz = f.elements[2];

    const length = Math.sqrt(fx * fx + fz * fz);

    if (length === 0) {
      return { x: 1, z: 0 };
    }

    fx /= length;
    fz /= length;

    return { x: fx, z: fz };
  }

  moveForward() {
    const f = this.getHorizontalForwardVector();

    const dx = f.x * this.speed;
    const dz = f.z * this.speed;

    this.eye.elements[0] += dx;
    this.eye.elements[2] += dz;

    this.at.elements[0] += dx;
    this.at.elements[2] += dz;

    this.updateViewMatrix();
  }

  moveBackwards() {
    const f = this.getHorizontalForwardVector();

    const dx = f.x * this.speed;
    const dz = f.z * this.speed;

    this.eye.elements[0] -= dx;
    this.eye.elements[2] -= dz;

    this.at.elements[0] -= dx;
    this.at.elements[2] -= dz;

    this.updateViewMatrix();
  }

  moveLeft() {
    const f = this.getHorizontalForwardVector();

    const leftX = -f.z;
    const leftZ = f.x;

    this.eye.elements[0] += leftX * this.speed;
    this.eye.elements[2] += leftZ * this.speed;

    this.at.elements[0] += leftX * this.speed;
    this.at.elements[2] += leftZ * this.speed;

    this.updateViewMatrix();
  }

  moveRight() {
    const f = this.getHorizontalForwardVector();

    const rightX = f.z;
    const rightZ = -f.x;

    this.eye.elements[0] += rightX * this.speed;
    this.eye.elements[2] += rightZ * this.speed;

    this.at.elements[0] += rightX * this.speed;
    this.at.elements[2] += rightZ * this.speed;

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

    if (this.eye.elements[1] < 0.5) {
      const diff = 0.5 - this.eye.elements[1];
      this.eye.elements[1] += diff;
      this.at.elements[1] += diff;
    }

    this.updateViewMatrix();
  }

  panLeft(alpha = this.panSpeed) {
    this.yaw -= (alpha * Math.PI) / 180.0;
    this.updateAtFromAngles();
  }

  panRight(alpha = this.panSpeed) {
    this.yaw += (alpha * Math.PI) / 180.0;
    this.updateAtFromAngles();
  }

  lookUp() {
    this.pitch += this.lookSpeed;

    if (this.pitch > 1.35) {
      this.pitch = 1.35;
    }

    this.updateAtFromAngles();
  }

  lookDown() {
    this.pitch -= this.lookSpeed;

    if (this.pitch < -1.35) {
      this.pitch = -1.35;
    }

    this.updateAtFromAngles();
  }

  lookWithMouse(deltaX, deltaY) {
    // Inverted so mouse movement feels like normal FPS camera movement
    this.yaw += deltaX * this.mouseSensitivity;
    this.pitch -= deltaY * this.mouseSensitivity;

    if (this.pitch > 1.35) {
      this.pitch = 1.35;
    }

    if (this.pitch < -1.35) {
      this.pitch = -1.35;
    }

    this.updateAtFromAngles();
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
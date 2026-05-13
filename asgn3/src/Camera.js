// Camera.js
// First-person camera for Assignment 3 virtual world

class Camera {
  constructor(canvas) {
    this.fov = 60;

    this.eye = new Vector3([0, 2, 5]);
    this.at = new Vector3([0, 2, 4]);
    this.up = new Vector3([0, 1, 0]);

    this.speed = 0.35;
    this.panSpeed = 5;

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
    const f = new Vector3();
    f.set(this.at);
    f.sub(this.eye);
    f.normalize();
    return f;
  }

  moveForward() {
    const f = this.getForwardVector();
    f.mul(this.speed);

    this.eye.add(f);
    this.at.add(f);

    this.updateViewMatrix();
  }

  moveBackwards() {
    const b = new Vector3();
    b.set(this.eye);
    b.sub(this.at);
    b.normalize();
    b.mul(this.speed);

    this.eye.add(b);
    this.at.add(b);

    this.updateViewMatrix();
  }

  moveLeft() {
    const f = this.getForwardVector();

    const s = Vector3.cross(this.up, f);
    s.normalize();
    s.mul(this.speed);

    this.eye.add(s);
    this.at.add(s);

    this.updateViewMatrix();
  }

  moveRight() {
    const f = this.getForwardVector();

    const s = Vector3.cross(f, this.up);
    s.normalize();
    s.mul(this.speed);

    this.eye.add(s);
    this.at.add(s);

    this.updateViewMatrix();
  }

  panLeft(alpha = this.panSpeed) {
    const f = this.getForwardVector();

    const rotationMatrix = new Matrix4();
    rotationMatrix.setRotate(
      alpha,
      this.up.elements[0],
      this.up.elements[1],
      this.up.elements[2]
    );

    const fPrime = rotationMatrix.multiplyVector3(f);

    this.at.set(this.eye);
    this.at.add(fPrime);

    this.updateViewMatrix();
  }

  panRight(alpha = this.panSpeed) {
    this.panLeft(-alpha);
  }

  panByMouse(deltaX) {
    const sensitivity = 0.25;
    this.panLeft(-deltaX * sensitivity);
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
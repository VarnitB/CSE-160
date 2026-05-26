class World {
  constructor() {
    this.size = 18;
    this.maxHeight = 3;
    this.map = this.createMap();
  }

  createMap() {
    const map = [];

    for (let z = 0; z < this.size; z++) {
      const row = [];

      for (let x = 0; x < this.size; x++) {
        let height = 0;

        if (x === 0 || z === 0 || x === this.size - 1 || z === this.size - 1) {
          height = 2;
        } else if (
          (x === 4 && z > 2 && z < 14) ||
          (z === 10 && x > 5 && x < 15)
        ) {
          height = 2;
        } else if ((x + z) % 9 === 0) {
          height = 1;
        }

        row.push(height);
      }

      map.push(row);
    }

    return map;
  }

  draw(gl, programInfo) {
    this.drawGround(gl, programInfo);
    this.drawWalls(gl, programInfo);
  }

  drawGround(gl, programInfo) {
    const ground = new Cube();

    ground.textureNum = 1;
    ground.texColorWeight = 1.0;
    ground.color = [0.4, 0.8, 0.4, 1.0];

    ground.matrix.translate(-16, -0.05, -16);
    ground.matrix.scale(32, 0.1, 32);

    ground.render(gl, programInfo);
  }

  drawWalls(gl, programInfo) {
    for (let z = 0; z < this.size; z++) {
      for (let x = 0; x < this.size; x++) {
        const height = this.map[z][x];

        if (height === 0) continue;

        for (let y = 0; y < height; y++) {
          const cube = new Cube();

          cube.textureNum = y === 0 ? 2 : 0;
          cube.texColorWeight = 1.0;
          cube.color = [1.0, 1.0, 1.0, 1.0];

          cube.matrix.translate(x - 9, y, z - 9);

          cube.render(gl, programInfo);
        }
      }
    }
  }

  getBlockInFront(camera) {
    return null;
  }

  addBlockInFront(camera) {}

  removeBlockInFront(camera) {}
}
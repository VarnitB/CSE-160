// World.js
// Creates and draws the 32x32 voxel world

class World {
  constructor() {
    this.size = 32;
    this.maxHeight = 4;

    // 0 = empty
    // 1-4 = wall height
    // 9 = goal block location
    this.map = this.createMap();

    this.goalX = 28;
    this.goalZ = 28;
    this.map[this.goalZ][this.goalX] = 9;
  }

  createMap() {
    const map = [];

    for (let z = 0; z < this.size; z++) {
      const row = [];

      for (let x = 0; x < this.size; x++) {
        // Border walls
        if (x === 0 || z === 0 || x === this.size - 1 || z === this.size - 1) {
          row.push(2);
        }
        // Some maze-like walls
        else if (x % 6 === 0 && z > 3 && z < 28) {
          row.push(2);
        } else if (z % 7 === 0 && x > 3 && x < 28) {
          row.push(1);
        }
        // A few taller towers
        else if ((x === 10 && z === 10) || (x === 20 && z === 22)) {
          row.push(4);
        } else if ((x === 15 && z > 10 && z < 20) || (z === 15 && x > 10 && x < 20)) {
          row.push(3);
        } else {
          row.push(0);
        }
      }

      map.push(row);
    }

    // Open paths through the maze walls
    for (let i = 2; i < 30; i++) {
      map[5][i] = 0;
      map[12][i] = 0;
      map[21][i] = 0;
      map[i][8] = 0;
      map[i][17] = 0;
      map[i][25] = 0;
    }

    return map;
  }

  draw(gl, programInfo) {
    this.drawGround(gl, programInfo);
    this.drawSky(gl, programInfo);
    this.drawWalls(gl, programInfo);
  }

  drawGround(gl, programInfo) {
    const ground = new Cube();
    ground.textureNum = 1; // grass
    ground.texColorWeight = 1.0;
    ground.color = [0.4, 0.8, 0.4, 1.0];

    ground.matrix.translate(-16, -0.05, -16);
    ground.matrix.scale(32, 0.1, 32);

    ground.render(gl, programInfo);
  }

  drawSky(gl, programInfo) {
    const sky = new Cube();
    sky.textureNum = 3; // sky texture
    sky.texColorWeight = 1.0;
    sky.color = [0.5, 0.7, 1.0, 1.0];

    sky.matrix.translate(-500, -500, -500);
    sky.matrix.scale(1000, 1000, 1000);

    sky.render(gl, programInfo);
  }

  drawWalls(gl, programInfo) {
    for (let z = 0; z < this.size; z++) {
      for (let x = 0; x < this.size; x++) {
        const value = this.map[z][x];

        if (value === 0) continue;

        if (value === 9) {
          this.drawGoalBlock(gl, programInfo, x, z);
          continue;
        }

        const height = value;

        for (let y = 0; y < height; y++) {
          const cube = new Cube();

          // Use wall for most walls, dirt for taller/lower variation
          cube.textureNum = y === 0 ? 2 : 0; // dirt base, wall above
          cube.texColorWeight = 1.0;
          cube.color = [1.0, 1.0, 1.0, 1.0];

          cube.matrix.translate(x - 16, y, z - 16);

          cube.render(gl, programInfo);
        }
      }
    }
  }

  drawGoalBlock(gl, programInfo, x, z) {
    const goal = new Cube();
    goal.textureNum = 4; // gold/goal
    goal.texColorWeight = 1.0;
    goal.color = [1.0, 0.85, 0.1, 1.0];

    goal.matrix.translate(x - 16, 0, z - 16);

    goal.render(gl, programInfo);
  }

  getMapCellFromWorld(worldX, worldZ) {
    const x = Math.floor(worldX + 16);
    const z = Math.floor(worldZ + 16);

    if (x < 0 || x >= this.size || z < 0 || z >= this.size) {
      return null;
    }

    return { x, z };
  }

  getBlockInFront(camera) {
    const pos = camera.getPosition();
    const dir = camera.getLookDirection();

    const distance = 2.0;

    const targetX = pos.x + dir.elements[0] * distance;
    const targetZ = pos.z + dir.elements[2] * distance;

    return this.getMapCellFromWorld(targetX, targetZ);
  }

  addBlockInFront(camera) {
    const cell = this.getBlockInFront(camera);
    if (!cell) return;

    const current = this.map[cell.z][cell.x];

    // Do not overwrite goal block
    if (current === 9) return;

    if (current < this.maxHeight) {
      this.map[cell.z][cell.x] = current + 1;
    }
  }

  removeBlockInFront(camera) {
    const cell = this.getBlockInFront(camera);
    if (!cell) return;

    const current = this.map[cell.z][cell.x];

    // Do not remove goal block
    if (current === 9) return;

    if (current > 0) {
      this.map[cell.z][cell.x] = current - 1;
    }
  }

  checkGoal(camera) {
    const pos = camera.getPosition();
    const cell = this.getMapCellFromWorld(pos.x, pos.z);

    if (!cell) return false;

    const dx = cell.x - this.goalX;
    const dz = cell.z - this.goalZ;

    return Math.abs(dx) <= 1 && Math.abs(dz) <= 1;
  }
}
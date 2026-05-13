// World.js
// Creates and draws the 32x32 voxel world.
// Easy Mode: find a randomly spawned gold block on an empty cell.
// Hard Mode: find one randomly selected darker wall block.

class World {
  constructor() {
    this.size = 32;
    this.maxHeight = 4;

    this.map = this.createMap();

    this.mode = "easy";
    this.gameWon = false;

    this.goalX = 28;
    this.goalZ = 28;

    this.hardTargetX = 0;
    this.hardTargetZ = 0;
    this.hardTargetY = 0;

    this.startEasyMode();
  }

  createMap() {
    const map = [];

    for (let z = 0; z < this.size; z++) {
      const row = [];

      for (let x = 0; x < this.size; x++) {
        if (x === 0 || z === 0 || x === this.size - 1 || z === this.size - 1) {
          row.push(2);
        } else if (x % 6 === 0 && z > 3 && z < 28) {
          row.push(2);
        } else if (z % 7 === 0 && x > 3 && x < 28) {
          row.push(1);
        } else if ((x === 10 && z === 10) || (x === 20 && z === 22)) {
          row.push(4);
        } else if (
          (x === 15 && z > 10 && z < 20) ||
          (z === 15 && x > 10 && x < 20)
        ) {
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

  startEasyMode() {
    this.mode = "easy";
    this.gameWon = false;
    this.spawnGoldBlock();
  }

  startHardMode() {
    this.mode = "hard";
    this.gameWon = false;
    this.spawnHardWallTarget();
  }

  restartCurrentMode() {
    if (this.mode === "hard") {
      this.startHardMode();
    } else {
      this.startEasyMode();
    }
  }

  spawnGoldBlock() {
    // Spawn only on empty cells, not inside walls.
    // Avoid the starting corner so it is not instantly won.
    let tries = 0;

    while (tries < 10000) {
      const x = Math.floor(Math.random() * this.size);
      const z = Math.floor(Math.random() * this.size);

      const tooCloseToStart = x < 6 && z < 6;
      const onBorder = x === 0 || z === 0 || x === this.size - 1 || z === this.size - 1;

      if (!onBorder && !tooCloseToStart && this.map[z][x] === 0) {
        this.goalX = x;
        this.goalZ = z;
        return;
      }

      tries++;
    }

    // Fallback
    this.goalX = 28;
    this.goalZ = 28;
  }

  spawnHardWallTarget() {
    // Pick one actual wall block and make that one use wall2.png.
    // Prefer wall blocks above the dirt base if possible.
    let tries = 0;

    while (tries < 10000) {
      const x = Math.floor(Math.random() * this.size);
      const z = Math.floor(Math.random() * this.size);
      const height = this.map[z][x];

      if (height >= 2 && height <= this.maxHeight) {
        this.hardTargetX = x;
        this.hardTargetZ = z;
        this.hardTargetY = 1 + Math.floor(Math.random() * (height - 1));
        return;
      }

      tries++;
    }

    // Fallback
    this.hardTargetX = 10;
    this.hardTargetZ = 10;
    this.hardTargetY = 1;
  }

  draw(gl, programInfo) {
    this.drawGround(gl, programInfo);
    this.drawSky(gl, programInfo);
    this.drawWalls(gl, programInfo);

    if (this.mode === "easy") {
      this.drawGoalBlock(gl, programInfo);
    }
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

    sky.textureNum = 3; // sky
    sky.texColorWeight = 1.0;
    sky.color = [0.5, 0.7, 1.0, 1.0];

    sky.matrix.translate(-500, -500, -500);
    sky.matrix.scale(1000, 1000, 1000);

    sky.render(gl, programInfo);
  }

  drawWalls(gl, programInfo) {
    for (let z = 0; z < this.size; z++) {
      for (let x = 0; x < this.size; x++) {
        const height = this.map[z][x];

        if (height === 0) continue;

        for (let y = 0; y < height; y++) {
          const cube = new Cube();

          if (
            this.mode === "hard" &&
            x === this.hardTargetX &&
            z === this.hardTargetZ &&
            y === this.hardTargetY
          ) {
            cube.textureNum = 5; // wall2, darker wall
          } else {
            cube.textureNum = y === 0 ? 2 : 0; // dirt base, wall above
          }

          cube.texColorWeight = 1.0;
          cube.color = [1.0, 1.0, 1.0, 1.0];

          cube.matrix.translate(x - 16, y, z - 16);

          cube.render(gl, programInfo);
        }
      }
    }
  }

  drawGoalBlock(gl, programInfo) {
    const goal = new Cube();

    goal.textureNum = 4; // gold goal
    goal.texColorWeight = 1.0;
    goal.color = [1.0, 0.85, 0.1, 1.0];

    goal.matrix.translate(this.goalX - 16, 0, this.goalZ - 16);

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

    // Do not add on top of the easy-mode gold block.
    if (
      this.mode === "easy" &&
      cell.x === this.goalX &&
      cell.z === this.goalZ
    ) {
      return;
    }

    const current = this.map[cell.z][cell.x];

    if (current < this.maxHeight) {
      this.map[cell.z][cell.x] = current + 1;
    }
  }

  removeBlockInFront(camera) {
    const cell = this.getBlockInFront(camera);
    if (!cell) return;

    // Do not remove the hard-mode special wall.
    if (
      this.mode === "hard" &&
      cell.x === this.hardTargetX &&
      cell.z === this.hardTargetZ
    ) {
      return;
    }

    const current = this.map[cell.z][cell.x];

    if (current > 0) {
      this.map[cell.z][cell.x] = current - 1;
    }
  }

  checkWin(camera) {
    if (this.gameWon) return true;

    const pos = camera.getPosition();
    const cell = this.getMapCellFromWorld(pos.x, pos.z);

    if (!cell) return false;

    if (this.mode === "easy") {
      const dx = cell.x - this.goalX;
      const dz = cell.z - this.goalZ;

      if (Math.abs(dx) <= 1 && Math.abs(dz) <= 1) {
        this.gameWon = true;
        return true;
      }
    }

    if (this.mode === "hard") {
      const dx = cell.x - this.hardTargetX;
      const dz = cell.z - this.hardTargetZ;

      if (Math.abs(dx) <= 1 && Math.abs(dz) <= 1) {
        this.gameWon = true;
        return true;
      }
    }

    return false;
  }
}
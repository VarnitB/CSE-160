// Picture.js
// Mario + ? block + mushroom animation using triangles only

let g_pictureAnimationId = null;
let g_pictureStartTime = 0;

function drawMyPicture() {
  // Clear paint shapes so the scene is clean
  g_shapesList = [];

  // Restart animation if button is clicked again
  if (g_pictureAnimationId !== null) {
    cancelAnimationFrame(g_pictureAnimationId);
    g_pictureAnimationId = null;
  }

  g_pictureStartTime = performance.now();
  animateMarioScene();
}

function animateMarioScene() {
  const now = performance.now();
  const t = (now - g_pictureStartTime) / 1000.0; // seconds

  // Timing
  // 0.0 - 0.55  : Mario jumps
  // 0.55 - 1.25 : mushroom rises
  // 1.25 - 2.20 : mushroom stays
  // 2.20 - 3.00 : mushroom flickers
  // after 3.00  : mushroom gone, final frame remains

  let marioJump = 0.0;
  if (t < 0.55) {
    marioJump = Math.sin((t / 0.55) * Math.PI) * 0.16;
  }

  let blockBump = 0.0;
  if (t > 0.33 && t < 0.58) {
    const local = (t - 0.33) / 0.25;
    blockBump = Math.sin(local * Math.PI) * 0.05;
  }

  let mushroomRise = 0.0;
  if (t >= 0.55 && t < 1.25) {
    mushroomRise = ((t - 0.55) / 0.70) * 0.24;
  } else if (t >= 1.25) {
    mushroomRise = 0.24;
  }

  let showMushroom = false;
  if (t >= 0.55 && t < 2.20) {
    showMushroom = true;
  } else if (t >= 2.20 && t < 3.00) {
    // flicker
    showMushroom = Math.floor((t - 2.20) * 12) % 2 === 0;
  } else {
    showMushroom = false;
  }

  renderMarioScene(marioJump, blockBump, mushroomRise, showMushroom);

  if (t < 3.05) {
    g_pictureAnimationId = requestAnimationFrame(animateMarioScene);
  } else {
    g_pictureAnimationId = null;
    renderMarioScene(0.0, 0.0, mushroomRise, false);
  }
}

function renderMarioScene(marioJump, blockBump, mushroomRise, showMushroom) {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Background
  drawRect(-1.0, -1.0, 2.0, 2.0, [0.55, 0.80, 1.0, 1.0]);

  // Ground
  drawRect(-1.0, -0.62, 2.0, 0.62, [0.34, 0.74, 0.20, 1.0]);

  // Simple clouds
  drawCloud(-0.72, 0.62, 0.18);
  drawCloud(0.35, 0.70, 0.16);

  // Question block position
  const blockX = 0.10;
  const blockY = 0.18 + blockBump;
  drawQuestionBlock(blockX, blockY, 0.24);

  // Mushroom
  if (showMushroom) {
    drawMushroom(blockX + 0.12, blockY + 0.24 + mushroomRise, 0.16);
  }

  // Mario
  drawMario(-0.06, -0.36 + marioJump, 0.34);

  // VB initials in scene
  drawVB(0.62, -0.16, 0.16);

  // Optional tiny decorative ground bricks
  drawGroundBrick(-0.78, -0.62, 0.22, 0.12);
  drawGroundBrick(-0.54, -0.62, 0.22, 0.12);
  drawGroundBrick(0.40, -0.62, 0.22, 0.12);
  drawGroundBrick(0.64, -0.62, 0.22, 0.12);
}

// ===================== Scene Pieces =====================

function drawMario(cx, cy, s) {
  // shoes
  drawRect(cx - 0.12 * s, cy - 0.33 * s, 0.11 * s, 0.04 * s, [0.35, 0.18, 0.05, 1.0]);
  drawRect(cx + 0.01 * s, cy - 0.33 * s, 0.11 * s, 0.04 * s, [0.35, 0.18, 0.05, 1.0]);

  // legs
  drawRect(cx - 0.09 * s, cy - 0.29 * s, 0.05 * s, 0.14 * s, [0.10, 0.22, 0.78, 1.0]);
  drawRect(cx + 0.03 * s, cy - 0.29 * s, 0.05 * s, 0.14 * s, [0.10, 0.22, 0.78, 1.0]);

  // overalls
  drawRect(cx - 0.13 * s, cy - 0.15 * s, 0.22 * s, 0.18 * s, [0.10, 0.22, 0.78, 1.0]);

  // shirt
  drawRect(cx - 0.16 * s, cy - 0.10 * s, 0.28 * s, 0.12 * s, [0.86, 0.10, 0.10, 1.0]);

  // arms
  drawRect(cx - 0.20 * s, cy - 0.08 * s, 0.05 * s, 0.11 * s, [0.86, 0.10, 0.10, 1.0]);
  drawRect(cx + 0.12 * s, cy - 0.08 * s, 0.05 * s, 0.11 * s, [0.86, 0.10, 0.10, 1.0]);

  // gloves
  drawRect(cx - 0.21 * s, cy - 0.08 * s, 0.04 * s, 0.04 * s, [1.0, 0.96, 0.90, 1.0]);
  drawRect(cx + 0.16 * s, cy - 0.08 * s, 0.04 * s, 0.04 * s, [1.0, 0.96, 0.90, 1.0]);

  // face
  drawRect(cx - 0.10 * s, cy + 0.03 * s, 0.18 * s, 0.14 * s, [1.0, 0.82, 0.63, 1.0]);

  // hat brim
  drawRect(cx - 0.13 * s, cy + 0.14 * s, 0.24 * s, 0.03 * s, [0.86, 0.10, 0.10, 1.0]);

  // hat top
  drawRect(cx - 0.08 * s, cy + 0.17 * s, 0.16 * s, 0.06 * s, [0.86, 0.10, 0.10, 1.0]);

  // nose
  drawRect(cx + 0.03 * s, cy + 0.07 * s, 0.04 * s, 0.03 * s, [0.95, 0.72, 0.54, 1.0]);

  // mustache
  drawRect(cx - 0.02 * s, cy + 0.04 * s, 0.08 * s, 0.02 * s, [0.20, 0.10, 0.03, 1.0]);

  // eyes
  drawRect(cx - 0.02 * s, cy + 0.11 * s, 0.015 * s, 0.025 * s, [0.0, 0.0, 0.0, 1.0]);
  drawRect(cx + 0.03 * s, cy + 0.11 * s, 0.015 * s, 0.025 * s, [0.0, 0.0, 0.0, 1.0]);
}

function drawQuestionBlock(x, y, size) {
  // block body
  drawRect(x, y, size, size, [0.97, 0.76, 0.12, 1.0]);

  // border feel
  drawRect(x, y + size - 0.02, size, 0.02, [0.88, 0.58, 0.05, 1.0]);
  drawRect(x, y, size, 0.02, [0.88, 0.58, 0.05, 1.0]);
  drawRect(x, y, 0.02, size, [0.88, 0.58, 0.05, 1.0]);
  drawRect(x + size - 0.02, y, 0.02, size, [0.88, 0.58, 0.05, 1.0]);

  // question mark made of small blocks
  const q = [0.55, 0.30, 0.05, 1.0];
  drawRect(x + 0.08, y + 0.16, 0.08, 0.03, q);
  drawRect(x + 0.14, y + 0.11, 0.03, 0.05, q);
  drawRect(x + 0.10, y + 0.08, 0.05, 0.03, q);
  drawRect(x + 0.10, y + 0.04, 0.03, 0.03, q);
  drawRect(x + 0.10, y + 0.01, 0.03, 0.02, q);

  // little studs
  drawRect(x + 0.04, y + 0.04, 0.025, 0.025, [0.88, 0.58, 0.05, 1.0]);
  drawRect(x + 0.175, y + 0.04, 0.025, 0.025, [0.88, 0.58, 0.05, 1.0]);
  drawRect(x + 0.04, y + 0.175, 0.025, 0.025, [0.88, 0.58, 0.05, 1.0]);
  drawRect(x + 0.175, y + 0.175, 0.025, 0.025, [0.88, 0.58, 0.05, 1.0]);
}

function drawMushroom(cx, cy, s) {
  // stem
  drawRect(cx - 0.03, cy - 0.10, 0.06, 0.10, [0.98, 0.93, 0.82, 1.0]);

  // cap
  drawTriangleColor([
    cx - s * 0.55, cy,
    cx + s * 0.55, cy,
    cx, cy + s * 0.45
  ], [0.86, 0.12, 0.12, 1.0]);

  drawRect(cx - s * 0.40, cy - s * 0.08, s * 0.80, s * 0.16, [0.86, 0.12, 0.12, 1.0]);

  // white spots
  drawTriangleColor([
    cx - 0.05, cy + 0.03,
    cx - 0.01, cy + 0.03,
    cx - 0.03, cy + 0.09
  ], [1, 1, 1, 1]);

  drawTriangleColor([
    cx + 0.01, cy + 0.02,
    cx + 0.05, cy + 0.02,
    cx + 0.03, cy + 0.08
  ], [1, 1, 1, 1]);
}

function drawVB(x, y, s) {
  const gold = [1.0, 0.92, 0.25, 1.0];

  // V
  drawTriangleColor([
    x, y + s,
    x + s * 0.18, y,
    x + s * 0.36, y + s
  ], gold);

  // B spine
  drawRect(x + s * 0.46, y, s * 0.10, s, gold);

  // B top
  drawRect(x + s * 0.56, y + s * 0.58, s * 0.20, s * 0.16, gold);

  // B middle
  drawRect(x + s * 0.56, y + s * 0.38, s * 0.16, s * 0.12, gold);

  // B bottom
  drawRect(x + s * 0.56, y + s * 0.08, s * 0.20, s * 0.16, gold);
}

function drawCloud(x, y, s) {
  const c = [1.0, 1.0, 1.0, 1.0];
  drawRect(x, y, s * 0.50, s * 0.16, c);
  drawRect(x + s * 0.12, y + s * 0.10, s * 0.18, s * 0.14, c);
  drawRect(x + s * 0.28, y + s * 0.10, s * 0.18, s * 0.14, c);
}

function drawGroundBrick(x, y, w, h) {
  drawRect(x, y, w, h, [0.72, 0.42, 0.14, 1.0]);
  drawRect(x, y + h - 0.01, w, 0.01, [0.55, 0.28, 0.08, 1.0]);
  drawRect(x, y, w, 0.01, [0.55, 0.28, 0.08, 1.0]);
}

// ===================== Triangle Helpers =====================

function drawRect(x, y, w, h, color) {
  drawTriangleColor([x, y, x + w, y, x, y + h], color);
  drawTriangleColor([x + w, y, x + w, y + h, x, y + h], color);
}

function drawTriangleColor(vertices, color) {
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  drawTriangle(vertices);
}
// Picture.js
// Simpler Mario scene, larger and centered better.
// Everything is still drawn from triangles.

let g_pictureAnimationId = null;
let g_pictureStartTime = 0;

function drawMyPicture() {
  if (g_pictureAnimationId !== null) {
    cancelAnimationFrame(g_pictureAnimationId);
    g_pictureAnimationId = null;
  }

  g_pictureStartTime = performance.now();
  animateMarioScene();
}

function animateMarioScene() {
  const now = performance.now();
  const t = (now - g_pictureStartTime) / 1000.0;

  let marioJump = 0.0;
  if (t < 0.52) {
    marioJump = Math.sin((t / 0.52) * Math.PI) * 0.28;
  }

  let blockBump = 0.0;
  if (t > 0.22 && t < 0.38) {
    const local = (t - 0.22) / 0.16;
    blockBump = Math.sin(local * Math.PI) * 0.035;
  }

  let mushroomRise = 0.0;
  if (t >= 0.45 && t < 1.05) {
    mushroomRise = ((t - 0.45) / 0.60) * 0.22;
  } else if (t >= 1.05) {
    mushroomRise = 0.22;
  }

  let showMushroom = false;
  if (t >= 0.45 && t < 2.10) {
    showMushroom = true;
  } else if (t >= 2.10 && t < 2.90) {
    showMushroom = Math.floor((t - 2.10) * 10) % 2 === 0;
  }

  renderMarioScene(marioJump, blockBump, mushroomRise, showMushroom);

  if (t < 3.0) {
    g_pictureAnimationId = requestAnimationFrame(animateMarioScene);
  } else {
    g_pictureAnimationId = null;
    renderMarioScene(0.0, 0.0, mushroomRise, false);
  }
}

function renderMarioScene(marioJump, blockBump, mushroomRise, showMushroom) {
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Bigger, centered layout
  const marioX = -0.22;
  const marioY = -0.52 + marioJump;
  const marioScale = 1.25;

  const blockSize = 0.34;
  const marioCenterX = marioX + 0.18;
  const blockX = marioCenterX - blockSize / 2;
  const blockY = 0.10 + blockBump;

  drawVBBlock(blockX, blockY, blockSize);

  if (showMushroom) {
    drawMushroom(blockX + blockSize / 2, blockY + blockSize + mushroomRise, 0.18);
  }

  drawMario(marioX, marioY, marioScale);
}

// ===================== Mario =====================

function drawMario(x, y, s) {
  // shoes
  drawRect(x + 0.03 * s, y + 0.00 * s, 0.12 * s, 0.05 * s, [0.35, 0.18, 0.05, 1.0]);
  drawRect(x + 0.17 * s, y + 0.00 * s, 0.12 * s, 0.05 * s, [0.35, 0.18, 0.05, 1.0]);

  // legs
  drawRect(x + 0.06 * s, y + 0.05 * s, 0.06 * s, 0.15 * s, [0.10, 0.22, 0.78, 1.0]);
  drawRect(x + 0.18 * s, y + 0.05 * s, 0.06 * s, 0.15 * s, [0.10, 0.22, 0.78, 1.0]);

  // overalls
  drawRect(x + 0.04 * s, y + 0.20 * s, 0.22 * s, 0.16 * s, [0.10, 0.22, 0.78, 1.0]);

  // shirt
  drawRect(x + 0.00 * s, y + 0.27 * s, 0.30 * s, 0.12 * s, [0.85, 0.10, 0.10, 1.0]);

  // arms
  drawRect(x - 0.04 * s, y + 0.27 * s, 0.04 * s, 0.10 * s, [0.85, 0.10, 0.10, 1.0]);
  drawRect(x + 0.30 * s, y + 0.27 * s, 0.04 * s, 0.10 * s, [0.85, 0.10, 0.10, 1.0]);

  // gloves
  drawRect(x - 0.05 * s, y + 0.27 * s, 0.03 * s, 0.04 * s, [1.0, 0.95, 0.90, 1.0]);
  drawRect(x + 0.33 * s, y + 0.27 * s, 0.03 * s, 0.04 * s, [1.0, 0.95, 0.90, 1.0]);

  // face
  drawRect(x + 0.07 * s, y + 0.39 * s, 0.18 * s, 0.14 * s, [1.0, 0.82, 0.63, 1.0]);

  // hat brim
  drawRect(x + 0.05 * s, y + 0.51 * s, 0.22 * s, 0.035 * s, [0.85, 0.10, 0.10, 1.0]);

  // hat top
  drawRect(x + 0.09 * s, y + 0.545 * s, 0.14 * s, 0.065 * s, [0.85, 0.10, 0.10, 1.0]);

  // mustache
  drawRect(x + 0.13 * s, y + 0.43 * s, 0.08 * s, 0.02 * s, [0.20, 0.10, 0.03, 1.0]);

  // nose
  drawRect(x + 0.20 * s, y + 0.46 * s, 0.035 * s, 0.03 * s, [0.95, 0.72, 0.54, 1.0]);

  // eyes
  drawRect(x + 0.13 * s, y + 0.485 * s, 0.012 * s, 0.024 * s, [0.0, 0.0, 0.0, 1.0]);
  drawRect(x + 0.17 * s, y + 0.485 * s, 0.012 * s, 0.024 * s, [0.0, 0.0, 0.0, 1.0]);
}

// ===================== VB Block =====================

function drawVBBlock(x, y, size) {
  const yellow = [0.97, 0.76, 0.12, 1.0];
  const dark = [0.82, 0.52, 0.05, 1.0];
  const text = [0.56, 0.30, 0.06, 1.0];

  drawRect(x, y, size, size, yellow);

  // border
  drawRect(x, y + size - 0.018, size, 0.018, dark);
  drawRect(x, y, size, 0.018, dark);
  drawRect(x, y, 0.018, size, dark);
  drawRect(x + size - 0.018, y, 0.018, size, dark);

  // studs
  drawRect(x + 0.04, y + 0.04, 0.025, 0.025, dark);
  drawRect(x + size - 0.065, y + 0.04, 0.025, 0.025, dark);
  drawRect(x + 0.04, y + size - 0.065, 0.025, 0.025, dark);
  drawRect(x + size - 0.065, y + size - 0.065, 0.025, 0.025, dark);

  // V
  drawTriangleColor([
    x + size * 0.20, y + size * 0.72,
    x + size * 0.28, y + size * 0.28,
    x + size * 0.36, y + size * 0.72
  ], text);

  // B spine
  drawRect(x + size * 0.50, y + size * 0.25, size * 0.07, size * 0.50, text);
  // B top
  drawRect(x + size * 0.57, y + size * 0.56, size * 0.14, size * 0.10, text);
  // B mid
  drawRect(x + size * 0.57, y + size * 0.43, size * 0.11, size * 0.07, text);
  // B bot
  drawRect(x + size * 0.57, y + size * 0.30, size * 0.14, size * 0.10, text);
}

// ===================== Mushroom =====================

function drawMushroom(cx, baseY, s) {
  drawRect(cx - 0.03, baseY - 0.085, 0.06, 0.085, [0.98, 0.93, 0.82, 1.0]);

  drawRect(cx - 0.07, baseY - 0.01, 0.14, 0.06, [0.86, 0.12, 0.12, 1.0]);
  drawTriangleColor([
    cx - 0.07, baseY + 0.05,
    cx + 0.07, baseY + 0.05,
    cx,        baseY + 0.11
  ], [0.86, 0.12, 0.12, 1.0]);

  drawRect(cx - 0.04, baseY + 0.01, 0.02, 0.02, [1, 1, 1, 1]);
  drawRect(cx + 0.02, baseY + 0.015, 0.02, 0.02, [1, 1, 1, 1]);
}

// ===================== Helpers =====================

function drawRect(x, y, w, h, color) {
  drawTriangleColor([x, y, x + w, y, x, y + h], color);
  drawTriangleColor([x + w, y, x + w, y + h, x, y + h], color);
}

function drawTriangleColor(vertices, color) {
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  drawTriangle(vertices);
}
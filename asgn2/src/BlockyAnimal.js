// BlockyAnimal.js

// Shader programs
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;

  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;

  void main() {
    gl_FragColor = u_FragColor;
  }
`;

// Global WebGL variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

// UI globals
let g_globalAngle = 0;
let g_neckAngle = 0;
let g_headAngle = 0;
let g_mouthAngle = 0;
let g_tailAngle = 0;

let g_animation = false;
let g_seconds = 0;
let g_startTime = performance.now() / 1000.0;

// Mouse rotation globals
let g_mouseXAngle = 0;
let g_mouseYAngle = 0;

// Poke animation
let g_pokeAnimation = false;
let g_pokeStart = 0;

function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = function(ev) {
    if (ev.shiftKey) {
      g_pokeAnimation = true;
      g_pokeStart = g_seconds;
    }
  };

  canvas.onmousemove = function(ev) {
    if (ev.buttons === 1) {
      g_mouseYAngle += ev.movementX;
      g_mouseXAngle += ev.movementY;
      renderScene();
    }
  };

  gl.clearColor(0.72, 0.88, 1.0, 1.0);

  requestAnimationFrame(tick);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');

  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) {
    console.log('Failed to get WebGL context.');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get a_Position');
    return;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get u_GlobalRotateMatrix');
    return;
  }

  const identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
  document.getElementById('angleSlide').addEventListener('input', function() {
    g_globalAngle = this.value;
    renderScene();
  });

  document.getElementById('neckSlide').addEventListener('input', function() {
    g_neckAngle = Number(this.value);
    renderScene();
  });

  document.getElementById('headSlide').addEventListener('input', function() {
    g_headAngle = Number(this.value);
    renderScene();
  });

  document.getElementById('mouthSlide').addEventListener('input', function() {
    g_mouthAngle = Number(this.value);
    renderScene();
  });

  document.getElementById('tailSlide').addEventListener('input', function() {
    g_tailAngle = Number(this.value);
    renderScene();
  });

  document.getElementById('animationOnButton').onclick = function() {
    g_animation = true;
  };

  document.getElementById('animationOffButton').onclick = function() {
    g_animation = false;
  };
}

function tick() {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateAnimationAngles();
  renderScene();

  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if (g_animation) {
    g_neckAngle = 10 * Math.sin(g_seconds * 2);
    g_headAngle = 8 * Math.sin(g_seconds * 2 + 1);
    g_mouthAngle = 8 * Math.sin(g_seconds * 4);
    g_tailAngle = 20 * Math.sin(g_seconds * 3);
  }

  if (g_pokeAnimation) {
    let pokeTime = g_seconds - g_pokeStart;

    if (pokeTime < 1.5) {
      g_headAngle = 25 * Math.sin(pokeTime * 12);
      g_mouthAngle = 25 * Math.abs(Math.sin(pokeTime * 10));
      g_tailAngle = 35 * Math.sin(pokeTime * 15);
    } else {
      g_pokeAnimation = false;
    }
  }
}

function drawCube(matrix, color) {
  let cube = new Cube();
  cube.color = color;
  cube.matrix = matrix;
  cube.render();
}

function renderScene() {
  let startTime = performance.now();

  let globalRotMat = new Matrix4()
    .scale(0.55, -0.2, 0.0)
    .translate(0.0, 0.5, 0.5)
    .rotate(g_globalAngle, 0, 1, 0)
    .rotate(g_mouseXAngle, 1, 0, 0)
    .rotate(g_mouseYAngle, 0, 1, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // Colors
  const camelColor = [0.72, 0.47, 0.22, 1.0];
  const camelDark = [0.50, 0.30, 0.12, 1.0];
  const camelLight = [0.86, 0.62, 0.34, 1.0];
  const black = [0.02, 0.02, 0.02, 1.0];

  // ---------------- BODY ----------------
  let body = new Matrix4();
  body.translate(-0.5, -0.25, 0.0);
  body.scale(1.4, 0.45, 0.55);
  drawCube(body, camelColor);

  // ---------------- HUMP ----------------
  let hump = new Matrix4();
  hump.translate(-0.1, 0.15, 0.12);
  hump.scale(0.45, 0.45, 0.35);
  drawCube(hump, camelDark);

  // ---------------- NECK CHAIN ----------------
  let lowerNeck = new Matrix4();
  lowerNeck.translate(0.75, 0.05, 0.22);
  lowerNeck.rotate(-35 + g_neckAngle, 0, 0, 1);
  let lowerNeckSave = new Matrix4(lowerNeck);
  lowerNeck.scale(0.22, 0.65, 0.22);
  drawCube(lowerNeck, camelColor);

  let upperNeck = new Matrix4(lowerNeckSave);
  upperNeck.translate(0.0, 0.55, 0.0);
  upperNeck.rotate(g_headAngle, 0, 0, 1);
  let upperNeckSave = new Matrix4(upperNeck);
  upperNeck.scale(0.20, 0.45, 0.20);
  drawCube(upperNeck, camelLight);

  let head = new Matrix4(upperNeckSave);
  head.translate(-0.08, 0.42, -0.04);
  let headSave = new Matrix4(head);
  head.scale(0.45, 0.25, 0.30);
  drawCube(head, camelColor);

  let mouth = new Matrix4(headSave);
  mouth.translate(0.28, 0.02, 0.04);
  mouth.rotate(g_mouthAngle, 0, 0, 1);
  mouth.scale(0.28, 0.12, 0.20);
  drawCube(mouth, camelLight);

  // Ears
  let ear1 = new Matrix4(headSave);
  ear1.translate(0.05, 0.22, 0.04);
  ear1.scale(0.08, 0.25, 0.06);
  drawCube(ear1, camelDark);

  let ear2 = new Matrix4(headSave);
  ear2.translate(0.22, 0.22, 0.18);
  ear2.scale(0.08, 0.25, 0.06);
  drawCube(ear2, camelDark);

  // Eye
  let eye = new Matrix4(headSave);
  eye.translate(0.28, 0.14, -0.01);
  eye.scale(0.05, 0.05, 0.05);
  drawCube(eye, black);

  // ---------------- LEGS ----------------

  // Front left leg
  let flUpper = new Matrix4();
  flUpper.translate(0.62, -0.65, 0.08);
  flUpper.rotate(6 * Math.sin(g_seconds * 2), 1, 0, 0);
  flUpper.scale(0.18, 0.55, 0.16);
  drawCube(flUpper, camelDark);

  let flLower = new Matrix4();
  flLower.translate(0.63, -1.1, 0.08);
  flLower.rotate(-6 * Math.sin(g_seconds * 2), 1, 0, 0);
  flLower.scale(0.15, 0.45, 0.14);
  drawCube(flLower, camelColor);

  let flFoot = new Matrix4();
  flFoot.translate(0.58, -1.24, 0.04);
  flFoot.scale(0.28, 0.12, 0.20);
  drawCube(flFoot, camelDark);

  // Front right leg
  let frUpper = new Matrix4();
  frUpper.translate(0.62, -0.65, 0.36);
  frUpper.rotate(-6 * Math.sin(g_seconds * 2), 1, 0, 0);
  frUpper.scale(0.18, 0.55, 0.16);
  drawCube(frUpper, camelDark);

  let frLower = new Matrix4();
  frLower.translate(0.63, -1.1, 0.36);
  frLower.rotate(6 * Math.sin(g_seconds * 2), 1, 0, 0);
  frLower.scale(0.15, 0.45, 0.14);
  drawCube(frLower, camelColor);

  let frFoot = new Matrix4();
  frFoot.translate(0.58, -1.24, 0.32);
  frFoot.scale(0.28, 0.12, 0.20);
  drawCube(frFoot, camelDark);

  // Back left leg
  let blUpper = new Matrix4();
  blUpper.translate(-0.38, -0.65, 0.08);
  blUpper.rotate(-6 * Math.sin(g_seconds * 2), 1, 0, 0);
  blUpper.scale(0.18, 0.55, 0.16);
  drawCube(blUpper, camelDark);

  let blLower = new Matrix4();
  blLower.translate(-0.37, -1.1, 0.08);
  blLower.rotate(6 * Math.sin(g_seconds * 2), 1, 0, 0);
  blLower.scale(0.15, 0.45, 0.14);
  drawCube(blLower, camelColor);

  let blFoot = new Matrix4();
  blFoot.translate(-0.42, -1.24, 0.04);
  blFoot.scale(0.28, 0.12, 0.20);
  drawCube(blFoot, camelDark);

  // Back right leg
  let brUpper = new Matrix4();
  brUpper.translate(-0.38, -0.65, 0.36);
  brUpper.rotate(6 * Math.sin(g_seconds * 2), 1, 0, 0);
  brUpper.scale(0.18, 0.55, 0.16);
  drawCube(brUpper, camelDark);

  let brLower = new Matrix4();
  brLower.translate(-0.37, -1.1, 0.36);
  brLower.rotate(-6 * Math.sin(g_seconds * 2), 1, 0, 0);
  brLower.scale(0.15, 0.45, 0.14);
  drawCube(brLower, camelColor);

  let brFoot = new Matrix4();
  brFoot.translate(-0.42, -1.24, 0.32);
  brFoot.scale(0.28, 0.12, 0.20);
  drawCube(brFoot, camelDark);

  // ---------------- TAIL ----------------
  let tailBase = new Matrix4();
  tailBase.translate(-0.55, -0.05, 0.25);
  tailBase.rotate(35 + g_tailAngle, 0, 0, 1);
  tailBase.scale(0.10, 0.45, 0.10);
  drawCube(tailBase, camelDark);

  let tailEnd = new Matrix4();
  tailEnd.translate(-0.72, -0.38, 0.22);
  tailEnd.scale(0.18, 0.18, 0.18);
  drawCube(tailEnd, black);

  // Performance indicator
  let duration = performance.now() - startTime;
  let fps = Math.floor(10000 / duration) / 10;
  document.getElementById('performance').innerHTML =
    'Performance: ' + fps + ' fps, render time: ' + Math.floor(duration * 10) / 10 + ' ms';
}
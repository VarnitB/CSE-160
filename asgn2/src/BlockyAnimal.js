// BlockyAnimal.js

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

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

let g_globalAngle = 0;

let g_neckAngle = 0;
let g_headAngle = 0;
let g_mouthAngle = 0;
let g_tailAngle = 0;

let g_frontLegAngle = 0;
let g_backLegAngle = 0;
let g_kneeAngle = 0;
let g_footAngle = 0;

let g_animation = false;
let g_seconds = 0;
let g_startTime = performance.now() / 1000.0;

let g_mouseXAngle = 0;
let g_mouseYAngle = 0;

let g_pokeAnimation = false;
let g_pokeStart = 0;

let g_coneBuffer = null;
let g_coneVertexCount = 0;

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

  gl = getWebGLContext(canvas);
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
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');

  const identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

function addActionsForHtmlUI() {
  document.getElementById('angleSlide').addEventListener('input', function() {
    g_globalAngle = Number(this.value);
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

  document.getElementById('frontLegSlide').addEventListener('input', function() {
    g_frontLegAngle = Number(this.value);
    renderScene();
  });

  document.getElementById('backLegSlide').addEventListener('input', function() {
    g_backLegAngle = Number(this.value);
    renderScene();
  });

  document.getElementById('kneeSlide').addEventListener('input', function() {
    g_kneeAngle = Number(this.value);
    renderScene();
  });

  document.getElementById('footSlide').addEventListener('input', function() {
    g_footAngle = Number(this.value);
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
    g_neckAngle = 8 * Math.sin(g_seconds * 2.0);
    g_headAngle = 10 * Math.sin(g_seconds * 2.0 + 0.8);
    g_mouthAngle = 6 * Math.sin(g_seconds * 5.0);
    g_tailAngle = 18 * Math.sin(g_seconds * 3.0);

    g_frontLegAngle = 16 * Math.sin(g_seconds * 2.4);
    g_backLegAngle = -16 * Math.sin(g_seconds * 2.4);
    g_kneeAngle = 12 * Math.sin(g_seconds * 2.4 + 1.2);
    g_footAngle = 8 * Math.sin(g_seconds * 2.4 + 2.0);
  }

  if (g_pokeAnimation) {
    const pokeTime = g_seconds - g_pokeStart;

    if (pokeTime < 1.5) {
      g_headAngle = 25 * Math.sin(pokeTime * 12);
      g_mouthAngle = 30 * Math.abs(Math.sin(pokeTime * 10));
      g_tailAngle = 45 * Math.sin(pokeTime * 14);
      g_frontLegAngle = 25 * Math.sin(pokeTime * 12);
      g_backLegAngle = -25 * Math.sin(pokeTime * 12);
    } else {
      g_pokeAnimation = false;
    }
  }
}

function drawCube(matrix, color) {
  const cube = new Cube();
  cube.color = color;
  cube.matrix = matrix;
  cube.render();
}

function initConeBuffer() {
  if (g_coneBuffer) return;

  const segments = 24;
  const vertices = [];

  for (let i = 0; i < segments; i++) {
    const angle1 = (i / segments) * 2 * Math.PI;
    const angle2 = ((i + 1) / segments) * 2 * Math.PI;

    const x1 = Math.cos(angle1) * 0.5;
    const z1 = Math.sin(angle1) * 0.5;
    const x2 = Math.cos(angle2) * 0.5;
    const z2 = Math.sin(angle2) * 0.5;

    vertices.push(0, 1, 0);
    vertices.push(x1, 0, z1);
    vertices.push(x2, 0, z2);

    vertices.push(0, 0, 0);
    vertices.push(x2, 0, z2);
    vertices.push(x1, 0, z1);
  }

  g_coneVertexCount = vertices.length / 3;
  g_coneBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, g_coneBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
}

function drawCone(matrix, color) {
  initConeBuffer();

  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_coneBuffer);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, g_coneVertexCount);
}

function drawLeg(baseX, baseZ, upperAngle, kneeAngle, footAngle, phaseColor) {
  const camelColor = [0.72, 0.47, 0.22, 1.0];
  const camelDark = [0.50, 0.30, 0.12, 1.0];

  let upperJoint = new Matrix4();
  upperJoint.translate(baseX, -0.17, baseZ);

  // FIXED: rotate around Z so legs swing forward/back along the body.
  upperJoint.rotate(upperAngle, 0, 0, 1);

  let upperLeg = new Matrix4(upperJoint);
  upperLeg.translate(-0.08, -0.48, -0.06);
  upperLeg.scale(0.16, 0.50, 0.14);
  drawCube(upperLeg, phaseColor ? camelDark : camelColor);

  let kneeJoint = new Matrix4(upperJoint);
  kneeJoint.translate(0.0, -0.48, 0.0);

  // FIXED: knee also bends in same forward/back plane.
  kneeJoint.rotate(kneeAngle, 0, 0, 1);

  let lowerLeg = new Matrix4(kneeJoint);
  lowerLeg.translate(-0.06, -0.40, -0.05);
  lowerLeg.scale(0.12, 0.42, 0.10);
  drawCube(lowerLeg, phaseColor ? camelColor : camelDark);

  let footJoint = new Matrix4(kneeJoint);
  footJoint.translate(0.07, -0.43, 0.0);

  // FIXED: foot rotates forward/back too.
  footJoint.rotate(footAngle, 0, 0, 1);

  let foot = new Matrix4(footJoint);
  foot.translate(-0.14, -0.06, -0.10);
  foot.scale(0.28, 0.10, 0.22);
  drawCube(foot, camelDark);
}

function renderScene() {
  const startTime = performance.now();

  const globalRotMat = new Matrix4()
    .scale(0.55, 0.55, 0.55)
    .translate(-0.15, 0.35, 0.0)
    .rotate(g_globalAngle, 0, 1, 0)
    .rotate(g_mouseXAngle, 1, 0, 0)
    .rotate(g_mouseYAngle, 0, 1, 0);

  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const camelColor = [0.72, 0.47, 0.22, 1.0];
  const camelDark = [0.50, 0.30, 0.12, 1.0];
  const camelLight = [0.86, 0.62, 0.34, 1.0];
  const black = [0.02, 0.02, 0.02, 1.0];

  // Body
  let body = new Matrix4();
  body.translate(-0.70, -0.15, -0.27);
  body.scale(1.40, 0.42, 0.55);
  drawCube(body, camelColor);

  // Chest
  let chest = new Matrix4();
  chest.translate(0.48, -0.05, -0.23);
  chest.scale(0.28, 0.36, 0.47);
  drawCube(chest, camelLight);

  // Hump
  let hump = new Matrix4();
  hump.translate(-0.22, 0.23, -0.18);
  hump.scale(0.48, 0.45, 0.36);
  drawCube(hump, camelDark);

  // Non-cube primitive: cone on hump
  let humpCone = new Matrix4();
  humpCone.translate(0.02, 0.62, 0.0);
  humpCone.rotate(180, 1, 0, 0);
  humpCone.scale(0.35, 0.22, 0.35);
  drawCone(humpCone, camelDark);

  // Neck chain
  let lowerNeckJoint = new Matrix4();
  lowerNeckJoint.translate(0.70, 0.12, 0.0);
  lowerNeckJoint.rotate(-38 + g_neckAngle, 0, 0, 1);

  let lowerNeck = new Matrix4(lowerNeckJoint);
  lowerNeck.translate(-0.08, 0.0, -0.08);
  lowerNeck.scale(0.18, 0.62, 0.18);
  drawCube(lowerNeck, camelColor);

  let upperNeckJoint = new Matrix4(lowerNeckJoint);
  upperNeckJoint.translate(0.0, 0.58, 0.0);
  upperNeckJoint.rotate(g_headAngle, 0, 0, 1);

  let upperNeck = new Matrix4(upperNeckJoint);
  upperNeck.translate(-0.07, 0.0, -0.07);
  upperNeck.scale(0.15, 0.45, 0.15);
  drawCube(upperNeck, camelLight);

  let headJoint = new Matrix4(upperNeckJoint);
  headJoint.translate(-0.12, 0.40, 0.0);

  let head = new Matrix4(headJoint);
  head.translate(-0.10, -0.02, -0.15);
  head.scale(0.42, 0.25, 0.30);
  drawCube(head, camelColor);

  let mouthJoint = new Matrix4(headJoint);
  mouthJoint.translate(0.26, 0.02, 0.0);
  mouthJoint.rotate(g_mouthAngle, 0, 0, 1);

  let mouth = new Matrix4(mouthJoint);
  mouth.translate(0.0, -0.07, -0.10);
  mouth.scale(0.26, 0.13, 0.20);
  drawCube(mouth, camelLight);

  // Ears
  let ear1 = new Matrix4(headJoint);
  ear1.translate(0.00, 0.20, -0.10);
  ear1.rotate(-10, 0, 0, 1);
  ear1.scale(0.07, 0.28, 0.06);
  drawCube(ear1, camelDark);

  let ear2 = new Matrix4(headJoint);
  ear2.translate(0.18, 0.20, 0.08);
  ear2.rotate(-10, 0, 0, 1);
  ear2.scale(0.07, 0.28, 0.06);
  drawCube(ear2, camelDark);

  // Eyes
  let eye1 = new Matrix4(headJoint);
  eye1.translate(0.24, 0.11, -0.16);
  eye1.scale(0.05, 0.05, 0.04);
  drawCube(eye1, black);

  let eye2 = new Matrix4(headJoint);
  eye2.translate(0.24, 0.11, 0.11);
  eye2.scale(0.05, 0.05, 0.04);
  drawCube(eye2, black);

  // Four legs with fixed forward/back swing
  drawLeg(0.48, -0.17, g_frontLegAngle, g_kneeAngle, g_footAngle, true);
  drawLeg(0.48, 0.17, -g_frontLegAngle, -g_kneeAngle, -g_footAngle, false);
  drawLeg(-0.45, -0.17, g_backLegAngle, -g_kneeAngle, g_footAngle, false);
  drawLeg(-0.45, 0.17, -g_backLegAngle, g_kneeAngle, -g_footAngle, true);

  // Tail
  let tailJoint = new Matrix4();
  tailJoint.translate(-0.72, 0.03, 0.0);

  // FIXED: tail starts pointing backward from the camel, not down into the body.
  tailJoint.rotate(-65 + g_tailAngle, 0, 0, 1);

  let tail = new Matrix4(tailJoint);
  tail.translate(-0.04, -0.34, -0.04);
  tail.scale(0.08, 0.38, 0.08);
  drawCube(tail, camelDark);

  let tailTuft = new Matrix4(tailJoint);
  tailTuft.translate(-0.01, -0.34, 0.0);
  tailTuft.rotate(180, 1, 0, 0);
  tailTuft.scale(0.16, 0.20, 0.16);
  drawCone(tailTuft, black);

  const duration = performance.now() - startTime;
  const fps = Math.floor(10000 / duration) / 10;

  document.getElementById('performance').innerHTML =
    'Performance: ' + fps + ' fps | render time: ' +
    Math.floor(duration * 10) / 10 + ' ms';
}
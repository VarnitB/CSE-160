// index.js
// Main file for Assignment 3 virtual world

let canvas;
let gl;

let camera;
let world;
let controls;

let programInfo;

let texturesLoaded = 0;
const NUM_TEXTURES = 5;

let lastFrameTime = performance.now();
let fpsDisplay;

// Vertex shader
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  varying vec2 v_UV;

  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }
`;

// Fragment shader
const FSHADER_SOURCE = `
  precision mediump float;

  uniform vec4 u_FragColor;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;

  uniform int u_whichTexture;
  uniform float u_texColorWeight;

  varying vec2 v_UV;

  void main() {
    vec4 texColor;

    if (u_whichTexture == 0) {
      texColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      texColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      texColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      texColor = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == 4) {
      texColor = texture2D(u_Sampler4, v_UV);
    } else {
      texColor = u_FragColor;
    }

    gl_FragColor = (1.0 - u_texColorWeight) * u_FragColor + u_texColorWeight * texColor;
  }
`;

function main() {
  setupWebGL();
  connectVariablesToGLSL();

  fpsDisplay = document.getElementById("fps");

  camera = new Camera(canvas);
  world = new World();

  controls = new Controls(canvas, camera, world, renderScene);

  initTextures();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  requestAnimationFrame(tick);
}

function setupWebGL() {
  canvas = document.getElementById("webgl");

  if (!canvas) {
    console.log("Failed to retrieve the canvas element");
    return;
  }

  // false turns off WebGL debug mode, which helps FPS a lot
  gl = getWebGLContext(canvas, false);

  if (!gl) {
    console.log("Failed to get WebGL context");
    return;
  }
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log("Failed to initialize shaders.");
    return;
  }

  programInfo = {
    a_Position: gl.getAttribLocation(gl.program, "a_Position"),
    a_UV: gl.getAttribLocation(gl.program, "a_UV"),

    u_ModelMatrix: gl.getUniformLocation(gl.program, "u_ModelMatrix"),
    u_ViewMatrix: gl.getUniformLocation(gl.program, "u_ViewMatrix"),
    u_ProjectionMatrix: gl.getUniformLocation(gl.program, "u_ProjectionMatrix"),

    u_FragColor: gl.getUniformLocation(gl.program, "u_FragColor"),
    u_whichTexture: gl.getUniformLocation(gl.program, "u_whichTexture"),
    u_texColorWeight: gl.getUniformLocation(gl.program, "u_texColorWeight"),

    u_Sampler0: gl.getUniformLocation(gl.program, "u_Sampler0"),
    u_Sampler1: gl.getUniformLocation(gl.program, "u_Sampler1"),
    u_Sampler2: gl.getUniformLocation(gl.program, "u_Sampler2"),
    u_Sampler3: gl.getUniformLocation(gl.program, "u_Sampler3"),
    u_Sampler4: gl.getUniformLocation(gl.program, "u_Sampler4"),
  };

  if (programInfo.a_Position < 0) {
    console.log("Failed to get a_Position");
  }

  if (programInfo.a_UV < 0) {
    console.log("Failed to get a_UV");
  }

  if (!programInfo.u_ModelMatrix) {
    console.log("Failed to get u_ModelMatrix");
  }

  if (!programInfo.u_ViewMatrix) {
    console.log("Failed to get u_ViewMatrix");
  }

  if (!programInfo.u_ProjectionMatrix) {
    console.log("Failed to get u_ProjectionMatrix");
  }
}

function initTextures() {
  loadTexture("./textures/wall.png", 0, programInfo.u_Sampler0);
  loadTexture("./textures/grass.png", 1, programInfo.u_Sampler1);
  loadTexture("./textures/dirt.png", 2, programInfo.u_Sampler2);
  loadTexture("./textures/sky.png", 3, programInfo.u_Sampler3);
  loadTexture("./textures/goal.png", 4, programInfo.u_Sampler4);
}

function loadTexture(src, textureUnit, samplerLocation) {
  const image = new Image();

  image.onload = function () {
    sendTextureToGLSL(image, textureUnit, samplerLocation);
  };

  image.onerror = function () {
    console.log("Failed to load texture:", src);
  };

  image.src = src;
}

function sendTextureToGLSL(image, textureUnit, samplerLocation) {
  const texture = gl.createTexture();

  if (!texture) {
    console.log("Failed to create texture object");
    return;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

  gl.activeTexture(gl.TEXTURE0 + textureUnit);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);

  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    image
  );

  gl.uniform1i(samplerLocation, textureUnit);

  texturesLoaded++;
}

function tick(now) {
  updateFPS(now);
  renderScene();
  requestAnimationFrame(tick);
}

function updateFPS(now) {
  const delta = now - lastFrameTime;
  lastFrameTime = now;

  const fps = Math.round(1000 / delta);

  if (fpsDisplay) {
    fpsDisplay.textContent = "FPS: " + fps;
  }
}

function renderScene() {
  if (!gl || !programInfo || !camera || !world) return;

  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.uniformMatrix4fv(
    programInfo.u_ViewMatrix,
    false,
    camera.viewMatrix.elements
  );

  gl.uniformMatrix4fv(
    programInfo.u_ProjectionMatrix,
    false,
    camera.projectionMatrix.elements
  );

  world.draw(gl, programInfo);

  if (world.checkGoal(camera)) {
    showWinMessage();
  }
}

function showWinMessage() {
  const message = document.getElementById("message");

  if (message) {
    message.textContent = "Status: You found the gold block! Mini-game complete.";
    message.style.borderLeftColor = "#facc15";
  }
}

window.onload = main;
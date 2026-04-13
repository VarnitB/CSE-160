// ColoredPoints.js

// ===================== Shaders =====================
const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

// ===================== Globals =====================
let canvas;
let gl;

let a_Position;
let u_FragColor;
let u_Size;

const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

let g_selectedType = POINT;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0];
let g_selectedSize = 10.0;
let g_selectedSegments = 10;

let g_shapesList = [];

// ===================== Main =====================
function main() {
  setupWebGL();
  connectVariablesToGLSL();
  addActionsForHtmlUI();

  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) {
    if (ev.buttons === 1) {
      click(ev);
    }
  };

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  renderAllShapes();
}

// ===================== Setup =====================
function setupWebGL() {
  canvas = document.getElementById('webgl');
  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });

  if (!gl) {
    console.log('Failed to get WebGL context.');
  }
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

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get u_Size');
    return;
  }
}

// ===================== HTML UI =====================
function addActionsForHtmlUI() {
  document.getElementById('clearButton').onclick = function() {
    g_shapesList = [];
    renderAllShapes();
  };

  document.getElementById('pointButton').onclick = function() {
    g_selectedType = POINT;
  };

  document.getElementById('triangleButton').onclick = function() {
    g_selectedType = TRIANGLE;
  };

  document.getElementById('circleButton').onclick = function() {
    g_selectedType = CIRCLE;
  };

  document.getElementById('redSlide').addEventListener('input', function() {
    g_selectedColor[0] = this.value / 100;
  });

  document.getElementById('greenSlide').addEventListener('input', function() {
    g_selectedColor[1] = this.value / 100;
  });

  document.getElementById('blueSlide').addEventListener('input', function() {
    g_selectedColor[2] = this.value / 100;
  });

  document.getElementById('sizeSlide').addEventListener('input', function() {
    g_selectedSize = Number(this.value);
  });

  document.getElementById('segmentSlide').addEventListener('input', function() {
    g_selectedSegments = Number(this.value);
  });

  document.getElementById('drawPictureButton').onclick = function() {
    drawMyPicture();
  };
}

// ===================== Mouse Click =====================
function click(ev) {
  let [x, y] = convertCoordinatesEventToGL(ev);

  let shape;

  if (g_selectedType === POINT) {
    shape = new Point();
  } else if (g_selectedType === TRIANGLE) {
    shape = new Triangle();
  } else {
    shape = new Circle();
    shape.segments = g_selectedSegments;
  }

  shape.position = [x, y];
  shape.color = [...g_selectedColor];
  shape.size = g_selectedSize;

  g_shapesList.push(shape);
  renderAllShapes();
}

// ===================== Render =====================
function renderAllShapes() {
  gl.clear(gl.COLOR_BUFFER_BIT);

  const len = g_shapesList.length;
  for (let i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
}

// ===================== Helpers =====================
function convertCoordinatesEventToGL(ev) {
  const x = ev.clientX;
  const y = ev.clientY;
  const rect = ev.target.getBoundingClientRect();

  const xGL = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
  const yGL = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

  return [xGL, yGL];
}

// ===================== Shader Helpers =====================
function initShaders(gl, vshader, fshader) {
  const program = createProgram(gl, vshader, fshader);
  if (!program) {
    console.log('Failed to create program');
    return false;
  }

  gl.useProgram(program);
  gl.program = program;
  return true;
}

function createProgram(gl, vshader, fshader) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vshader);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fshader);
  if (!vertexShader || !fragmentShader) {
    return null;
  }

  const program = gl.createProgram();
  if (!program) {
    return null;
  }

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
    const error = gl.getProgramInfoLog(program);
    console.log('Failed to link program: ' + error);
    gl.deleteProgram(program);
    gl.deleteShader(fragmentShader);
    gl.deleteShader(vertexShader);
    return null;
  }

  return program;
}

function loadShader(gl, type, source) {
  const shader = gl.createShader(type);
  if (shader == null) {
    console.log('Unable to create shader');
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!compiled) {
    const error = gl.getShaderInfoLog(shader);
    console.log('Failed to compile shader: ' + error);
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
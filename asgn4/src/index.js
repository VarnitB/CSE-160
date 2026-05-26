let canvas;
let gl;

let camera;
let world;
let controls;
let objModel = null;

let programInfo;

let texturesLoaded = 0;

let lastFrameTime = performance.now();
let fpsDisplay;

let g_seconds = 0;
let g_startTime = performance.now() / 1000.0;

let lightingOn = true;
let normalsOn = false;
let pointLightOn = true;
let spotLightOn = true;

let lightPos = [0, 5, 0];
let lightColor = [1, 1, 1];

let animateLight = true;

const VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;

  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;

  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec3 v_WorldPos;

  void main() {
    vec4 worldPosition = u_ModelMatrix * a_Position;

    gl_Position = u_ProjectionMatrix * u_ViewMatrix * worldPosition;

    v_UV = a_UV;
    v_WorldPos = worldPosition.xyz;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));
  }
`;

const FSHADER_SOURCE = `
  precision mediump float;

  uniform vec4 u_FragColor;

  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;

  uniform int u_whichTexture;
  uniform float u_texColorWeight;

  uniform vec3 u_LightPos;
  uniform vec3 u_CameraPos;
  uniform vec3 u_LightColor;

  uniform vec3 u_SpotLightPos;
  uniform vec3 u_SpotDirection;
  uniform float u_SpotCutoff;

  uniform int u_LightingOn;
  uniform int u_NormalOn;
  uniform int u_PointLightOn;
  uniform int u_SpotLightOn;

  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec3 v_WorldPos;

  vec4 getBaseColor() {
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
    } else if (u_whichTexture == 5) {
      texColor = texture2D(u_Sampler5, v_UV);
    } else {
      texColor = u_FragColor;
    }

    return (1.0 - u_texColorWeight) * u_FragColor + u_texColorWeight * texColor;
  }

  vec3 phongLight(vec3 lightPosition, vec3 currentLightColor, vec3 normal, vec3 baseColor) {
    vec3 lightVector = lightPosition - v_WorldPos;
    vec3 L = normalize(lightVector);
    vec3 N = normalize(normal);
    vec3 V = normalize(u_CameraPos - v_WorldPos);
    vec3 R = reflect(-L, N);

    float nDotL = max(dot(N, L), 0.0);

    vec3 diffuse = currentLightColor * baseColor * nDotL;

    float specPower = 32.0;
    float specAmount = pow(max(dot(V, R), 0.0), specPower);
    vec3 specular = currentLightColor * vec3(0.45) * specAmount;

    float distance = length(lightVector);
    float attenuation = 1.0 / (1.0 + 0.03 * distance + 0.004 * distance * distance);

    return attenuation * (diffuse + specular);
  }

  void main() {
    vec4 base = getBaseColor();

    if (u_NormalOn == 1) {
      gl_FragColor = vec4(normalize(v_Normal) * 0.5 + 0.5, 1.0);
      return;
    }

    if (u_LightingOn == 0) {
      gl_FragColor = base;
      return;
    }

    vec3 N = normalize(v_Normal);

    vec3 ambient = 0.25 * base.rgb;
    vec3 finalColor = ambient;

    if (u_PointLightOn == 1) {
      finalColor += phongLight(u_LightPos, u_LightColor, N, base.rgb);
    }

    if (u_SpotLightOn == 1) {
      vec3 lightToFrag = normalize(v_WorldPos - u_SpotLightPos);
      vec3 spotDir = normalize(u_SpotDirection);

      float theta = dot(lightToFrag, spotDir);

      if (theta > u_SpotCutoff) {
        float intensity = smoothstep(u_SpotCutoff, u_SpotCutoff + 0.08, theta);
        finalColor += intensity * phongLight(
          u_SpotLightPos,
          vec3(1.0, 0.92, 0.72),
          N,
          base.rgb
        );
      }
    }

    gl_FragColor = vec4(finalColor, base.a);
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

  objModel = new Model("./models/sample.obj");
  objModel.load();

  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.enable(gl.DEPTH_TEST);

  updateLightSlider();
  updateLightColor();
  updateStatusText();

  requestAnimationFrame(tick);
}

function setupWebGL() {
  canvas = document.getElementById("webgl");

  if (!canvas) {
    console.log("Failed to retrieve canvas");
    return;
  }

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
    a_Normal: gl.getAttribLocation(gl.program, "a_Normal"),

    u_ModelMatrix: gl.getUniformLocation(gl.program, "u_ModelMatrix"),
    u_NormalMatrix: gl.getUniformLocation(gl.program, "u_NormalMatrix"),
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
    u_Sampler5: gl.getUniformLocation(gl.program, "u_Sampler5"),

    u_LightPos: gl.getUniformLocation(gl.program, "u_LightPos"),
    u_CameraPos: gl.getUniformLocation(gl.program, "u_CameraPos"),
    u_LightColor: gl.getUniformLocation(gl.program, "u_LightColor"),

    u_SpotLightPos: gl.getUniformLocation(gl.program, "u_SpotLightPos"),
    u_SpotDirection: gl.getUniformLocation(gl.program, "u_SpotDirection"),
    u_SpotCutoff: gl.getUniformLocation(gl.program, "u_SpotCutoff"),

    u_LightingOn: gl.getUniformLocation(gl.program, "u_LightingOn"),
    u_NormalOn: gl.getUniformLocation(gl.program, "u_NormalOn"),
    u_PointLightOn: gl.getUniformLocation(gl.program, "u_PointLightOn"),
    u_SpotLightOn: gl.getUniformLocation(gl.program, "u_SpotLightOn"),
  };
}

function initTextures() {
  loadTexture("./textures/wall.png", 0, programInfo.u_Sampler0);
  loadTexture("./textures/grass.png", 1, programInfo.u_Sampler1);
  loadTexture("./textures/dirt.png", 2, programInfo.u_Sampler2);
  loadTexture("./textures/sky.png", 3, programInfo.u_Sampler3);
  loadTexture("./textures/goal.png", 4, programInfo.u_Sampler4);
  loadTexture("./textures/wall2.png", 5, programInfo.u_Sampler5);
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
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    image
  );

  gl.uniform1i(samplerLocation, textureUnit);

  texturesLoaded++;
}

function tick(now) {
  g_seconds = performance.now() / 1000.0 - g_startTime;

  updateFPS(now);

  if (controls) {
    controls.update();
  }

  if (animateLight) {
    const radius = 9;

    lightPos[0] = Math.cos(g_seconds) * radius;
    lightPos[2] = Math.sin(g_seconds) * radius;

    const xSlider = document.getElementById("lightXSlider");
    const zSlider = document.getElementById("lightZSlider");

    if (xSlider) xSlider.value = lightPos[0];
    if (zSlider) zSlider.value = lightPos[2];

    updateLightTextOnly();
  }

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

  const camPos = camera.getPosition();

  gl.uniform3f(programInfo.u_CameraPos, camPos.x, camPos.y, camPos.z);
  gl.uniform3f(programInfo.u_LightPos, lightPos[0], lightPos[1], lightPos[2]);
  gl.uniform3f(
    programInfo.u_LightColor,
    lightColor[0],
    lightColor[1],
    lightColor[2]
  );

  gl.uniform1i(programInfo.u_LightingOn, lightingOn ? 1 : 0);
  gl.uniform1i(programInfo.u_NormalOn, normalsOn ? 1 : 0);
  gl.uniform1i(programInfo.u_PointLightOn, pointLightOn ? 1 : 0);
  gl.uniform1i(programInfo.u_SpotLightOn, spotLightOn ? 1 : 0);

  gl.uniform3f(programInfo.u_SpotLightPos, camPos.x, camPos.y, camPos.z);

  const lookDir = camera.getLookDirection();

  gl.uniform3f(
    programInfo.u_SpotDirection,
    lookDir.elements[0],
    lookDir.elements[1],
    lookDir.elements[2]
  );

  gl.uniform1f(programInfo.u_SpotCutoff, Math.cos((18 * Math.PI) / 180));

  world.draw(gl, programInfo);

  drawAssignmentObjects();
  drawLightCube();
}

function drawAssignmentObjects() {
  const cube = new Cube();

  cube.textureNum = -1;
  cube.texColorWeight = 0.0;
  cube.color = [0.2, 0.7, 1.0, 1.0];
  cube.matrix.translate(-4, 1, -3);
  cube.matrix.scale(1.5, 1.5, 1.5);
  cube.render(gl, programInfo);

  const sphere1 = new Sphere(24, 24);

  sphere1.textureNum = -1;
  sphere1.texColorWeight = 0.0;
  sphere1.color = [1.0, 0.3, 0.25, 1.0];
  sphere1.matrix.translate(2, 1.2, -3);
  sphere1.matrix.scale(1.2, 1.2, 1.2);
  sphere1.render(gl, programInfo);

  const sphere2 = new Sphere(24, 24);

  sphere2.textureNum = -1;
  sphere2.texColorWeight = 0.0;
  sphere2.color = [0.3, 1.0, 0.4, 1.0];
  sphere2.matrix.translate(5, 1, 2);
  sphere2.matrix.scale(1.0, 1.0, 1.0);
  sphere2.render(gl, programInfo);

  if (objModel && objModel.loaded) {
    objModel.color = [0.9, 0.8, 1.0, 1.0];
    objModel.matrix.setIdentity();
    objModel.matrix.translate(-1, 0.05, 5);
    objModel.matrix.scale(1.5, 1.5, 1.5);
    objModel.render(gl, programInfo);
  }
}

function drawLightCube() {
  const lightCube = new Cube();

  lightCube.textureNum = -1;
  lightCube.texColorWeight = 0.0;
  lightCube.color = [lightColor[0], lightColor[1], lightColor[2], 1.0];

  lightCube.matrix.translate(lightPos[0], lightPos[1], lightPos[2]);
  lightCube.matrix.scale(0.35, 0.35, 0.35);

  gl.uniform1i(programInfo.u_LightingOn, 0);
  lightCube.render(gl, programInfo);
  gl.uniform1i(programInfo.u_LightingOn, lightingOn ? 1 : 0);
}

function toggleLighting() {
  lightingOn = !lightingOn;
  updateStatusText();
}

function toggleNormals() {
  normalsOn = !normalsOn;
  updateStatusText();
}

function togglePointLight() {
  pointLightOn = !pointLightOn;
  updateStatusText();
}

function toggleSpotLight() {
  spotLightOn = !spotLightOn;
  updateStatusText();
}

function updateLightSlider() {
  animateLight = false;

  const x = parseFloat(document.getElementById("lightXSlider").value);
  const y = parseFloat(document.getElementById("lightYSlider").value);
  const z = parseFloat(document.getElementById("lightZSlider").value);

  lightPos = [x, y, z];

  updateLightTextOnly();
}

function updateLightTextOnly() {
  const xText = document.getElementById("lightXText");
  const yText = document.getElementById("lightYText");
  const zText = document.getElementById("lightZText");

  if (xText) xText.textContent = lightPos[0].toFixed(1);
  if (yText) yText.textContent = lightPos[1].toFixed(1);
  if (zText) zText.textContent = lightPos[2].toFixed(1);
}

function updateLightColor() {
  const r = parseFloat(document.getElementById("lightRSlider").value);
  const g = parseFloat(document.getElementById("lightGSlider").value);
  const b = parseFloat(document.getElementById("lightBSlider").value);

  lightColor = [r, g, b];

  document.getElementById("lightRText").textContent = r.toFixed(2);
  document.getElementById("lightGText").textContent = g.toFixed(2);
  document.getElementById("lightBText").textContent = b.toFixed(2);
}

function updateStatusText() {
  const message = document.getElementById("message");

  if (!message) return;

  message.textContent =
    "Lighting: " +
    (lightingOn ? "ON" : "OFF") +
    " | Normals: " +
    (normalsOn ? "ON" : "OFF") +
    " | Point: " +
    (pointLightOn ? "ON" : "OFF") +
    " | Spot: " +
    (spotLightOn ? "ON" : "OFF");
}

window.onload = main;
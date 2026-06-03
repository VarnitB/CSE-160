import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// -----------------------------
// Basic scene setup
// -----------------------------
const canvas = document.querySelector("#webgl");

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const orbitCameraPosition = new THREE.Vector3(18, 14, 22);
const orbitTarget = new THREE.Vector3(0, 2, 0);

camera.position.copy(orbitCameraPosition);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Orbit camera controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(orbitTarget);
controls.enableDamping = true;

// -----------------------------
// Texture loading
// -----------------------------
const textureLoader = new THREE.TextureLoader();

const sandTexture = textureLoader.load(
  new URL("../assets/textures/sand.jpg", import.meta.url)
);
sandTexture.wrapS = THREE.RepeatWrapping;
sandTexture.wrapT = THREE.RepeatWrapping;
sandTexture.repeat.set(8, 8);

const waterTexture = textureLoader.load(
  new URL("../assets/textures/water.jpg", import.meta.url)
);
waterTexture.wrapS = THREE.RepeatWrapping;
waterTexture.wrapT = THREE.RepeatWrapping;
waterTexture.repeat.set(10, 10);

const crateTexture = textureLoader.load(
  new URL("../assets/textures/crate.jpg", import.meta.url)
);
crateTexture.wrapS = THREE.RepeatWrapping;
crateTexture.wrapT = THREE.RepeatWrapping;

const skyTexture = textureLoader.load(
  new URL("../assets/textures/sky.jpg", import.meta.url)
);
skyTexture.wrapS = THREE.RepeatWrapping;
skyTexture.wrapT = THREE.ClampToEdgeWrapping;

// -----------------------------
// Skybox using a large inside-facing sphere
// -----------------------------
const skyGeometry = new THREE.SphereGeometry(450, 64, 64);
const skyMaterial = new THREE.MeshBasicMaterial({
  map: skyTexture,
  side: THREE.BackSide,
});
const sky = new THREE.Mesh(skyGeometry, skyMaterial);
scene.add(sky);

// -----------------------------
// Lights
// -----------------------------
const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambientLight);

const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x5b3a1e, 0.7);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight(0xfff4cc, 1.6);
directionalLight.position.set(15, 25, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.left = -35;
directionalLight.shadow.camera.right = 35;
directionalLight.shadow.camera.top = 35;
directionalLight.shadow.camera.bottom = -35;
scene.add(directionalLight);

const treasureLight = new THREE.PointLight(0xffc857, 3, 30);
treasureLight.position.set(3, 2.8, -3);
treasureLight.castShadow = true;
scene.add(treasureLight);

const spotLight = new THREE.SpotLight(0x66ccff, 1.8, 55, Math.PI / 7, 0.4, 1);
spotLight.position.set(-10, 14, -10);
spotLight.target.position.set(0, 0, 0);
spotLight.castShadow = true;
scene.add(spotLight);
scene.add(spotLight.target);

// -----------------------------
// Materials
// -----------------------------
const sandMaterial = new THREE.MeshStandardMaterial({
  map: sandTexture,
  roughness: 0.9,
});

const waterMaterial = new THREE.MeshStandardMaterial({
  map: waterTexture,
  color: 0x4fc3f7,
  transparent: true,
  opacity: 0.78,
  roughness: 0.25,
  metalness: 0.1,
});

const crateMaterial = new THREE.MeshStandardMaterial({
  map: crateTexture,
  roughness: 0.85,
});

const woodMaterial = new THREE.MeshStandardMaterial({
  color: 0x7b4f2a,
  roughness: 0.8,
});

const leafMaterial = new THREE.MeshStandardMaterial({
  color: 0x2e9f3f,
  roughness: 0.7,
});

const rockMaterial = new THREE.MeshStandardMaterial({
  color: 0x777777,
  roughness: 1,
});

const goldMaterial = new THREE.MeshStandardMaterial({
  color: 0xffcc33,
  roughness: 0.25,
  metalness: 0.9,
  emissive: 0x553300,
  emissiveIntensity: 0.45,
});

const clothMaterial = new THREE.MeshStandardMaterial({
  color: 0x111111,
  roughness: 0.7,
});

// -----------------------------
// Helper function
// -----------------------------
function makeMesh(
  geometry,
  material,
  position,
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
  mesh.scale.set(scale[0], scale[1], scale[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  return mesh;
}

// -----------------------------
// Main island and ocean
// -----------------------------
makeMesh(new THREE.BoxGeometry(24, 1, 24), sandMaterial, [0, -0.5, 0]);

const ocean = makeMesh(
  new THREE.PlaneGeometry(260, 260, 80, 80),
  waterMaterial,
  [0, -1.05, 0],
  [-Math.PI / 2, 0, 0]
);
ocean.receiveShadow = true;

// -----------------------------
// Dock
// -----------------------------
for (let i = 0; i < 8; i++) {
  makeMesh(
    new THREE.BoxGeometry(1.8, 0.25, 1),
    woodMaterial,
    [-10 + i * 1.8, 0.15, 11.5]
  );
}

for (let i = 0; i < 5; i++) {
  makeMesh(
    new THREE.CylinderGeometry(0.18, 0.22, 2.2, 16),
    woodMaterial,
    [-10 + i * 3.2, 0.35, 10.5]
  );

  makeMesh(
    new THREE.CylinderGeometry(0.18, 0.22, 2.2, 16),
    woodMaterial,
    [-10 + i * 3.2, 0.35, 12.5]
  );
}

// -----------------------------
// Crates
// -----------------------------
const cratePositions = [
  [-6, 0.65, 7],
  [-4.7, 0.65, 7.3],
  [-5.4, 1.85, 7.1],
  [6.5, 0.65, 4],
  [7.7, 0.65, 4.3],
  [7.1, 1.85, 4.2],
];

cratePositions.forEach((pos, index) => {
  makeMesh(
    new THREE.BoxGeometry(1.25, 1.25, 1.25),
    crateMaterial,
    pos,
    [0, index * 0.25, 0]
  );
});

// -----------------------------
// Barrels
// -----------------------------
const barrelPositions = [
  [-8, 0.75, 5],
  [-9.2, 0.75, 5.7],
  [5, 0.75, 8],
  [6.3, 0.75, 8.4],
  [8.5, 0.75, -7],
];

barrelPositions.forEach((pos) => {
  makeMesh(
    new THREE.CylinderGeometry(0.55, 0.55, 1.5, 24),
    woodMaterial,
    pos
  );
});

// -----------------------------
// Palm trees
// -----------------------------
function createPalmTree(x, z, height = 4) {
  makeMesh(
    new THREE.CylinderGeometry(0.35, 0.5, height, 18),
    woodMaterial,
    [x, height / 2, z],
    [0.15, 0, -0.1]
  );

  const leafGroup = new THREE.Group();
  leafGroup.position.set(x, height + 0.25, z);
  scene.add(leafGroup);

  for (let i = 0; i < 8; i++) {
    const leaf = new THREE.Mesh(
      new THREE.ConeGeometry(0.45, 3.6, 8),
      leafMaterial
    );

    leaf.rotation.z = Math.PI / 2;
    leaf.rotation.y = (Math.PI * 2 * i) / 8;
    leaf.position.x = Math.cos(leaf.rotation.y) * 1.2;
    leaf.position.z = Math.sin(leaf.rotation.y) * 1.2;
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    leafGroup.add(leaf);
  }

  const coconutMaterial = new THREE.MeshStandardMaterial({
    color: 0x4b2e1f,
    roughness: 0.9,
  });

  for (let i = 0; i < 3; i++) {
    const coconut = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 16, 16),
      coconutMaterial
    );

    coconut.position.set(
      Math.cos(i * 2.1) * 0.35,
      -0.2,
      Math.sin(i * 2.1) * 0.35
    );

    coconut.castShadow = true;
    leafGroup.add(coconut);
  }

  return { leafGroup };
}

const palm1 = createPalmTree(6, -6, 4.8);
const palm2 = createPalmTree(8.5, -3.5, 3.8);
const palm3 = createPalmTree(-7.5, -6.5, 4.3);

// -----------------------------
// Rocks
// -----------------------------
const rockPositions = [
  [-10, 0.25, -9],
  [-8, 0.25, -10],
  [9, 0.25, -9],
  [10, 0.25, -6],
  [-11, 0.25, 2],
  [11, 0.25, 1],
  [2, 0.25, -10],
  [-2, 0.25, 10],
];

rockPositions.forEach((pos, i) => {
  makeMesh(
    new THREE.SphereGeometry(0.55 + (i % 3) * 0.15, 16, 12),
    rockMaterial,
    pos,
    [0, 0, 0],
    [1.4, 0.55, 1]
  );
});

// -----------------------------
// Treasure chest and floating coins
// -----------------------------
const treasureGroup = new THREE.Group();
treasureGroup.position.set(3, 0.3, -3);
scene.add(treasureGroup);

const chestBase = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 1.3), woodMaterial);
chestBase.position.y = 0.5;
chestBase.castShadow = true;
chestBase.receiveShadow = true;
treasureGroup.add(chestBase);

const chestLid = new THREE.Mesh(
  new THREE.CylinderGeometry(0.68, 0.68, 2.05, 24, 1, false, 0, Math.PI),
  woodMaterial
);
chestLid.rotation.z = Math.PI / 2;
chestLid.position.y = 1.1;
chestLid.castShadow = true;
treasureGroup.add(chestLid);

const chestLock = new THREE.Mesh(
  new THREE.BoxGeometry(0.3, 0.35, 0.1),
  goldMaterial
);
chestLock.position.set(0, 0.65, 0.68);
chestLock.castShadow = true;
treasureGroup.add(chestLock);

const animatedCoins = [];

for (let i = 0; i < 18; i++) {
  const angle = (i / 18) * Math.PI * 2;
  const radius = 0.35 + (i % 3) * 0.23;

  const coin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.18, 0.06, 32),
    goldMaterial
  );

  coin.position.set(
    Math.cos(angle) * radius,
    1.55 + (i % 4) * 0.18,
    Math.sin(angle) * radius
  );

  coin.rotation.x = Math.PI / 2;
  coin.castShadow = true;
  treasureGroup.add(coin);
  animatedCoins.push({
    mesh: coin,
    baseY: coin.position.y,
    angle,
    radius,
  });
}

// -----------------------------
// Pirate flag
// -----------------------------
makeMesh(
  new THREE.CylinderGeometry(0.08, 0.08, 4, 12),
  woodMaterial,
  [-2.5, 2, -7]
);

const flag = makeMesh(
  new THREE.BoxGeometry(1.8, 1, 0.06),
  clothMaterial,
  [-1.55, 3.2, -7]
);

makeMesh(
  new THREE.SphereGeometry(0.22, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff }),
  [-1.6, 3.25, -6.93]
);

// -----------------------------
// Campfire
// -----------------------------
const fireBasePositions = [
  [-1.4, 0.25, 3.5],
  [-0.6, 0.25, 3.5],
  [-1.0, 0.25, 4.1],
  [-1.0, 0.25, 2.9],
];

fireBasePositions.forEach((pos) => {
  makeMesh(new THREE.SphereGeometry(0.35, 14, 10), rockMaterial, pos);
});

const flame = makeMesh(
  new THREE.ConeGeometry(0.45, 1.1, 18),
  new THREE.MeshStandardMaterial({
    color: 0xff6b00,
    emissive: 0xff3b00,
    emissiveIntensity: 1.3,
  }),
  [-1, 0.9, 3.5]
);

const fireLight = new THREE.PointLight(0xff6b00, 2.5, 18);
fireLight.position.set(-1, 1.5, 3.5);
scene.add(fireLight);

// -----------------------------
// GLB model loader
// -----------------------------
const loader = new GLTFLoader();

// Pirate ship
loader.load(
  new URL("../assets/models/pirate_ship.glb", import.meta.url).href,
  (gltf) => {
    const ship = gltf.scene;

    ship.position.set(-11, -0.25, 18);
    ship.rotation.y = Math.PI * 0.9;
    ship.scale.set(1.35, 1.35, 1.35);

    ship.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene.add(ship);
  },
  undefined,
  (error) => {
    console.warn("Could not load pirate_ship.glb. Showing placeholder ship.", error);

    const placeholder = new THREE.Group();
    placeholder.position.set(-11, 0.4, 18);
    placeholder.rotation.y = Math.PI * 0.9;
    scene.add(placeholder);

    const hull = new THREE.Mesh(
      new THREE.BoxGeometry(4, 0.8, 1.5),
      new THREE.MeshStandardMaterial({ color: 0x5a341e })
    );
    hull.castShadow = true;
    placeholder.add(hull);

    const mast = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 3, 12),
      woodMaterial
    );
    mast.position.y = 1.5;
    mast.castShadow = true;
    placeholder.add(mast);

    const sail = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.5, 0.05),
      new THREE.MeshStandardMaterial({ color: 0xf7ead1 })
    );
    sail.position.set(0.7, 1.7, 0);
    sail.castShadow = true;
    placeholder.add(sail);
  }
);

// -----------------------------
// Walking pirate captain
// -----------------------------
const captainRoot = new THREE.Group();
captainRoot.position.set(0.5, 0, 2.5);
scene.add(captainRoot);

const captainModelGroup = new THREE.Group();
captainRoot.add(captainModelGroup);

let captainHeading = Math.PI;
let captainCurrentTarget = 0;

const captainPath = [
  new THREE.Vector3(0.5, 0, 2.5),
  new THREE.Vector3(2.4, 0, 0.5),
  new THREE.Vector3(5.0, 0, -3.4),
  new THREE.Vector3(1.0, 0, -5.5),
  new THREE.Vector3(-3.5, 0, -2.8),
  new THREE.Vector3(-4.8, 0, 3.6),
  new THREE.Vector3(-1.2, 0, 5.2),
];

loader.load(
  new URL("../assets/models/pirate_captain.glb", import.meta.url).href,
  (gltf) => {
    const captain = gltf.scene;

    captain.position.set(0, 0, 0);
    captain.rotation.y = Math.PI;
    captain.scale.set(1.15, 1.15, 1.15);

    captain.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    captainModelGroup.add(captain);
  },
  undefined,
  (error) => {
    console.warn(
      "Could not load pirate_captain.glb. Showing placeholder captain.",
      error
    );

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const skinMaterial = new THREE.MeshStandardMaterial({ color: 0xc68642 });

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.45, 1.4, 16),
      bodyMaterial
    );
    body.position.y = 0.95;
    body.castShadow = true;
    captainModelGroup.add(body);

    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      skinMaterial
    );
    head.position.y = 1.85;
    head.castShadow = true;
    captainModelGroup.add(head);

    const hat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.45, 0.18, 16),
      clothMaterial
    );
    hat.position.y = 2.15;
    hat.castShadow = true;
    captainModelGroup.add(hat);
  }
);

function updateCaptain(deltaTime) {
  const target = captainPath[captainCurrentTarget];
  const toTarget = target.clone().sub(captainRoot.position);
  const distance = toTarget.length();

  if (distance < 0.2) {
    captainCurrentTarget = (captainCurrentTarget + 1) % captainPath.length;
    return;
  }

  const direction = toTarget.normalize();
  const speed = 1.25;

  captainRoot.position.add(direction.multiplyScalar(speed * deltaTime));

  captainHeading = Math.atan2(direction.x, direction.z);
  captainRoot.rotation.y = captainHeading;

  // Small walking bounce
  captainModelGroup.position.y = Math.sin(clock.getElapsedTime() * 8) * 0.04;
}

// -----------------------------
// Pirate's View wow feature
// -----------------------------
const pirateViewButton = document.querySelector("#pirateViewButton");
const orbitViewButton = document.querySelector("#orbitViewButton");
const wowNote = document.querySelector("#wowNote");

let pirateViewActive = false;

function setPirateView() {
  pirateViewActive = true;
  controls.enabled = false;

  wowNote.innerHTML =
    "Wow Feature Activated: You are now following the walking pirate captain from his point of view.";

  updatePirateCamera();
}

function setOrbitView() {
  pirateViewActive = false;
  controls.enabled = true;

  captainModelGroup.visible = true;

  camera.position.copy(orbitCameraPosition);
  controls.target.copy(orbitTarget);
  controls.update();

  wowNote.innerHTML =
    "Wow Feature: Click <strong>Pirate's View</strong> to follow the walking pirate captain from his point of view.";
}

function updatePirateCamera() {
  const captainWorldPosition = new THREE.Vector3();
  captainRoot.getWorldPosition(captainWorldPosition);

  const forward = new THREE.Vector3(
    Math.sin(captainHeading),
    0,
    Math.cos(captainHeading)
  );

  // Hide the model in POV so the camera does not get blocked by the head/hat.
  captainModelGroup.visible = false;

  camera.position.set(
    captainWorldPosition.x + forward.x * 0.45,
    captainWorldPosition.y + 1.75,
    captainWorldPosition.z + forward.z * 0.45
  );

  camera.lookAt(
    camera.position.x + forward.x * 8,
    camera.position.y + 0.15,
    camera.position.z + forward.z * 8
  );
}

pirateViewButton.addEventListener("click", setPirateView);
orbitViewButton.addEventListener("click", setOrbitView);

// -----------------------------
// Animation loop
// -----------------------------
const clock = new THREE.Clock();

function animate() {
  const deltaTime = clock.getDelta();
  const elapsedTime = clock.getElapsedTime();

  updateCaptain(deltaTime);

  if (!pirateViewActive) {
    controls.update();
    captainModelGroup.visible = true;
  } else {
    updatePirateCamera();
  }

  // Animated water texture
  waterTexture.offset.x = elapsedTime * 0.025;
  waterTexture.offset.y = elapsedTime * 0.015;

  // Animated floating coins above treasure chest
  animatedCoins.forEach((coinData, i) => {
    const coin = coinData.mesh;
    const spinSpeed = 1.4 + i * 0.04;
    const orbitSpeed = elapsedTime * 0.55 + coinData.angle;

    coin.position.x = Math.cos(orbitSpeed) * coinData.radius;
    coin.position.z = Math.sin(orbitSpeed) * coinData.radius;
    coin.position.y = coinData.baseY + Math.sin(elapsedTime * 2.2 + i) * 0.12;

    coin.rotation.z = elapsedTime * spinSpeed;
    coin.rotation.y = elapsedTime * spinSpeed * 0.5;
  });

  // Treasure glow
  treasureLight.intensity = 2.4 + Math.sin(elapsedTime * 4) * 0.8;
  fireLight.intensity = 2.0 + Math.sin(elapsedTime * 8) * 0.4;

  // Animated flag waving
  flag.rotation.y = Math.sin(elapsedTime * 3) * 0.18;
  flag.position.y = 3.2 + Math.sin(elapsedTime * 4) * 0.05;

  // Gentle palm movement
  palm1.leafGroup.rotation.y = Math.sin(elapsedTime * 0.7) * 0.08;
  palm2.leafGroup.rotation.y = Math.sin(elapsedTime * 0.8 + 1) * 0.08;
  palm3.leafGroup.rotation.y = Math.sin(elapsedTime * 0.9 + 2) * 0.08;

  // Flickering flame
  flame.scale.y = 1 + Math.sin(elapsedTime * 10) * 0.15;
  flame.rotation.y = elapsedTime * 1.5;

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// -----------------------------
// Resize handling
// -----------------------------
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
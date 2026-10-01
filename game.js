import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const overlay = document.getElementById('overlay');
const startButton = document.getElementById('startButton');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const starsLeftEl = document.getElementById('starsLeft');
const hud = document.getElementById('hud');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bdcff);
scene.fog = new THREE.Fog(0x9bdcff, 18, 55);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 150);
camera.position.set(0, 8, 14);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xfff7d6, 0x3d7a36, 1.3));
const sun = new THREE.DirectionalLight(0xfff0b5, 1.8);
sun.position.set(8, 18, 6);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(
  new THREE.CylinderGeometry(18, 20, 2, 48),
  new THREE.MeshStandardMaterial({ color: 0x86d96c, roughness: 0.95 })
);
ground.position.y = -1;
ground.receiveShadow = true;
scene.add(ground);

const path = new THREE.Mesh(
  new THREE.CylinderGeometry(5.5, 5.8, 0.5, 48),
  new THREE.MeshStandardMaterial({ color: 0xc8c28f, roughness: 0.9 })
);
path.receiveShadow = true;
scene.add(path);

function addTree(x, z, scale = 1) {
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35 * scale, 0.45 * scale, 2.3 * scale, 14),
    new THREE.MeshStandardMaterial({ color: 0x8d5a3d })
  );
  trunk.position.y = 1.15 * scale;
  trunk.castShadow = true;
  tree.add(trunk);
  const leaves = new THREE.Mesh(
    new THREE.SphereGeometry(1.45 * scale, 18, 16),
    new THREE.MeshStandardMaterial({ color: 0x3caa5c })
  );
  leaves.position.y = 2.9 * scale;
  leaves.castShadow = true;
  tree.add(leaves);
  tree.position.set(x, 0, z);
  scene.add(tree);
}

for (let i = 0; i < 18; i += 1) {
  const x = (Math.random() - 0.5) * 26;
  const z = (Math.random() - 0.5) * 26;
  if (Math.abs(x) > 8 || Math.abs(z) > 8) addTree(x, z, 0.7 + Math.random() * 0.8);
}

const player = new THREE.Group();
const body = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 20, 20),
  new THREE.MeshStandardMaterial({ color: 0xffc7a6 })
);
body.position.y = 1.15;
body.castShadow = true;
player.add(body);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.55, 20, 20),
  new THREE.MeshStandardMaterial({ color: 0xffd8b8 })
);
head.position.y = 2.1;
head.castShadow = true;
player.add(head);

const hat = new THREE.Mesh(
  new THREE.ConeGeometry(0.55, 0.8, 16),
  new THREE.MeshStandardMaterial({ color: 0x7d5cff, emissive: 0x4c36d1, emissiveIntensity: 0.2 })
);
hat.position.y = 2.8;
hat.castShadow = true;
player.add(hat);

const cape = new THREE.Mesh(
  new THREE.BoxGeometry(0.9, 1.5, 0.15),
  new THREE.MeshStandardMaterial({ color: 0xff7ab6 })
);
cape.position.set(0, 1.1, 0.7);
cape.rotation.x = 0.2;
player.add(cape);
scene.add(player);

const crystals = [];
const hazards = [];

function addCrystal(x, z) {
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.45),
    new THREE.MeshStandardMaterial({
      color: 0x88f0ff,
      emissive: 0x4bd7ff,
      emissiveIntensity: 1.2,
    })
  );
  crystal.position.set(x, 1.2, z);
  crystal.castShadow = true;
  crystal.userData.phase = Math.random() * Math.PI * 2;
  scene.add(crystal);
  crystals.push(crystal);
}

function addHazard(x, z, radius, speed, phase) {
  const hazard = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 18, 18),
    new THREE.MeshStandardMaterial({ color: 0x3b2d7e, emissive: 0x7b53ff, emissiveIntensity: 0.25 })
  );
  hazard.position.set(x, 1.2, z);
  hazard.castShadow = true;
  hazard.userData = { baseX: x, baseZ: z, radius, speed, phase };
  scene.add(hazard);
  hazards.push(hazard);
}

const crystalPositions = [[-7, -7], [-6, 4], [0, -8], [8, -3], [9, 6], [-10, 8], [5, 10], [-1, 8]];
const hazardPositions = [
  { x: 0, z: -5, radius: 4.5, speed: 1.1, phase: 0.4 },
  { x: -8, z: 0, radius: 5.4, speed: 1.3, phase: 1.2 },
  { x: 8, z: 7, radius: 4.8, speed: 1.5, phase: 2.1 },
];

const game = { running: false, score: 0, timeLeft: 60, totalCrystals: 8 };
const keys = Object.create(null);

window.addEventListener('keydown', (event) => {
  const key = event.key.toLowerCase();
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
    event.preventDefault();
    keys[key] = true;
  }
});
window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});
window.addEventListener('blur', () => {
  Object.keys(keys).forEach((key) => { keys[key] = false; });
});

function updateHud() {
  scoreEl.textContent = String(game.score);
  timeEl.textContent = String(Math.max(0, Math.ceil(game.timeLeft)));
  starsLeftEl.textContent = String(Math.max(0, game.totalCrystals - game.score));
}

function resetWorld() {
  crystals.forEach((crystal) => scene.remove(crystal));
  hazards.forEach((hazard) => scene.remove(hazard));
  crystals.length = 0;
  hazards.length = 0;
  crystalPositions.forEach(([x, z]) => addCrystal(x, z));
  hazardPositions.forEach(({ x, z, radius, speed, phase }) => addHazard(x, z, radius, speed, phase));
  player.position.set(0, 0, 0);
  player.rotation.y = 0;
}

function startGame() {
  game.running = true;
  game.score = 0;
  game.timeLeft = 60;
  resetWorld();
  updateHud();
  overlay.classList.add('hidden');
  hud.classList.remove('hidden');
}

function finishGame(success) {
  game.running = false;
  overlay.querySelector('h1').textContent = success ? '🌟 成功啦！' : '⏰ 时间到啦！';
  overlay.querySelector('p').textContent = success
    ? '你收集到了所有星光水晶！'
    : '再试一次吧，继续探索魔法森林！';
  overlay.querySelector('ul').innerHTML = `<li>分数：${game.score}/${game.totalCrystals}</li><li>使用 WASD 或方向键移动</li>`;
  startButton.textContent = '再玩一次';
  overlay.classList.remove('hidden');
  hud.classList.add('hidden');
}

startButton.addEventListener('click', startGame);

function updateMovement(delta) {
  // 固定的第三人称视角：屏幕上方就是世界的 -Z 方向。
  // 因此 W/↑ 向屏幕上方，S/↓ 向下，A/← 向左，D/→ 向右。
  let x = 0;
  let z = 0;
  if (keys.w || keys.arrowup) z -= 1;
  if (keys.s || keys.arrowdown) z += 1;
  if (keys.a || keys.arrowleft) x -= 1;
  if (keys.d || keys.arrowright) x += 1;
  if (x === 0 && z === 0) return;

  const length = Math.hypot(x, z);
  x /= length;
  z /= length;
  const speed = 8;
  player.position.x = THREE.MathUtils.clamp(player.position.x + x * speed * delta, -11.5, 11.5);
  player.position.z = THREE.MathUtils.clamp(player.position.z + z * speed * delta, -11.5, 11.5);

  // 角色的正面是 -Z，旋转角度与移动方向一致。
  player.rotation.y = Math.atan2(x, -z);
}

function updateCamera() {
  // 不再根据角色旋转移动相机，避免按键方向和相机方向互相干扰。
  const targetX = player.position.x;
  const targetY = 7;
  const targetZ = player.position.z + 12;
  camera.position.x += (targetX - camera.position.x) * 0.12;
  camera.position.y += (targetY - camera.position.y) * 0.12;
  camera.position.z += (targetZ - camera.position.z) * 0.12;
  camera.lookAt(player.position.x, 1.2, player.position.z);
}

function updateObjects(delta, elapsed) {
  crystals.forEach((crystal) => {
    crystal.rotation.y += delta * 2;
    crystal.position.y = 1.2 + Math.sin(elapsed * 2 + crystal.userData.phase) * 0.3;
  });

  hazards.forEach((hazard) => {
    const { baseX, baseZ, radius, speed, phase } = hazard.userData;
    const angle = elapsed * speed + phase;
    hazard.position.x = baseX + Math.cos(angle) * radius;
    hazard.position.z = baseZ + Math.sin(angle * 1.2) * radius * 0.9;
  });

  for (let i = crystals.length - 1; i >= 0; i -= 1) {
    if (crystals[i].position.distanceTo(player.position) < 1.2) {
      scene.remove(crystals[i]);
      crystals.splice(i, 1);
      game.score += 1;
      if (game.score >= game.totalCrystals) finishGame(true);
    }
  }
}

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  if (game.running) {
    game.timeLeft -= delta;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      finishGame(false);
    } else {
      updateMovement(delta);
      updateCamera();
      updateObjects(delta, elapsed);
      updateHud();
    }
  } else {
    camera.position.lerp(new THREE.Vector3(0, 7, 15), 0.04);
    camera.lookAt(0, 1.5, 0);
  }

  renderer.render(scene, camera);
}

updateHud();
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

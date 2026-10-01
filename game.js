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
sun.shadow.mapSize.set(2048, 2048);
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

function material(color, options = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...options });
}

function addPart(group, geometry, partMaterial, position, options = {}) {
  const mesh = new THREE.Mesh(geometry, partMaterial);
  mesh.position.set(...position);
  if (options.rotation) mesh.rotation.set(...options.rotation);
  if (options.scale) mesh.scale.set(...options.scale);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  return mesh;
}

const player = new THREE.Group();
const character = new THREE.Group();
player.add(character);

const skin = material(0xffc7a6);
const skinLight = material(0xffd8b8);
const hair = material(0x4b2a22);
const shirt = material(0x4f83ff);
const shirtLight = material(0x6fa8ff);
const trousers = material(0x1f4faa);
const boot = material(0x5a3d2d);
const capeMaterial = material(0xff5aa5, { emissive: 0xff2d82, emissiveIntensity: 0.15, side: THREE.DoubleSide });
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x24304f, roughness: 0.35 });
const eyeSparkle = new THREE.MeshBasicMaterial({ color: 0xffffff });

const bodyRig = new THREE.Group();
character.add(bodyRig);

const torso = new THREE.Group();
addPart(torso, new THREE.CapsuleGeometry(0.62, 0.8, 8, 20), shirt, [0, 1.5, 0]);
addPart(torso, new THREE.TorusGeometry(0.48, 0.055, 10, 24), shirtLight, [0, 1.6, 0], { rotation: [Math.PI / 2, 0, 0] });
bodyRig.add(torso);

const shoulderLeft = addPart(torso, new THREE.SphereGeometry(0.24, 18, 18), shirt, [-0.62, 1.94, 0]);
const shoulderRight = addPart(torso, new THREE.SphereGeometry(0.24, 18, 18), shirt, [0.62, 1.94, 0]);

const leftArm = new THREE.Group();
const rightArm = new THREE.Group();
leftArm.position.set(-0.78, 1.8, 0);
rightArm.position.set(0.78, 1.8, 0);
addPart(leftArm, new THREE.CapsuleGeometry(0.18, 0.62, 5, 12), shirt, [0, -0.18, 0]);
addPart(rightArm, new THREE.CapsuleGeometry(0.18, 0.62, 5, 12), shirt, [0, -0.18, 0]);
addPart(leftArm, new THREE.SphereGeometry(0.21, 18, 18), skin, [0, -0.66, 0]);
addPart(rightArm, new THREE.SphereGeometry(0.21, 18, 18), skin, [0, -0.66, 0]);
bodyRig.add(leftArm, rightArm);

const hips = new THREE.Group();
addPart(hips, new THREE.BoxGeometry(0.8, 0.42, 0.55), trousers, [0, 0.7, 0], { scale: [1.1, 1, 1] });
bodyRig.add(hips);

const leftLeg = new THREE.Group();
const rightLeg = new THREE.Group();
leftLeg.position.set(-0.28, 0.18, 0);
rightLeg.position.set(0.28, 0.18, 0);
addPart(leftLeg, new THREE.CapsuleGeometry(0.23, 0.7, 8, 14), trousers, [0, 0, 0]);
addPart(rightLeg, new THREE.CapsuleGeometry(0.23, 0.7, 8, 14), trousers, [0, 0, 0]);
addPart(leftLeg, new THREE.SphereGeometry(0.27, 16, 16), boot, [0, -0.8, 0.08], { scale: [1, 0.68, 1.5] });
addPart(rightLeg, new THREE.SphereGeometry(0.27, 16, 16), boot, [0, -0.8, 0.08], { scale: [1, 0.68, 1.5] });
bodyRig.add(leftLeg, rightLeg);

const head = new THREE.Group();
addPart(head, new THREE.SphereGeometry(0.7, 26, 22), skinLight, [0, 2.7, 0]);
addPart(head, new THREE.SphereGeometry(0.64, 18, 16), hair, [0, 3.1, 0.02], { scale: [1, 0.62, 0.95] });
addPart(head, new THREE.SphereGeometry(0.18, 16, 16), hair, [-0.45, 3.0, 0.05]);
addPart(head, new THREE.SphereGeometry(0.18, 16, 16), hair, [0.45, 3.0, 0.05]);
addPart(head, new THREE.SphereGeometry(0.08, 12, 12), eyeMaterial, [-0.2, 2.75, 0.55]);
addPart(head, new THREE.SphereGeometry(0.08, 12, 12), eyeMaterial, [0.2, 2.75, 0.55]);
addPart(head, new THREE.SphereGeometry(0.04, 10, 10), eyeSparkle, [-0.17, 2.8, 0.6]);
addPart(head, new THREE.SphereGeometry(0.04, 10, 10), eyeSparkle, [0.23, 2.8, 0.6]);
addPart(head, new THREE.SphereGeometry(0.09, 8, 8), skin, [0, 2.48, 0.6], { scale: [0.9, 0.8, 0.5] });
addPart(head, new THREE.TorusGeometry(0.18, 0.028, 8, 20, Math.PI), skin, [0, 2.35, 0.58], { rotation: [Math.PI, 0, 0] });
bodyRig.add(head);

const hat = new THREE.Group();
addPart(hat, new THREE.CylinderGeometry(0.7, 0.7, 0.12, 24), material(0x7d5cff, { emissive: 0x4c36d1, emissiveIntensity: 0.2 }), [0, 3.55, 0]);
addPart(hat, new THREE.ConeGeometry(0.56, 0.92, 20), material(0x7d5cff, { emissive: 0x4c36d1, emissiveIntensity: 0.2 }), [0, 4.05, 0]);
bodyRig.add(hat);

const cape = addPart(bodyRig, new THREE.PlaneGeometry(1.3, 1.9, 6, 6), capeMaterial, [0, 1.5, 0.7], { rotation: [0.22, Math.PI, 0] });
cape.userData.baseY = 1.5;

const marker = addPart(character, new THREE.SphereGeometry(0.08, 10, 10), material(0xfff0a8, { emissive: 0xffc400, emissiveIntensity: 0.8 }), [0, 1.5, -0.55]);

player.position.set(0, 0, 0);
scene.add(player);

const crystals = [];
const hazards = [];

function addCrystal(x, z) {
  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.45),
    new THREE.MeshStandardMaterial({ color: 0x88f0ff, emissive: 0x4bd7ff, emissiveIntensity: 1.2 })
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
window.addEventListener('keyup', (event) => { keys[event.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { Object.keys(keys).forEach((key) => { keys[key] = false; }); });

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
  overlay.querySelector('p').textContent = success ? '你收集到了所有星光水晶！' : '再试一次吧，继续探索魔法森林！';
  overlay.querySelector('ul').innerHTML = `<li>分数：${game.score}/${game.totalCrystals}</li><li>使用 WASD 或方向键移动</li>`;
  startButton.textContent = '再玩一次';
  overlay.classList.remove('hidden');
  hud.classList.add('hidden');
}

startButton.addEventListener('click', startGame);

function updateMovement(delta) {
  let x = 0;
  let z = 0;
  if (keys.w || keys.arrowup) z -= 1;
  if (keys.s || keys.arrowdown) z += 1;
  if (keys.a || keys.arrowleft) x -= 1;
  if (keys.d || keys.arrowright) x += 1;
  if (x === 0 && z === 0) return false;

  const length = Math.hypot(x, z);
  x /= length;
  z /= length;
  const speed = 8;
  player.position.x = THREE.MathUtils.clamp(player.position.x + x * speed * delta, -11.5, 11.5);
  player.position.z = THREE.MathUtils.clamp(player.position.z + z * speed * delta, -11.5, 11.5);
  player.rotation.y = Math.atan2(x, -z);
  return true;
}

function updateCamera() {
  const target = new THREE.Vector3(player.position.x, 1.2, player.position.z);
  const desired = new THREE.Vector3(player.position.x, 7, player.position.z + 12);
  camera.position.lerp(desired, 0.12);
  camera.lookAt(target);
}

function animateCharacter(elapsed, moving) {
  const walk = moving ? Math.sin(elapsed * 12) : 0;
  leftLeg.rotation.x = walk * 0.62;
  rightLeg.rotation.x = -walk * 0.62;
  leftArm.rotation.x = -walk * 0.5;
  rightArm.rotation.x = walk * 0.5;
  character.position.y = moving ? Math.abs(Math.sin(elapsed * 12)) * 0.03 : Math.sin(elapsed * 2) * 0.015;
  cape.rotation.x = 0.22 + (moving ? Math.sin(elapsed * 10) * 0.08 : 0);
  hat.rotation.z = Math.sin(elapsed * 2) * 0.05;
  marker.position.y = 1.55 + Math.sin(elapsed * 4) * 0.07;
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
  let moving = false;

  if (game.running) {
    game.timeLeft -= delta;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      finishGame(false);
    } else {
      moving = updateMovement(delta);
      updateCamera();
      updateObjects(delta, elapsed);
      updateHud();
    }
  } else {
    camera.position.lerp(new THREE.Vector3(0, 7, 15), 0.04);
    camera.lookAt(0, 1.5, 0);
  }

  animateCharacter(elapsed, moving);
  renderer.render(scene, camera);
}

updateHud();
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

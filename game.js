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
camera.position.set(0, 7, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.domElement.tabIndex = 0;
renderer.domElement.style.outline = 'none';
renderer.domElement.addEventListener('pointerdown', () => renderer.domElement.focus());
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.HemisphereLight(0xfff7d6, 0x3d7a36, 1.3);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xfff0b5, 1.8);
sunLight.position.set(8, 18, 6);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
sunLight.shadow.camera.near = 0.5;
sunLight.shadow.camera.far = 50;
sunLight.shadow.camera.left = -25;
sunLight.shadow.camera.right = 25;
sunLight.shadow.camera.top = 25;
sunLight.shadow.camera.bottom = -25;
scene.add(sunLight);

const keys = {};

function handleKeyDown(event) {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
    event.preventDefault();
  }
  keys[event.code] = true;
}

function handleKeyUp(event) {
  keys[event.code] = false;
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
window.addEventListener('blur', () => {
  Object.keys(keys).forEach((key) => {
    keys[key] = false;
  });
});

const ground = new THREE.Mesh(
  new THREE.CylinderGeometry(18, 20, 2, 48),
  new THREE.MeshStandardMaterial({
    color: 0x86d96c,
    roughness: 0.95,
    metalness: 0.04,
  })
);
ground.position.set(0, -1, 0);
ground.receiveShadow = true;
scene.add(ground);

const path = new THREE.Mesh(
  new THREE.CylinderGeometry(5.5, 5.8, 0.5, 48),
  new THREE.MeshStandardMaterial({ color: 0xc8c28f, roughness: 0.9 })
);
path.position.set(0, 0, 0);
path.receiveShadow = true;
scene.add(path);

const moonGlow = new THREE.Mesh(
  new THREE.SphereGeometry(1.8, 24, 24),
  new THREE.MeshBasicMaterial({ color: 0xfef7c7, transparent: true, opacity: 0.8 })
);
moonGlow.position.set(12, 16, -16);
scene.add(moonGlow);

function createTree(x, z, scale = 1) {
  const tree = new THREE.Group();

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35 * scale, 0.45 * scale, 2.3 * scale, 14),
    new THREE.MeshStandardMaterial({ color: 0x8d5a3d, roughness: 0.9 })
  );
  trunk.position.y = 1.2 * scale;
  trunk.castShadow = true;
  tree.add(trunk);

  const leavesMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(0.3 + Math.random() * 0.06, 0.7, 0.45),
    roughness: 0.9,
  });

  const leaves1 = new THREE.Mesh(new THREE.SphereGeometry(1.2 * scale, 18, 16), leavesMaterial);
  leaves1.position.set(0, 3 * scale, 0);
  leaves1.castShadow = true;
  tree.add(leaves1);

  const leaves2 = new THREE.Mesh(new THREE.SphereGeometry(1 * scale, 18, 16), leavesMaterial);
  leaves2.position.set(0.8 * scale, 2.5 * scale, 0.5 * scale);
  leaves2.castShadow = true;
  tree.add(leaves2);

  const leaves3 = new THREE.Mesh(new THREE.SphereGeometry(0.9 * scale, 18, 16), leavesMaterial);
  leaves3.position.set(-0.8 * scale, 2.6 * scale, -0.4 * scale);
  leaves3.castShadow = true;
  tree.add(leaves3);

  tree.position.set(x, 0, z);
  scene.add(tree);
}

function createFlower(x, z, hue) {
  const flower = new THREE.Group();

  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, 0.8, 6),
    new THREE.MeshStandardMaterial({ color: 0x4dac4d })
  );
  stem.position.y = 0.4;
  flower.add(stem);

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 10),
    new THREE.MeshStandardMaterial({ color: 0xf9db65, emissive: 0xf9db65, emissiveIntensity: 0.4 })
  );
  center.position.y = 0.85;
  flower.add(center);

  const petalMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color().setHSL(hue, 0.85, 0.65),
    emissive: new THREE.Color().setHSL(hue, 0.7, 0.5),
    emissiveIntensity: 0.25,
  });

  for (let i = 0; i < 6; i += 1) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), petalMaterial);
    petal.position.set(Math.cos((i / 6) * Math.PI * 2) * 0.14, 0.9, Math.sin((i / 6) * Math.PI * 2) * 0.14);
    petal.scale.set(1.8, 0.8, 1.2);
    flower.add(petal);
  }

  flower.position.set(x, 0, z);
  scene.add(flower);
}

function createRock(x, z, scale = 1) {
  const rock = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.7 * scale, 0),
    new THREE.MeshStandardMaterial({ color: 0x8c8d92, roughness: 1 })
  );
  rock.position.set(x, 0.35 * scale, z);
  rock.scale.set(1.1, 0.7, 1.4);
  rock.castShadow = true;
  rock.receiveShadow = true;
  scene.add(rock);
}

function createCloud(x, y, z, scale = 1) {
  const cloud = new THREE.Group();
  const materials = [
    new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.82 }),
    new THREE.MeshStandardMaterial({ color: 0xf8fbff, transparent: true, opacity: 0.8 }),
  ];

  for (let i = 0; i < 5; i += 1) {
    const puff = new THREE.Mesh(
      new THREE.SphereGeometry(1.1 * scale, 20, 18),
      materials[i % 2]
    );
    puff.position.set((i - 2) * 1.2 * scale, i % 2 === 0 ? 0.15 : -0.1, Math.random() * 0.5);
    cloud.add(puff);
  }

  cloud.position.set(x, y, z);
  cloud.userData = { floatOffset: Math.random() * Math.PI * 2, speed: 0.5 + Math.random() * 0.8 };
  scene.add(cloud);
  return cloud;
}

const clouds = [
  createCloud(-12, 9, -10, 1.4),
  createCloud(-2, 12, -14, 1.8),
  createCloud(10, 11, -12, 1.5),
  createCloud(14, 8, -8, 1.1),
];

for (let i = 0; i < 18; i += 1) {
  const x = (Math.random() - 0.5) * 26;
  const z = (Math.random() - 0.5) * 26;
  const treeScale = 0.7 + Math.random() * 0.8;
  if (Math.abs(x) > 8 || Math.abs(z) > 8) {
    createTree(x, z, treeScale);
  }
}

for (let i = 0; i < 35; i += 1) {
  const x = (Math.random() - 0.5) * 24;
  const z = (Math.random() - 0.5) * 24;
  const hue = 0.05 + Math.random() * 0.3;
  createFlower(x, z, hue);
}

for (let i = 0; i < 14; i += 1) {
  const x = (Math.random() - 0.5) * 24;
  const z = (Math.random() - 0.5) * 24;
  createRock(x, z, 0.8 + Math.random() * 1.2);
}

const player = new THREE.Group();
const playerBody = new THREE.Mesh(
  new THREE.SphereGeometry(0.8, 20, 20),
  new THREE.MeshStandardMaterial({ color: 0xffc7a6, roughness: 0.9 })
);
playerBody.position.y = 1.15;
playerBody.castShadow = true;
player.add(playerBody);

const playerHead = new THREE.Mesh(
  new THREE.SphereGeometry(0.55, 20, 20),
  new THREE.MeshStandardMaterial({ color: 0xffd8b8, roughness: 0.9 })
);
playerHead.position.y = 2.1;
playerHead.castShadow = true;
player.add(playerHead);

const hat = new THREE.Mesh(
  new THREE.ConeGeometry(0.55, 0.8, 16),
  new THREE.MeshStandardMaterial({ color: 0x7d5cff, emissive: 0x4c36d1, emissiveIntensity: 0.2 })
);
hat.position.y = 2.8;
hat.rotation.y = Math.PI / 6;
hat.castShadow = true;
player.add(hat);

const cape = new THREE.Mesh(
  new THREE.BoxGeometry(0.9, 1.5, 0.15),
  new THREE.MeshStandardMaterial({ color: 0xff7ab6, emissive: 0xff4d9a, emissiveIntensity: 0.18 })
);
cape.position.set(0, 1.1, -0.7);
cape.rotation.x = -0.2;
player.add(cape);

player.position.set(0, 0, 0);
scene.add(player);

const crystals = [];
const hazards = [];

function createCrystal(x, z) {
  const crystalGroup = new THREE.Group();

  const crystal = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.45, 0),
    new THREE.MeshStandardMaterial({
      color: 0x88f0ff,
      emissive: 0x4bd7ff,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.2,
    })
  );
  crystal.castShadow = true;
  crystalGroup.add(crystal);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.65, 0.08, 12, 30),
    new THREE.MeshStandardMaterial({
      color: 0xfff5a1,
      emissive: 0xffd86c,
      emissiveIntensity: 0.9,
      roughness: 0.5,
    })
  );
  ring.rotation.x = Math.PI / 2;
  crystalGroup.add(ring);

  crystalGroup.position.set(x, 1.2, z);
  crystalGroup.userData = {
    phase: Math.random() * Math.PI * 2,
    baseY: 1.2,
  };

  scene.add(crystalGroup);
  crystals.push(crystalGroup);
}

function createHazard(x, z, radius, speed, phase) {
  const hazardGroup = new THREE.Group();

  const body = new THREE.Mesh(
    new THREE.SphereGeometry(0.85, 18, 18),
    new THREE.MeshStandardMaterial({
      color: 0x3b2d7e,
      emissive: 0x7b53ff,
      emissiveIntensity: 0.25,
      roughness: 0.7,
    })
  );
  body.castShadow = true;
  hazardGroup.add(body);

  const eye1 = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 12, 12),
    new THREE.MeshBasicMaterial({ color: 0xffb5d2 })
  );
  eye1.position.set(-0.23, 0.15, 0.75);
  hazardGroup.add(eye1);

  const eye2 = eye1.clone();
  eye2.position.x = 0.23;
  hazardGroup.add(eye2);

  hazardGroup.position.set(x, 1.2, z);
  hazardGroup.userData = { radius, speed, phase, baseX: x, baseZ: z };
  scene.add(hazardGroup);
  hazards.push(hazardGroup);
}

const game = {
  running: false,
  score: 0,
  totalCrystals: 8,
  timeLeft: 60,
};

function updateHud() {
  scoreEl.textContent = String(game.score);
  timeEl.textContent = String(Math.max(0, Math.ceil(game.timeLeft)));
  starsLeftEl.textContent = String(Math.max(0, game.totalCrystals - game.score));
}

function resetWorld() {
  for (let i = crystals.length - 1; i >= 0; i -= 1) {
    scene.remove(crystals[i]);
  }
  crystals.length = 0;

  for (let i = hazards.length - 1; i >= 0; i -= 1) {
    scene.remove(hazards[i]);
  }
  hazards.length = 0;

  const crystalPositions = [
    [-7, -7], [-6, 4], [0, -8], [8, -3], [9, 6], [-10, 8], [5, 10], [-1, 8],
  ];

  crystalPositions.forEach(([x, z], index) => {
    createCrystal(x, z + (index % 2 === 0 ? 0.1 : -0.1));
  });

  const hazardPositions = [
    { x: 0, z: -5, radius: 4.5, speed: 1.1, phase: 0.4 },
    { x: -8, z: 0, radius: 5.4, speed: 1.3, phase: 1.2 },
    { x: 8, z: 7, radius: 4.8, speed: 1.5, phase: 2.1 },
  ];

  hazardPositions.forEach(({ x, z, radius, speed, phase }) => createHazard(x, z, radius, speed, phase));

  player.position.set(0, 0, 0);
  player.rotation.y = 0;
  player.scale.set(1, 1, 1);
}

function startGame() {
  game.running = true;
  game.score = 0;
  game.timeLeft = 60;
  resetWorld();
  updateHud();
  overlay.classList.add('hidden');
  hud.classList.remove('hidden');
  renderer.domElement.focus();
}

function finishGame(success) {
  game.running = false;

  const title = success ? '🌟 成功啦！' : '⏰ 时间到啦！';
  const message = success
    ? '你帮助小勇者收集到了所有闪亮的星光水晶，魔法森林真的很开心！'
    : '再试一次吧！让我们继续一起在魔法森林中冒险。';

  overlay.querySelector('h1').textContent = title;
  overlay.querySelector('p').textContent = message;
  overlay.querySelector('ul').innerHTML = `
    <li>分数：${game.score}/${game.totalCrystals}</li>
    <li>按键：WASD / 方向键</li>
    <li>再来一局：点击下方按钮</li>
  `;
  startButton.textContent = '再玩一次';
  overlay.classList.remove('hidden');
  hud.classList.add('hidden');
}

startButton.addEventListener('click', () => {
  overlay.querySelector('h1').textContent = '魔法森林探险';
  overlay.querySelector('p').textContent = '帮助小勇者收集闪亮的星光水晶，避开偷偷偷走光芒的小影子怪兽！';
  overlay.querySelector('ul').innerHTML = `
    <li>使用 ↑ ↓ ← → 或 WASD 移动</li>
    <li>收集 8 个水晶即可过关</li>
    <li>在 60 秒内完成任务</li>
  `;
  startButton.textContent = '开始冒险';
  startGame();
});

function updatePlayer(delta) {
  const speed = 8.0;
  let moved = false;

  // 按键检测和移动（直接在世界坐标系中移动）
  if (keys.KeyW || keys.ArrowUp) {
    player.position.z -= speed * delta;
    moved = true;
  }
  if (keys.KeyS || keys.ArrowDown) {
    player.position.z += speed * delta;
    moved = true;
  }
  if (keys.KeyA || keys.ArrowLeft) {
    player.position.x -= speed * delta;
    moved = true;
  }
  if (keys.KeyD || keys.ArrowRight) {
    player.position.x += speed * delta;
    moved = true;
  }

  // 边界限制
  player.position.x = THREE.MathUtils.clamp(player.position.x, -11.5, 11.5);
  player.position.z = THREE.MathUtils.clamp(player.position.z, -11.5, 11.5);

  // 更新方向朝向
  if (keys.KeyW || keys.ArrowUp) {
    player.rotation.y = 0;
  } else if (keys.KeyS || keys.ArrowDown) {
    player.rotation.y = Math.PI;
  } else if (keys.KeyA || keys.ArrowLeft) {
    player.rotation.y = Math.PI / 2;
  } else if (keys.KeyD || keys.ArrowRight) {
    player.rotation.y = -Math.PI / 2;
  }
}

function updateCrystals(delta, elapsed) {
  for (let i = crystals.length - 1; i >= 0; i -= 1) {
    const crystal = crystals[i];
    const dist = crystal.position.distanceTo(player.position);
    crystal.rotation.y += delta * 2.2;
    crystal.position.y = crystal.userData.baseY + Math.sin(elapsed * 2.1 + crystal.userData.phase) * 0.35;

    if (dist < 1.2) {
      scene.remove(crystal);
      crystals.splice(i, 1);
      game.score += 1;
      updateHud();
      if (game.score >= game.totalCrystals) {
        finishGame(true);
      }
    }
  }
}

function updateHazards(elapsed) {
  hazards.forEach((hazard) => {
    const { radius, speed, phase, baseX, baseZ } = hazard.userData;
    const angle = elapsed * speed + phase;
    hazard.position.x = baseX + Math.cos(angle) * radius;
    hazard.position.z = baseZ + Math.sin(angle * 1.2) * radius * 0.9;
    hazard.rotation.y += 0.03;

    if (hazard.position.distanceTo(player.position) < 1.3) {
      game.score = Math.max(0, game.score - 1);
      updateHud();
      player.position.add(new THREE.Vector3((Math.random() - 0.5) * 2, 0, (Math.random() - 0.5) * 2));
    }
  });
}

function updateCamera() {
  const backOffset = new THREE.Vector3(-Math.sin(player.rotation.y) * 7, 5.7, -Math.cos(player.rotation.y) * 7);
  const cameraTarget = new THREE.Vector3(player.position.x, 1.2, player.position.z);
  const desiredCameraPos = cameraTarget.clone().add(backOffset);
  camera.position.lerp(desiredCameraPos, 0.08);
  camera.lookAt(cameraTarget);
}

function updateClouds(elapsed) {
  clouds.forEach((cloud, index) => {
    cloud.position.x += Math.sin(elapsed * 0.25 + index) * 0.003;
    cloud.position.y += Math.sin(elapsed * 0.8 + cloud.userData.floatOffset) * 0.02;
  });
}

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;

  updateClouds(elapsed);

  if (game.running) {
    game.timeLeft -= delta;
    if (game.timeLeft <= 0) {
      game.timeLeft = 0;
      updateHud();
      finishGame(false);
      return;
    }

    updatePlayer(delta);
    updateCamera();
    updateCrystals(delta, elapsed);
    updateHazards(elapsed);
    updateHud();
  } else {
    const idleMood = Math.sin(elapsed * 0.8) * 0.2;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, 0, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 7 + idleMood, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, 15, 0.05);
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

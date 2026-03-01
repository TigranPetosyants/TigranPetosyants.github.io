import * as THREE from 'three';
interface AsteroidData {
  group: THREE.Group;
  rockMesh: THREE.Mesh;
  debris: THREE.Mesh[];
  basePosition: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  projectIndex: number;
}

interface ProjectEntry {
  readonly title: string;
  readonly description: string;
  readonly tech: readonly string[];
  readonly link: string;
  readonly image?: string;
}

const SHOW_START = 7;
const OPAQUE_START = 3;
const OPAQUE_END = -1;
const HIDE_END = -2.5;
let zoneEnter = -31;
let zoneExit = -63;

export const BASE_POSITIONS: [number, number, number][] = [
  [-0.9, 0.3, -34],
  [1.5, -0.5, -44],
  [-1.2, 0.8, -54],
  [1.8, -0.2, -64],
];

const TEXTURE_SETS = [
  {
    diff: '/textures/asteroids/rock_boulder_dry_diff_1k.jpg',
    normal: '/textures/asteroids/rock_boulder_dry_nor_gl_1k.jpg',
    rough: '/textures/asteroids/rock_boulder_dry_rough_1k.jpg',
  },
  {
    diff: '/textures/asteroids/rock_06_diff_1k.jpg',
    normal: '/textures/asteroids/rock_06_nor_gl_1k.jpg',
    rough: '/textures/asteroids/rock_06_rough_1k.jpg',
  },
  {
    diff: '/textures/asteroids/rock_face_03_diff_1k.jpg',
    normal: '/textures/asteroids/rock_face_03_nor_gl_1k.jpg',
    rough: '/textures/asteroids/rock_face_03_rough_1k.jpg',
  },
  {
    diff: '/textures/asteroids/rock_boulder_cracked_diff_1k.jpg',
    normal: '/textures/asteroids/rock_boulder_cracked_nor_gl_1k.jpg',
    rough: '/textures/asteroids/rock_boulder_cracked_rough_1k.jpg',
  },
];

const ASTEROID_CONFIGS = [
  {
    radius: 0.4,
    segments: 128,
    emissive: 0x3a2a15,
    displaceAmount: 0.035,
    noiseScale: 3.5,
    noiseSeed: 0,
    debrisCount: 4,
    stretch: new THREE.Vector3(1.0, 0.85, 0.95),
    debrisColor: 0x8a7d6b,
  },
  {
    radius: 0.32,
    segments: 96,
    emissive: 0x201815,
    displaceAmount: 0.025,
    noiseScale: 4.0,
    noiseSeed: 42,
    debrisCount: 3,
    stretch: new THREE.Vector3(0.9, 1.0, 1.1),
    debrisColor: 0x6b6055,
  },
  {
    radius: 0.38,
    segments: 128,
    emissive: 0x2a2520,
    displaceAmount: 0.04,
    noiseScale: 3.0,
    noiseSeed: 137,
    debrisCount: 5,
    stretch: new THREE.Vector3(1.1, 0.9, 0.85),
    debrisColor: 0x7a7068,
  },
  {
    radius: 0.3,
    segments: 96,
    emissive: 0x352a1a,
    displaceAmount: 0.03,
    noiseScale: 3.8,
    noiseSeed: 271,
    debrisCount: 3,
    stretch: new THREE.Vector3(0.85, 1.1, 1.0),
    debrisColor: 0x9a8d7a,
  },
];

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function fbmNoise(x: number, y: number, z: number, seed: number): number {
  const p = (a: number, b: number, c: number) => {
    const n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + seed) * 43758.5453;
    return n - Math.floor(n);
  };

  let value = 0;
  let amp = 1.0;
  let freq = 1.0;
  for (let i = 0; i < 4; i++) {
    const ix = Math.floor(x * freq);
    const iy = Math.floor(y * freq);
    const iz = Math.floor(z * freq);
    const fx = x * freq - ix;
    const fy = y * freq - iy;
    const fz = z * freq - iz;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const sz = fz * fz * (3 - 2 * fz);

    const n000 = p(ix, iy, iz);
    const n100 = p(ix + 1, iy, iz);
    const n010 = p(ix, iy + 1, iz);
    const n110 = p(ix + 1, iy + 1, iz);
    const n001 = p(ix, iy, iz + 1);
    const n101 = p(ix + 1, iy, iz + 1);
    const n011 = p(ix, iy + 1, iz + 1);
    const n111 = p(ix + 1, iy + 1, iz + 1);

    const nx00 = n000 + sx * (n100 - n000);
    const nx10 = n010 + sx * (n110 - n010);
    const nx01 = n001 + sx * (n101 - n001);
    const nx11 = n011 + sx * (n111 - n011);
    const nxy0 = nx00 + sy * (nx10 - nx00);
    const nxy1 = nx01 + sy * (nx11 - nx01);
    const nxyz = nxy0 + sz * (nxy1 - nxy0);

    value += nxyz * amp;
    amp *= 0.5;
    freq *= 2.0;
  }
  return value;
}

const loadedTextures: THREE.Texture[] = [];

function displaceAsteroid(
  geo: THREE.BufferGeometry,
  config: typeof ASTEROID_CONFIGS[0]
): void {
  const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;

  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);

    const len = Math.sqrt(x * x + y * y + z * z);
    if (len === 0) continue;
    const nx = x / len;
    const ny = y / len;
    const nz = z / len;

    const n1 = fbmNoise(nx * config.noiseScale, ny * config.noiseScale, nz * config.noiseScale, config.noiseSeed);
    const n2 = fbmNoise(nx * config.noiseScale * 2, ny * config.noiseScale * 2, nz * config.noiseScale * 2, config.noiseSeed + 100);

    const displacement = (n1 - 0.5) * config.displaceAmount + (n2 - 0.5) * config.displaceAmount * 0.3;

    const newLen = len + displacement;
    posAttr.setXYZ(
      i,
      nx * newLen * config.stretch.x,
      ny * newLen * config.stretch.y,
      nz * newLen * config.stretch.z
    );
  }

  posAttr.needsUpdate = true;
  geo.computeVertexNormals();
}

function createDebris(
  group: THREE.Group,
  config: typeof ASTEROID_CONFIGS[0],
  rng: () => number
): THREE.Mesh[] {
  const debris: THREE.Mesh[] = [];
  for (let d = 0; d < config.debrisCount; d++) {
    const size = 0.02 + rng() * 0.04;
    const dGeo = new THREE.IcosahedronGeometry(size, 2);
    const pAttr = dGeo.getAttribute('position') as THREE.BufferAttribute;
    for (let v = 0; v < pAttr.count; v++) {
      pAttr.setXYZ(v,
        pAttr.getX(v) * (0.6 + rng() * 0.8),
        pAttr.getY(v) * (0.6 + rng() * 0.8),
        pAttr.getZ(v) * (0.6 + rng() * 0.8)
      );
    }
    pAttr.needsUpdate = true;
    dGeo.computeVertexNormals();

    const dMat = new THREE.MeshPhysicalMaterial({
      color: config.debrisColor,
      roughness: 0.95,
      metalness: 0.02,
      emissive: config.emissive,
      emissiveIntensity: 0.05,
    });

    const dMesh = new THREE.Mesh(dGeo, dMat);
    const orbitRadius = config.radius + 0.15 + rng() * 0.25;
    const angle = rng() * Math.PI * 2;
    const tilt = (rng() - 0.5) * 1.2;
    dMesh.position.set(
      Math.cos(angle) * orbitRadius,
      Math.sin(tilt) * orbitRadius * 0.5,
      Math.sin(angle) * orbitRadius
    );
    dMesh.rotation.set(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI);
    group.add(dMesh);
    debris.push(dMesh);
  }
  return debris;
}

let asteroids: AsteroidData[] = [];
let sceneRef: THREE.Scene | null = null;
let panels: HTMLElement[] = [];
let connectorLines: SVGLineElement[] = [];
let connectorDots: SVGCircleElement[] = [];
let sectionActive = false;

export function setAsteroidsActive(active: boolean): void {
  sectionActive = active;
}

export function createAsteroids(
  scene: THREE.Scene,
  projects: readonly ProjectEntry[],
  isMobile: boolean
): void {
  sceneRef = scene;

  const panelElements = document.querySelectorAll<HTMLElement>('[data-project-panel]');
  panelElements.forEach(p => panels.push(p));

  const lineElements = document.querySelectorAll<SVGLineElement>('[data-connector]');
  lineElements.forEach(l => connectorLines.push(l));

  const dotElements = document.querySelectorAll<SVGCircleElement>('[data-connector-dot]');
  dotElements.forEach(d => connectorDots.push(d));

  const count = Math.min(projects.length, BASE_POSITIONS.length);

  for (let pi = 0; pi < count; pi++) {
    const basePos = BASE_POSITIONS[pi];
    const config = ASTEROID_CONFIGS[pi];
    const rng = seededRandom(config.noiseSeed + pi * 1000);

    const group = new THREE.Group();
    const xScale = isMobile ? 0.3 : 1;
    group.position.set(basePos[0] * xScale, basePos[1] * 0.8, basePos[2]);

    const segs = isMobile ? Math.round(config.segments * 0.5) : config.segments;
    const rockGeo = new THREE.SphereGeometry(config.radius, segs, Math.round(segs * 0.6));
    displaceAsteroid(rockGeo, config);

    const texLoader = new THREE.TextureLoader();
    const texSet = TEXTURE_SETS[pi % TEXTURE_SETS.length];

    const diffMap = texLoader.load(texSet.diff);
    const normalMap = texLoader.load(texSet.normal);
    const roughMap = texLoader.load(texSet.rough);
    [diffMap, normalMap, roughMap].forEach(t => {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
      loadedTextures.push(t);
    });

    const rockMat = new THREE.MeshStandardMaterial({
      map: diffMap,
      roughnessMap: roughMap,
      roughness: 1.0,
      metalness: 0.02,
      emissive: config.emissive,
      emissiveIntensity: 0.06,
      normalMap,
      normalScale: new THREE.Vector2(1.5, 1.5),
      flatShading: false,
    });
    const rockMesh = new THREE.Mesh(rockGeo, rockMat);
    group.add(rockMesh);

    const mobileConfig = isMobile ? { ...config, debrisCount: Math.min(config.debrisCount, 2) } : config;
    const debris = createDebris(group, mobileConfig, rng);

    const rotSpeed = new THREE.Vector3(
      (rng() - 0.5) * 0.004,
      (rng() - 0.5) * 0.006,
      (rng() - 0.5) * 0.003
    );

    scene.add(group);

    asteroids.push({
      group,
      rockMesh,
      debris,
      basePosition: group.position.clone(),
      rotationSpeed: rotSpeed,
      projectIndex: pi,
    });
  }
}

export function updateAsteroids(
  elapsed: number,
  cameraZ: number,
  _mouseNorm: THREE.Vector2,
  camera: THREE.Camera
): void {
  if (asteroids.length === 0) return;

  for (let i = 0; i < asteroids.length; i++) {
    const asteroid = asteroids[i];
    const { group, basePosition, rotationSpeed, debris } = asteroid;

    const dist = Math.abs(basePosition.z - cameraZ);
    group.visible = sectionActive && dist < 15;

    if (!group.visible) {
      if (panels[i]) {
        panels[i].style.opacity = '0';
        panels[i].style.pointerEvents = 'none';
      }
      if (connectorLines[i]) connectorLines[i].style.opacity = '0';
      if (connectorDots[i]) connectorDots[i].style.opacity = '0';
      continue;
    }

    group.rotation.x += rotationSpeed.x;
    group.rotation.y += rotationSpeed.y;
    group.rotation.z += rotationSpeed.z;

    if (group.visible) {
      for (let d = 0; d < debris.length; d++) {
        const dm = debris[d];
        const angle = elapsed * (0.15 + d * 0.05) + d * 2.09;
        const orbitR = dm.position.length();
        const tiltY = dm.position.y;
        dm.position.x = Math.cos(angle) * orbitR;
        dm.position.z = Math.sin(angle) * orbitR;
        dm.position.y = tiltY + Math.sin(elapsed * 0.3 + d) * 0.02;
        dm.rotation.x += 0.01;
        dm.rotation.y += 0.015;
      }
    }

    if (panels[i]) {
      const diff = cameraZ - basePosition.z;
      let opacity: number;
      if (diff > SHOW_START || diff < HIDE_END) {
        opacity = 0;
      } else if (diff > OPAQUE_START) {
        opacity = 1 - (diff - OPAQUE_START) / (SHOW_START - OPAQUE_START);
      } else if (diff < OPAQUE_END) {
        opacity = (diff - HIDE_END) / (OPAQUE_END - HIDE_END);
      } else {
        opacity = 1;
      }
      if (cameraZ > zoneEnter || cameraZ < zoneExit) opacity = 0;
      panels[i].style.opacity = String(opacity);
      panels[i].style.pointerEvents = opacity > 0.3 ? 'auto' : 'none';
      const slideY = (1 - opacity) * 20;
      const isMobileView = window.innerWidth < 768;
      if (isMobileView) {
        panels[i].style.transform = `translateX(-50%) translateY(-50%) translateY(${slideY}px)`;
      } else {
        panels[i].style.transform = `translateY(-50%) translateY(${slideY}px)`;
      }

      if (opacity > 0.01 && connectorLines[i] && group.visible) {
        const projected = basePosition.clone().project(camera as THREE.PerspectiveCamera);
        if (projected.z < 1) {
          const sx = (projected.x * 0.5 + 0.5) * window.innerWidth;
          const sy = (-projected.y * 0.5 + 0.5) * window.innerHeight;

          const rect = panels[i].getBoundingClientRect();
          const px = Math.max(rect.left, Math.min(sx, rect.right));
          const py = Math.max(rect.top, Math.min(sy, rect.bottom));

          connectorLines[i].setAttribute('x1', String(sx));
          connectorLines[i].setAttribute('y1', String(sy));
          connectorLines[i].setAttribute('x2', String(px));
          connectorLines[i].setAttribute('y2', String(py));
          connectorLines[i].style.opacity = String(opacity * 0.5);

          if (connectorDots[i]) {
            connectorDots[i].setAttribute('cx', String(sx));
            connectorDots[i].setAttribute('cy', String(sy));
            connectorDots[i].style.opacity = String(opacity * 0.6);
          }
        }
      } else {
        if (connectorLines[i]) connectorLines[i].style.opacity = '0';
        if (connectorDots[i]) connectorDots[i].style.opacity = '0';
      }
    }
  }

}

export function repositionAsteroids(cameraStartZ: number, cameraEndZ: number): void {
  if (asteroids.length === 0) return;

  const count = asteroids.length;
  const zoneMarginStart = 7;
  const zoneMarginEnd = 5;
  zoneEnter = cameraStartZ - zoneMarginStart;
  zoneExit = cameraEndZ + zoneMarginEnd;

  const paddingStart = 2;
  const paddingEnd = 2;
  const firstZ = zoneEnter - SHOW_START + paddingStart;
  const lastZ = zoneExit - HIDE_END - paddingEnd;

  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    const newZ = firstZ + (lastZ - firstZ) * t;
    asteroids[i].group.position.z = newZ;
    asteroids[i].basePosition.z = newZ;
  }
}

export function disposeAsteroids(): void {
  asteroids.forEach(asteroid => {
    asteroid.rockMesh.geometry.dispose();
    (asteroid.rockMesh.material as THREE.Material).dispose();
    asteroid.debris.forEach(d => {
      d.geometry.dispose();
      (d.material as THREE.Material).dispose();
    });
    if (sceneRef) sceneRef.remove(asteroid.group);
  });
  loadedTextures.forEach(t => t.dispose());
  loadedTextures.length = 0;
  asteroids = [];
  panels = [];
  connectorLines = [];
  connectorDots = [];
  sceneRef = null;
  zoneEnter = -31;
  zoneExit = -63;
}

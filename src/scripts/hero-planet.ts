import * as THREE from 'three';

const RADIUS = 0.55;
const CLOUD_RADIUS = RADIUS + 0.008;
const SPLIT_DISTANCE = 1.2;
const CURSOR_POWER = 1.8;
const PLATE_COUNT = 32;

function generatePlateDirs(n: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (2 * i) / (n - 1);
    const r = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push(new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r));
  }
  return points;
}

const PLATE_DIRS = generatePlateDirs(PLATE_COUNT);

const coreVertexShader = `
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewDir;
void main() {
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPos.xyz);
  gl_Position = projectionMatrix * mvPos;
}`;

const coreFragmentShader = `
uniform float uTime;
varying vec3 vPosition;
varying vec3 vNormal;
varying vec3 vViewDir;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
        mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
    mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
        mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y),
    f.z
  );
}

float fbm(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

void main() {
  float n = fbm(vPosition * 5.0 + uTime * 0.15);
  n += 0.5 * fbm(vPosition * 10.0 - uTime * 0.1);
  n *= 0.67;

  vec3 hot = vec3(1.0, 0.95, 0.4);
  vec3 warm = vec3(1.0, 0.45, 0.0);
  vec3 cool = vec3(0.7, 0.08, 0.0);

  vec3 color = mix(cool, warm, smoothstep(0.25, 0.45, n));
  color = mix(color, hot, smoothstep(0.55, 0.75, n));

  float fresnel = pow(1.0 - max(dot(vViewDir, vNormal), 0.0), 2.0);
  color += vec3(1.0, 0.3, 0.0) * fresnel * 0.6;

  gl_FragColor = vec4(color, 1.0);
}`;

interface PlanetSection {
  mesh: THREE.Mesh;
  cloudMesh: THREE.Mesh;
  direction: THREE.Vector3;
  currentOffset: number;
}

let planetGroup: THREE.Group | null = null;
let sectionsGroup: THREE.Group | null = null;
let sceneRef: THREE.Scene | null = null;
let sections: PlanetSection[] = [];
let outerCoreMesh: THREE.Mesh | null = null;
let innerCoreMesh: THREE.Mesh | null = null;
let coreLight: THREE.PointLight | null = null;
let backingMesh: THREE.Mesh | null = null;
let earthTexture: THREE.Texture | null = null;
let cloudTexture: THREE.Texture | null = null;
let coreMaterial: THREE.ShaderMaterial | null = null;

const mouseTarget = { x: 0, y: 0 };
const _cursorDir = new THREE.Vector3();
const _inverseQuat = new THREE.Quaternion();
const _projected = new THREE.Vector3();

function buildPlates(sourceGeo: THREE.BufferGeometry): Map<number, { positions: number[]; normals: number[]; uvs: number[] }> {
  const posAttr = sourceGeo.getAttribute('position') as THREE.BufferAttribute;
  const normAttr = sourceGeo.getAttribute('normal') as THREE.BufferAttribute;
  const uvAttr = sourceGeo.getAttribute('uv') as THREE.BufferAttribute;
  const index = sourceGeo.getIndex();

  const groups = new Map<number, { positions: number[]; normals: number[]; uvs: number[] }>();
  for (let i = 0; i < PLATE_DIRS.length; i++) {
    groups.set(i, { positions: [], normals: [], uvs: [] });
  }

  const faceCount = index ? index.count / 3 : posAttr.count / 3;

  for (let f = 0; f < faceCount; f++) {
    const i0 = index ? index.getX(f * 3) : f * 3;
    const i1 = index ? index.getX(f * 3 + 1) : f * 3 + 1;
    const i2 = index ? index.getX(f * 3 + 2) : f * 3 + 2;

    const cx = (posAttr.getX(i0) + posAttr.getX(i1) + posAttr.getX(i2)) / 3;
    const cy = (posAttr.getY(i0) + posAttr.getY(i1) + posAttr.getY(i2)) / 3;
    const cz = (posAttr.getZ(i0) + posAttr.getZ(i1) + posAttr.getZ(i2)) / 3;
    const centroid = new THREE.Vector3(cx, cy, cz).normalize();

    let bestIdx = 0;
    let bestDot = -Infinity;
    for (let d = 0; d < PLATE_DIRS.length; d++) {
      const dot = centroid.dot(PLATE_DIRS[d]);
      if (dot > bestDot) {
        bestDot = dot;
        bestIdx = d;
      }
    }

    const group = groups.get(bestIdx)!;
    for (const idx of [i0, i1, i2]) {
      group.positions.push(posAttr.getX(idx), posAttr.getY(idx), posAttr.getZ(idx));
      group.normals.push(normAttr.getX(idx), normAttr.getY(idx), normAttr.getZ(idx));
      group.uvs.push(uvAttr.getX(idx), uvAttr.getY(idx));
    }
  }

  return groups;
}

export function createPlanet(scene: THREE.Scene, isMobile: boolean): void {
  sceneRef = scene;
  sections = [];

  planetGroup = new THREE.Group();
  planetGroup.position.set(isMobile ? 0.6 : 1.8, -0.2, 0);

  sectionsGroup = new THREE.Group();
  planetGroup.add(sectionsGroup);

  const textureLoader = new THREE.TextureLoader();
  earthTexture = textureLoader.load('/textures/earth-diffuse.jpg');
  cloudTexture = textureLoader.load('/textures/earth-clouds.jpg');

  const detail = isMobile ? 32 : 64;

  const earthGeo = new THREE.SphereGeometry(RADIUS, detail, detail);
  const earthPlates = buildPlates(earthGeo);
  earthGeo.dispose();

  const cloudGeo = new THREE.SphereGeometry(CLOUD_RADIUS, detail, detail);
  const cloudPlates = buildPlates(cloudGeo);
  cloudGeo.dispose();

  earthPlates.forEach((data, idx) => {
    if (data.positions.length === 0) return;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(data.positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(data.normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(data.uvs, 2));

    const mat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.05,
    });

    const mesh = new THREE.Mesh(geo, mat);
    sectionsGroup!.add(mesh);

    const cData = cloudPlates.get(idx)!;
    const cGeo = new THREE.BufferGeometry();
    cGeo.setAttribute('position', new THREE.Float32BufferAttribute(cData.positions, 3));
    cGeo.setAttribute('normal', new THREE.Float32BufferAttribute(cData.normals, 3));
    cGeo.setAttribute('uv', new THREE.Float32BufferAttribute(cData.uvs, 2));

    const cMat = new THREE.MeshStandardMaterial({
      map: cloudTexture,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });

    const cloudMesh = new THREE.Mesh(cGeo, cMat);
    sectionsGroup!.add(cloudMesh);

    sections.push({ mesh, cloudMesh, direction: PLATE_DIRS[idx].clone(), currentOffset: 0 });
  });

  const backingGeo = new THREE.SphereGeometry(RADIUS - 0.004, 48, 48);
  const backingMat = new THREE.MeshBasicMaterial({ color: 0x0a1828, transparent: true, opacity: 1 });
  backingMesh = new THREE.Mesh(backingGeo, backingMat);
  sectionsGroup.add(backingMesh);

  const outerCoreGeo = new THREE.SphereGeometry(RADIUS * 0.5, 48, 48);
  coreMaterial = new THREE.ShaderMaterial({
    vertexShader: coreVertexShader,
    fragmentShader: coreFragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
  });
  outerCoreMesh = new THREE.Mesh(outerCoreGeo, coreMaterial);
  planetGroup.add(outerCoreMesh);

  const innerCoreGeo = new THREE.SphereGeometry(RADIUS * 0.2, 24, 24);
  const innerCoreMat = new THREE.MeshBasicMaterial({ color: 0xffdd44 });
  innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMat);
  planetGroup.add(innerCoreMesh);

  coreLight = new THREE.PointLight(0xff4400, 0, 3);
  coreLight.position.set(0, 0, 0);
  planetGroup.add(coreLight);

  scene.add(planetGroup);
}

export function setMouseTarget(mx: number, my: number): void {
  mouseTarget.x = mx;
  mouseTarget.y = my;
}

export function updatePlanet(elapsed: number, cameraZ: number, camera: THREE.PerspectiveCamera): void {
  if (!planetGroup || !sectionsGroup) return;

  if (cameraZ < -2) {
    planetGroup.visible = false;
    return;
  }

  planetGroup.visible = true;

  sectionsGroup.rotation.y = elapsed * 0.08;

  _projected.copy(planetGroup.position).project(camera);
  const dx = mouseTarget.x - _projected.x;
  const dy = mouseTarget.y - _projected.y;
  const screenDist = Math.sqrt(dx * dx + dy * dy);

  const influence = Math.max(0, 1 - screenDist / 0.5);

  _cursorDir.set(dx, -dy, 0.3).normalize();
  _inverseQuat.setFromEuler(sectionsGroup.rotation).invert();
  _cursorDir.applyQuaternion(_inverseQuat);

  let maxOffset = 0;
  for (const section of sections) {
    const proximity = Math.max(0, section.direction.dot(_cursorDir));
    const targetOffset = Math.pow(proximity, CURSOR_POWER) * SPLIT_DISTANCE * influence;
    const speed = targetOffset > section.currentOffset ? 0.1 : 0.03;
    section.currentOffset += (targetOffset - section.currentOffset) * speed;
    section.mesh.position.copy(section.direction).multiplyScalar(section.currentOffset);
    section.cloudMesh.position.copy(section.mesh.position);
    maxOffset = Math.max(maxOffset, section.currentOffset);
  }

  const coreVisibility = Math.min(1, maxOffset / (SPLIT_DISTANCE * 0.15));
  if (backingMesh) {
    (backingMesh.material as THREE.MeshBasicMaterial).opacity = 1 - coreVisibility;
  }
  if (coreLight) {
    coreLight.intensity = coreVisibility * 3;
  }

  if (coreMaterial) {
    coreMaterial.uniforms.uTime.value = elapsed;
  }

  if (outerCoreMesh) {
    outerCoreMesh.rotation.y = elapsed * 0.2;
  }

  if (innerCoreMesh) {
    innerCoreMesh.rotation.y = -elapsed * 0.15;
  }
}

export function setPlanetOpacity(opacity: number): void {
  for (const section of sections) {
    const mat = section.mesh.material as THREE.MeshStandardMaterial;
    mat.transparent = opacity < 1;
    mat.opacity = opacity;
    const cMat = section.cloudMesh.material as THREE.MeshStandardMaterial;
    cMat.opacity = 0.35 * opacity;
  }
  if (backingMesh) {
    (backingMesh.material as THREE.MeshBasicMaterial).opacity = opacity;
  }
  if (outerCoreMesh) {
    outerCoreMesh.visible = opacity > 0.1;
  }
  if (innerCoreMesh) {
    innerCoreMesh.visible = opacity > 0.1;
  }
  if (coreLight) {
    coreLight.intensity *= opacity;
  }
}

export function setPlanetScale(scale: number): void {
  if (planetGroup) {
    planetGroup.scale.setScalar(scale);
  }
}

export function disposePlanet(): void {
  for (const section of sections) {
    section.mesh.geometry.dispose();
    (section.mesh.material as THREE.Material).dispose();
    section.cloudMesh.geometry.dispose();
    (section.cloudMesh.material as THREE.Material).dispose();
  }
  sections = [];

  if (earthTexture) {
    earthTexture.dispose();
    earthTexture = null;
  }

  if (cloudTexture) {
    cloudTexture.dispose();
    cloudTexture = null;
  }

  if (backingMesh) {
    backingMesh.geometry.dispose();
    (backingMesh.material as THREE.Material).dispose();
    backingMesh = null;
  }

  if (outerCoreMesh) {
    outerCoreMesh.geometry.dispose();
    (outerCoreMesh.material as THREE.Material).dispose();
    outerCoreMesh = null;
  }

  if (innerCoreMesh) {
    innerCoreMesh.geometry.dispose();
    (innerCoreMesh.material as THREE.Material).dispose();
    innerCoreMesh = null;
  }

  coreMaterial = null;
  coreLight = null;

  if (planetGroup && sceneRef) {
    sceneRef.remove(planetGroup);
  }
  planetGroup = null;
  sectionsGroup = null;
  sceneRef = null;
}

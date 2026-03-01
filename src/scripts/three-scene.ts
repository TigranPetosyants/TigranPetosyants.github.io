import * as THREE from 'three';

let sceneReadyResolve: (() => void) | null = null;
export const sceneReady: Promise<void> = new Promise<void>((resolve) => {
  sceneReadyResolve = resolve;
});

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let animationId: number | null = null;
let canvas: HTMLCanvasElement | null = null;
let pointLight: THREE.PointLight | null = null;

const cameraCurrentZ = { value: 5 };
const cameraTargetZ = { value: 5 };
const cameraCurrent = new THREE.Vector3(0, 0, 5);
const mouseNorm = new THREE.Vector2(0, 0);
const mouseTarget = new THREE.Vector2(0, 0);

const lightColorCurrent = new THREE.Color(0x06b6d4);
const lightColorTarget = new THREE.Color(0x06b6d4);

interface FloatingShape {
  mesh: THREE.Mesh;
  rotationSpeed: THREE.Vector3;
  driftAmplitude: number;
  driftFrequency: number;
  driftOffset: number;
  baseY: number;
  baseZ: number;
}

const floatingShapes: FloatingShape[] = [];
let backgroundPoints: THREE.Points | null = null;

interface ZoneConfig {
  zCenter: number;
  count: number;
  particleCount: number;
}

const ZONES: ZoneConfig[] = [
  { zCenter: 4,   count: 6, particleCount: 400 },
  { zCenter: -4,  count: 4, particleCount: 300 },
  { zCenter: -12, count: 5, particleCount: 350 },
  { zCenter: -20, count: 4, particleCount: 250 },
  { zCenter: -28, count: 5, particleCount: 350 },
  { zCenter: -36, count: 3, particleCount: 200 },
  { zCenter: -45, count: 3, particleCount: 300 },
];

const GEOMETRY_FACTORIES = [
  () => new THREE.IcosahedronGeometry(0.15, 0),
  () => new THREE.OctahedronGeometry(0.18, 0),
  () => new THREE.TetrahedronGeometry(0.2, 0),
  () => new THREE.IcosahedronGeometry(0.12, 0),
  () => new THREE.OctahedronGeometry(0.14, 0),
];

function createFloatingShapes(isMobile: boolean): void {
  const mobileFactor = isMobile ? 0.6 : 1;
  const xRange = isMobile ? 3.5 : 5;
  const yRange = isMobile ? 2.5 : 3;

  ZONES.forEach((zone) => {
    const count = Math.ceil(zone.count * mobileFactor);
    for (let i = 0; i < count; i++) {
      const geoFactory = GEOMETRY_FACTORIES[i % GEOMETRY_FACTORIES.length];
      const geometry = geoFactory();

      const opacity = 0.15 + Math.random() * 0.25;
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x06b6d4,
        emissive: 0x06b6d4,
        emissiveIntensity: 0.4 + Math.random() * 0.4,
        wireframe: true,
        transparent: true,
        opacity,
      });

      const mesh = new THREE.Mesh(geometry, material);

      const zSpread = 4;
      const z = zone.zCenter + (Math.random() - 0.5) * zSpread;
      mesh.position.set(
        (Math.random() - 0.5) * xRange * 2,
        (Math.random() - 0.5) * yRange * 2,
        z
      );

      scene!.add(mesh);

      floatingShapes.push({
        mesh,
        rotationSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.008,
          (Math.random() - 0.5) * 0.012,
          (Math.random() - 0.5) * 0.006
        ),
        driftAmplitude: 0.08 + Math.random() * 0.12,
        driftFrequency: 0.3 + Math.random() * 0.5,
        driftOffset: Math.random() * Math.PI * 2,
        baseY: mesh.position.y,
        baseZ: z,
      });
    }
  });
}

function createBackgroundParticles(isMobile: boolean): void {
  const totalParticles = isMobile ? 1075 : 2150;
  const positions = new Float32Array(totalParticles * 3);
  const corridorLength = 58;
  const corridorStart = 8;

  for (let i = 0; i < totalParticles; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 22;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 14;
    positions[i * 3 + 2] = corridorStart - Math.random() * corridorLength;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x22d3ee,
    size: 0.025,
    transparent: true,
    opacity: 0.3,
    sizeAttenuation: true,
    depthWrite: false,
  });

  backgroundPoints = new THREE.Points(geometry, material);
  scene!.add(backgroundPoints);
}

export function initScene(): void {
  if (renderer) return;

  canvas = document.getElementById('scene-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const isMobile = window.innerWidth < 768;

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: false,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 5);
  cameraCurrent.set(0, 0, 5);
  cameraCurrentZ.value = 5;
  cameraTargetZ.value = 5;

  pointLight = new THREE.PointLight(0x06b6d4, 2.5, 30);
  pointLight.position.set(3, 3, 5);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0x0a0a1a, 1.5);
  scene.add(ambientLight);

  lightColorCurrent.set(0x06b6d4);
  lightColorTarget.set(0x06b6d4);

  createBackgroundParticles(isMobile);
  createFloatingShapes(isMobile);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timer = new THREE.Timer();

  function animate() {
    animationId = requestAnimationFrame(animate);

    timer.update();
    const elapsed = timer.getElapsed();

    mouseNorm.x += (mouseTarget.x - mouseNorm.x) * 0.05;
    mouseNorm.y += (mouseTarget.y - mouseNorm.y) * 0.05;

    cameraCurrentZ.value += (cameraTargetZ.value - cameraCurrentZ.value) * 0.08;

    cameraCurrent.x += (mouseNorm.x * 0.5 - cameraCurrent.x) * 0.05;
    cameraCurrent.y += (mouseNorm.y * 0.3 - cameraCurrent.y) * 0.05;

    camera!.position.x = cameraCurrent.x;
    camera!.position.y = cameraCurrent.y;
    camera!.position.z = cameraCurrentZ.value;
    camera!.lookAt(cameraCurrent.x * 0.1, cameraCurrent.y * 0.1, cameraCurrentZ.value - 10);

    lightColorCurrent.lerp(lightColorTarget, 0.03);
    if (pointLight) {
      pointLight.color.copy(lightColorCurrent);
      pointLight.position.z = cameraCurrentZ.value + 2;
    }

    if (!prefersReducedMotion) {
      for (const shape of floatingShapes) {
        const dist = Math.abs(shape.baseZ - cameraCurrentZ.value);
        shape.mesh.visible = dist < 25;

        if (shape.mesh.visible) {
          shape.mesh.rotation.x += shape.rotationSpeed.x;
          shape.mesh.rotation.y += shape.rotationSpeed.y;
          shape.mesh.rotation.z += shape.rotationSpeed.z;

          shape.mesh.position.y =
            shape.baseY + Math.sin(elapsed * shape.driftFrequency + shape.driftOffset) * shape.driftAmplitude;
        }
      }

      if (backgroundPoints) {
        backgroundPoints.rotation.y = elapsed * 0.001;
      }
    } else {
      for (const shape of floatingShapes) {
        const dist = Math.abs(shape.baseZ - cameraCurrentZ.value);
        shape.mesh.visible = dist < 25;
      }
    }

    renderer!.render(scene!, camera!);

    if (sceneReadyResolve) {
      sceneReadyResolve();
      sceneReadyResolve = null;
    }
  }

  animate();

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
}

export function setCameraZTarget(z: number): void {
  cameraTargetZ.value = z;
}

export function setLightColor(color: THREE.ColorRepresentation): void {
  lightColorTarget.set(color);
}

function onMouseMove(e: MouseEvent) {
  mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onResize() {
  if (!camera || !renderer) return;
  const isMobile = window.innerWidth < 768;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
}

export function destroyScene(): void {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize', onResize);

  for (const shape of floatingShapes) {
    shape.mesh.geometry.dispose();
    (shape.mesh.material as THREE.MeshPhysicalMaterial).dispose();
    scene?.remove(shape.mesh);
  }
  floatingShapes.length = 0;

  if (backgroundPoints) {
    backgroundPoints.geometry.dispose();
    (backgroundPoints.material as THREE.PointsMaterial).dispose();
    scene?.remove(backgroundPoints);
    backgroundPoints = null;
  }

  renderer?.dispose();
  renderer = null;
  scene = null;
  camera = null;
  pointLight = null;
  canvas = null;
}

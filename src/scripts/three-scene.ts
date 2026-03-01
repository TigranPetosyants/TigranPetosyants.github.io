import * as THREE from 'three';

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let animationId: number | null = null;
let canvas: HTMLCanvasElement | null = null;

const cameraTarget = new THREE.Vector3(0, 0, 5);
const cameraCurrent = new THREE.Vector3(0, 0, 5);
const mouseNorm = new THREE.Vector2(0, 0);
const mouseTarget = new THREE.Vector2(0, 0);

interface FloatingShape {
  mesh: THREE.Mesh;
  rotationSpeed: THREE.Vector3;
  driftAmplitude: number;
  driftFrequency: number;
  driftOffset: number;
  baseY: number;
}

const floatingShapes: FloatingShape[] = [];
let backgroundPoints: THREE.Points | null = null;

function createFloatingShapes(isMobile: boolean): void {
  const count = isMobile ? 10 : 18;
  const geometryTypes = [
    () => new THREE.IcosahedronGeometry(0.15, 0),
    () => new THREE.OctahedronGeometry(0.18, 0),
    () => new THREE.TetrahedronGeometry(0.2, 0),
    () => new THREE.IcosahedronGeometry(0.12, 0),
    () => new THREE.OctahedronGeometry(0.14, 0),
  ];

  for (let i = 0; i < count; i++) {
    const geoFactory = geometryTypes[i % geometryTypes.length];
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

    const xRange = isMobile ? 3.5 : 5;
    const yRange = isMobile ? 2.5 : 3;
    mesh.position.set(
      (Math.random() - 0.5) * xRange * 2,
      (Math.random() - 0.5) * yRange * 2,
      (Math.random() - 0.5) * 3 * 2
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
    });
  }
}

function createBackgroundParticles(isMobile: boolean): void {
  const count = isMobile ? 800 : 1500;
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: 0x22d3ee,
    size: 0.025,
    transparent: true,
    opacity: 0.35,
    sizeAttenuation: true,
    depthWrite: false,
  });

  backgroundPoints = new THREE.Points(geometry, material);
  scene!.add(backgroundPoints);
}

export function initHeroScene(): void {
  if (renderer) return;

  canvas = document.getElementById('hero-canvas') as HTMLCanvasElement;
  if (!canvas) return;

  const isMobile = window.innerWidth < 768;

  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);
  cameraCurrent.set(0, 0, 5);
  cameraTarget.set(0, 0, 5);

  const pointLight = new THREE.PointLight(0x06b6d4, 2.5, 20);
  pointLight.position.set(3, 3, 4);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0x0a0a1a, 1.5);
  scene.add(ambientLight);

  createBackgroundParticles(isMobile);
  createFloatingShapes(isMobile);

  const clock = new THREE.Clock();

  function animate() {
    animationId = requestAnimationFrame(animate);

    const elapsed = clock.getElapsedTime();

    mouseNorm.x += (mouseTarget.x - mouseNorm.x) * 0.05;
    mouseNorm.y += (mouseTarget.y - mouseNorm.y) * 0.05;

    cameraTarget.x = mouseNorm.x * 0.5;
    cameraTarget.y = mouseNorm.y * 0.3;

    cameraCurrent.x += (cameraTarget.x - cameraCurrent.x) * 0.05;
    cameraCurrent.y += (cameraTarget.y - cameraCurrent.y) * 0.05;

    camera!.position.x = cameraCurrent.x;
    camera!.position.y = cameraCurrent.y;
    camera!.lookAt(0, 0, 0);

    for (const shape of floatingShapes) {
      shape.mesh.rotation.x += shape.rotationSpeed.x;
      shape.mesh.rotation.y += shape.rotationSpeed.y;
      shape.mesh.rotation.z += shape.rotationSpeed.z;

      shape.mesh.position.y =
        shape.baseY + Math.sin(elapsed * shape.driftFrequency + shape.driftOffset) * shape.driftAmplitude;
    }

    if (backgroundPoints) {
      backgroundPoints.rotation.y = elapsed * 0.005;
    }

    renderer!.render(scene!, camera!);
  }

  animate();

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });
}

function onMouseMove(e: MouseEvent) {
  mouseTarget.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouseTarget.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

function onResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

export function destroyHeroScene(): void {
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
  canvas = null;
}

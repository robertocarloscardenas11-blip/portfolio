import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const MOTHERBOARD_GLB_URL = new URL("../assets/models/motherboard_am4.glb", import.meta.url).href;

export const prefersReduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function initHero3D(root) {
  if (!webglAvailable()) {
    console.error("WebGL no disponible: revisa aceleración por hardware o prueba otro navegador.");
    return;
  }
  const showHeroShapes =
    typeof document !== "undefined" &&
    document.body.classList.contains("page-home");

  const width = window.innerWidth;
  const height = window.innerHeight;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0e17, 0.035);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 120);
  camera.position.set(0, 0.6, 9);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  root.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  controls.minDistance = 4;
  controls.maxDistance = 16;
  controls.autoRotate = !prefersReduced;
  controls.autoRotateSpeed = 0.55;
  controls.target.set(0, 0, 0);

  const group = new THREE.Group();
  let meshB = null;
  if (showHeroShapes) {
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x082038,
      emissiveIntensity: 0.45,
      metalness: 0.4,
      roughness: 0.35,
      wireframe: true,
    });

    const solidMat = new THREE.MeshStandardMaterial({
      color: 0x818cf8,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.35,
      metalness: 0.25,
      roughness: 0.4,
      transparent: true,
      opacity: 0.22,
    });

    const meshA = new THREE.Mesh(new THREE.IcosahedronGeometry(1.35, 0), wireMat.clone());
    meshA.position.set(-2.1, 0.3, 0);
    group.add(meshA);

    meshB = new THREE.Mesh(new THREE.TorusKnotGeometry(0.75, 0.22, 120, 16), solidMat);
    meshB.position.set(1.2, -0.2, 0.5);
    group.add(meshB);

    const meshC = new THREE.Mesh(new THREE.OctahedronGeometry(0.95, 0), wireMat.clone());
    meshC.material.color.setHex(0xa78bfa);
    meshC.position.set(2.4, 0.8, -1.2);
    group.add(meshC);

    scene.add(group);
  }

  const particles = new THREE.BufferGeometry();
  const narrow =
    typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches;
  const count = prefersReduced ? 500 : narrow ? 1400 : 2200;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 32;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 32;
  }
  particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const ptsMat = new THREE.PointsMaterial({
    color: 0x7dd3fc,
    size: narrow ? 0.065 : 0.045,
    transparent: true,
    opacity: narrow ? 0.62 : 0.55,
    depthWrite: false,
    sizeAttenuation: true,
  });
  const pts = new THREE.Points(particles, ptsMat);
  scene.add(pts);

  scene.add(new THREE.AmbientLight(0x64748b, 0.55));
  const dir = new THREE.DirectionalLight(0x38bdf8, 1.1);
  dir.position.set(6, 8, 10);
  scene.add(dir);
  const pt = new THREE.PointLight(0x818cf8, 1.4, 40);
  pt.position.set(-4, 2, 6);
  scene.add(pt);

  let mouseX = 0;
  let mouseY = 0;
  const onMove = (e) => {
    const vw = window.innerWidth || width;
    const vh = window.innerHeight || height;
    mouseX = (e.clientX / vw) * 2 - 1;
    mouseY = (e.clientY / vh) * 2 - 1;
  };
  window.addEventListener("pointermove", onMove);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    if (showHeroShapes && !prefersReduced) {
      group.rotation.y = t * 0.12 + mouseX * 0.35;
      group.rotation.x = mouseY * 0.18;
      if (meshB) {
        meshB.rotation.x = t * 0.45;
        meshB.rotation.y = t * 0.3;
      }
    }
    pts.rotation.y = t * 0.02;
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    const mob = w <= 640;
    ptsMat.size = mob ? 0.065 : 0.045;
    ptsMat.opacity = mob ? 0.62 : 0.55;
    ptsMat.needsUpdate = true;
  };
  window.addEventListener("resize", onResize);
}

export function initWorkstation3D(canvas) {
  if (!webglAvailable()) {
    console.error("WebGL no disponible (Experiencia · placa madre).");
    return;
  }
  const size = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(280, r.width || canvas.clientWidth || 320);
    const h = Math.max(200, Math.round(w * 0.75));
    return { w, h };
  };

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(42, 4 / 3, 0.05, 120);
  camera.position.set(-0.35, 1.85, -2.6);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.toneMappingExposure = 1.35;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0, 0);
  controls.minDistance = 0.85;
  controls.maxDistance = 12;
  controls.maxPolarAngle = Math.PI / 2 - 0.06;

  const mb = new THREE.Group();
  scene.add(mb);

  scene.add(new THREE.HemisphereLight(0xf0f7ff, 0x5a7d5a, 0.85));
  scene.add(new THREE.AmbientLight(0xd4e4f7, 0.55));

  const key = new THREE.DirectionalLight(0xfff8f0, 2.15);
  key.position.set(2.2, 5.5, 3.2);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.2;
  key.shadow.camera.far = 40;
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  key.shadow.bias = -0.00015;
  key.shadow.normalBias = 0.025;
  scene.add(key);

  const fillFront = new THREE.DirectionalLight(0xe0f2fe, 0.95);
  fillFront.position.set(-1.2, 3.2, 4);
  scene.add(fillFront);

  const fill = new THREE.PointLight(0xbae6fd, 1.15, 22);
  fill.position.set(-2.2, 2.4, 1.8);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xc7d2fe, 0.75);
  rim.position.set(-3.5, 2.2, -2.2);
  scene.add(rim);

  const pcbGlow = new THREE.PointLight(0x86efac, 0.55, 14);
  pcbGlow.position.set(0.3, 1.2, 0.2);
  scene.add(pcbGlow);

  let mixer = null;

  const loader = new GLTFLoader();
  loader.load(
    MOTHERBOARD_GLB_URL,
    (gltf) => {
      const model = gltf.scene;
      mb.add(model);

      model.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const sizeV = box.getSize(new THREE.Vector3());
      model.position.sub(center);
      const maxDim = Math.max(sizeV.x, sizeV.y, sizeV.z, 1e-6);
      const targetSize = 2.35;
      model.scale.setScalar(targetSize / maxDim);

      model.traverse((obj) => {
        if (obj.isMesh) {
          obj.castShadow = true;
          obj.receiveShadow = true;
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          for (const mat of mats) {
            if (mat && "envMapIntensity" in mat) mat.envMapIntensity = 1;
          }
        }
      });

      mb.updateMatrixWorld(true);
      const fitBox = new THREE.Box3().setFromObject(mb);
      const sphere = fitBox.getBoundingSphere(new THREE.Sphere());
      controls.target.copy(sphere.center);
      const dist = Math.max(sphere.radius * 2.4, 1.6);
      camera.position.set(
        sphere.center.x - dist * 0.35,
        sphere.center.y + dist * 0.55,
        sphere.center.z - dist * 0.65
      );
      controls.minDistance = Math.max(sphere.radius * 0.35, 0.5);
      controls.maxDistance = sphere.radius * 8;
      controls.update();

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        for (const clip of gltf.animations) {
          mixer.clipAction(clip).play();
        }
      }
    },
    undefined,
    (err) => {
      console.error("No se pudo cargar motherboard_am4.glb:", err);
    }
  );

  const clock = new THREE.Clock();
  function loop() {
    requestAnimationFrame(loop);
    const delta = clock.getDelta();
    const t = clock.getElapsedTime();

    if (mixer) mixer.update(delta);

    if (!prefersReduced) {
      const baseX = -0.38;
      mb.rotation.y = Math.sin(t * 0.2) * 0.06;
      mb.rotation.x = baseX + Math.sin(t * 0.16) * 0.022;
    } else {
      mb.rotation.x = -0.38;
      mb.rotation.y = 0;
    }

    controls.update();
    const { w, h } = size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  loop();
}

export function initMobileAI3D(canvas) {
  if (!webglAvailable()) {
    console.error("WebGL no disponible (Proyecto · vista móvil).");
    return;
  }
  const size = () => {
    const r = canvas.getBoundingClientRect();
    const w = Math.max(280, r.width || canvas.clientWidth || 320);
    const h = Math.max(200, Math.round(w * 0.75));
    return { w, h };
  };

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(40, 4 / 3, 0.1, 50);
  camera.position.set(0, 0.32, 3.35);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  if ("outputColorSpace" in renderer) renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 2.2;
  controls.maxDistance = 8;
  controls.target.set(0, 0.12, 0);

  const phone = new THREE.Group();
  phone.scale.setScalar(0.9);
  scene.add(phone);

  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.35,
    roughness: 0.45,
  });
  const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.72, 0.09), bodyMat);
  phone.add(body);

  const glass = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0c4a6e,
    emissiveIntensity: 0.55,
    metalness: 0.2,
    roughness: 0.15,
    transparent: true,
    opacity: 0.92,
  });
  const screen = new THREE.Mesh(new THREE.BoxGeometry(0.74, 1.52, 0.02), glass);
  screen.position.z = 0.05;
  phone.add(screen);

  phone.position.y = 0.22;

  const nodes = new THREE.Group();
  nodes.position.y = 0.06;
  scene.add(nodes);

  for (let i = 0; i < 8; i++) {
    const geo = i % 2 === 0
      ? new THREE.IcosahedronGeometry(0.12 + Math.random() * 0.06, 0)
      : new THREE.OctahedronGeometry(0.1, 0);
    const mat = new THREE.MeshStandardMaterial({
      color: i % 2 === 0 ? 0x38bdf8 : 0xa78bfa,
      emissive: i % 2 === 0 ? 0x082f49 : 0x1e1b4b,
      emissiveIntensity: 0.6,
      metalness: 0.4,
      roughness: 0.3,
    });
    const m = new THREE.Mesh(geo, mat);
    const a = (i / 8) * Math.PI * 2;
    m.position.set(Math.cos(a) * 1.35, Math.sin(a * 2) * 0.35, Math.sin(a) * 0.65);
    nodes.add(m);
  }

  scene.add(new THREE.AmbientLight(0xe0f2fe, 0.5));
  const d1 = new THREE.DirectionalLight(0x7dd3fc, 1.2);
  d1.position.set(3, 5, 4);
  scene.add(d1);

  const clock = new THREE.Clock();
  function loop() {
    requestAnimationFrame(loop);
    const t = clock.getElapsedTime();
    if (!prefersReduced) {
      phone.rotation.y = Math.sin(t * 0.5) * 0.12;
      nodes.rotation.y = t * 0.35;
      screen.material.emissiveIntensity = 0.4 + Math.sin(t * 1.8) * 0.15;
    }
    controls.update();
    const { w, h } = size();
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  }
  loop();
}

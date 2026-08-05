import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeFabricScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 550;
    const height = container.clientHeight || 450;

    // Scene
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xf5f0ff, 0.06);

    // Camera
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7);
    camera.lookAt(0, 0.3, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // ── Lighting (Soft Studio Setup) ──
    const ambientLight = new THREE.AmbientLight(0xfdf4ff, 0.8);
    scene.add(ambientLight);

    // Key light — warm violet
    const keyLight = new THREE.DirectionalLight(0xf3e8ff, 2.2);
    keyLight.position.set(4, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 20;
    scene.add(keyLight);

    // Fill light — cool blue
    const fillLight = new THREE.DirectionalLight(0xdbeafe, 1.2);
    fillLight.position.set(-6, 4, 3);
    scene.add(fillLight);

    // Rim light — purple accent
    const rimLight = new THREE.PointLight(0xc084fc, 2.5, 15);
    rimLight.position.set(0, 4, -3);
    scene.add(rimLight);

    // Bottom bounce light
    const bounceLight = new THREE.PointLight(0xfef3c7, 0.8, 10);
    bounceLight.position.set(0, -2, 2);
    scene.add(bounceLight);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // ── 1. PURPLE SILK CLOTH (Realistic Multi-Layer Wave) ──
    const purpleSegW = 80, purpleSegH = 60;
    const purpleGeo = new THREE.PlaneGeometry(5.5, 3.0, purpleSegW, purpleSegH);
    const purpleMat = new THREE.MeshPhysicalMaterial({
      color: 0xc084fc,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 1.0,
      clearcoatRoughness: 0.08,
      sheen: 1.0,
      sheenRoughness: 0.3,
      sheenColor: new THREE.Color(0xe9d5ff),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.92,
    });
    const purpleCloth = new THREE.Mesh(purpleGeo, purpleMat);
    purpleCloth.position.set(-0.3, 1.4, 0.5);
    purpleCloth.rotation.set(-0.35, 0.25, -0.15);
    purpleCloth.castShadow = true;
    mainGroup.add(purpleCloth);

    // Store original positions for displacement
    const purpleOrigZ = new Float32Array(purpleGeo.attributes.position.count);
    const purplePos = purpleGeo.attributes.position;
    for (let i = 0; i < purplePos.count; i++) {
      purpleOrigZ[i] = purplePos.getZ(i);
    }

    // ── 2. WHITE SATIN CLOTH (Softer, Flowing Underneath) ──
    const whiteSegW = 70, whiteSegH = 50;
    const whiteGeo = new THREE.PlaneGeometry(5.0, 2.5, whiteSegW, whiteSegH);
    const whiteMat = new THREE.MeshPhysicalMaterial({
      color: 0xfafafa,
      roughness: 0.18,
      metalness: 0.02,
      clearcoat: 0.7,
      clearcoatRoughness: 0.12,
      sheen: 0.8,
      sheenRoughness: 0.4,
      sheenColor: new THREE.Color(0xf5f5f5),
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    });
    const whiteCloth = new THREE.Mesh(whiteGeo, whiteMat);
    whiteCloth.position.set(-0.8, -0.1, -0.2);
    whiteCloth.rotation.set(-0.2, 0.4, -0.08);
    whiteCloth.castShadow = true;
    mainGroup.add(whiteCloth);

    const whiteOrigZ = new Float32Array(whiteGeo.attributes.position.count);
    const whitePos = whiteGeo.attributes.position;
    for (let i = 0; i < whitePos.count; i++) {
      whiteOrigZ[i] = whitePos.getZ(i);
    }

    // ── 3. GOLDEN ARCH ──
    const archGeo = new THREE.TorusGeometry(2.0, 0.04, 24, 80, Math.PI);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4a574,
      roughness: 0.15,
      metalness: 0.85,
    });
    const arch = new THREE.Mesh(archGeo, goldMat);
    arch.position.set(1.0, -0.5, -1.2);
    mainGroup.add(arch);

    // ── 4. PEDESTAL ──
    const pedestalGeo = new THREE.CylinderGeometry(1.8, 1.9, 0.35, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xf5f5f5,
      roughness: 0.4,
      metalness: 0.05,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.set(1.0, -1.35, 0);
    pedestal.receiveShadow = true;
    mainGroup.add(pedestal);

    // Pedestal gold ring
    const rimGeo = new THREE.TorusGeometry(1.82, 0.025, 16, 64);
    const rim = new THREE.Mesh(rimGeo, goldMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(1.0, -1.18, 0);
    mainGroup.add(rim);

    // ── 5. FABRIC ROLLS ──
    const rollColors = [
      { color: 0x7dd3fc, y: -0.95 },  // Sky blue
      { color: 0x94a3b8, y: -0.6 },   // Slate
      { color: 0xa855f7, y: -0.25 },   // Purple
      { color: 0xfef3c7, y: 0.1 },     // Cream
    ];

    rollColors.forEach((cfg) => {
      const rGeo = new THREE.CylinderGeometry(0.48, 0.48, 1.4, 40);
      const rMat = new THREE.MeshStandardMaterial({
        color: cfg.color,
        roughness: 0.55,
        metalness: 0.02,
      });
      const roll = new THREE.Mesh(rGeo, rMat);
      roll.position.set(1.0, cfg.y, 0);
      roll.rotation.z = Math.PI / 2;
      roll.castShadow = true;
      mainGroup.add(roll);
    });

    // ── 6. THREAD SPOOLS ──
    const spoolGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.6, 24);
    const threadColors = [
      { color: 0xe9d5ff, x: -0.5, z: 0.9 },
      { color: 0xfde68a, x: 2.3, z: 0.7 },
    ];
    threadColors.forEach(cfg => {
      const mat = new THREE.MeshStandardMaterial({ color: cfg.color, roughness: 0.4 });
      const spool = new THREE.Mesh(spoolGeo, mat);
      spool.position.set(cfg.x, -0.8, cfg.z);
      mainGroup.add(spool);
    });

    // ── 7. FLOATING PARTICLES (Ambient Dust Motes) ──
    const particleCount = 40;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 8;
      particlePositions[i * 3 + 1] = Math.random() * 5 - 1;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xd8b4fe,
      size: 0.035,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // ── MOUSE PARALLAX ──
    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // ── ANIMATION LOOP ──
    const clock = new THREE.Clock();
    let animId;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      // ▸ Purple Cloth — Multi-octave wave displacement
      for (let i = 0; i < purplePos.count; i++) {
        const x = purplePos.getX(i);
        const y = purplePos.getY(i);
        // 3 layered sine waves for realistic drape
        const wave1 = Math.sin(x * 1.2 + t * 1.8) * 0.22;
        const wave2 = Math.cos(y * 1.6 + t * 1.3) * 0.15;
        const wave3 = Math.sin((x + y) * 0.8 + t * 2.4) * 0.08;
        // Edge damping for natural cloth boundary
        const edgeFactor = 1.0 - Math.pow(Math.abs(x / 2.75), 3) * 0.5;
        purplePos.setZ(i, purpleOrigZ[i] + (wave1 + wave2 + wave3) * edgeFactor);
      }
      purplePos.needsUpdate = true;
      purpleGeo.computeVertexNormals();

      // Floating motion — gentle bobbing
      purpleCloth.position.y = 1.4 + Math.sin(t * 1.2) * 0.08 + Math.cos(t * 0.7) * 0.04;
      purpleCloth.rotation.z = -0.15 + Math.sin(t * 0.9) * 0.03;

      // ▸ White Cloth — Softer, phase-shifted wave
      for (let i = 0; i < whitePos.count; i++) {
        const x = whitePos.getX(i);
        const y = whitePos.getY(i);
        const wave1 = Math.cos(x * 1.0 + t * 1.5 + 1.2) * 0.18;
        const wave2 = Math.sin(y * 1.3 + t * 1.1 + 0.8) * 0.12;
        const wave3 = Math.cos((x - y) * 0.6 + t * 2.0) * 0.06;
        const edgeFactor = 1.0 - Math.pow(Math.abs(x / 2.5), 3) * 0.4;
        whitePos.setZ(i, whiteOrigZ[i] + (wave1 + wave2 + wave3) * edgeFactor);
      }
      whitePos.needsUpdate = true;
      whiteGeo.computeVertexNormals();

      whiteCloth.position.y = -0.1 + Math.cos(t * 1.0) * 0.06 + Math.sin(t * 0.6) * 0.03;
      whiteCloth.rotation.z = -0.08 + Math.cos(t * 0.8) * 0.02;

      // ▸ Particles — slow upward drift
      const pPos = particleGeo.attributes.position;
      for (let i = 0; i < particleCount; i++) {
        let py = pPos.getY(i);
        py += 0.003;
        if (py > 4) py = -1;
        pPos.setY(i, py);
        pPos.setX(i, pPos.getX(i) + Math.sin(t + i) * 0.001);
      }
      pPos.needsUpdate = true;

      // ▸ Mouse parallax — smooth interpolation
      mainGroup.rotation.y += (mouseX * 0.12 - mainGroup.rotation.y) * 0.04;
      mainGroup.rotation.x += (mouseY * 0.06 - mainGroup.rotation.x) * 0.04;

      // ▸ Rim light pulse
      rimLight.intensity = 2.5 + Math.sin(t * 1.5) * 0.5;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full min-h-[420px] relative cursor-grab active:cursor-grabbing"
      style={{ touchAction: 'none' }}
    />
  );
}

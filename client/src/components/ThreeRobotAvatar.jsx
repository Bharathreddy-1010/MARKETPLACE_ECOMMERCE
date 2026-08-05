import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeRobotAvatar({ isSpeaking = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 160;
    const height = container.clientHeight || 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xa78bfa, 2.5);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const robotGroup = new THREE.Group();
    scene.add(robotGroup);

    // 1. Robot Head (Rounded Box / Sphere blend)
    const headGeo = new THREE.SphereGeometry(0.7, 32, 32);
    headGeo.scale(1, 0.85, 0.9);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Clean White
      roughness: 0.2,
      metalness: 0.1,
    });
    const head = new THREE.Mesh(headGeo, headMat);
    robotGroup.add(head);

    // 2. Visor Screen (Black Dark Glass)
    const visorGeo = new THREE.SphereGeometry(0.55, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.45);
    visorGeo.scale(0.95, 0.6, 0.4);
    const visorMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep Onyx
      roughness: 0.1,
      metalness: 0.8
    });
    const visor = new THREE.Mesh(visorGeo, visorMat);
    visor.position.set(0, 0.05, 0.42);
    visor.rotation.x = Math.PI / 2;
    head.add(visor);

    // 3. Glowing Eyes (Cyan Blue Spheres)
    const eyeGeo = new THREE.SphereGeometry(0.09, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
    leftEye.position.set(-0.2, 0.05, 0.62);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
    rightEye.position.set(0.2, 0.05, 0.62);
    head.add(rightEye);

    // 4. Antenna / Ears (Cute purple cones)
    const earGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.25, 16);
    const earMat = new THREE.MeshStandardMaterial({ color: 0x7c3aed, roughness: 0.3 });

    const leftEar = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.75, 0.1, 0);
    leftEar.rotation.z = Math.PI / 2;
    head.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, earMat);
    rightEar.position.set(0.75, 0.1, 0);
    rightEar.rotation.z = -Math.PI / 2;
    head.add(rightEar);

    // Top Antenna Light Ball
    const topLightGeo = new THREE.SphereGeometry(0.08, 16, 16);
    const topLightMat = new THREE.MeshBasicMaterial({ color: 0xa855f7 });
    const topLight = new THREE.Mesh(topLightGeo, topLightMat);
    topLight.position.set(0, 0.8, 0);
    head.add(topLight);

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Floating Bobbing Effect
      robotGroup.position.y = Math.sin(elapsedTime * 2) * 0.08;
      robotGroup.rotation.y = Math.sin(elapsedTime * 1.2) * 0.15;
      robotGroup.rotation.x = Math.cos(elapsedTime * 1.5) * 0.05;

      // Eye Pulse / Blink logic
      if (Math.sin(elapsedTime * 4) > 0.98) {
        leftEye.scale.y = 0.1;
        rightEye.scale.y = 0.1;
      } else {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="w-24 h-24 sm:w-28 sm:h-28 mx-auto relative flex items-center justify-center" />
  );
}

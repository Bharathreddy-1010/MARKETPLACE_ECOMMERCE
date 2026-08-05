import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCartScene() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 240;
    const height = container.clientHeight || 240;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 4);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x8b5cf6, 2.5);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const cartGroup = new THREE.Group();
    scene.add(cartGroup);

    // 1. Purple Cart Basket (Box with rounded feel / bevel)
    const cartGeo = new THREE.BoxGeometry(1.2, 0.8, 1.0);
    const cartMat = new THREE.MeshStandardMaterial({
      color: 0x7c3aed, // Violet/Purple theme matching reference image
      roughness: 0.2,
      metalness: 0.1
    });
    const cartBasket = new THREE.Mesh(cartGeo, cartMat);
    cartBasket.position.set(0, 0, 0);
    cartGroup.add(cartBasket);

    // 2. Cart Wheels (4 small cylinders)
    const wheelGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3 });

    const wheelPos = [
      [-0.5, -0.5, 0.5],
      [0.5, -0.5, 0.5],
      [-0.5, -0.5, -0.5],
      [0.5, -0.5, -0.5]
    ];

    wheelPos.forEach(p => {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(...p);
      cartGroup.add(wheel);
    });

    // 3. Fabric Rolls popping out of cart!
    const rollColors = [0x10b981, 0x38bdf8, 0xf59e0b]; // Emerald, Sky Blue, Amber
    rollColors.forEach((col, idx) => {
      const rollGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.9, 24);
      const rollMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.4 });
      const roll = new THREE.Mesh(rollGeo, rollMat);
      roll.rotation.x = Math.PI / 4 + (idx * 0.2);
      roll.rotation.z = (idx - 1) * 0.3;
      roll.position.set((idx - 1) * 0.3, 0.4, (idx % 2 === 0 ? 0.1 : -0.1));
      cartGroup.add(roll);
    });

    // Animation Loop
    let clock = new THREE.Clock();
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      cartGroup.rotation.y = Math.sin(elapsedTime * 0.8) * 0.2;
      cartGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.06;

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
    <div ref={mountRef} className="w-48 h-48 sm:w-60 sm:h-60 mx-auto relative flex items-center justify-center" />
  );
}

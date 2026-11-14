"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ThreeBackground — animated 3D particle starfield.
 * - Fixed, behind all content (z-index handled by parent).
 * - Reacts to mouse movement (parallax tilt).
 * - Self-healing animation loop, cleans up on unmount.
 */
export default function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect WebGL support; fallback silently (portfolio still works)
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // transparent
    container.appendChild(renderer.domElement);

    // ---- Particle starfield ----
    const COUNT = 900;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);

    // Brand palette
    const palette = [
      new THREE.Color("#6366f1"), // indigo
      new THREE.Color("#8b5cf6"), // purple
      new THREE.Color("#22d3ee"), // cyan
      new THREE.Color("#a78bfa"), // light purple
    ];

    for (let i = 0; i < COUNT; i++) {
      const i3 = i * 3;
      // Spread across a large sphere
      const r = 18 + Math.random() * 22;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi);

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i3] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Soft round point texture via canvas
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, "rgba(255,255,255,1)");
    grad.addColorStop(0.4, "rgba(255,255,255,0.6)");
    grad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);
    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.22,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // ---- A few drifting wireframe shapes for depth ----
    const shapes: THREE.Mesh[] = [];
    const shapeGeo: THREE.BufferGeometry[] = [];
    const shapeColors = ["#6366f1", "#8b5cf6", "#22d3ee"];

    for (let i = 0; i < 3; i++) {
      const geo =
        i === 0
          ? new THREE.IcosahedronGeometry(3.2, 1)
          : i === 1
          ? new THREE.TorusKnotGeometry(2.4, 0.7, 64, 8)
          : new THREE.OctahedronGeometry(3, 0);
      shapeGeo.push(geo);
      const mat = new THREE.MeshBasicMaterial({
        color: shapeColors[i],
        wireframe: true,
        transparent: true,
        opacity: 0.12,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (i - 1) * 16,
        (Math.random() - 0.5) * 14,
        -12 - i * 6
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      scene.add(mesh);
      shapes.push(mesh);
    }

    // ---- Mouse parallax ----
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ---- Resize handler ----
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ---- Animation loop ----
    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();

      // Rotate particle field slowly
      particles.rotation.y = t * 0.03;
      particles.rotation.x = Math.sin(t * 0.05) * 0.1;

      // Shapes gently rotate & drift
      shapes.forEach((m, idx) => {
        m.rotation.x += 0.003 * (idx + 1);
        m.rotation.y += 0.004 * (idx + 1);
        m.position.y = Math.sin(t * 0.2 + idx) * 2;
      });

      // Camera parallax (smooth)
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
      camera.position.y += (-mouseY * 2 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      shapes.forEach((m) => {
        scene.remove(m);
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      shapeGeo.forEach((g) => g.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />;
}


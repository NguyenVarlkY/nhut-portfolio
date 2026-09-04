"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Hero3D — floating 3D geometric sculpture for the Hero section.
 * - Icosahedron + TorusKnot + Octahedron, wireframe with glow.
 * - Slow auto-rotation + mouse parallax.
 * - Only rendered on md+ screens (CSS hidden on mobile).
 */
export default function Hero3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 12);

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ---- Group of shapes ----
    const group = new THREE.Group();
    scene.add(group);

    // Central icosahedron (wireframe)
    const icoGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const icoMat = new THREE.MeshBasicMaterial({
      color: "#8b5cf6",
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    const ico = new THREE.Mesh(icoGeo, icoMat);
    group.add(ico);

    // Torus knot (accent cyan)
    const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.42, 120, 16);
    const knotMat = new THREE.MeshBasicMaterial({
      color: "#22d3ee",
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const knot = new THREE.Mesh(knotGeo, knotMat);
    knot.position.set(0, 0.2, 0);
    knot.scale.setScalar(1.35);
    group.add(knot);

    // Small octahedron (indigo)
    const octGeo = new THREE.OctahedronGeometry(1.1, 0);
    const octMat = new THREE.MeshBasicMaterial({
      color: "#6366f1",
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const oct = new THREE.Mesh(octGeo, octMat);
    oct.position.set(2.6, -2.0, 1.2);
    group.add(oct);

    // Small floating dots around (for depth)
    const dots = new THREE.Group();
    for (let i = 0; i < 40; i++) {
      const dGeo = new THREE.SphereGeometry(0.06, 8, 8);
      const dMat = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? "#22d3ee" : i % 3 === 1 ? "#8b5cf6" : "#6366f1",
        transparent: true,
        opacity: 0.9,
      });
      const dot = new THREE.Mesh(dGeo, dMat);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 3;
      dot.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
      dots.add(dot);
    }
    group.add(dots);

    // ---- Mouse parallax ----
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ---- Resize ----
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    onResize();
    window.addEventListener("resize", onResize);

    // ---- Animation ----
    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();

      ico.rotation.x = t * 0.22;
      ico.rotation.y = t * 0.3;
      knot.rotation.x = t * 0.28;
      knot.rotation.y = t * 0.4;
      oct.rotation.x = -t * 0.2;
      oct.rotation.y = t * 0.26;

      // Group gentle float
      group.position.y = Math.sin(t * 0.6) * 0.35;
      group.rotation.z = Math.sin(t * 0.2) * 0.06;

      // Mouse parallax on group
      group.rotation.x += (-mouseY * 0.3 - group.rotation.x) * 0.03;
      group.rotation.y += (mouseX * 0.4 - group.rotation.y) * 0.03;

      dots.rotation.y = -t * 0.1;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    // ---- Cleanup ----
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      group.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          (obj.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute right-[4%] top-1/2 hidden h-[460px] w-[460px] -translate-y-1/2 md:block lg:right-[7%] lg:h-[540px] lg:w-[540px]"
      aria-hidden="true"
    />
  );
}


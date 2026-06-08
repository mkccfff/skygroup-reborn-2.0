"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface GlassArtifactProps {
  className?: string;
}

/**
 * A floating frosted-glass 3D artifact (torus knot) rendered with three.js.
 * Uses a procedural RoomEnvironment for realistic transmission/refraction.
 * Reacts to the cursor and gently auto-rotates.
 */
export function GlassArtifact({ className }: GlassArtifactProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    const geometry = new THREE.TorusKnotGeometry(1.0, 0.34, 280, 44, 2, 3);
    const material = new THREE.MeshPhysicalMaterial({
      transmission: 1,
      thickness: 1.5,
      roughness: 0.18,
      ior: 1.35,
      metalness: 0,
      clearcoat: 1,
      clearcoatRoughness: 0.25,
      iridescence: 1,
      iridescenceIOR: 1.3,
      attenuationColor: new THREE.Color("#7fb4e6"),
      attenuationDistance: 2.6,
      color: new THREE.Color("#eaf4ff"),
      envMapIntensity: 1.25,
      transparent: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(4, 5, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x9cc4ff, 1.3);
    rim.position.set(-6, -2, -4);
    scene.add(rim);

    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      target.x = e.clientX / window.innerWidth - 0.5;
      target.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    const clock = new THREE.Clock();
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();
      cur.x += (target.x - cur.x) * 0.05;
      cur.y += (target.y - cur.y) * 0.05;
      const spin = reduced ? 0 : t;
      mesh.rotation.y = spin * 0.25 + cur.x * 0.9;
      mesh.rotation.x = spin * 0.12 + cur.y * 0.6;
      mesh.position.y = reduced ? 0 : Math.sin(t * 0.8) * 0.1;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      geometry.dispose();
      material.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}

"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

interface Building3DProps {
  className?: string;
  /** "assemble" — parts fly in and stack on mount; "orbit" — rotates with scroll progress */
  variant?: "assemble" | "orbit";
  /** for orbit variant: a ref holding 0..1 scroll progress */
  progress?: React.MutableRefObject<number>;
}

/**
 * Procedurally generated, twisting glass skyscraper (three.js).
 * Transparent background so it floats over the sky shader.
 */
export function Building3D({
  className,
  variant = "assemble",
  progress,
}: Building3DProps) {
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
    renderer.toneMappingExposure = 1.05;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 1.5, 20.5);
    camera.lookAt(0, 0, 0);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;

    // Procedural glass-facade window texture (lit windows on a tinted curtain wall)
    const makeFacade = () => {
      const c = document.createElement("canvas");
      c.width = 128;
      c.height = 256;
      const ctx = c.getContext("2d")!;
      // mullion base
      const grd = ctx.createLinearGradient(0, 0, 0, c.height);
      grd.addColorStop(0, "#173a5e");
      grd.addColorStop(1, "#0f2742");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, c.width, c.height);
      const cols = 8;
      const rows = 16;
      const gw = c.width / cols;
      const gh = c.height / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const lit = Math.random();
          if (lit > 0.62) {
            ctx.fillStyle =
              lit > 0.9 ? "rgba(214,238,255,0.95)" : "rgba(150,200,240,0.7)";
          } else {
            ctx.fillStyle = "rgba(40,78,120,0.55)";
          }
          ctx.fillRect(x * gw + 1.2, y * gh + 1.2, gw - 2.4, gh - 2.4);
        }
      }
      const tex = new THREE.CanvasTexture(c);
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(2, 2);
      return tex;
    };
    const facadeTex = makeFacade();

    // Lights
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(7, 14, 9);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x8fc0ec, 1.7);
    rim.position.set(-9, 5, -7);
    scene.add(rim);
    const fill = new THREE.PointLight(0x3ad0c6, 1.1, 40);
    fill.position.set(0, -2, 8);
    scene.add(fill);
    scene.add(new THREE.AmbientLight(0xbcd8ff, 0.55));

    // Materials
    const glass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color("#dbeefb"),
      map: facadeTex,
      emissive: new THREE.Color("#9cc7ec"),
      emissiveMap: facadeTex,
      emissiveIntensity: 0.55,
      metalness: 0.2,
      roughness: 0.12,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      envMapIntensity: 1.6,
      transparent: true,
      opacity: 0.96,
      side: THREE.DoubleSide,
    });
    const slab = new THREE.MeshStandardMaterial({
      color: "#ffffff",
      metalness: 0.25,
      roughness: 0.45,
    });
    const accent = new THREE.MeshStandardMaterial({
      color: "#0F4C81",
      metalness: 0.6,
      roughness: 0.28,
      emissive: new THREE.Color("#0F4C81"),
      emissiveIntensity: 0.25,
    });

    const group = new THREE.Group();
    scene.add(group);

    const FLOORS = 22;
    const FH = 0.5;
    const baseW = 3.5;
    const baseD = 3.0;
    const twist = (Math.PI / 180) * 2.6; // per floor
    const totalH = (FLOORS - 1) * FH;

    type Part = {
      mesh: THREE.Group;
      tPos: THREE.Vector3;
      tRot: number;
      sPos: THREE.Vector3;
      sRot: THREE.Euler;
    };
    const parts: Part[] = [];

    for (let i = 0; i < FLOORS; i++) {
      const fl = new THREE.Group();
      const taper = 1 - (i / FLOORS) * 0.4;
      const w = baseW * taper;
      const d = baseD * taper;

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(w, FH * 0.84, d),
        glass
      );
      fl.add(body);

      const edge = new THREE.Mesh(
        new THREE.BoxGeometry(w * 1.05, FH * 0.14, d * 1.05),
        slab
      );
      edge.position.y = FH * 0.49;
      fl.add(edge);

      if (i % 4 === 0) {
        const fin = new THREE.Mesh(
          new THREE.BoxGeometry(w * 1.08, FH * 0.05, 0.07),
          accent
        );
        fin.position.set(0, FH * 0.1, d * 0.53);
        fl.add(fin);
      }

      const y = i * FH;
      fl.position.set(0, y, 0);
      fl.rotation.y = i * twist;

      // scattered start state
      const ang = Math.random() * Math.PI * 2;
      const rad = 6 + Math.random() * 8;
      const sPos = new THREE.Vector3(
        Math.cos(ang) * rad,
        y + (Math.random() - 0.5) * 12,
        Math.sin(ang) * rad - 2
      );
      const sRot = new THREE.Euler(
        (Math.random() - 0.5) * 2.4,
        (Math.random() - 0.5) * 3.4,
        (Math.random() - 0.5) * 2.4
      );

      group.add(fl);
      parts.push({
        mesh: fl,
        tPos: new THREE.Vector3(0, y, 0),
        tRot: i * twist,
        sPos,
        sRot,
      });
    }

    // crown spire
    const spire = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.14, 2.4, 12),
      accent
    );
    spire.position.y = totalH + 1.15;
    group.add(spire);

    const baseY = -totalH / 2;
    group.position.y = baseY;

    // mouse parallax
    const mouse = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("mousemove", onMove);

    const easeInOut = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const tmp = new THREE.Vector3();
    const setAssembly = (a: number) => {
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const stagger = (i / parts.length) * 0.5;
        let local = (a - stagger) / 0.5;
        local = Math.min(Math.max(local, 0), 1);
        const e = 1 - Math.pow(1 - local, 3);
        tmp.copy(p.sPos).lerp(p.tPos, e);
        p.mesh.position.copy(tmp);
        p.mesh.rotation.set(
          THREE.MathUtils.lerp(p.sRot.x, 0, e),
          THREE.MathUtils.lerp(p.sRot.y, p.tRot, e),
          THREE.MathUtils.lerp(p.sRot.z, 0, e)
        );
      }
      spire.visible = a > 0.96;
    };

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

    const startTime = performance.now();
    const ASSEMBLE_MS = 2900;
    let raf = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();

      if (variant === "assemble") {
        // scroll-driven build-up when a progress ref is supplied, else time-based
        let a;
        if (progress) {
          a = reduced ? 1 : Math.min(Math.max(progress.current, 0), 1);
        } else {
          a = reduced ? 1 : Math.min((now - startTime) / ASSEMBLE_MS, 1);
        }
        setAssembly(easeInOut(a));
      } else {
        setAssembly(1);
      }

      cur.x += (mouse.x - cur.x) * 0.05;
      cur.y += (mouse.y - cur.y) * 0.05;

      if (variant === "orbit") {
        const p = progress ? progress.current : 0;
        group.rotation.y = (p - 0.5) * Math.PI * 1.7 + cur.x * 0.5;
        group.rotation.x = cur.y * 0.12;
        group.position.y = baseY;
      } else {
        const spin = reduced ? 0.3 : ((now - startTime) / 1000) * 0.1 + 0.3;
        group.rotation.y = spin + cur.x * 0.5;
        group.rotation.x = cur.y * 0.08;
        group.position.y =
          baseY + (reduced ? 0 : Math.sin((now / 1000) * 0.6) * 0.18);
      }

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      facadeTex.dispose();
      glass.dispose();
      slab.dispose();
      accent.dispose();
      group.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
      });
      envTex.dispose();
      pmrem.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, [variant, progress]);

  return <canvas ref={canvasRef} className={className} />;
}

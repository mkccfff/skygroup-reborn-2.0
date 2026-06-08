"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Tint = "sky" | "deep" | "dawn";

interface WebGLShaderProps {
  className?: string;
  tint?: Tint;
  speed?: number;
}

const PALETTES: Record<
  Tint,
  { top: number[]; bottom: number[]; cloud: number[]; glow: number[] }
> = {
  // Light, airy daytime sky (hero)
  sky: {
    top: [0.36, 0.62, 0.86],
    bottom: [0.83, 0.91, 0.97],
    cloud: [0.99, 0.995, 1.0],
    glow: [1.0, 0.93, 0.82],
  },
  // Deep premium twilight (dark sections)
  deep: {
    top: [0.03, 0.07, 0.13],
    bottom: [0.05, 0.16, 0.27],
    cloud: [0.12, 0.3, 0.45],
    glow: [0.25, 0.55, 0.85],
  },
  // Warm horizon
  dawn: {
    top: [0.18, 0.33, 0.55],
    bottom: [0.85, 0.6, 0.42],
    cloud: [0.98, 0.86, 0.78],
    glow: [1.0, 0.78, 0.5],
  },
};

export function WebGLShader({
  className,
  tint = "sky",
  speed = 1,
}: WebGLShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const pal = PALETTES[tint];

    const vertexShader = `
      attribute vec3 position;
      void main() { gl_Position = vec4(position, 1.0); }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform vec3 colTop;
      uniform vec3 colBottom;
      uniform vec3 colCloud;
      uniform vec3 colGlow;

      float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
      float noise(vec2 p){
        vec2 i = floor(p); vec2 f = fract(p);
        float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
        vec2 u = f*f*(3.-2.*f);
        return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
      }
      float fbm(vec2 p){
        float v = 0.0; float a = 0.55;
        mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
        for(int i=0;i<6;i++){ v += a*noise(p); p = m*p; a *= 0.5; }
        return v;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = uv; p.x *= resolution.x/resolution.y;
        float t = time*0.03;

        vec3 col = mix(colBottom, colTop, pow(clamp(uv.y,0.0,1.0), 0.85));

        float c1 = fbm(p*2.3 + vec2(t*1.7, t*0.4));
        float clouds = fbm(p*2.0 + c1*1.25 + vec2(-t, t*0.32));
        float cloudMask = smoothstep(0.34, 0.96, clouds);
        col = mix(col, colCloud, cloudMask*0.82);

        vec2 sun = vec2(0.5*resolution.x/resolution.y, 0.30);
        float g = exp(-length(p-sun)*2.4);
        col += colGlow*g*0.45;

        float vig = smoothstep(1.3, 0.25, length(uv-0.5));
        col *= mix(0.82, 1.06, vig);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    } catch (err) {
      console.warn("WebGLShader: context unavailable", err);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);

    const uniforms = {
      resolution: { value: [1, 1] },
      time: { value: 0 },
      colTop: { value: pal.top },
      colBottom: { value: pal.bottom },
      colCloud: { value: pal.cloud },
      colGlow: { value: pal.glow },
    };

    const position = [
      -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0,
    ];
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(new Float32Array(position), 3)
    );

    const material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      uniforms.resolution.value = [
        w * Math.min(window.devicePixelRatio, 2),
        h * Math.min(window.devicePixelRatio, 2),
      ];
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    let visible = !document.hidden;
    const animate = () => {
      if (visible) {
        uniforms.time.value += 0.01 * speed;
        renderer.render(scene, camera);
      }
      raf = requestAnimationFrame(animate);
    };
    const onVis = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVis);

    if (reduced) {
      uniforms.time.value = 12.0;
      renderer.render(scene, camera);
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      geometry.dispose();
      material.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, [tint, speed]);

  return <canvas ref={canvasRef} className={className} />;
}

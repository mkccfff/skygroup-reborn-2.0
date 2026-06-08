"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

interface AuroraShaderProps {
  className?: string;
  speed?: number;
}

/**
 * Flowing, silky light-toned aurora gradient (brand blue/teal over near-white).
 * Distinct from the hero cloud shader — used for the CTA finale.
 */
export function AuroraShader({ className, speed = 1 }: AuroraShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const vertexShader = `
      attribute vec3 position;
      void main() { gl_Position = vec4(position, 1.0); }
    `;

    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;

      float hash(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
      float noise(vec2 p){
        vec2 i=floor(p), f=fract(p);
        float a=hash(i),b=hash(i+vec2(1.,0.)),c=hash(i+vec2(0.,1.)),d=hash(i+vec2(1.,1.));
        vec2 u=f*f*(3.-2.*f);
        return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y;
      }
      float fbm(vec2 p){
        float v=0.,a=.55; mat2 m=mat2(1.6,1.2,-1.2,1.6);
        for(int i=0;i<5;i++){ v+=a*noise(p); p=m*p; a*=.5; }
        return v;
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec2 p = uv; p.x *= resolution.x/resolution.y;
        float t = time*0.05;

        float n = fbm(p*1.7 + vec2(t, t*0.3));
        float flow = fbm(p*2.2 + n*1.4 + vec2(-t*0.8, t*0.5));

        vec3 light = vec3(0.93, 0.965, 0.99);
        vec3 blue  = vec3(0.059, 0.298, 0.506);
        vec3 teal  = vec3(0.094, 0.357, 0.412);

        float bands = 0.5 + 0.5*sin((uv.y*2.4 + flow*2.6 + t*1.4)*3.14159);
        vec3 col = mix(light, mix(blue, teal, uv.x + n*0.2), bands*0.6);

        // soft moving streaks
        float streak = smoothstep(0.45, 0.0, abs(fract(uv.x*1.6 + flow + t)-0.5));
        col += vec3(0.35,0.6,0.85)*streak*0.06;

        // gentle vignette toward light
        float vig = smoothstep(1.25, 0.2, length(uv-0.5));
        col = mix(col, light, (1.0-vig)*0.25);

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1);
    const uniforms = {
      resolution: { value: [1, 1] },
      time: { value: 0 },
    };
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(
        new Float32Array([
          -1, -1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0,
        ]),
        3
      )
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
      const dpr = Math.min(window.devicePixelRatio, 2);
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      renderer.setSize(w, h, false);
      uniforms.resolution.value = [w * dpr, h * dpr];
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    let raf = 0;
    const animate = () => {
      uniforms.time.value += 0.01 * speed;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    if (reduced) {
      uniforms.time.value = 8;
      renderer.render(scene, camera);
    } else {
      animate();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, [speed]);

  return <canvas ref={canvasRef} className={className} />;
}

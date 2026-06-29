"use client";
import { useEffect, useRef } from "react";

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let cleanup: (() => void) | undefined;

    import("three").then((THREE) => {
      const W = window.innerWidth, H = window.innerHeight;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
      camera.position.set(0, 2, 8);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      // ── Galaxy particle system ──
      const COUNT = 3500;
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      const purple = new THREE.Color("#9B6DFF");
      const coral = new THREE.Color("#F28B82");
      const blue = new THREE.Color("#38bdf8");

      for (let i = 0; i < COUNT; i++) {
        const arm = Math.floor(Math.random() * 3);
        const angle = (arm / 3) * Math.PI * 2 + Math.random() * 0.8;
        const radius = Math.pow(Math.random(), 0.5) * 5 + 0.3;
        const spin = radius * 0.5;
        const spread = (1 - Math.pow(Math.random(), 2)) * 0.8;

        positions[i * 3]     = Math.cos(angle + spin) * radius + (Math.random() - 0.5) * spread;
        positions[i * 3 + 1] = (Math.random() - 0.5) * (0.5 - radius * 0.06);
        positions[i * 3 + 2] = Math.sin(angle + spin) * radius + (Math.random() - 0.5) * spread;

        const t = radius / 5;
        const c = t < 0.5 ? purple.clone().lerp(coral, t * 2) : coral.clone().lerp(blue, (t - 0.5) * 2);
        c.multiplyScalar(0.6 + Math.random() * 0.4);
        colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const mat = new THREE.PointsMaterial({
        size: 0.045, vertexColors: true,
        transparent: true, opacity: 0.85,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const galaxy = new THREE.Points(geo, mat);
      scene.add(galaxy);

      // ── Floating wireframe sphere ──
      const sphereGeo = new THREE.IcosahedronGeometry(1.2, 2);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x9B6DFF, wireframe: true, transparent: true, opacity: 0.08 });
      const sphere = new THREE.Mesh(sphereGeo, wireMat);
      sphere.position.set(3, 0.5, -1);
      scene.add(sphere);

      // ── Second smaller wireframe ──
      const sphere2 = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.7, 1),
        new THREE.MeshBasicMaterial({ color: 0xF28B82, wireframe: true, transparent: true, opacity: 0.1 })
      );
      sphere2.position.set(-3, -0.5, -2);
      scene.add(sphere2);

      // ── Fog for depth ──
      scene.fog = new THREE.FogExp2(0x07070a, 0.06);

      // Mouse
      let mx = 0, my = 0;
      const onMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth - 0.5) * 2;
        my = -(e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener("mousemove", onMove);

      // Resize
      const onResize = () => {
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      // Animate
      let raf: number;
      const clock = new THREE.Clock();
      const animate = () => {
        raf = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Galaxy slow rotation
        galaxy.rotation.y = t * 0.04;
        galaxy.rotation.x = Math.sin(t * 0.015) * 0.1;

        // Camera drift with mouse
        camera.position.x += (mx * 1.5 - camera.position.x) * 0.02;
        camera.position.y += (my * 0.8 + 2 - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        // Spheres
        sphere.rotation.x = t * 0.3; sphere.rotation.y = t * 0.5;
        sphere2.rotation.x = -t * 0.4; sphere2.rotation.y = -t * 0.3;
        sphere.position.y = 0.5 + Math.sin(t * 0.7) * 0.3;
        sphere2.position.y = -0.5 + Math.cos(t * 0.5) * 0.3;

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    });

    return () => cleanup?.();
  }, []);

  return (
    <div ref={mountRef} style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.55,
    }} />
  );
}

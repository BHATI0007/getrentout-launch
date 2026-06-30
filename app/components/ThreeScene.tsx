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

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(W, H);
      renderer.setClearColor(0x000000, 0);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      mount.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(65, W / H, 0.1, 200);
      camera.position.set(0, 3.5, 10);
      camera.lookAt(0, 0, 0);

      // ── Circular soft glow particle texture ──
      const makeSprite = () => {
        const c = document.createElement("canvas");
        c.width = 64; c.height = 64;
        const ctx = c.getContext("2d")!;
        const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        g.addColorStop(0, "rgba(255,255,255,1)");
        g.addColorStop(0.3, "rgba(255,255,255,0.8)");
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, 64, 64);
        return new THREE.CanvasTexture(c);
      };
      const sprite = makeSprite();

      // ── Galaxy formation ──
      const COUNT = 4000;
      const positions = new Float32Array(COUNT * 3);
      const colors = new Float32Array(COUNT * 3);
      const sizes = new Float32Array(COUNT);

      const purple = new THREE.Color("#9B6DFF");
      const coral  = new THREE.Color("#F28B82");
      const blue   = new THREE.Color("#60A5FA");
      const white  = new THREE.Color("#ffffff");

      for (let i = 0; i < COUNT; i++) {
        const arm   = i % 3;
        const t     = Math.pow(Math.random(), 0.45); // cluster toward center
        const radius = t * 6 + 0.2;
        const spinAngle  = radius * 0.55;
        const armAngle   = (arm / 3) * Math.PI * 2;
        const angle = armAngle + spinAngle;
        const scatter = Math.pow(1 - t, 2) * 1.2;

        positions[i*3]   = Math.cos(angle) * radius + (Math.random()-0.5) * scatter;
        positions[i*3+1] = (Math.random()-0.5) * (scatter * 0.4 + 0.1);
        positions[i*3+2] = Math.sin(angle) * radius + (Math.random()-0.5) * scatter;

        // Color: bright white at center, purple arms, coral+blue tips
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let col: any;
        if (t < 0.15) col = white.clone().lerp(purple, t / 0.15);
        else if (t < 0.55) col = purple.clone().lerp(coral, (t - 0.15) / 0.4);
        else col = coral.clone().lerp(blue, (t - 0.55) / 0.45);
        col.multiplyScalar(0.55 + Math.random() * 0.45);

        colors[i*3] = col.r; colors[i*3+1] = col.g; colors[i*3+2] = col.b;
        sizes[i] = Math.random() * 2.5 + 0.5;
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
      geo.setAttribute("size",     new THREE.BufferAttribute(sizes, 1));

      const mat = new THREE.PointsMaterial({
        size: 0.12,
        map: sprite,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const galaxy = new THREE.Points(geo, mat);
      galaxy.rotation.x = Math.PI * 0.18; // tilt for 3D depth
      scene.add(galaxy);

      // ── Glowing core ──
      const coreMat = new THREE.PointsMaterial({
        size: 0.5, map: sprite, color: 0xffffff,
        transparent: true, opacity: 0.6,
        blending: THREE.AdditiveBlending, depthWrite: false,
      });
      const coreGeo = new THREE.BufferGeometry();
      const corePos = new Float32Array(150 * 3);
      for (let i = 0; i < 150; i++) {
        const r = Math.random() * 0.8;
        const a = Math.random() * Math.PI * 2;
        corePos[i*3]   = Math.cos(a) * r;
        corePos[i*3+1] = (Math.random()-0.5) * 0.3;
        corePos[i*3+2] = Math.sin(a) * r;
      }
      coreGeo.setAttribute("position", new THREE.BufferAttribute(corePos, 3));
      scene.add(new THREE.Points(coreGeo, coreMat));

      // ── Floating wireframe shapes ──
      const addWire = (size: number, x: number, y: number, z: number, col: number) => {
        const mesh = new THREE.Mesh(
          new THREE.IcosahedronGeometry(size, 1),
          new THREE.MeshBasicMaterial({ color: col, wireframe: true, transparent: true, opacity: 0.09 })
        );
        mesh.position.set(x, y, z);
        scene.add(mesh);
        return mesh;
      };
      const w1 = addWire(1.0, 4, 0.5, -2, 0x9B6DFF);
      const w2 = addWire(0.6, -3.5, -0.3, -1, 0xF28B82);
      const w3 = addWire(0.8, 0.5, 1.5, -4, 0x60A5FA);

      // Fog
      scene.fog = new THREE.FogExp2(0x000000, 0.018);

      // ── Interaction ──
      let mx = 0, my = 0, scrollY = 0;
      const onMove = (e: MouseEvent) => {
        mx = (e.clientX / window.innerWidth  - 0.5) * 2;
        my = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      const onScroll = () => { scrollY = window.scrollY; };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("scroll", onScroll, { passive: true });

      const onResize = () => {
        const w = window.innerWidth, h = window.innerHeight;
        camera.aspect = w / h; camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      // ── Animate ──
      let raf: number;
      const clock = new THREE.Clock();
      let camX = 0, camY = 3.5, camZ = 10;

      const animate = () => {
        raf = requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        // Galaxy slow rotation
        galaxy.rotation.y = t * 0.035;

        // Camera: mouse drift + scroll zoom-in (capped so galaxy stays visible)
        const scrollClamped = Math.min(scrollY, 1800);
        const targetX = mx * 2;
        const targetY = 3.5 - my * 0.8 + scrollClamped * 0.0008;
        const targetZ = Math.max(4, 10 - scrollClamped * 0.003);

        camX += (targetX - camX) * 0.025;
        camY += (targetY - camY) * 0.025;
        camZ += (targetZ - camZ) * 0.025;

        camera.position.set(camX, camY, camZ);
        camera.lookAt(0, 0.5, 0); // look slightly above center so galaxy stays framed

        // Wireframes orbit
        w1.rotation.x = t * 0.25; w1.rotation.y = t * 0.4;
        w2.rotation.x = -t * 0.3; w2.rotation.y = -t * 0.25;
        w3.rotation.x = t * 0.2;  w3.rotation.z = t * 0.3;
        w1.position.y = 0.5 + Math.sin(t * 0.6) * 0.4;
        w2.position.y = -0.3 + Math.cos(t * 0.5) * 0.35;
        w3.position.y = 1.5 + Math.sin(t * 0.4) * 0.3;

        renderer.render(scene, camera);
      };
      animate();

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onResize);
        renderer.dispose(); sprite.dispose(); geo.dispose(); mat.dispose();
        if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
      };
    });

    return () => cleanup?.();
  }, []);

  return (
    <div ref={mountRef} style={{
      position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.75,
    }} />
  );
}

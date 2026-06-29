"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const BrandLogo = ({ src, alt }: { src: string; alt: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={src} alt={alt} width={28} height={28} style={{ display: "block" }} />
);

const Icons = {
  whatsapp: <BrandLogo src="https://cdn.simpleicons.org/whatsapp/ffffff" alt="WhatsApp" />,
  facebook: <BrandLogo src="https://cdn.simpleicons.org/facebook/ffffff" alt="Facebook" />,
  instagram: <BrandLogo src="https://cdn.simpleicons.org/instagram/ffffff" alt="Instagram" />,
  twitter: <BrandLogo src="https://cdn.simpleicons.org/x/ffffff" alt="X" />,
  telegram: <BrandLogo src="https://cdn.simpleicons.org/telegram/ffffff" alt="Telegram" />,
  reddit: <BrandLogo src="https://cdn.simpleicons.org/reddit/ffffff" alt="Reddit" />,
  linkedin: <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  tiktok: <BrandLogo src="https://cdn.simpleicons.org/tiktok/ffffff" alt="TikTok" />,
  email: <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>,
  copy: <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>,
};

const TOTAL = 100000;
const CLOSE_DATE = new Date("2026-07-19T23:59:59");

function useSpots() {
  const [spots, setSpots] = useState(TOTAL);
  useEffect(() => {
    const go = () => fetch("/api/spots").then(r => r.json()).then(d => setSpots(d.remaining)).catch(() => {});
    go();
    const id = setInterval(go, 30000);
    return () => clearInterval(id);
  }, []);
  return spots;
}

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function useCursorGlow() {
  useEffect(() => {
    const el = document.getElementById("cursor-glow");
    if (!el) return;
    const move = (e: MouseEvent) => { el.style.left = e.clientX + "px"; el.style.top = e.clientY + "px"; };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
}

/* ── WebGL Shader Background ── */
function ShaderBackground() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl");
    if (!gl) return;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src); gl.compileShader(s); return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, `
      precision mediump float;
      uniform float t; uniform vec2 res; uniform vec2 mouse;
      void main(){
        vec2 uv=gl_FragCoord.xy/res;
        vec2 m=mouse/res;
        float x=uv.x+sin(uv.y*4.+t*.4)*.09+(m.x-.5)*.06;
        float y=uv.y+cos(uv.x*3.+t*.28)*.09+(m.y-.5)*.06;
        float r=.09*sin(x*6.+t*1.1)*sin(y*4.+t*.7);
        float g=.03*sin(x*4.+t*.9)+.01;
        float b=.16*sin(x*5.+y*3.+t*.65);
        float glow=.07*(1.-smoothstep(0.,.4,length(uv-m)));
        gl_FragColor=vec4(r+glow*.5,g+glow*.08,b+glow,1.);
      }
    `));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uT=gl.getUniformLocation(prog,"t"), uR=gl.getUniformLocation(prog,"res"), uM=gl.getUniformLocation(prog,"mouse");
    let mx=canvas.width/2, my=canvas.height/2;
    const onMove=(e:MouseEvent)=>{mx=e.clientX;my=canvas.height-e.clientY;};
    window.addEventListener("mousemove",onMove);
    gl.uniform2f(uR,canvas.width,canvas.height);
    const t0=Date.now(); let raf:number;
    const draw=()=>{ gl.uniform1f(uT,(Date.now()-t0)/1000); gl.uniform2f(uM,mx,my); gl.drawArrays(gl.TRIANGLE_STRIP,0,4); raf=requestAnimationFrame(draw); };
    draw();
    const onResize=()=>{ canvas.width=window.innerWidth; canvas.height=window.innerHeight; gl.viewport(0,0,canvas.width,canvas.height); gl.uniform2f(uR,canvas.width,canvas.height); };
    window.addEventListener("resize",onResize);
    return ()=>{ cancelAnimationFrame(raf); window.removeEventListener("mousemove",onMove); window.removeEventListener("resize",onResize); };
  },[]);
  return <canvas ref={ref} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,opacity:0.35}}/>;
}

/* ── Live activity toasts ── */
type ActivityItem = { firstName: string; city: string; ago: number };
function ActivityToast() {
  const [item, setItem] = useState<ActivityItem|null>(null);
  const [phase, setPhase] = useState<"in"|"out"|"hidden">("hidden");
  const dataRef = useRef<ActivityItem[]>([]);
  const idxRef = useRef(0);
  useEffect(() => {
    fetch("/api/activity").then(r=>r.json()).then(d=>{ dataRef.current=d.activity??[]; });
    const show=()=>{
      const items=dataRef.current; if(!items.length) return;
      const it=items[idxRef.current%items.length]; idxRef.current++;
      setItem(it); setPhase("in");
      setTimeout(()=>setPhase("out"),3500);
      setTimeout(()=>setPhase("hidden"),3950);
    };
    const id=setInterval(show,6000);
    setTimeout(show,4000);
    return ()=>clearInterval(id);
  },[]);
  if(phase==="hidden"||!item) return null;
  return (
    <div className={`activity-toast ${phase}`}>
      <div style={{width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#9B6DFF,#F28B82)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0}}>
        {item.firstName[0]}
      </div>
      <div>
        <p style={{fontSize:13,fontWeight:700,color:"#e0e0f0",margin:0}}>{item.firstName} from {item.city}</p>
        <p style={{fontSize:11,color:"#8888aa",margin:0}}>{item.ago < 2 ? "just joined" : `joined ${item.ago}m ago`}</p>
      </div>
      <span style={{fontSize:10,marginLeft:"auto",color:"#22c55e"}}>●</span>
    </div>
  );
}

/* ── World map SVG ── */
function WorldMap({ signups }: { signups: {city:string;lat:number;lng:number}[] }) {
  const dots = [
    {lat:28.6,lng:77.2},{lat:19.07,lng:72.87},{lat:12.97,lng:77.59},{lat:22.57,lng:88.36},
    {lat:51.5,lng:-0.12},{lat:40.71,lng:-74.0},{lat:37.77,lng:-122.4},{lat:35.68,lng:139.69},
    {lat:-33.87,lng:151.2},{lat:48.85,lng:2.35},{lat:52.52,lng:13.4},{lat:55.75,lng:37.62},
    {lat:31.23,lng:121.47},{lat:1.35,lng:103.82},{lat:-23.55,lng:-46.63},
  ];
  const project=(lat:number,lng:number)=>({
    x:(lng+180)/360*300, y:(90-lat)/180*150,
  });
  return (
    <svg viewBox="0 0 300 150" style={{width:"100%",opacity:0.6}}>
      <rect width="300" height="150" fill="transparent"/>
      {dots.map((d,i)=>{const p=project(d.lat,d.lng);return(
        <g key={i} transform={`translate(${p.x},${p.y})`}>
          <circle r="1.5" fill="#9B6DFF" opacity="0.9"/>
          <circle r="1.5" fill="#9B6DFF" opacity="0.5" className="map-dot-ring" style={{animationDelay:`${i*0.3}s`}}/>
        </g>
      );})}
    </svg>
  );
}

/* ── Sparkline ── */
function Sparkline({ position }: { position: number }) {
  const points = Array.from({length:8},(_,i)=>{
    const decay = Math.pow(0.75, 7-i);
    return Math.round(position + (7-i)*12*decay + Math.sin(i)*3);
  });
  const max=Math.max(...points), min=Math.min(...points,position);
  const W=120,H=32;
  const px=(i:number)=>(i/(points.length-1))*W;
  const py=(v:number)=>H-((v-min)/(max-min||1))*(H-4)-2;
  const d=points.map((v,i)=>`${i===0?"M":"L"}${px(i)},${py(v)}`).join(" ")+` L${W},${py(position)}`;
  return (
    <svg width={W} height={H} style={{overflow:"visible"}}>
      <defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0%" stopColor="#9B6DFF"/><stop offset="100%" stopColor="#F28B82"/></linearGradient></defs>
      <path d={d} fill="none" stroke="url(#sg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={W} cy={py(position)} r="3" fill="#F28B82"/>
    </svg>
  );
}

/* ── Preloader ── */
function Preloader({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setExiting(true); setTimeout(onDone, 550); }, 1300);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`preloader${exiting ? " exit" : ""}`}>
      <Image src="/logo.png" alt="RentOut" width={52} height={52} style={{ borderRadius: 15, opacity: 0.95 }} />
      <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", color: "#f0f0fa" }}>RentOut</div>
      <div className="preloader-bar"><div className="preloader-bar-inner" /></div>
    </div>
  );
}

/* ── Particle field ── */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);
    const mouse = { x: -999, y: -999 };
    const pts = Array.from({ length: 48 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
    }));
    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", onMove);
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
        if (d < 140) { p.vx += dx * 0.00018; p.vy += dy * 0.00018; }
        const speed = Math.hypot(p.vx, p.vy);
        if (speed > 1) { p.vx /= speed; p.vy /= speed; }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(155,109,255,0.55)"; ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 110) {
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y);
          ctx.strokeStyle = `rgba(155,109,255,${0.12 * (1 - d / 110)})`; ctx.lineWidth = 0.6; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.3 }} />;
}

/* ── Done screen count-up ── */
function CountUpTo({ target }: { target: number }) {
  const [n, setN] = useState(1);
  useEffect(() => {
    const dur = 1000; const t0 = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - t0) / dur, 1);
      setN(Math.max(1, Math.round((1 - Math.pow(1 - p, 3)) * target)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target]);
  return <>{n.toLocaleString()}</>;
}

/* ── Spring cursor ── */
function useSpringCursor() {
  useEffect(() => {
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!dot || !ring) return;
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + "px"; dot.style.top = my + "px";
    };
    const onDown = () => ring.classList.add("clicking");
    const onUp = () => ring.classList.remove("clicking");
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    let raf: number;
    const tick = () => {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + "px"; ring.style.top = ry + "px";
      raf = requestAnimationFrame(tick);
    };
    tick();
    const els = document.querySelectorAll("a, button");
    const enter = () => { dot.classList.add("hovered"); ring.classList.add("hovered"); };
    const leave = () => { dot.classList.remove("hovered"); ring.classList.remove("hovered"); };
    els.forEach(el => { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("mousedown", onDown); window.removeEventListener("mouseup", onUp); };
  }, []);
}

/* ── Gyroscope parallax ── */
function useGyroscope() {
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const blobs = document.querySelector(".aurora-parallax") as HTMLElement | null;
      if (!blobs) return;
      const x = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 25));
      const y = Math.max(-1, Math.min(1, ((e.beta ?? 0) - 30) / 25));
      blobs.style.transform = `translate(${x * 28}px, ${y * 18}px)`;
    };
    window.addEventListener("deviceorientation", handler);
    return () => window.removeEventListener("deviceorientation", handler);
  }, []);
}

/* ── Ambient hover particles from CTA ── */
function useAmbientParticles() {
  useEffect(() => {
    const btn = document.querySelector(".cta-border-wrap") as HTMLElement | null;
    if (!btn) return;
    let interval: ReturnType<typeof setInterval> | null = null;
    const emit = () => {
      const r = btn.getBoundingClientRect();
      const el = document.createElement("div");
      const x = r.left + Math.random() * r.width;
      const y = r.top + Math.random() * r.height;
      const colors = ["#9B6DFF", "#F28B82", "#c87dff", "#38bdf8"];
      el.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:4px;height:4px;border-radius:50%;background:${colors[Math.floor(Math.random() * colors.length)]};pointer-events:none;z-index:9997;transition:all 0.8s ease-out;transform:translate(-50%,-50%)`;
      document.body.appendChild(el);
      requestAnimationFrame(() => {
        el.style.transform = `translate(calc(-50% + ${(Math.random() - 0.5) * 60}px), calc(-50% - ${Math.random() * 60 + 20}px))`;
        el.style.opacity = "0";
      });
      setTimeout(() => el.remove(), 900);
    };
    const start = () => { interval = setInterval(emit, 80); };
    const stop = () => { if (interval) { clearInterval(interval); interval = null; } };
    btn.addEventListener("mouseenter", start);
    btn.addEventListener("mouseleave", stop);
    return () => { btn.removeEventListener("mouseenter", start); btn.removeEventListener("mouseleave", stop); stop(); };
  }, []);
}

/* ── View Transitions API ── */
function transitionTo(cb: () => void) {
  if ((document as any).startViewTransition) {
    (document as any).startViewTransition(cb);
  } else {
    cb();
  }
}

function useKonami(cb: () => void) {
  useEffect(() => {
    const seq = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
    let i = 0;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === seq[i]) { i++; if (i === seq.length) { cb(); i = 0; } }
      else i = e.key === seq[0] ? 1 : 0;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cb]);
}

function use3DHeroTilt() {
  useEffect(() => {
    const hero = document.querySelector(".hero-tilt") as HTMLElement|null;
    if (!hero) return;
    const move = (e: MouseEvent) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) / r.width;
      const y = (e.clientY - r.top - r.height/2) / r.height;
      hero.style.transform = `perspective(1200px) rotateX(${-y*4}deg) rotateY(${x*4}deg)`;
    };
    const leave = () => { hero.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)"; };
    hero.addEventListener("mousemove", move);
    hero.addEventListener("mouseleave", leave);
    return () => { hero.removeEventListener("mousemove", move); hero.removeEventListener("mouseleave", leave); };
  }, []);
}

function useScrollJack() {
  useEffect(() => {
    const el = document.querySelector(".hero-jacked") as HTMLElement|null;
    if (!el) return;
    const onScroll = () => {
      const s = window.scrollY;
      el.style.transform = `scale(${Math.max(0.88, 1 - s * 0.0004)}) translateY(${-s * 0.15}px)`;
      el.style.opacity = String(Math.max(0, 1 - s * 0.0018));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

function useHaptic() {
  return () => { try { navigator.vibrate?.(8); } catch {} };
}

function useScrollProgress() {
  useEffect(() => {
    const bar = document.getElementById("scroll-progress");
    if (!bar) return;
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = total > 0 ? `${(window.scrollY / total) * 100}%` : "0%";
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
}

function useButtonRipple() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest(".btn-primary") as HTMLElement | null;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const el = document.createElement("div");
      el.className = "ripple-el";
      el.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
      btn.appendChild(el);
      setTimeout(() => el.remove(), 700);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

function useCursorTrail() {
  useEffect(() => {
    let last = 0;
    const move = (e: MouseEvent) => {
      const now = Date.now();
      if (now - last < 40) return;
      last = now;
      const el = document.createElement("div");
      el.className = "cursor-trail";
      el.style.left = e.clientX + "px";
      el.style.top = e.clientY + "px";
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 460);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
}

function useHeroShadow() {
  useEffect(() => {
    const hero = document.querySelector(".hero-line-1") as HTMLElement | null;
    if (!hero) return;
    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 24;
      const y = (e.clientY / window.innerHeight - 0.5) * 12;
      hero.style.textShadow = `${-x * 0.4}px ${-y * 0.4}px 0 rgba(155,109,255,0.18), ${-x * 0.8}px ${-y * 0.8}px 0 rgba(155,109,255,0.07)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
}

function useSoundOnClick() {
  useEffect(() => {
    let ctx: AudioContext | null = null;
    const play = (freq = 700) => {
      try {
        if (!ctx) ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.07, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.start(); osc.stop(ctx.currentTime + 0.13);
      } catch { /* AudioContext blocked */ }
    };
    const onClick = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest(".btn-primary")) play(800);
      else if (t.closest("button")) play(600);
      else if (t.closest("a")) play(500);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

function useMagneticButtons() {
  useEffect(() => {
    const btns = Array.from(document.querySelectorAll<HTMLElement>(".btn-primary"));
    const cleanup: (() => void)[] = [];
    btns.forEach(btn => {
      const move = (e: MouseEvent) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        const dist = Math.sqrt(x * x + y * y);
        if (dist < 90) {
          const pull = (1 - dist / 90) * 0.45;
          btn.style.transform = `translate(${x * pull}px,${y * pull}px)`;
          btn.style.transition = "transform 0.1s ease";
        }
      };
      const leave = () => {
        btn.style.transform = "";
        btn.style.transition = "transform 0.5s cubic-bezier(.16,1,.3,1)";
      };
      window.addEventListener("mousemove", move);
      btn.addEventListener("mouseleave", leave);
      cleanup.push(() => { window.removeEventListener("mousemove", move); btn.removeEventListener("mouseleave", leave); });
    });
    return () => cleanup.forEach(fn => fn());
  }, []);
}

function useNavGlass() {
  useEffect(() => {
    const nav = document.querySelector("nav");
    if (!nav) return;
    const onScroll = () => nav.classList.toggle("nav-scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

function useTextScramble(ref: React.RefObject<HTMLElement | null>, text: string, delay = 600) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&";
    let frame = 0;
    const total = text.length * 3 + 8;
    let raf: number;
    const timer = setTimeout(() => {
      const tick = () => {
        el.textContent = text.split("").map((ch, i) => {
          if (ch === " " || ch === ".") return ch;
          if (i < Math.floor(frame / 3)) return ch;
          return chars[Math.floor(Math.random() * chars.length)];
        }).join("");
        frame++;
        if (frame < total) raf = requestAnimationFrame(tick);
        else el.textContent = text;
      };
      raf = requestAnimationFrame(tick);
    }, delay);
    return () => { clearTimeout(timer); cancelAnimationFrame(raf); };
  }, [text, delay, ref]);
}

function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = ["#9B6DFF", "#F28B82", "#c87dff", "#ffffff", "#38bdf8", "#fbbf24"];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width, y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4, vy: Math.random() * 3 + 1.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      w: Math.random() * 8 + 4, h: Math.random() * 4 + 2,
      rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 12,
      opacity: 1,
    }));
    let frame = 0; let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.04; p.rot += p.rotV;
        if (frame > 80) p.opacity = Math.max(0, p.opacity - 0.012);
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (frame < 220) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 997 }} />;
}

function useParallax() {
  useEffect(() => {
    const blobs = document.querySelector(".aurora-parallax") as HTMLElement | null;
    if (!blobs) return;
    const move = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      blobs.style.transform = `translate(${x}px, ${y}px)`;
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);
}

function useCountdown() {
  const [t, setT] = useState({ d: 0, h: 0, m: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = CLOSE_DATE.getTime() - Date.now();
      if (diff <= 0) return;
      setT({ d: Math.floor(diff / 864e5), h: Math.floor((diff % 864e5) / 36e5), m: Math.floor((diff % 36e5) / 6e4) });
    };
    tick(); const id = setInterval(tick, 30000); return () => clearInterval(id);
  }, []);
  return t;
}

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true; io.disconnect();
      const t0 = Date.now(), dur = 1800;
      const tick = () => {
        const p = Math.min((Date.now() - t0) / dur, 1);
        setV(Math.round((1 - Math.pow(1 - p, 4)) * to));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.5 });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [to]);
  return <span ref={ref}>{v.toLocaleString()}</span>;
}

function Ticker({ value }: { value: number }) {
  const [d, setD] = useState(value);
  const [flash, setFlash] = useState(false);
  const prev = useRef(value);
  useEffect(() => {
    if (value === prev.current) return;
    setFlash(true);
    setTimeout(() => setFlash(false), 350);
    const diff = prev.current - value; let i = 0;
    const id = setInterval(() => {
      i++; setD(Math.round(prev.current - diff * (1 - Math.pow(1 - i / 40, 3))));
      if (i >= 40) { clearInterval(id); prev.current = value; }
    }, 16);
    return () => clearInterval(id);
  }, [value]);
  return <span key={flash ? "f" : "n"} className={flash ? "counter-flash" : ""}>{d.toLocaleString()}</span>;
}

const SERVICES = [
  { who: "Arjun", what: "FIFA gaming partner", price: "$6/hr", tag: "Gaming", c: "#9B6DFF" },
  { who: "Priya", what: "Portrait photographer", price: "$18/hr", tag: "Photography", c: "#F28B82" },
  { who: "Rohan", what: "Spanish conversation", price: "$8/hr", tag: "Language", c: "#38bdf8" },
  { who: "Sneha", what: "Watch-party companion", price: "$11/hr", tag: "Social", c: "#9B6DFF" },
  { who: "Karan", what: "City photo walk", price: "$12/hr", tag: "Travel", c: "#fb923c" },
  { who: "Ananya", what: "Fitness coach", price: "$10/session", tag: "Fitness", c: "#F28B82" },
  { who: "Dev", what: "Guitar lessons", price: "$7/hr", tag: "Music", c: "#9B6DFF" },
  { who: "Meera", what: "Study partner", price: "$5/hr", tag: "Tutoring", c: "#38bdf8" },
];


const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #1a1228, #120d1e)", border: "1px solid rgba(155,109,255,0.25)" }}>
      <Image src="/logo.png" alt="RentOut" width={32} height={32} style={{ borderRadius: 8 }} />
    </div>
    <span className="logo-text">RentOut</span>
  </div>
);

type V = "home" | "form" | "done";

export default function Page() {
  const [view, setView] = useState<V>("home");
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const [copied, setCopied] = useState(false);
  const [myRefCode, setMyRefCode] = useState<string | null>(null);
  const [refCode, setRefCode] = useState<string | null>(null);
  const [fields, setFields] = useState({ name: "", email: "", city: "" });
  const [errors, setErrors] = useState({ name: "", email: "", city: "" });
  const [showRankModal, setShowRankModal] = useState(false);
  const [rankEmail, setRankEmail] = useState("");
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState("");
  const scrambleRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [konamiActive, setKonamiActive] = useState(false);
  const [chargeLevel, setChargeLevel] = useState(0);
  const [viewerCount, setViewerCount] = useState(0);
  const [showExit, setShowExit] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [timeGreeting, setTimeGreeting] = useState("");
  const chargeTimer = useRef<ReturnType<typeof setInterval>|null>(null);
  const exitShown = useRef(false);
  const haptic = useHaptic();
  const starsRef = useRef(Array.from({ length: 32 }, (_, i) => ({
    id: i, left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 100}%`,
    size: (i % 3) * 0.8 + 0.6,
    dur: `${(i % 5) * 0.7 + 2}s`, del: `${(i % 7) * 0.5}s`,
  })));
  const spots = useSpots();
  const cd = useCountdown();
  const taken = TOTAL - spots;
  useReveal();
  useCursorGlow();
  useParallax();
  useMagneticButtons();
  useNavGlass();
  useScrollProgress();
  useButtonRipple();
  useCursorTrail();
  useHeroShadow();
  useSoundOnClick();
  useTextScramble(scrambleRef, "Sell anything.", 900);
  use3DHeroTilt();
  useScrollJack();
  useSpringCursor();
  useGyroscope();
  useAmbientParticles();

  // Time-aware greeting
  useEffect(() => {
    const h = new Date().getHours();
    setTimeGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening");
  }, []);

  // Viewer count (realistic simulation)
  useEffect(() => {
    const base = 12 + Math.floor(Math.random() * 8);
    setViewerCount(base);
    const id = setInterval(() => setViewerCount(v => v + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 2)), 7000);
    return () => clearInterval(id);
  }, []);

  // Exit intent
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.clientY <= 2 && !exitShown.current && view === "home") {
        exitShown.current = true; setShowExit(true);
      }
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, [view]);

  // Auto-detect city from IP
  useEffect(() => {
    if (view === "form" && !fields.city) {
      fetch("https://ipapi.co/city/").then(r => r.text()).then(city => {
        if (city && city.length < 40 && !city.includes("<")) setFields(p => ({ ...p, city }));
      }).catch(() => {});
    }
  }, [view]);

  // Idle CTA pulse
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const reset = () => { clearTimeout(t); setIsIdle(false); t = setTimeout(() => setIsIdle(true), 5000); };
    window.addEventListener("mousemove", reset); window.addEventListener("keydown", reset);
    reset();
    return () => { clearTimeout(t); window.removeEventListener("mousemove", reset); window.removeEventListener("keydown", reset); };
  }, []);
  useKonami(() => {
    setKonamiActive(true);
    haptic();
    setTimeout(() => setKonamiActive(false), 1600);
    // Rainbow confetti burst
    const colors = ["#9B6DFF","#F28B82","#38bdf8","#fbbf24","#34d399","#f472b6","#fff"];
    Array.from({length:120}).forEach((_,i) => {
      const el = document.createElement("div");
      el.className = "copy-particle";
      const angle = (i/120)*Math.PI*2;
      const dist = 80+Math.random()*200;
      el.style.cssText = `left:50vw;top:40vh;width:${Math.random()*8+4}px;height:${Math.random()*4+3}px;background:${colors[i%colors.length]};--tx:${Math.cos(angle)*dist}px;--ty:${Math.sin(angle)*dist}px`;
      document.body.appendChild(el);
      setTimeout(()=>el.remove(),600);
    });
  });
  useEffect(() => { setTimeout(() => setShowCursor(false), 850); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRefCode(params.get("ref"));
  }, []);

  const lookupRank = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rankEmail.trim()) return;
    setRankLoading(true);
    setRankError("");
    try {
      const res = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: rankEmail.trim() }),
      });
      const data = await res.json();
      if (data.error) { setRankError("We couldn't find that email. Did you sign up?"); return; }
      window.open(`/r/${data.referralCode}`, "_blank");
      setShowRankModal(false);
      setRankEmail("");
    } finally {
      setRankLoading(false);
    }
  };

  const validate = () => {
    const e = { name: "", email: "", city: "" };
    if (!fields.name.trim()) e.name = "Please enter your name";
    else if (fields.name.trim().length < 2) e.name = "Name is too short";
    if (!fields.email.trim()) e.email = "Please enter your email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) e.email = "That doesn't look like a valid email";
    if (!fields.city.trim()) e.city = "Please enter your city";
    setErrors(e);
    return !e.name && !e.email && !e.city;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, referredBy: refCode }),
      });
      const data = await res.json();
      setPosition(data.position ?? taken + 1);
      setMyRefCode(data.referralCode ?? null);
      setView("done");
    } finally {
      setLoading(false);
    }
  };

  if (!loaded) return <Preloader onDone={() => setLoaded(true)} />;

  /* ── DONE ── */
  if (view === "done") return (
    <div className="view-transition" style={{ background: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <Confetti />
      <div id="cursor-glow" className="cursor-glow" />
      <div style={{ position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)", width: 1000, height: 800, background: "radial-gradient(ellipse, rgba(155,109,255,0.12), transparent 55%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: 700, height: 600, background: "radial-gradient(ellipse, rgba(242,139,130,0.06), transparent 55%)", pointerEvents: "none" }} />

      {/* Top nav */}
      <div style={{ padding: "24px 32px", display: "flex", justifyContent: "center", alignItems: "center", position: "relative" }}>
        <Logo />
        <a href="/leaderboard" target="_blank" rel="noopener" style={{ position: "absolute", right: 32, fontSize: 13, fontWeight: 700, color: "#8888aa", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, padding: "7px 14px", transition: "all .2s" }}
          onMouseEnter={e => { e.currentTarget.style.color = "#b090ff"; e.currentTarget.style.borderColor = "rgba(155,109,255,0.3)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#8888aa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
          🏆 Leaderboard
        </a>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px 0", position: "relative" }} className="page-in">

        {/* Robinhood-style: number IS the hero */}
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 20 }}>
          Early access confirmed
        </p>

        <div style={{ fontSize: "clamp(120px, 28vw, 280px)", fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 0.82, marginBottom: 40, textAlign: "center" }}>
          <span className="g">#<CountUpTo target={position} /></span>
        </div>

        <p style={{ fontSize: "clamp(20px, 2.5vw, 28px)", fontWeight: 600, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.02em" }}>
          You&apos;re one of the first.
        </p>
        <p style={{ fontSize: 16, color: "#8888aa", maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
          We&apos;ll email you when it&apos;s time.<br />Watch your inbox.
        </p>

        {myRefCode && (
          <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <a href={`/r/${myRefCode}`} target="_blank" rel="noopener"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#9B6DFF", textDecoration: "none", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.2)", borderRadius: 100, padding: "8px 18px" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#9B6DFF", display: "inline-block" }} />
              Check your position anytime →
            </a>
            <a href={`/leaderboard?me=${myRefCode}`} target="_blank" rel="noopener"
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#c0a080", textDecoration: "none", background: "rgba(242,139,130,0.07)", border: "1px solid rgba(242,139,130,0.2)", borderRadius: 100, padding: "8px 18px" }}>
              🏆 See your rank
            </a>
          </div>
        )}
      </div>

      {/* Bottom share section — pinned to bottom like Robinhood */}
      <div style={{ padding: "40px 24px 48px", maxWidth: 560, width: "100%", margin: "0 auto", position: "relative" }}>
        <div style={{ height: 1, background: "var(--border)", marginBottom: 32 }} />

        {/* Referral callout */}
        {myRefCode && (
          <div style={{ background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.22)", borderRadius: 16, padding: "18px 20px", marginBottom: 28, textAlign: "center" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#b090ff", marginBottom: 4, letterSpacing: "0.04em" }}>
              YOUR REFERRAL LINK
            </p>
            <p style={{ fontSize: 13, color: "#8888aa", marginBottom: 2 }}>
              Each friend who signs up moves you <span style={{ color: "var(--text)", fontWeight: 700 }}>5 spots higher</span>.
            </p>
            <p style={{ fontSize: 12, color: "#666688", fontFamily: "monospace", marginTop: 8 }}>
              getrentout.me?ref={myRefCode}
            </p>
          </div>
        )}

        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "var(--text-faint)", textTransform: "uppercase", marginBottom: 20, textAlign: "center" }}>
          Spread the word
        </p>
        {/* Share grid — real brand logos */}
        {(() => {
          const shareUrl = myRefCode ? `https://getrentout.me?ref=${myRefCode}` : "https://getrentout.me";
          const shareText = "Just got early access to RentOut — something big is coming. Get yours:";
          return (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 10 }}>
                {[
                  { label: "WhatsApp", bg: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: Icons.whatsapp },
                  { label: "Instagram", bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", href: "https://www.instagram.com/", icon: Icons.instagram },
                  { label: "Facebook", bg: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, icon: Icons.facebook },
                  { label: "X", bg: "#000", border: "1px solid #2a2a2a", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: Icons.twitter },
                  { label: "Telegram", bg: "#229ED9", href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, icon: Icons.telegram },
                  { label: "TikTok", bg: "#010101", border: "1px solid #333", href: "https://www.tiktok.com/", icon: Icons.tiktok },
                  { label: "Reddit", bg: "#FF4500", href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`, icon: Icons.reddit },
                  { label: "LinkedIn", bg: "#0A66C2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, icon: Icons.linkedin },
                ].map(({ label, bg, border, href, icon }, i) => (
                  <a key={label} href={href} target="_blank" rel="noopener"
                    className="share-btn"
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: bg, border: border || "none", borderRadius: 16, padding: "18px 8px", textDecoration: "none", transition: "opacity .15s, transform .15s", animationDelay: `${i * 0.06}s` }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-3px) scale(1.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = ""; }}>
                    {icon}
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>{label}</span>
                  </a>
                ))}
              </div>
              <button onClick={(e) => {
                navigator.clipboard.writeText(myRefCode ? `https://getrentout.me?ref=${myRefCode}` : "https://getrentout.me");
                setCopied(true); setTimeout(() => setCopied(false), 2000);
                // copy burst
                const r = e.currentTarget.getBoundingClientRect();
                const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
                const colors = ["#9B6DFF","#F28B82","#c87dff","#fff","#38bdf8"];
                Array.from({length:8}).forEach((_,i) => {
                  const el = document.createElement("div"); el.className = "copy-particle";
                  const angle = (i/8)*Math.PI*2; const dist = 40+Math.random()*30;
                  el.style.cssText = `left:${cx}px;top:${cy}px;background:${colors[i%colors.length]};--tx:${Math.cos(angle)*dist-3}px;--ty:${Math.sin(angle)*dist-3}px`;
                  document.body.appendChild(el); setTimeout(()=>el.remove(),520);
                });
              }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: copied ? "rgba(155,109,255,0.1)" : "var(--surface)", border: `1px solid ${copied ? "rgba(155,109,255,0.3)" : "var(--border)"}`, borderRadius: 14, padding: "16px", fontSize: 15, fontWeight: 700, color: copied ? "var(--accent)" : "var(--text-dim)", cursor: "pointer", width: "100%", transition: "all .2s" }}>
                {Icons.copy} {copied ? "Link copied!" : myRefCode ? `Copy your referral link` : "Copy link — getrentout.me"}
              </button>
            </>
          );
        })()}

      </div>
    </div>
  );

  /* ── FORM ── */
  if (view === "form") return (
    <div className="view-transition" style={{ background: "var(--bg)", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <div id="cursor-glow" className="cursor-glow" />
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)" }}>
        <Logo />
        <button onClick={() => setView("home")} className="nav-link" style={{ background: "none", border: "none", cursor: "pointer", padding: "8px 0" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--text-dim)")}>
          ← Back
        </button>
      </nav>

      <div className="form-layout" style={{ paddingTop: 58, minHeight: "100vh" }}>
        {/* Left — brand */}
        <div className="form-brand" style={{ position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -100, left: -100, width: 600, height: 600, background: "radial-gradient(circle, rgba(155,109,255,0.2), transparent 65%)", pointerEvents: "none" }} />
          <div style={{ position: "relative", maxWidth: 420 }}>
            <p className="section-label" style={{ marginBottom: 20 }}>Early access</p>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.05, marginBottom: 20, color: "#f0f0fa" }}>
              Something new<br />is coming.<br /><span className="g">Start earning early.</span>
            </h2>
            <p style={{ fontSize: 16, color: "#b0b0cc", lineHeight: 1.75, marginBottom: 40 }}>
              We&apos;re not ready to reveal everything yet. Sign up and be among the first to know when we launch.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
              {[
                "Early access before anyone else",
                "First in line on launch day",
                "Exclusive earner benefits",
                "Direct line to the team",
              ].map(text => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 6, background: "rgba(155,109,255,0.18)", border: "1px solid rgba(155,109,255,0.35)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#b090ff", fontWeight: 800, flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: 14, color: "#a8a8c8", lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right — form */}
        <div className="form-panel">
          <div style={{ maxWidth: 400, width: "100%" }} className="page-in">
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(155,109,255,0.12)", border: "1px solid rgba(155,109,255,0.3)", borderRadius: 100, padding: "6px 14px", marginBottom: 28 }}>
              <span className="dot" style={{ background: "var(--accent)" }} />
              <span style={{ fontSize: 13, color: "#b090ff", fontWeight: 600 }}>For early earners</span>
            </div>

            <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8, color: "#f0f0fa" }}>
              Start earning early
            </h3>
            <p style={{ fontSize: 14, color: "#9090b8", marginBottom: 28, lineHeight: 1.6 }}>
              60 seconds. We&apos;ll email you when we&apos;re ready.
            </p>

            <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div className="field-wrap">
                  <input name="fullname" type="text" placeholder=" " className="field"
                    value={fields.name} style={{ borderColor: errors.name ? "#F28B82" : undefined }}
                    onChange={e => { setFields(p => ({ ...p, name: e.target.value })); setErrors(p => ({ ...p, name: "" })); }} />
                  <label className={`float-label${fields.name ? " up" : ""}`} style={{ color: errors.name ? "#F28B82" : undefined }}>Full name</label>
                </div>
                {errors.name && <p style={{ fontSize: 12, color: "#F28B82", marginTop: 6 }}>{errors.name}</p>}
              </div>
              <div>
                <div className="field-wrap">
                  <input type="email" placeholder=" " className="field" inputMode="email" name="useremail"
                    value={fields.email} style={{ borderColor: errors.email ? "#F28B82" : undefined }}
                    onChange={e => { setFields(p => ({ ...p, email: e.target.value })); setErrors(p => ({ ...p, email: "" })); }} />
                  <label className={`float-label${fields.email ? " up" : ""}`} style={{ color: errors.email ? "#F28B82" : undefined }}>Email address</label>
                </div>
                {errors.email && <p style={{ fontSize: 12, color: "#F28B82", marginTop: 6 }}>{errors.email}</p>}
              </div>
              <div>
                <div className="field-wrap">
                  <input type="text" placeholder=" " className="field" name="usercity"
                    value={fields.city} style={{ borderColor: errors.city ? "#F28B82" : undefined }}
                    onChange={e => { setFields(p => ({ ...p, city: e.target.value })); setErrors(p => ({ ...p, city: "" })); }} />
                  <label className={`float-label${fields.city ? " up" : ""}`} style={{ color: errors.city ? "#F28B82" : undefined }}>Your city</label>
                </div>
                {errors.city && <p style={{ fontSize: 12, color: "#F28B82", marginTop: 6 }}>{errors.city}</p>}
              </div>
              <div style={{ height: 4 }} />
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", fontSize: 15, padding: "17px", borderRadius: 13 }}>
                {loading ? "Just a moment…" : "Start earning early"}
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-faint)" }}>
                No credit card. No spam.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  /* ── HOME ── */
  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }} className={konamiActive ? "konami-active" : ""}>
      {/* Custom cursor */}
      <div id="cursor-dot" className="cursor-dot" />
      <div id="cursor-ring" className="cursor-ring" />
      <div id="scroll-progress" className="scroll-progress" style={{ width: "0%" }} />
      <div className="scanlines" /><div className="scan-sweep" />
      <ShaderBackground />
      <ParticleField />
      <ActivityToast />

      {/* Exit intent popup */}
      {showExit && (
        <div className="exit-popup">
          <div style={{ fontSize: 36, marginBottom: 12 }}>⏳</div>
          <h3 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8 }}>Wait — spots are filling up.</h3>
          <p style={{ fontSize: 14, color: "#8888aa", marginBottom: 24, lineHeight: 1.6 }}>
            {viewerCount} people are looking at this right now.<br />Your spot won&apos;t be saved if you leave.
          </p>
          <button className={`btn-primary${isIdle ? " btn-idle" : ""}`} style={{ width: "100%", fontSize: 15, padding: "16px", borderRadius: 12 }}
            onClick={() => { setShowExit(false); transitionTo(() => setView("form")); haptic(); }}>
            Claim my spot now →
          </button>
          <button onClick={() => setShowExit(false)} style={{ marginTop: 14, background: "none", border: "none", color: "#555577", fontSize: 13, cursor: "pointer" }}>
            No thanks, I&apos;ll miss out
          </button>
        </div>
      )}
      <div id="cursor-glow" className="cursor-glow" />

      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)" }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="/leaderboard" target="_blank" rel="noopener" className="nav-hide-mobile" style={{ fontSize: 13, fontWeight: 700, color: "#8888aa", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#b090ff"; e.currentTarget.style.borderColor = "rgba(155,109,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8888aa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
            🏆 Leaderboard
          </a>
          <button onClick={() => { setShowRankModal(true); setRankError(""); setRankEmail(""); }} className="nav-hide-mobile"
            style={{ fontSize: 13, fontWeight: 700, color: "#8888aa", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, padding: "7px 14px", cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#b090ff"; e.currentTarget.style.borderColor = "rgba(155,109,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8888aa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
            Check my rank
          </button>
          <button className="btn-primary" onClick={() => setView("form")} style={{ padding: "9px 20px", fontSize: 14, borderRadius: 100 }}>
            Start earning early
          </button>
        </div>
      </nav>

      {/* Rank lookup modal */}
      {showRankModal && (
        <div onClick={() => setShowRankModal(false)} style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#111118", border: "1px solid rgba(155,109,255,0.25)", borderRadius: 24, padding: "40px 32px", width: "100%", maxWidth: 400, position: "relative" }}>
            <button onClick={() => setShowRankModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", color: "#666688", fontSize: 20, cursor: "pointer", lineHeight: 1 }}>×</button>
            <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.16em", color: "#9B6DFF", textTransform: "uppercase", marginBottom: 12 }}>Already signed up?</p>
            <h3 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8, color: "#f0f0fa" }}>Check your rank</h3>
            <p style={{ fontSize: 14, color: "#8888aa", marginBottom: 24, lineHeight: 1.6 }}>Enter the email you signed up with to see your current position.</p>
            <form onSubmit={lookupRank} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input
                type="email" placeholder="you@email.com" value={rankEmail}
                onChange={e => { setRankEmail(e.target.value); setRankError(""); }}
                className="field" style={{ borderColor: rankError ? "#F28B82" : undefined }}
              />
              {rankError && <p style={{ fontSize: 12, color: "#F28B82", marginTop: -4 }}>{rankError}</p>}
              <button type="submit" disabled={rankLoading} className="btn-primary" style={{ width: "100%", fontSize: 15, padding: "15px", borderRadius: 12 }}>
                {rankLoading ? "Looking up…" : "See my rank →"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HERO */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Morphing aurora blobs */}
        <div className="aurora-parallax" style={{ position: "absolute", inset: 0, pointerEvents: "none", transition: "transform 0.8s cubic-bezier(.25,.46,.45,.94)" }}>
          <div className="aurora-blob morph-blob" style={{ width: 900, height: 700, top: "-30%", left: "30%", background: "radial-gradient(ellipse, rgba(155,109,255,0.22), transparent 65%)", filter: "blur(55px)" }} />
          <div className="aurora-blob morph-blob-2" style={{ width: 700, height: 600, bottom: "-20%", right: "-10%", background: "radial-gradient(ellipse, rgba(242,139,130,0.14), transparent 65%)", filter: "blur(65px)" }} />
          <div className="aurora-blob aurora-3" style={{ top: "20%", left: "-5%" }} />
        </div>
        {/* Spotlight beam */}
        <div className="spotlight" style={{ zIndex: 1 }} />
        {/* Star field */}
        {starsRef.current.map(s => (
          <div key={s.id} className="star-dot" style={{ left: s.left, top: s.top, width: s.size, height: s.size, "--sdur": s.dur, "--sdel": s.del } as React.CSSProperties} />
        ))}

        <div className="hero-tilt hero-jacked" style={{ position: "relative", maxWidth: 960, margin: "0 auto", padding: "72px 24px 64px", textAlign: "center" }}>
          {timeGreeting && (
            <p style={{ fontSize: 13, color: "#666688", fontWeight: 600, marginBottom: 12, letterSpacing: "0.04em" }}>{timeGreeting} 👋</p>
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
            <div className="hero-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.16)", borderRadius: 100, padding: "7px 18px" }}>
              <span className="dot" />
              <span style={{ fontSize: 13, color: "var(--text-dim)", letterSpacing: "0.01em" }}>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>Earner early access</span>
              </span>
            </div>
            {viewerCount > 0 && (
              <div className="hero-eyebrow viewer-badge">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F28B82", display: "inline-block", animation: "pulse-dot 2s infinite" }} />
                {viewerCount} viewing now
              </div>
            )}
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div ref={scrambleRef} className="hero-line-1" style={{ fontSize: "clamp(52px, 10vw, 118px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.055em", color: "#f8f8fa", display: "inline" }}>
                Sell anything.
              </div>
              {showCursor && <span className="typer-cursor" />}
            </div>
            <div className="hero-line-2" style={{ fontSize: "clamp(52px, 10vw, 118px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.055em" }}>
              <span className="g hero-glitch">Keep everything.</span>
            </div>
          </div>

          <p className="hero-sub" style={{ fontSize: "clamp(17px, 2vw, 21px)", color: "var(--text-body)", lineHeight: 1.7, maxWidth: 520, margin: "0 auto 40px" }}>
            Something new is coming. Sign up to earn — before anyone else.
          </p>

          <div className="hero-cta" style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
            <div className="cta-border-wrap" style={{ borderRadius: 16 }}>
              <div className="cta-border-bg" />
              <div className="cta-border-inner" style={{ padding: 2 }}>
                <div style={{ position: "relative", display: "inline-block" }}>
                  {chargeLevel > 0 && (
                    <svg viewBox="0 0 44 44" style={{ position: "absolute", inset: -6, width: "calc(100% + 12px)", height: "calc(100% + 12px)", pointerEvents: "none", zIndex: 2 }}>
                      <circle cx="22" cy="22" r="18" strokeDasharray="113" strokeDashoffset={113 - (113 * chargeLevel / 100)} fill="none" stroke="rgba(155,109,255,0.9)" strokeWidth="2.5" strokeLinecap="round" style={{ transform: "rotate(-90deg)", transformOrigin: "center" }} />
                    </svg>
                  )}
                  <button className={`btn-primary${isIdle ? " btn-idle" : ""}`}
                    style={{ fontSize: 17, padding: "20px 48px", borderRadius: 14, transform: chargeLevel > 50 ? `scale(${1 + chargeLevel * 0.002})` : undefined }}
                    onClick={() => { transitionTo(() => setView("form")); haptic(); }}
                    onPointerDown={() => {
                      setChargeLevel(0); haptic();
                      chargeTimer.current = setInterval(() => {
                        setChargeLevel(p => { if (p >= 100) { clearInterval(chargeTimer.current!); return 100; } return p + 2; });
                      }, 20);
                    }}
                    onPointerUp={() => { clearInterval(chargeTimer.current!); setChargeLevel(0); }}
                    onPointerLeave={() => { clearInterval(chargeTimer.current!); setChargeLevel(0); }}>
                    Start earning early
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3D live spots remaining */}
          <div className="hero-note" style={{ textAlign: "center" }}>
            <div className="counter-3d">
              <Ticker value={spots} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
              <span className="dot" />
              <span style={{ fontSize: 13, color: "var(--text-faint)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
                spots remaining
              </span>
            </div>
          </div>

        </div>
      </div>

      <hr className="hr" style={{ marginTop: 40 }} />

      {/* BOTTOM CTA */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "100px 24px 120px" }}>
        <div className="card reveal" style={{ borderRadius: 24, padding: "clamp(52px, 8vw, 88px) clamp(28px, 6vw, 72px)", textAlign: "center", position: "relative", overflow: "hidden", border: "1px solid rgba(155,109,255,0.16)", background: "linear-gradient(160deg, rgba(155,109,255,0.06) 0%, var(--surface) 55%)" }}>
          <div style={{ position: "absolute", top: -140, left: "50%", transform: "translateX(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.13), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, right: "0%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,139,130,0.06), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 16px" }}>
              <span className="dot" style={{ background: "var(--accent)", width: 6, height: 6 }} /> Earner early access
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.02, marginBottom: 18 }}>
              Don&apos;t wait.<br /><span className="g">Start earning early.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 40px" }}>
              We&apos;re building something new. Sign up now and be among the first to experience it.
            </p>
            {/* Countdown */}
            {(cd.d > 0 || cd.h > 0 || cd.m > 0) && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 28 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {[{ v: cd.d, l: "days" }, { v: cd.h, l: "hrs" }, { v: cd.m, l: "min" }].map(({ v, l }, i) => (
                    <div key={l} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "rgba(155,109,255,0.09)", border: "1px solid rgba(155,109,255,0.22)", borderRadius: 10, padding: "10px 18px", minWidth: 58 }}>
                        <span style={{ fontSize: 24, fontWeight: 900, letterSpacing: "-0.03em", color: "var(--text)" }}>{String(v).padStart(2, "0")}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--text-dim)", textTransform: "uppercase", marginTop: 3 }}>{l}</span>
                      </div>
                      {i < 2 && <span style={{ fontSize: 22, fontWeight: 900, color: "var(--text-dim)", lineHeight: 1, paddingBottom: 14 }}>:</span>}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-dim)", letterSpacing: "0.04em" }}>left to claim your spot</span>
              </div>
            )}
            <button className="btn-primary" onClick={() => setView("form")} style={{ fontSize: 16, padding: "18px 48px", borderRadius: 14 }}>
              Start earning early
            </button>
          </div>
        </div>
      </div>

      <hr className="hr" />
      <div style={{ padding: "28px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <Logo />
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <a href="mailto:hello@getrentout.me" style={{ fontSize: 13, color: "var(--text-faint)", textDecoration: "none", transition: "color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-dim)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}>hello@getrentout.me</a>
        </div>
        <span style={{ fontSize: 13, color: "var(--text-faint)" }}>© 2026 RentOut</span>
      </div>
    </div>
  );
}
// force redeploy Mon Jun 29 13:24:50 IST 2026

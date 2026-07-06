"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { getShareText } from "./lib/shareText";

const ThreeScene = dynamic(() => import("./components/ThreeScene"), { ssr: false });

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

function useSpots() {
  const [spots, setSpots] = useState(TOTAL);
  useEffect(() => {
    const go = () => fetch("/api/spots").then(r => r.json()).then(d => setSpots(d.remaining)).catch(() => {});
    go();
    const id = setInterval(go, 5000);
    return () => clearInterval(id);
  }, []);
  return spots;
}

function useReveal(ready: boolean) {
  useEffect(() => {
    if (!ready) return;
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [ready]);
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

/* ── Preloader ── */
function Preloader({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => { setExiting(true); setTimeout(onDone, 550); }, 1300);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`preloader${exiting ? " exit" : ""}`}>
      <Image src="/logo.png" alt="RentOut" width={52} height={52} priority style={{ borderRadius: 15, opacity: 0.95 }} />
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

/* ── View Transitions API ── */
function transitionTo(cb: () => void) {
  if ((document as any).startViewTransition) {
    (document as any).startViewTransition(cb);
  } else {
    cb();
  }
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

function FAQItem({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="reveal" style={{ border: "1px solid var(--border)", borderRadius: 14, background: "var(--surface)", overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, padding: "18px 22px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
        <span style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)" }}>{q}</span>
        <span aria-hidden style={{ fontSize: 18, fontWeight: 400, color: "var(--accent)", flexShrink: 0, transform: open ? "rotate(45deg)" : "none", transition: "transform .25s cubic-bezier(.16,1,.3,1)" }}>+</span>
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .3s cubic-bezier(.16,1,.3,1)" }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ padding: "0 22px 20px", fontSize: 14, color: "var(--text-dim)", lineHeight: 1.7 }}>{a}</div>
        </div>
      </div>
    </div>
  );
}

const FAQS: { q: string; a: React.ReactNode }[] = [
  { q: "What exactly is RentOut?", a: "RentOut is a skills marketplace app. You create a listing for something you're good at, such as tutoring, photography, design, coaching, or language practice. You set your own price, and people book and pay you through the app." },
  { q: "Is it free to join?", a: "Yes. Creating an account and listing your skills is free. There is no signup fee and no credit card required. A transparent service fee applies only to completed bookings." },
  { q: "How and when do I get paid?", a: "Payments are handled inside the app. When a customer books you, their payment is held securely and released to your in-app earnings balance once the booking is completed. You can then withdraw your balance to your local payout method. Full payout details for each country will be confirmed in your onboarding email before launch." },
  { q: "How much can I earn?", a: "You set your own rates: hourly, per session, or per package. There is no cap and no fixed shift. You earn from every booking you choose to accept. Early earners also get priority visibility in search when the marketplace opens." },
  { q: "Is this a job or employment?", a: "No. You are an independent earner on a marketplace, running your own one-person business through the app. You decide what you offer, when you work, what you charge, and which bookings to accept." },
  { q: "What skills can I list?", a: "Any legal skill or service people would pay for: tutoring and languages, photography and video, design and editing, music lessons, fitness coaching, tech help, gaming partners, event help, and more. Every listing is reviewed by our moderation team before it goes live." },
  { q: "Is it safe? How do you prevent scams?", a: "Every earner goes through identity verification (KYC) before they can accept bookings. Payments are held by the platform until the booking is completed, both sides review each other after every booking, and our moderation team reviews reports and removes bad actors." },
  { q: "Which countries can join?", a: "The waitlist is open globally — you can sign up from anywhere. The app launches city by city, and waitlist members in each region get access first, in the order they joined." },
  { q: "What happens after I sign up?", a: "You get a waitlist position and a personal referral link (each signup through your link moves you 5 spots up). When we launch in your region, you'll receive an email invitation to set up your earner profile and publish your first listing." },
  { q: "What do you do with my data?", a: <>We collect only your name, email, and city — used solely to manage the waitlist and contact you about launch. We never sell your data, and you can ask us to delete it anytime at <a href="mailto:support@getrentout.me" style={{ color: "var(--accent)" }}>support@getrentout.me</a>. See our <a href="/privacy" style={{ color: "var(--accent)" }}>Privacy Policy</a>.</> },
];

const Logo = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{ width: 32, height: 32, borderRadius: 9, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #1a1228, #120d1e)", border: "1px solid rgba(155,109,255,0.25)" }}>
      <Image src="/logo.png" alt="RentOut" width={32} height={32} style={{ borderRadius: 8 }} />
    </div>
    <span className="logo-text">RentOut</span>
  </div>
);

const ic = (d: React.ReactNode) => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{d}</svg>
);
const FeatureIcons = {
  clock: ic(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>),
  globe: ic(<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>),
  card: ic(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /></>),
  layers: ic(<><path d="M12 3 3 8l9 5 9-5-9-5Z" /><path d="m3 13 9 5 9-5" /></>),
  lock: ic(<><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>),
  chart: ic(<><path d="M4 20V10M10 20V4M16 20v-8M21 20H3" /></>),
  id: ic(<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="11" r="2" /><path d="M6 16c.5-1.5 1.7-2 3-2s2.5.5 3 2M15 9h4M15 13h4" /></>),
  shield: ic(<><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>),
  star: ic(<path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 9.7l5.4-.8L12 4Z" />),
  flag: ic(<><path d="M5 21V4" /><path d="M5 4h12l-2 4 2 4H5" /></>),
  doc: ic(<><path d="M7 3h7l5 5v13H7V3Z" /><path d="M14 3v5h5M10 13h6M10 17h6" /></>),
  mail: ic(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
};

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
  const [submitError, setSubmitError] = useState("");
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [showRankModal, setShowRankModal] = useState(false);
  const [rankEmail, setRankEmail] = useState("");
  const [rankLoading, setRankLoading] = useState(false);
  const [rankError, setRankError] = useState("");
  const scrambleRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [chargeLevel, setChargeLevel] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const chargeTimer = useRef<ReturnType<typeof setInterval>|null>(null);
  const haptic = useHaptic();
  const starsRef = useRef(Array.from({ length: 32 }, (_, i) => ({
    id: i, left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 100}%`,
    size: (i % 3) * 0.8 + 0.6,
    dur: `${(i % 5) * 0.7 + 2}s`, del: `${(i % 7) * 0.5}s`,
  })));
  const spots = useSpots();
  const taken = TOTAL - spots;
  useReveal(loaded);
  useCursorGlow();
  useParallax();
  useMagneticButtons();
  useNavGlass();
  useScrollProgress();
  useButtonRipple();
  useHeroShadow();
  use3DHeroTilt();
  useScrollJack();
  useGyroscope();

  // Idle CTA pulse
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const reset = () => { clearTimeout(t); setIsIdle(false); t = setTimeout(() => setIsIdle(true), 5000); };
    window.addEventListener("mousemove", reset); window.addEventListener("keydown", reset);
    reset();
    return () => { clearTimeout(t); window.removeEventListener("mousemove", reset); window.removeEventListener("keydown", reset); };
  }, []);
  useEffect(() => { setTimeout(() => setShowCursor(false), 850); }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    setRefCode(ref ? ref.trim().toUpperCase() : null);
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
    setSubmitError("");
    try {
      const res = await fetch("/api/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, referredBy: refCode, website: honeypotRef.current?.value ?? "" }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setSubmitError(data.error === "Please use a permanent email address"
          ? "Please use a permanent email address (temporary inboxes aren't accepted)."
          : data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setPosition(data.position ?? taken + 1);
      setMyRefCode(data.referralCode ?? null);
      setView("done");
    } catch {
      setSubmitError("Network error. Please check your connection and try again.");
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
          Leaderboard
        </a>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "32px 24px 0", position: "relative" }} className="page-in">

        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.18em", color: "var(--accent)", textTransform: "uppercase", marginBottom: 16 }}>
          Early access confirmed
        </p>

        <div style={{ fontSize: "clamp(96px, 22vw, 220px)", fontWeight: 900, letterSpacing: "-0.06em", lineHeight: 0.85, marginBottom: 24, textAlign: "center" }}>
          <span className="g">#<CountUpTo target={position} /></span>
        </div>

        <p style={{ fontSize: "clamp(18px, 2.5vw, 24px)", fontWeight: 600, color: "var(--text)", marginBottom: 8, letterSpacing: "-0.02em" }}>
          You&apos;re one of the first.
        </p>
        <p style={{ fontSize: 15, color: "#8888aa", maxWidth: 360, textAlign: "center", lineHeight: 1.6 }}>
          We&apos;ll email you when it&apos;s time. Watch your inbox.
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
              See your rank
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
          const shareText = getShareText();
          return (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 10 }}>
                {[
                  { label: "WhatsApp", bg: "#25D366", href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: Icons.whatsapp },
                  { label: "Instagram", bg: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", href: "https://www.instagram.com/", icon: Icons.instagram, copyFirst: true },
                  { label: "Facebook", bg: "#1877F2", href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, icon: Icons.facebook },
                  { label: "X", bg: "#000", border: "1px solid #2a2a2a", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`, icon: Icons.twitter },
                  { label: "Telegram", bg: "#229ED9", href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, icon: Icons.telegram },
                  { label: "TikTok", bg: "#010101", border: "1px solid #333", href: "https://www.tiktok.com/", icon: Icons.tiktok, copyFirst: true },
                  { label: "Reddit", bg: "#FF4500", href: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`, icon: Icons.reddit },
                  { label: "LinkedIn", bg: "#0A66C2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, icon: Icons.linkedin },
                ].map(({ label, bg, border, href, icon, copyFirst }, i) => (
                  <a key={label} href={href} target="_blank" rel="noopener"
                    className="share-btn"
                    onClick={copyFirst ? () => {
                      navigator.clipboard.writeText(shareUrl);
                      setCopied(true); setTimeout(() => setCopied(false), 2500);
                    } : undefined}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, background: bg, border: border || "none", borderRadius: 16, padding: "18px 8px", textDecoration: "none", transition: "opacity .15s, transform .15s", animationDelay: `${i * 0.06}s`, position: "relative" }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "translateY(-3px) scale(1.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = ""; }}>
                    {icon}
                    <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.04em" }}>{label}</span>
                  </a>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "var(--text-faint)", textAlign: "center", marginBottom: 14 }}>
                Instagram &amp; TikTok copy your link automatically — just paste it in your post.
              </p>
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
              Your skills<br />are worth money.<br /><span className="g">Be first to sell them.</span>
            </h2>
            <p style={{ fontSize: 16, color: "#b0b0cc", lineHeight: 1.75, marginBottom: 40 }}>
              List a skill, get booked, get paid — on your own schedule. Signing up is free and takes 60 seconds.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
              {[
                "Early access before anyone else",
                "First in line on launch day",
                "Priority visibility for founding earners",
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
              <span style={{ fontSize: 13, color: "#b090ff", fontWeight: 600 }}>Earners only</span>
            </div>

            <h3 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8, color: "#f0f0fa" }}>
              Sign up as an Earner
            </h3>
            <p style={{ fontSize: 14, color: "#9090b8", marginBottom: 28, lineHeight: 1.6 }}>
              60 seconds. We&apos;ll email you when your access is ready.
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
              <div>
                <div className="field-wrap">
                  <input type="text" placeholder=" " className="field" name="referralcode"
                    value={refCode ?? ""}
                    onChange={e => setRefCode(e.target.value.trim().toUpperCase() || null)} />
                  <label className={`float-label${refCode ? " up" : ""}`}>Referral code (optional)</label>
                </div>
              </div>
              <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }} />
              <div style={{ height: 4 }} />
              {submitError && <p style={{ fontSize: 13, color: "#F28B82", textAlign: "center", lineHeight: 1.5 }}>{submitError}</p>}
              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", fontSize: 15, padding: "17px", borderRadius: 13 }}>
                {loading ? "Just a moment…" : "Join as an Earner"}
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
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* Custom cursor */}
      <div id="scroll-progress" className="scroll-progress" style={{ width: "0%" }} />
      <ShaderBackground />
      <ThreeScene />
      <ParticleField />
      <div id="cursor-glow" className="cursor-glow" />

      <nav style={{ position: "sticky", top: 0, zIndex: 99, background: "rgba(7,7,10,0.85)", borderBottom: "1px solid rgba(255,255,255,0.04)", padding: "0 28px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", backdropFilter: "blur(16px)" }}>
        <Logo />
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <a href="#how-it-works" className="nav-hide-mobile" style={{ fontSize: 13, fontWeight: 600, color: "#8888aa", textDecoration: "none", padding: "7px 10px", transition: "color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#b090ff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8888aa")}>
            How it works
          </a>
          <a href="#faq" className="nav-hide-mobile" style={{ fontSize: 13, fontWeight: 600, color: "#8888aa", textDecoration: "none", padding: "7px 10px", transition: "color .2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#b090ff")}
            onMouseLeave={e => (e.currentTarget.style.color = "#8888aa")}>
            FAQ
          </a>
          <a href="/leaderboard" target="_blank" rel="noopener" className="nav-hide-mobile" style={{ fontSize: 13, fontWeight: 700, color: "#8888aa", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.03)", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#b090ff"; e.currentTarget.style.borderColor = "rgba(155,109,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8888aa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
            Leaderboard
          </a>
          <button onClick={() => { setShowRankModal(true); setRankError(""); setRankEmail(""); }} className="nav-hide-mobile"
            style={{ fontSize: 13, fontWeight: 700, color: "#8888aa", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 100, padding: "7px 14px", cursor: "pointer", transition: "all .2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#b090ff"; e.currentTarget.style.borderColor = "rgba(155,109,255,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#8888aa"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}>
            Check my rank
          </button>
          <button className="btn-primary" onClick={() => setView("form")} style={{ padding: "9px 20px", fontSize: 14, borderRadius: 100 }}>
            Join as an Earner
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
      <div style={{ position: "relative", overflow: "hidden", zIndex: 1 }}>
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 36, flexWrap: "wrap" }}>
            <div className="hero-eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(155,109,255,0.07)", border: "1px solid rgba(155,109,255,0.16)", borderRadius: 100, padding: "7px 18px" }}>
              <span className="dot" />
              <span style={{ fontSize: 13, color: "var(--text-dim)", letterSpacing: "0.01em" }}>
                <span style={{ color: "var(--text)", fontWeight: 600 }}>Earner early access</span>
              </span>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div ref={scrambleRef} className="hero-line-1" style={{ fontSize: "clamp(52px, 10vw, 118px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.055em", color: "#f8f8fa", display: "inline" }}>
                Rent out your time.
              </div>
              {showCursor && <span className="typer-cursor" />}
            </div>
            <div className="hero-line-2" style={{ fontSize: "clamp(52px, 10vw, 118px)", fontWeight: 900, lineHeight: 0.92, letterSpacing: "-0.055em" }}>
              <span className="g hero-glitch">Get paid for it.</span>
            </div>
          </div>

          <p className="hero-sub" style={{ fontSize: "clamp(17px, 2vw, 21px)", color: "var(--text-body)", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 40px" }}>
            RentOut is a marketplace where people book your skills by the hour — tutoring, design, coaching, photography, gaming and more. Signing up is free. Early earners get first access at launch.
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
                    Join as an Earner
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
                of 100,000 early access spots remaining
              </span>
            </div>
          </div>

        </div>
      </div>

      <hr className="hr" style={{ marginTop: 40, position: "relative", zIndex: 1 }} />

      {/* HOW IT WORKS */}
      <div id="how-it-works" style={{ maxWidth: 1000, margin: "0 auto", padding: "100px 24px 40px", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 16px" }}>
            How it works
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Start earning in three steps
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { n: "01", title: "List your skill", body: "Tutoring, editing, design, coaching, photography — whatever you're good at. Set it up in minutes." },
            { n: "02", title: "Get booked", body: "People searching for that skill find your listing and book you directly through the app." },
            { n: "03", title: "Get paid", body: "Complete the booking and get paid for your time — no fixed hours, no boss, your schedule." },
          ].map((step) => (
            <div key={step.n} className="card reveal" style={{ borderRadius: 20, padding: "32px 28px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent)", letterSpacing: "0.05em", marginBottom: 14 }}>{step.n}</div>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>{step.title}</div>
              <div style={{ fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* KEY FEATURES */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent-2)", textTransform: "uppercase", background: "rgba(242,139,130,0.08)", border: "1px solid rgba(242,139,130,0.18)", borderRadius: 100, padding: "6px 16px" }}>
            Why RentOut
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Work on your terms
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { icon: FeatureIcons.clock, title: "Set your own hours", body: "No fixed shifts. Take bookings whenever it works for you." },
            { icon: FeatureIcons.globe, title: "Open globally", body: "Sign up from anywhere. Not limited to one city or country." },
            { icon: FeatureIcons.card, title: "Get paid for every booking", body: "Earnings scale with how much you take on. There is no cap." },
            { icon: FeatureIcons.layers, title: "Any skill counts", body: "Creative, technical, tutoring, or service-based. If it's useful, it's welcome." },
            { icon: FeatureIcons.lock, title: "Simple, secure signup", body: "60-second signup, no credit card, no spam." },
            { icon: FeatureIcons.chart, title: "Early access perks", body: "First earners get priority visibility when the marketplace opens." },
          ].map((f) => (
            <div key={f.title} className="reveal" style={{ padding: "24px 20px", borderRadius: 16, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(155,109,255,0.1)", border: "1px solid rgba(155,109,255,0.2)", color: "#b090ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 16px" }}>
            Categories
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 14 }}>
            What you can offer
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--text-dim)", maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            You choose what to offer, how to deliver it, and what to charge.
          </p>
        </div>
        <div className="reveal" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, maxWidth: 760, margin: "0 auto" }}>
          {[
            "Tutoring & Test Prep", "Languages", "Photography & Video", "Design & Editing",
            "Music Lessons", "Fitness & Coaching", "Tech Help", "Gaming Sessions",
            "Career & Interview Prep", "Cooking", "Event Support",
          ].map((c) => (
            <span key={c} style={{ fontSize: 14, fontWeight: 600, color: "var(--text-body)", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 100, padding: "10px 20px" }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* HOW YOU GET PAID */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent-2)", textTransform: "uppercase", background: "rgba(242,139,130,0.08)", border: "1px solid rgba(242,139,130,0.18)", borderRadius: 100, padding: "6px 16px" }}>
            Payments
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 14 }}>
            How you get paid
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--text-dim)", maxWidth: 560, margin: "0 auto", lineHeight: 1.7 }}>
            No signup fees. A single transparent service fee applies only when a booking is completed.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
          {[
            { n: "01", title: "Customer books & pays", body: "The customer pays through the app at the time of booking. The payment is held securely by the platform, so you never have to chase anyone for money." },
            { n: "02", title: "You complete the booking", body: "Deliver the session or service. Completion is confirmed in the app, which protects both you and the customer." },
            { n: "03", title: "Earnings released to you", body: "The money lands in your in-app earnings balance, and you withdraw it to your local payout method. Payout options for your country are confirmed before launch." },
          ].map((step) => (
            <div key={step.n} className="card reveal" style={{ borderRadius: 20, padding: "32px 28px", border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--accent-2)", letterSpacing: "0.05em", marginBottom: 14 }}>{step.n}</div>
              <div style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 10 }}>{step.title}</div>
              <div style={{ fontSize: 14.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{step.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TRUST & SAFETY */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 16px" }}>
            Trust &amp; safety
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1, marginBottom: 14 }}>
            Trust and safety, built in
          </h2>
          <p style={{ fontSize: 15.5, color: "var(--text-dim)", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
            A marketplace only works if everyone can trust it. This is what&apos;s built into RentOut from day one.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { icon: FeatureIcons.id, title: "Verified identities", body: "Every earner completes identity verification (KYC) before accepting bookings. No anonymous accounts." },
            { icon: FeatureIcons.shield, title: "Protected payments", body: "Payments are held by the platform and only released when the booking is completed. This protects both sides." },
            { icon: FeatureIcons.star, title: "Two-way reviews", body: "Earners and customers review each other after every booking, so reputations are real and earned." },
            { icon: FeatureIcons.flag, title: "Active moderation", body: "Every listing is screened before going live, and a moderation team reviews reports and removes bad actors." },
            { icon: FeatureIcons.doc, title: "Clear terms, no tricks", body: "Plain-language Terms of Service and Privacy Policy. No hidden fees, no fine-print surprises." },
            { icon: FeatureIcons.mail, title: "A team you can reach", body: "Questions or concerns? Email support@getrentout.me and a real person will reply." },
          ].map((f) => (
            <div key={f.title} className="reveal" style={{ padding: "24px 20px", borderRadius: 16, border: "1px solid var(--border)", background: "var(--surface)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(155,109,255,0.1)", border: "1px solid rgba(155,109,255,0.2)", color: "#b090ff", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13.5, color: "var(--text-dim)", lineHeight: 1.6 }}>{f.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div id="faq" style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 16px" }}>
            FAQ
          </div>
          <h2 style={{ fontSize: "clamp(28px, 4.5vw, 46px)", fontWeight: 900, letterSpacing: "-0.04em", lineHeight: 1.1 }}>
            Frequently asked questions
          </h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
        </div>
        <p className="reveal" style={{ textAlign: "center", fontSize: 14, color: "var(--text-faint)", marginTop: 28 }}>
          Have a question we didn't cover? Email <a href="mailto:support@getrentout.me" style={{ color: "var(--accent)", textDecoration: "none" }}>support@getrentout.me</a>.
        </p>
      </div>

      {/* ABOUT */}
      <div id="about" style={{ maxWidth: 760, margin: "0 auto", padding: "80px 24px 40px", position: "relative", zIndex: 1 }}>
        <div className="card reveal" style={{ borderRadius: 20, padding: "40px 36px", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent-2)", textTransform: "uppercase", marginBottom: 16 }}>About RentOut</div>
          <p style={{ fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.8, marginBottom: 14 }}>
            RentOut is built by a dedicated team of engineers, designers, and marketplace operators with one belief: <span style={{ color: "var(--text)", fontWeight: 600 }}>everyone has a skill someone else would pay for</span>. Most people just never get a simple, safe way to sell it.
          </p>
          <p style={{ fontSize: 15.5, color: "var(--text-body)", lineHeight: 1.8 }}>
            The app is in the final stage of development, with verified onboarding, secure in-app payments, and moderation built in from the start. This waitlist decides who gets access first. Reach us anytime at <a href="mailto:hello@getrentout.me" style={{ color: "var(--accent)", textDecoration: "none" }}>hello@getrentout.me</a>.
          </p>
        </div>
      </div>

      <hr className="hr" style={{ position: "relative", zIndex: 1 }} />

      {/* BOTTOM CTA */}
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "100px 24px 120px", position: "relative", zIndex: 1 }}>
        <div className="card" style={{ borderRadius: 24, padding: "clamp(52px, 8vw, 88px) clamp(28px, 6vw, 72px)", textAlign: "center", position: "relative", overflow: "hidden", border: "1px solid rgba(155,109,255,0.16)", background: "linear-gradient(160deg, rgba(155,109,255,0.06) 0%, var(--surface) 55%)" }}>
          <div style={{ position: "absolute", top: -140, left: "50%", transform: "translateX(-50%)", width: 520, height: 520, borderRadius: "50%", background: "radial-gradient(circle, rgba(155,109,255,0.13), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: -80, right: "0%", width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(242,139,130,0.06), transparent 60%)", pointerEvents: "none" }} />
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", color: "var(--accent)", textTransform: "uppercase", background: "rgba(155,109,255,0.08)", border: "1px solid rgba(155,109,255,0.18)", borderRadius: 100, padding: "6px 16px" }}>
              <span className="dot" style={{ background: "var(--accent)", width: 6, height: 6 }} /> Earner early access
            </div>
            <h2 style={{ fontSize: "clamp(32px, 5.5vw, 60px)", fontWeight: 900, letterSpacing: "-0.045em", lineHeight: 1.02, marginBottom: 18 }}>
              <Ticker value={spots} /> spots left.<br /><span className="g">Claim yours.</span>
            </h2>
            <p style={{ fontSize: 16, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 460, margin: "0 auto 40px" }}>
              Free to join. No credit card. Your skills, your rates, your schedule — and early earners get first access at launch.
            </p>
            <button className="btn-primary" onClick={() => setView("form")} style={{ fontSize: 16, padding: "18px 48px", borderRadius: 14 }}>
              Join as an Earner
            </button>
          </div>
        </div>
      </div>

      <hr className="hr" style={{ position: "relative", zIndex: 1 }} />
      <footer style={{ maxWidth: 1000, margin: "0 auto", padding: "56px 24px 32px", position: "relative", zIndex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 36, marginBottom: 44 }}>
          <div>
            <Logo />
            <p style={{ fontSize: 13, color: "var(--text-faint)", lineHeight: 1.7, marginTop: 14, maxWidth: 240 }}>
              The marketplace where people book your skills by the hour. Free to join. Earn on your own schedule.
            </p>
          </div>
          {[
            { head: "Product", links: [
              { label: "How it works", href: "#how-it-works" },
              { label: "FAQ", href: "#faq" },
              { label: "Leaderboard", href: "/leaderboard" },
            ]},
            { head: "Company", links: [
              { label: "About", href: "#about" },
              { label: "Contact us", href: "mailto:hello@getrentout.me" },
              { label: "Support", href: "mailto:support@getrentout.me" },
            ]},
            { head: "Legal", links: [
              { label: "Terms of Service", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
            ]},
          ].map(col => (
            <div key={col.head}>
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-dim)", marginBottom: 16 }}>{col.head}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {col.links.map(l => (
                  <a key={l.label} href={l.href} style={{ fontSize: 13.5, color: "var(--text-faint)", textDecoration: "none", transition: "color .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-faint)")}>{l.label}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>© 2026 RentOut. All rights reserved.</span>
          <span style={{ fontSize: 12.5, color: "var(--text-faint)" }}>hello@getrentout.me</span>
        </div>
      </footer>
    </div>
  );
}
// force redeploy Mon Jun 29 13:24:50 IST 2026

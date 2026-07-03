"use client";
import { useEffect, useRef, useState } from "react";

type Cursor = { id: string; x: number; y: number; color: string };

const COLORS = ["#9B6DFF", "#F28B82", "#38bdf8", "#34d399", "#fbbf24", "#f472b6"];
const NAMES = ["Arjun", "Priya", "Ravi", "Sneha", "Karan", "Meera", "Dev", "Ananya", "Rohan", "Pooja"];

export default function MultiCursors() {
  const [others, setOthers] = useState<Cursor[]>([]);
  const myId = useRef(`${Math.random().toString(36).slice(2, 8)}`);
  const myColor = useRef(COLORS[Math.floor(Math.random() * COLORS.length)]);
  const myName = useRef(NAMES[Math.floor(Math.random() * NAMES.length)]);
  const lastSend = useRef(0);
  const lastPos = useRef({ x: -1, y: -1 });

  useEffect(() => {
    // Send cursor position
    const sendCursor = (x: number, y: number) => {
      const now = Date.now();
      if (now - lastSend.current < 400) return;
      lastSend.current = now;
      lastPos.current = { x, y };
      fetch("/api/cursors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: myId.current, x, y, color: myColor.current }),
      }).catch(() => {});
    };

    const onMove = (e: MouseEvent) => sendCursor(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    window.addEventListener("mousemove", onMove);

    // Poll for other cursors
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/cursors");
        const data = await res.json();
        setOthers((data.cursors ?? []).filter((c: Cursor) => c.id !== myId.current));
      } catch {}
    }, 1000);

    // Remove cursor on leave
    const onLeave = () => {
      fetch("/api/cursors", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: myId.current }),
      }).catch(() => {});
    };
    window.addEventListener("beforeunload", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("beforeunload", onLeave);
      clearInterval(poll);
      onLeave();
    };
  }, []);

  if (!others.length) return null;

  return (
    <>
      {others.map((c) => (
        <div key={c.id} style={{
          position: "fixed", pointerEvents: "none", zIndex: 99990,
          left: `${c.x * 100}%`, top: `${c.y * 100}%`,
          transform: "translate(2px, 2px)",
          transition: "left 0.12s linear, top 0.12s linear",
        }}>
          {/* Cursor arrow */}
          <svg width="18" height="22" viewBox="0 0 18 22" style={{ display: "block" }}>
            <path d="M0 0L0 16L4.5 12L6.5 18L9 17L7 11L12 11Z"
              fill={c.color} stroke="rgba(0,0,0,0.4)" strokeWidth="0.8" strokeLinejoin="round" />
          </svg>
          {/* Name tag */}
          <div style={{
            fontSize: 10, fontWeight: 700, color: "#fff",
            background: c.color, borderRadius: 5,
            padding: "2px 7px", marginTop: 2, whiteSpace: "nowrap",
            boxShadow: `0 2px 8px ${c.color}60`,
          }}>
            {myName.current}
          </div>
        </div>
      ))}
    </>
  );
}

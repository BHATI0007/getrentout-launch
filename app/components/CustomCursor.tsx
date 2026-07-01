"use client";
import { useEffect } from "react";

export default function CustomCursor() {
  useEffect(() => {
    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    const dot = document.createElement("div");
    const ring = document.createElement("div");

    const BASE_DOT = "position:fixed;pointer-events:none;z-index:999999;border-radius:50%;transform:translate(-50%,-50%);left:-200px;top:-200px;transition:width .18s cubic-bezier(.16,1,.3,1),height .18s cubic-bezier(.16,1,.3,1);";
    const BASE_RING = "position:fixed;pointer-events:none;z-index:999998;border-radius:50%;transform:translate(-50%,-50%);left:-200px;top:-200px;";

    const setDotNormal  = () => { dot.style.cssText  = BASE_DOT  + "width:22px;height:22px;background:radial-gradient(circle at 38% 35%,#d8baff,#9B6DFF 60%,#7c44ff);box-shadow:0 0 16px rgba(155,109,255,1),0 0 36px rgba(155,109,255,.7),0 0 70px rgba(155,109,255,.3);"; dot.style.left = dotX + "px"; dot.style.top = dotY + "px"; };
    const setDotHovered = () => { dot.style.cssText  = BASE_DOT  + "width:10px;height:10px;opacity:.5;background:#9B6DFF;box-shadow:0 0 10px rgba(155,109,255,1);"; dot.style.left = dotX + "px"; dot.style.top = dotY + "px"; };
    const setDotClick   = () => { dot.style.cssText  = BASE_DOT  + "width:16px;height:16px;background:radial-gradient(circle,#ffd0cc,#F28B82);box-shadow:0 0 20px rgba(242,139,130,1),0 0 40px rgba(242,139,130,.5);"; dot.style.left = dotX + "px"; dot.style.top = dotY + "px"; };

    const setRingNormal  = () => { ring.style.cssText = BASE_RING + "width:56px;height:56px;border:2px solid rgba(155,109,255,.85);box-shadow:0 0 18px rgba(155,109,255,.35);transition:width .35s cubic-bezier(.16,1,.3,1),height .35s cubic-bezier(.16,1,.3,1),border-color .25s;"; ring.style.left = ringX + "px"; ring.style.top = ringY + "px"; };
    const setRingHovered = () => { ring.style.cssText = BASE_RING + "width:80px;height:80px;border:2.5px solid rgba(155,109,255,1);box-shadow:0 0 28px rgba(155,109,255,.55);transition:width .35s cubic-bezier(.16,1,.3,1),height .35s cubic-bezier(.16,1,.3,1),border-color .25s;"; ring.style.left = ringX + "px"; ring.style.top = ringY + "px"; };
    const setRingClick   = () => { ring.style.cssText = BASE_RING + "width:38px;height:38px;border:3px solid rgba(242,139,130,1);box-shadow:0 0 22px rgba(242,139,130,.7);transition:width .35s cubic-bezier(.16,1,.3,1),height .35s cubic-bezier(.16,1,.3,1),border-color .25s;"; ring.style.left = ringX + "px"; ring.style.top = ringY + "px"; };

    let dotX = -200, dotY = -200, ringX = -200, ringY = -200;
    let isHovered = false, isClicking = false;

    setDotNormal(); setRingNormal();
    document.body.appendChild(dot);
    document.body.appendChild(ring);

    let mx = -200, my = -200, raf: number;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      dotX = mx; dotY = my;
      dot.style.left = dotX + "px"; dot.style.top = dotY + "px";
    };

    const onDown = () => { isClicking = true;  setDotClick();   setRingClick(); };
    const onUp   = () => { isClicking = false; isHovered ? setDotHovered() : setDotNormal(); isHovered ? setRingHovered() : setRingNormal(); };

    const onEnter = (e: MouseEvent) => { if ((e.target as HTMLElement).closest("a,button")) { isHovered = true;  if (!isClicking) { setDotHovered(); setRingHovered(); } } };
    const onLeave = (e: MouseEvent) => { if (!(e.relatedTarget as HTMLElement|null)?.closest("a,button")) { isHovered = false; if (!isClicking) { setDotNormal();  setRingNormal();  } } };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    document.addEventListener("mouseover",  onEnter);
    document.addEventListener("mouseout",   onLeave);

    const tick = () => {
      ringX += (mx - ringX) * 0.1; ringY += (my - ringY) * 0.1;
      ring.style.left = ringX + "px"; ring.style.top = ringY + "px";
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      document.removeEventListener("mouseover",  onEnter);
      document.removeEventListener("mouseout",   onLeave);
      dot.remove(); ring.remove();
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";
    };
  }, []);

  return null;
}

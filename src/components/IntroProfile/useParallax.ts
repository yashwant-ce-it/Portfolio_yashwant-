import { useEffect, useRef } from "react";

export function useParallax() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const portraitRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Check prefers-reduced-motion and touch capability
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isTouch = window.matchMedia("(hover: none)").matches;

    if (prefersReducedMotion || isTouch) return;

    let rafId: number | null = null;
    let targetPx = 0;
    let targetPy = 0;
    let currentPx = 0;
    let currentPy = 0;
    let targetSpotX = 0;
    let targetSpotY = 0;

    const handlePointerMove = (e: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      // Normalized between -1 and 1 from center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      targetPx = (e.clientX - centerX) / (rect.width / 2);
      targetPy = (e.clientY - centerY) / (rect.height / 2);

      // Clamp between -1 and 1
      targetPx = Math.max(-1, Math.min(1, targetPx));
      targetPy = Math.max(-1, Math.min(1, targetPy));

      if (portraitRef.current) {
        const pRect = portraitRef.current.getBoundingClientRect();
        targetSpotX = e.clientX - pRect.left;
        targetSpotY = e.clientY - pRect.top;
      }

      if (rafId === null) {
        rafId = requestAnimationFrame(updateStyles);
      }
    };

    const handlePointerLeave = () => {
      targetPx = 0;
      targetPy = 0;
      if (rafId === null) {
        rafId = requestAnimationFrame(updateStyles);
      }
    };

    const updateStyles = () => {
      // Lerp for smooth spring dampening
      currentPx += (targetPx - currentPx) * 0.12;
      currentPy += (targetPy - currentPy) * 0.12;

      section.style.setProperty("--px", currentPx.toFixed(4));
      section.style.setProperty("--py", currentPy.toFixed(4));
      section.style.setProperty("--spot-x", `${targetSpotX.toFixed(1)}px`);
      section.style.setProperty("--spot-y", `${targetSpotY.toFixed(1)}px`);

      if (
        Math.abs(targetPx - currentPx) > 0.001 ||
        Math.abs(targetPy - currentPy) > 0.001
      ) {
        rafId = requestAnimationFrame(updateStyles);
      } else {
        rafId = null;
      }
    };

    section.addEventListener("pointermove", handlePointerMove);
    section.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      section.removeEventListener("pointermove", handlePointerMove);
      section.removeEventListener("pointerleave", handlePointerLeave);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return { sectionRef, portraitRef };
}


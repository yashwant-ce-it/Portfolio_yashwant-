import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  layer: 0 | 1 | 2; // 0: far (4px), 1: mid (10px), 2: near (18px)
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface StarfieldProps {
  isActive?: boolean;
}

// Subtle, calm starlight palette for stealth dark theme
const CYBER_STAR_COLORS = [
  "#FFFFFF",
  "#FFFFFF",
  "#F8FAFC",
  "#E2E8F0",
  "#CBD5E1",
  "#94A3B8",
  "#DDD6FE",
];

export const Starfield: React.FC<StarfieldProps> = ({ isActive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let stars: Star[] = [];
    let isVisible = isActive && !document.hidden;

    const generateStars = (count: number) => {
      const arr: Star[] = [];
      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        const layer = rand < 0.55 ? 0 : rand < 0.85 ? 1 : 2;
        let radius = 0.6;
        let baseAlpha = 0.35;

        if (layer === 0) {
          radius = 0.5 + Math.random() * 0.6;
          baseAlpha = 0.2 + Math.random() * 0.3;
        } else if (layer === 1) {
          radius = 1.0 + Math.random() * 0.8;
          baseAlpha = 0.5 + Math.random() * 0.3;
        } else {
          radius = 1.6 + Math.random() * 1.2;
          baseAlpha = 0.75 + Math.random() * 0.25;
        }

        arr.push({
          x: Math.random(),
          y: Math.random(),
          radius,
          baseAlpha,
          layer,
          twinkleSpeed: 0.6 + Math.random() * 1.8,
          twinklePhase: Math.random() * Math.PI * 2,
          color: CYBER_STAR_COLORS[Math.floor(Math.random() * CYBER_STAR_COLORS.length)],
        });
      }
      return arr;
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const count = width < 768 ? 90 : 220;
      stars = generateStars(count);
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(canvas);

    const draw = (now: number) => {
      if (!isVisible) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Read parallax offsets from section container CSS variables
      const section = canvas.closest("section");
      let px = 0;
      let py = 0;
      if (section) {
        px = parseFloat(section.style.getPropertyValue("--px")) || 0;
        py = parseFloat(section.style.getPropertyValue("--py")) || 0;
      }

      const layerOffsets = [
        { x: px * 4, y: py * 4 },
        { x: px * 10, y: py * 10 },
        { x: px * 18, y: py * 18 },
      ];

      const tSec = now * 0.001;

      // Additive blending for glowing particle field like Citadel
      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        const offset = layerOffsets[star.layer];
        let sx = star.x * width + offset.x;
        let sy = star.y * height + offset.y;

        // Wrap around seamlessly
        if (sx < 0) sx += width;
        if (sx > width) sx -= width;
        if (sy < 0) sy += height;
        if (sy > height) sy -= height;

        let alpha = star.baseAlpha;
        if (star.layer === 2) {
          alpha = Math.max(
            0.35,
            Math.min(1, star.baseAlpha + Math.sin(tSec * star.twinkleSpeed + star.twinklePhase) * 0.3)
          );
        }

        // Draw soft glowing radial particle
        const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, star.radius * 2.4);
        grad.addColorStop(0, star.color);
        grad.addColorStop(0.4, star.color);
        grad.addColorStop(1, "transparent");

        ctx.globalAlpha = alpha;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sx, sy, star.radius * 2.4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      isVisible = isActive && !document.hidden;
      if (isVisible && !rafId) {
        rafId = requestAnimationFrame(draw);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 2 }}
      aria-hidden="true"
    />
  );
};

export default Starfield;

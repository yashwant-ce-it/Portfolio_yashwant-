import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FlipNameProps {
  front?: string;
  back?: string;
  className?: string;
  isRevealed?: boolean;
}

interface SlotData {
  index: number;
  frontChar: string;
  backChar: string;
}

export const FlipName: React.FC<FlipNameProps> = ({
  front = "YASHWANT",
  back = "SHARMA",
  className = "",
  isRevealed = true,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [slotWidths, setSlotWidths] = useState<number[]>([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Scoped pointer pill state
  const [pillPos, setPillPos] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Compute 8 slots centering the shorter back word
  const slots: SlotData[] = useMemo(() => {
    const frontChars = front.split("");
    const backChars = back.split("");
    const length = Math.max(frontChars.length, backChars.length);
    const offset = Math.floor((length - backChars.length) / 2);

    return Array.from({ length }).map((_, i) => {
      const fChar = frontChars[i] || "";
      const bIndex = i - offset;
      const bChar =
        bIndex >= 0 && bIndex < backChars.length ? backChars[bIndex] : "·";
      return {
        index: i,
        frontChar: fChar,
        backChar: bChar,
      };
    });
  }, [front, back]);

  // Measure glyph widths to prevent any layout shift on flip
  const measureGlyphs = useCallback(() => {
    if (!containerRef.current) return;
    const computedStyle = window.getComputedStyle(containerRef.current);
    const font = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = font;

    const widths = slots.map((slot) => {
      const wFront = ctx.measureText(slot.frontChar).width;
      const wBack =
        slot.backChar === "·" ? wFront * 0.45 : ctx.measureText(slot.backChar).width;
      return Math.ceil(Math.max(wFront, wBack));
    });

    setSlotWidths(widths);
  }, [slots]);

  useEffect(() => {
    const checkMedia = () => {
      setReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      );
      setIsTouchDevice(window.matchMedia("(hover: none)").matches);
    };
    checkMedia();

    measureGlyphs();
    window.addEventListener("resize", measureGlyphs);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(measureGlyphs);
    }

    return () => {
      window.removeEventListener("resize", measureGlyphs);
    };
  }, [measureGlyphs]);

  // Touch auto-flip every 4s until first interaction
  useEffect(() => {
    if (!isTouchDevice || hasInteracted) return;

    const interval = setInterval(() => {
      setIsFlipped((prev) => !prev);
    }, 4000);

    return () => clearInterval(interval);
  }, [isTouchDevice, hasInteracted]);

  // Hover detection with 120ms leave debounce
  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    setIsHovered(true);
    setIsFlipped(true);
    setHasInteracted(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPillPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
      setIsFlipped(false);
      setPillPos(null);
    }, 120);
  };

  // Keyboard navigation & tap handlers
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsFlipped((prev) => !prev);
      setHasInteracted(true);
    }
  };

  const handleClick = () => {
    if (isTouchDevice) {
      setIsFlipped((prev) => !prev);
      setHasInteracted(true);
    }
  };

  return (
    <div
      ref={containerRef}
      role="text"
      aria-label="Yashwant Sharma"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onFocus={() => {
        setIsFlipped(true);
        setHasInteracted(true);
      }}
      onBlur={() => {
        setIsFlipped(false);
      }}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#915EFF] focus-visible:ring-offset-8 focus-visible:ring-offset-[#050816] rounded-xl transition-all ${className}`}
      style={{
        perspective: "1000px",
      }}
    >
      {/* Scoped "FLIP" pill following the pointer */}
      <AnimatePresence>
        {isHovered && pillPos && !isTouchDevice && !reducedMotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.15 }}
            className="absolute pointer-events-none z-30 -top-3 left-0 px-2 py-0.5 rounded-full bg-[#915EFF] text-black font-mono text-[10px] font-bold tracking-widest uppercase shadow-lg shadow-[#915EFF]/40"
            style={{
              transform: `translate(${pillPos.x + 12}px, ${pillPos.y - 18}px)`,
            }}
          >
            FLIP
          </motion.div>
        )}
      </AnimatePresence>

      {/* Letter slots */}
      <div className="flex items-center justify-center">
        {slots.map((slot, index) => {
          const widthStyle = slotWidths[index] ? `${slotWidths[index]}px` : "auto";

          // Reduced motion: crossfade instead of 3D flip
          if (reducedMotion) {
            return (
              <div
                key={slot.index}
                aria-hidden="true"
                className="relative inline-flex items-center justify-center overflow-hidden"
                style={{ width: widthStyle }}
              >
                <span
                  className="transition-opacity duration-200 text-[#915EFF]"
                  style={{ opacity: isFlipped ? 0 : 1 }}
                >
                  {slot.frontChar}
                </span>
                <span
                  className="absolute inset-0 flex items-center justify-center transition-opacity duration-200 bg-gradient-to-r from-[#22D3EE] to-[#915EFF] bg-clip-text text-transparent"
                  style={{
                    opacity: isFlipped ? 1 : 0,
                  }}
                >
                  {slot.backChar}
                </span>
              </div>
            );
          }

          // Full 3D animated flip with spring physics & left-to-right wave stagger
          return (
            <div
              key={slot.index}
              aria-hidden="true"
              className="relative inline-flex items-center justify-center overflow-visible"
              style={{
                width: widthStyle,
                perspective: "1000px",
              }}
            >
              {/* Initial reveal mask wrapper */}
              <motion.div
                initial={{ y: "110%", rotateX: -40, opacity: 0 }}
                animate={
                  isRevealed
                    ? { y: 0, rotateX: 0, opacity: 1 }
                    : { y: "110%", rotateX: -40, opacity: 0 }
                }
                transition={{
                  duration: 0.8,
                  delay: 0.1 + index * 0.045,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="relative inline-block"
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* 3D Flip Card */}
                <motion.div
                  animate={{
                    rotateX: isFlipped ? 180 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 22,
                    delay: (isFlipped ? index : slots.length - 1 - index) * 0.045,
                  }}
                  className="relative inline-block"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                >
                  {/* Front face (YASHWANT in exact hero purple) */}
                  <div
                    className="relative flex items-center justify-center text-[#915EFF]"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateX(0deg)",
                    }}
                  >
                    {slot.frontChar}
                  </div>

                  {/* Back face (SHARMA in cyan-to-purple gradient) */}
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      backfaceVisibility: "hidden",
                      WebkitBackfaceVisibility: "hidden",
                      transform: "rotateX(180deg)",
                    }}
                  >
                    <span
                      className={`bg-gradient-to-r from-[#22D3EE] via-[#7487F6] to-[#915EFF] bg-clip-text text-transparent ${
                        slot.backChar === "·"
                          ? "text-[#22D3EE]/60 text-[0.6em] animate-pulse"
                          : ""
                      }`}
                    >
                      {slot.backChar}
                    </span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FlipName;


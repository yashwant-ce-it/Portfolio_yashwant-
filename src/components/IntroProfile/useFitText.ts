import { useState, useEffect, useCallback } from "react";

/**
 * useFitText Hook
 * Ensures text never overflows its container by scaling it down
 * and maintaining at least 4% margin on each side (width <= 92%).
 */
export function useFitText(
  targetRef: React.RefObject<HTMLElement | null>,
  containerRef: React.RefObject<HTMLElement | null>
) {
  const [scale, setScale] = useState(1);

  const calculateFit = useCallback(() => {
    const target = targetRef.current;
    const container = containerRef.current;
    if (!target || !container) return;

    // Available width with at least 4% margin on each side (max 92%)
    const availableWidth = container.clientWidth * 0.92;
    // Reset scale temporarily to measure true unscaled scrollWidth
    target.style.transform = "none";
    const contentWidth = target.scrollWidth;

    if (contentWidth > 0 && availableWidth > 0) {
      if (contentWidth > availableWidth) {
        const newScale = Math.min(1, availableWidth / contentWidth);
        setScale(newScale);
      } else {
        setScale(1);
      }
    }
  }, [targetRef, containerRef]);

  useEffect(() => {
    calculateFit();

    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver(() => {
      calculateFit();
    });
    ro.observe(container);

    window.addEventListener("resize", calculateFit);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(calculateFit);
    }

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", calculateFit);
    };
  }, [calculateFit, containerRef]);

  return scale;
}


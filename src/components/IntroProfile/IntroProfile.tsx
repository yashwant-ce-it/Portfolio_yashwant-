import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import FlipName from "./FlipName";
import Starfield from "./Starfield";
import { useParallax } from "./useParallax";
import { useFitText } from "./useFitText";
import styles from "./introProfile.module.css";

/* ═══════════════════════════════════════════════════════════
   CONTENT CONFIGURATION
   Stealth Dark Theme
   ═══════════════════════════════════════════════════════════ */
export const INTRO_CONTENT = {
  nameFront: "YASHWANT",
  nameBack: "SHARMA",
  fullNameAria: "Yashwant Sharma",
  roleCaption: "AI & SOFTWARE DEVELOPER",
  idLabel: "PORTFOLIO // YS-01",
  statusLabel: "AVAILABLE",
  // Real transparent cutout exports (389 x 735)
  photoCutoutWebp: "/images/yashwant-cutout.webp",
  photoCutout700Webp: "/images/yashwant-cutout-700.webp",
  photoCutoutAvif: "/images/yashwant-cutout.avif",
  photoCutoutPng: "/images/yashwant-cutout.png",
  photoFallback: "/images/yashwant-photo.jpg",
  photoAlt: "Portrait of Yashwant Sharma",
  nameOverlap: true, // portrait overlaps lower ~15-20% of the name letters
  flipSpeed: 0.7,
};

export const IntroProfile: React.FC = () => {
  const { sectionRef, portraitRef } = useParallax();
  const nameContainerRef = useRef<HTMLDivElement | null>(null);
  const nameWrapperRef = useRef<HTMLDivElement | null>(null);

  // useFitText hook guarantees name never overflows, maintaining >= 4% side margins
  const fitScale = useFitText(nameWrapperRef, nameContainerRef);

  const [isActive, setIsActive] = useState(true);
  const [typedRole, setTypedRole] = useState("");

  // Trigger master choreography once when 25% visible
  const isInView = useInView(sectionRef as React.RefObject<Element>, {
    once: true,
    amount: 0.25,
  });

  // IntersectionObserver to pause background starfield animations when off-screen
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionRef]);

  // Typewriter effect for role caption: starts at t=0.90s, 30ms/char
  useEffect(() => {
    if (!isInView) return;

    let timeoutId: NodeJS.Timeout;
    const fullText = `[ ${INTRO_CONTENT.roleCaption} ]`;
    let currentIndex = 0;

    const startDelay = setTimeout(() => {
      const typeChar = () => {
        if (currentIndex <= fullText.length) {
          setTypedRole(fullText.slice(0, currentIndex));
          currentIndex++;
          timeoutId = setTimeout(typeChar, 30);
        }
      };
      typeChar();
    }, 900);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timeoutId);
    };
  }, [isInView]);

  return (
    <section
      id="intro"
      aria-labelledby="intro-heading"
      ref={sectionRef}
      data-active={isActive ? "true" : "false"}
      className={styles.section}
    >
      <h2 id="intro-heading" className="sr-only">
        {INTRO_CONTENT.fullNameAria} — {INTRO_CONTENT.roleCaption}
      </h2>

      {/* ─── Top Seam Gradient Fading Seamlessly from Hero (#050816) ─── */}
      <div className={styles.topSeamMask} aria-hidden="true" />

      {/* ─── Deep Dark Starfield Canvas (Subtle Calm Starlight) ─── */}
      <Starfield isActive={isActive} />

      {/* ─── Ghost Marquee Depth Layer (Dark Monochromatic Tone) ─── */}
      <div className={styles.ghostLayer} aria-hidden="true">
        <div className={styles.ghostTrack}>
          <span className={styles.ghostText}>
            YASHWANT SHARMA &bull; YASHWANT SHARMA &bull;
          </span>
          <span className={styles.ghostText}>
            YASHWANT SHARMA &bull; YASHWANT SHARMA &bull;
          </span>
        </div>
      </div>

      {/* ─── Center Stage ─── */}
      <div className={styles.stage}>
        {/* ─── Name Container with Fit-To-Width & Container Queries ─── */}
        <div ref={nameContainerRef} className={styles.nameContainer}>
          <div
            ref={nameWrapperRef}
            className={`${styles.nameWrapper} ${
              INTRO_CONTENT.nameOverlap
                ? styles.nameOverlap
                : styles.nameNoOverlap
            }`}
            style={{
              transform: fitScale < 1 ? `scale(${fitScale})` : "none",
            }}
          >
            <FlipName
              front={INTRO_CONTENT.nameFront}
              back={INTRO_CONTENT.nameBack}
              isRevealed={isInView}
            />
          </div>
        </div>

        {/* ─── Cutout Portrait Layer (Clean Dark Float, No Neon Halos) ─── */}
        <div className={styles.portraitWrapper}>
          {/* 3D Tilt + Idle Float Box */}
          <div className={styles.tiltBox} ref={portraitRef}>
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 35, filter: "blur(10px)" }}
              animate={
                isInView
                  ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, scale: 0.94, y: 35, filter: "blur(10px)" }
              }
              transition={{
                duration: 0.9,
                delay: 0.45,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={styles.portraitCutout}
            >
              <picture>
                <source
                  srcSet={INTRO_CONTENT.photoCutoutAvif}
                  type="image/avif"
                />
                <source
                  srcSet={`${INTRO_CONTENT.photoCutout700Webp} 700w, ${INTRO_CONTENT.photoCutoutWebp} 1400w`}
                  sizes="(max-width: 768px) 700px, 1400px"
                  type="image/webp"
                />
                <img
                  src={INTRO_CONTENT.photoCutoutPng}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== INTRO_CONTENT.photoFallback) {
                      target.src = INTRO_CONTENT.photoFallback;
                    }
                  }}
                  alt={INTRO_CONTENT.photoAlt}
                  width={389}
                  height={735}
                  loading="lazy"
                  decoding="async"
                  {...({ fetchPriority: "low" } as any)}
                  className={styles.cutoutImg}
                />
              </picture>
            </motion.div>

            {/* Subtle Minimalist HUD Framing */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={
                isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }
              }
              transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className={styles.hudLayer}
              aria-hidden="true"
            >
              <div className={styles.bracketTL} />
              <div className={styles.bracketTR} />
              <div className={styles.bracketBL} />
              <div className={styles.bracketBR} />

              <div className={styles.hudHeader}>
                <span>{INTRO_CONTENT.idLabel}</span>
                <div className={styles.onlineStatus}>
                  <div className={styles.statusDot} />
                  <span>{INTRO_CONTENT.statusLabel}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ─── Role Caption (Typewriter) ─── */}
        <div className={styles.roleCaption} aria-label={INTRO_CONTENT.roleCaption}>
          <span>{typedRole || "\u00A0"}</span>
        </div>

        {/* ─── "Hover or Tap" Hint Chip (Dark Stealth Tone) ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={
            isInView
              ? {
                  opacity: [0, 1, 0.6, 1, 0.8, 1],
                  y: 0,
                }
              : { opacity: 0, y: 10 }
          }
          transition={{
            duration: 1.2,
            delay: 1.4,
            times: [0, 0.3, 0.5, 0.7, 0.85, 1],
            ease: "easeInOut",
          }}
          className={styles.hintChip}
          aria-hidden="true"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#aaa6c3] animate-ping" />
          <span>Hover or tap to flip name</span>
        </motion.div>
      </div>
    </section>
  );
};

export default IntroProfile;

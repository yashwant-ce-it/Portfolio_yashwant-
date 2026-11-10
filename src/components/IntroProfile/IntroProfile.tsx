import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import FlipName from "./FlipName";
import Starfield from "./Starfield";
import { useParallax } from "./useParallax";
import { useFitText } from "./useFitText";
import styles from "./introProfile.module.css";

/* ═══════════════════════════════════════════════════════════
   CONTENT CONFIGURATION
   Editable in 10 seconds
   ═══════════════════════════════════════════════════════════ */
export const INTRO_CONTENT = {
  nameFront: "YASHWANT",
  nameBack: "SHARMA",
  fullNameAria: "Yashwant Sharma",
  roleCaption: "SOFTWERE DEVELOPER",
  idLabel: "NODE // YS-01",
  statusLabel: "CITADEL ACTIVE",
  // Real transparent cutout exports (389 x 735)
  photoCutoutWebp: "/images/yashwant-cutout.webp",
  photoCutout700Webp: "/images/yashwant-cutout-700.webp",
  photoCutoutAvif: "/images/yashwant-cutout.avif",
  photoCutoutPng: "/images/yashwant-cutout.png",
  photoFallback: "/images/yashwant-photo.jpg",
  photoAlt: "Portrait of Yashwant Sharma",
  nameOverlap: true, // true: portrait overlaps lower ~15-20% of the name letters
  flipSpeed: 0.7,
  accentColor: "#915EFF", // Hero purple
  accentCyan: "#00f0ff",  // Cyber cyan
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

  // IntersectionObserver to pause heavy background CSS animations when off-screen
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

      {/* ─── Seamless 160px Top Gradient Mask from Hero (#050816) ─── */}
      <div className={styles.topSeamMask} aria-hidden="true" />

      {/* ─── Layer 1: Cyber Grid Horizon Floor (Citadel Perspective) ─── */}
      <div className={styles.cyberGridFloor} aria-hidden="true" />

      {/* ─── Layer 2: Deep-Space Nebulae (Screen Blend Mode) ─── */}
      <div className={styles.nebulaContainer} aria-hidden="true">
        <div className={styles.nebulaPurple} />
        <div className={styles.nebulaCyan} />
        <div className={styles.nebulaMagenta} />
      </div>

      {/* ─── Layer 3: Milky-Way Diagonal Band ─── */}
      <div className={styles.milkyWayBand} aria-hidden="true" />

      {/* ─── Layer 4: 2D Canvas Starfield (Cyber Multicolored Glowing Particles) ─── */}
      <Starfield isActive={isActive} />

      {/* ─── Layer 5: Shooting Star Streak ─── */}
      <div className={styles.shootingStarTrack} aria-hidden="true" />

      {/* ─── Layer 6: Planet Horizon Arc & Distant Moon ─── */}
      <div className={styles.planetHorizon} aria-hidden="true" />
      <div className={styles.distantMoon} aria-hidden="true" />

      {/* ─── Floating Holographic Geometric Nodes (Citadel Cyber Core Accents) ─── */}
      <div className={styles.hologramNodeLeft} aria-hidden="true">
        <div className={styles.holoInner} />
      </div>
      <div className={styles.hologramNodeRight} aria-hidden="true">
        <div className={styles.holoInner} />
      </div>

      {/* ─── Ghost Marquee Depth Layer ─── */}
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

        {/* ─── Cutout Portrait Layer (True Center Float, No Box/Border) ─── */}
        <div className={styles.portraitWrapper}>
          {/* Head Backlight Glow (mix-blend-mode: screen) */}
          <div className={styles.headBacklight} aria-hidden="true" />

          {/* 2 Tilted Orbit Rings with Satellite Dots */}
          <div className={styles.orbitRingPurple} aria-hidden="true">
            <div className={styles.orbitDotPurple} />
          </div>
          <div className={styles.orbitRingCyan} aria-hidden="true">
            <div className={styles.orbitDotCyan} />
          </div>

          {/* 3D Tilt + Idle Float Box */}
          <div className={styles.tiltBox} ref={portraitRef}>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 40, filter: "blur(14px)" }}
              animate={
                isInView
                  ? { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
                  : { opacity: 0, scale: 0.92, y: 40, filter: "blur(14px)" }
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

              {/* Cyan / Purple Light Sweep across portrait once */}
              <motion.div
                initial={{ left: "-140%" }}
                animate={isInView ? { left: "180%" } : { left: "-140%" }}
                transition={{
                  duration: 1.1,
                  delay: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={styles.lightSweep}
                aria-hidden="true"
              />

              {/* Cursor Spotlight over subject */}
              <div className={styles.spotlight} aria-hidden="true" />
            </motion.div>

            {/* HUD Framing Accents */}
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

        {/* ─── "Hover or Tap" Hint Chip ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={
            isInView
              ? {
                  opacity: [0, 1, 0.5, 1, 0.7, 1],
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
          <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping" />
          <span>Hover or tap to flip name</span>
        </motion.div>
      </div>
    </section>
  );
};

export default IntroProfile;

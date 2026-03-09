"use client";

import confetti from "canvas-confetti";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type FallingHeart = {
  id: number;
  x: number;
  y: number;
  speed: number;
  wobble: number;
  scale: number;
};

type CatchBurst = {
  id: number;
  x: number;
  y: number;
};

const TARGET_SCORE = 10;
const HEART_SPAWN_MS = 1500;
const PLAYER_WIDTH = 104;
const PLAYER_HEIGHT = 96;
const HEART_SIZE = 56;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function randomNoPosition() {
  return {
    left: 8 + Math.random() * 50,
    top: 64 + Math.random() * 16,
  };
}

function FloatingHearts() {
  const hearts = useMemo(
    () =>
      Array.from({ length: 18 }, (_, index) => ({
        id: index,
        left: `${4 + index * 5.4}%`,
        delay: (index % 6) * 1.2,
        duration: 10 + (index % 5) * 2.1,
        scale: 0.42 + (index % 4) * 0.14,
        opacity: 0.12 + (index % 3) * 0.08,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className="absolute bottom-[-18%]"
          style={{ left: heart.left }}
          animate={{
            y: [0, -940],
            x: [0, heart.id % 2 === 0 ? 18 : -20, 0],
            rotate: [0, heart.id % 2 === 0 ? 10 : -10, 0],
            opacity: [0, heart.opacity, heart.opacity, 0],
          }}
          transition={{
            duration: heart.duration,
            delay: heart.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <svg
            aria-hidden="true"
            className="drop-shadow-[0_0_18px_rgba(255,135,170,0.28)]"
            fill="none"
            height="36"
            style={{ transform: `scale(${heart.scale})` }}
            viewBox="0 0 32 29"
            width="32"
          >
            <path
              d="M23.6 0C20.9 0 18.5 1.2 16.9 3.2C15.3 1.2 12.9 0 10.2 0C4.6 0 0 4.6 0 10.2C0 20.1 16.9 29 16.9 29C16.9 29 33.8 20.1 33.8 10.2C33.8 4.6 29.2 0 23.6 0Z"
              fill="rgba(255, 206, 221, 0.75)"
            />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

export function ProposalExperience() {
  const arenaRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const heartIdRef = useRef(0);
  const burstIdRef = useRef(0);
  const initializedPlayerRef = useRef(false);
  const heartsRef = useRef<FallingHeart[]>([]);
  const scoreRef = useRef(0);
  const playerCenterXRef = useRef(PLAYER_WIDTH / 2);

  const [arenaSize, setArenaSize] = useState({ width: 0, height: 0 });
  const [hearts, setHearts] = useState<FallingHeart[]>([]);
  const [bursts, setBursts] = useState<CatchBurst[]>([]);
  const [score, setScore] = useState(0);
  const [statusText, setStatusText] = useState(
    "Drag Kiki to catch each falling heart.",
  );
  const [playerPulse, setPlayerPulse] = useState(0);
  const [hasSaidYes, setHasSaidYes] = useState(false);
  const [noPosition, setNoPosition] = useState(randomNoPosition);
  const [hasDodgedNo, setHasDodgedNo] = useState(false);
  const [canDodgeNo, setCanDodgeNo] = useState(false);
  const [yesLocked, setYesLocked] = useState(false);

  const playerX = useMotionValue(0);
  const maxPlayerX = Math.max(arenaSize.width - PLAYER_WIDTH, 1);
  const playerRotate = useTransform(playerX, [0, maxPlayerX], [-8, 8]);

  useMotionValueEvent(playerX, "change", (latest) => {
    playerCenterXRef.current = latest + PLAYER_WIDTH / 2;
  });

  const isUnlocked = score >= TARGET_SCORE;
  const gameActive =
    !isUnlocked && !hasSaidYes && arenaSize.width > 0 && arenaSize.height > 0;

  useEffect(() => {
    const arenaNode = arenaRef.current;

    if (!arenaNode) {
      return;
    }

    const updateArena = () => {
      const rect = arenaNode.getBoundingClientRect();
      const nextWidth = rect.width;
      const nextHeight = rect.height;

      setArenaSize({ width: nextWidth, height: nextHeight });

      const maxX = Math.max(nextWidth - PLAYER_WIDTH, 0);
      const nextX = initializedPlayerRef.current
        ? clamp(playerX.get(), 0, maxX)
        : maxX / 2;

      initializedPlayerRef.current = true;
      playerX.set(nextX);
      playerCenterXRef.current = nextX + PLAYER_WIDTH / 2;
    };

    updateArena();

    const observer = new ResizeObserver(updateArena);
    observer.observe(arenaNode);

    return () => observer.disconnect();
  }, [playerX]);

  useEffect(() => {
    heartsRef.current = hearts;
  }, [hearts]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (!gameActive) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }

    audio.volume = 0.22;

    void audio.play().catch(() => {
      audio.muted = true;
      void audio.play().catch(() => {
        audio.muted = false;
      });
    });

    return () => {
      audio.pause();
      audio.currentTime = 0;
      audio.muted = false;
    };
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) {
      return;
    }

    const spawnHeart = () => {
      const spawnX = arenaSize.width * (0.1 + Math.random() * 0.8);

      const newHeart: FallingHeart = {
        id: heartIdRef.current++,
        x: spawnX,
        y: -HEART_SIZE,
        speed: 220 + Math.random() * 70,
        wobble: 10 + Math.random() * 8,
        scale: 0.95 + Math.random() * 0.2,
      };

      const nextHearts = [...heartsRef.current, newHeart];
      heartsRef.current = nextHearts;
      setHearts(nextHearts);
    };

    spawnHeart();
    const interval = window.setInterval(spawnHeart, HEART_SPAWN_MS);

    return () => window.clearInterval(interval);
  }, [arenaSize.width, gameActive]);

  useEffect(() => {
    if (!gameActive) {
      return;
    }

    let frameId = 0;
    let previousTime = performance.now();

    const animateHearts = (now: number) => {
      const deltaSeconds = Math.min((now - previousTime) / 1000, 0.032);
      previousTime = now;

      const catchLine = arenaSize.height - PLAYER_HEIGHT - 32;
      const caughtHearts: FallingHeart[] = [];
      const nextHearts: FallingHeart[] = [];

      for (const heart of heartsRef.current) {
        const nextY = heart.y + heart.speed * deltaSeconds;
        const closeEnough =
          Math.abs(heart.x - playerCenterXRef.current) <= PLAYER_WIDTH * 0.42;

        if (nextY >= catchLine && closeEnough) {
          caughtHearts.push({ ...heart, y: catchLine });
          continue;
        }

        if (nextY > arenaSize.height + HEART_SIZE) {
          continue;
        }

        nextHearts.push({ ...heart, y: nextY });
      }

      heartsRef.current = nextHearts;
      setHearts(nextHearts);

      if (caughtHearts.length > 0) {
        if (typeof navigator !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(24);
        }

        setPlayerPulse((current) => current + 1);

        for (const heart of caughtHearts) {
          const burst = {
            id: burstIdRef.current++,
            x: heart.x,
            y: heart.y - 22,
          };

          setBursts((current) => [...current, burst]);
          window.setTimeout(() => {
            setBursts((current) =>
              current.filter((item) => item.id !== burst.id),
            );
          }, 520);
        }

        const nextScore = Math.min(
          scoreRef.current + caughtHearts.length,
          TARGET_SCORE,
        );
        scoreRef.current = nextScore;
        setScore(nextScore);

        if (nextScore < TARGET_SCORE) {
          setStatusText("Caught one. Keep going.");
        } else {
          setStatusText("The secret is ready.");
          heartsRef.current = [];
          setHearts([]);
        }
      }

      frameId = window.requestAnimationFrame(animateHearts);
    };

    frameId = window.requestAnimationFrame(animateHearts);

    return () => window.cancelAnimationFrame(frameId);
  }, [arenaSize.height, gameActive]);

  useEffect(() => {
    if (!hasSaidYes) {
      return;
    }

    const launchConfetti = () => {
      confetti({
        angle: 60,
        spread: 72,
        origin: { x: 0 },
        particleCount: 90,
        colors: ["#ffe4ea", "#ff5f87", "#f43f5e", "#ffd6df"],
      });
      confetti({
        angle: 120,
        spread: 72,
        origin: { x: 1 },
        particleCount: 90,
        colors: ["#ffe4ea", "#ff5f87", "#f43f5e", "#ffd6df"],
      });
      confetti({
        spread: 108,
        startVelocity: 36,
        scalar: 1.05,
        particleCount: 120,
        colors: ["#fff4f6", "#ff5f87", "#b21e4b", "#ffd6df"],
      });
    };

    launchConfetti();
    const timeout = window.setTimeout(launchConfetti, 260);
    window.history.replaceState(window.history.state, "", "/");

    return () => {
      window.clearTimeout(timeout);
    };
  }, [hasSaidYes]);

  useEffect(() => {
    if (!isUnlocked || hasSaidYes) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setHasDodgedNo(false);
      setCanDodgeNo(false);
      setYesLocked(false);
      setNoPosition(randomNoPosition());
    }, 0);

    const timer = window.setTimeout(() => {
      setCanDodgeNo(true);
    }, 450);

    return () => {
      window.clearTimeout(resetTimer);
      window.clearTimeout(timer);
    };
  }, [hasSaidYes, isUnlocked]);

  function dodgeNoButton(
    event?:
      | React.MouseEvent<HTMLButtonElement>
      | React.TouchEvent<HTMLButtonElement>
      | React.PointerEvent<HTMLButtonElement>,
  ) {
    event?.preventDefault();
    event?.stopPropagation();

    if (!canDodgeNo) {
      return;
    }

    setYesLocked(true);
    setHasDodgedNo(true);
    setNoPosition(randomNoPosition());

    window.setTimeout(() => {
      setYesLocked(false);
    }, 650);
  }

  function blockNoClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  function handleYesClick(event?: React.MouseEvent<HTMLButtonElement>) {
    event?.preventDefault();

    if (yesLocked) {
      return;
    }

    setHasSaidYes(true);
  }

  return (
    <main className="relative h-dvh w-full overflow-hidden bg-[linear-gradient(180deg,#12020b_0%,#2a0413_45%,#0d0208_100%)] text-rose-50">
      <audio ref={audioRef} loop preload="auto" src="/nyan-cat.mp3" />

      <FloatingHearts />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,239,244,0.12),transparent_34%),radial-gradient(circle_at_bottom,rgba(236,95,134,0.12),transparent_26%)]" />

      <section className="relative z-10 flex h-full flex-col overflow-hidden px-4 pb-4 pt-4">
        <motion.div
          animate={{ opacity: [0.85, 1, 0.9] }}
          className="mx-auto w-full max-w-sm shrink-0 rounded-4xl border border-white/15 bg-white/10 p-4 shadow-[0_18px_54px_rgba(0,0,0,0.3)] backdrop-blur-md"
          transition={{
            duration: 3.2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <p className="font-display text-center text-[2rem] font-semibold tracking-[0.18em] uppercase text-rose-50">
            Catch The Love
          </p>
          <p className="mt-2 text-center text-sm text-rose-100/92">
            Catch {TARGET_SCORE} hearts to unlock a secret... {score}/
            {TARGET_SCORE}
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/20">
            <motion.div
              animate={{ width: `${(score / TARGET_SCORE) * 100}%` }}
              className="h-full rounded-full bg-linear-to-r from-rose-200 via-rose-400 to-rose-600 shadow-[0_0_24px_rgba(255,132,164,0.8)]"
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <p className="mt-3 text-center text-xs tracking-wide text-rose-50/80">
            {statusText}
          </p>
        </motion.div>

        <div className="relative mt-4 min-h-0 flex-1 overflow-hidden rounded-4xl border border-white/10 bg-black/12 shadow-[inset_0_0_40px_rgba(255,120,160,0.08)] backdrop-blur-sm">
          <div
            ref={arenaRef}
            className="relative h-full w-full overflow-hidden rounded-4xl bg-[linear-gradient(180deg,rgba(49,5,20,0.55),rgba(15,2,9,0.22))]"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-linear-to-b from-rose-200/8 to-transparent" />

            {hearts.map((heart) => (
              <motion.div
                key={heart.id}
                className="pointer-events-none absolute left-0 top-0 z-20 h-14 w-14 will-change-transform"
                style={{ x: heart.x - HEART_SIZE / 2, y: heart.y }}
              >
                <motion.div
                  animate={{
                    scale: [heart.scale, heart.scale * 1.08, heart.scale],
                    rotate: [0, heart.wobble, -heart.wobble, 0],
                  }}
                  className="relative h-full w-full"
                  transition={{
                    duration: 0.9,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <div className="absolute inset-[14%] rounded-full bg-rose-300/38 blur-md" />
                  <Image
                    alt="Falling heart"
                    className="object-contain"
                    fill
                    sizes="56px"
                    src="/heart.png"
                  />
                </motion.div>
              </motion.div>
            ))}

            <AnimatePresence>
              {bursts.map((burst) => (
                <motion.div
                  key={burst.id}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -26, -48],
                    scale: [0.8, 1.05, 1.2],
                  }}
                  className="pointer-events-none absolute left-0 top-0 z-30 text-sm font-bold tracking-[0.2em] text-rose-100"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0, y: 0, scale: 0.8 }}
                  style={{ x: burst.x - 20, y: burst.y }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  +1 💖
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.div
              key={playerPulse}
              animate={{ scale: [1, 1.08, 1] }}
              className="absolute bottom-3 left-0 z-20 h-24 w-26"
              drag="x"
              dragConstraints={arenaRef}
              dragElastic={0}
              dragMomentum={false}
              style={{ x: playerX, rotate: playerRotate }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="relative h-full w-full rounded-[28px] border border-white/18 bg-white/10 shadow-[0_18px_40px_rgba(255,90,130,0.16)] backdrop-blur-md">
                <div className="absolute inset-x-3 top-2 h-6 rounded-full bg-rose-200/12 blur-md" />
                <div className="absolute inset-2 overflow-hidden rounded-3xl bg-linear-to-b from-white/12 to-transparent">
                  <Image
                    alt="Kiki"
                    className="object-contain p-2"
                    fill
                    sizes="104px"
                    src="/kiki.png"
                    unoptimized
                  />
                </div>
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 rounded-full border border-white/14 bg-black/18 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.28em] text-rose-100/80">
                  drag meow
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isUnlocked ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-[#12020b]/55 px-5 backdrop-blur-md"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="scrollbar-hidden relative flex w-full max-w-[min(92vw,420px)] max-h-[90dvh] flex-col items-center overflow-y-auto rounded-[34px] border border-white/15 bg-[linear-gradient(180deg,rgba(92,9,34,0.98),rgba(49,4,17,0.98))] px-5 pb-8 pt-5 text-center shadow-[0_35px_90px_rgba(0,0,0,0.5)] sm:px-6 sm:pb-10 sm:pt-6"
              exit={{ opacity: 0, scale: 0.92 }}
              initial={{ opacity: 0, scale: 0.5, y: 24 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
            >
              {hasSaidYes ? (
                <>
                  <div className="relative mb-4 aspect-square w-full max-w-64 shrink-0 overflow-hidden rounded-[28px] border border-white/20 bg-white/10 sm:mb-5 sm:max-w-72">
                    <Image
                      alt="You and Missy"
                      className="object-cover"
                      fill
                      sizes="220px"
                      src="/yessss.png"
                    />
                  </div>
                  <p className="font-display text-[2.5rem] font-bold leading-[0.96] text-rose-50 sm:text-5xl">
                    She said yes.
                  </p>
                  <p className="mt-4 text-lg leading-7 text-rose-100">
                    You just made my world brighter, softer, and infinitely more
                    beautiful. I love you, Missy. Thank you for everything you are and all the joy you bring into my life. I can't wait to spend forever
                    with you.
                  </p>
                </>
              ) : (
                <>
                  <div className="relative mb-4 aspect-square w-full max-w-64 shrink-0 overflow-hidden rounded-[28px] border border-white/20 bg-white/10 sm:mb-5 sm:max-w-72">
                    <Image
                      alt="You and Missy"
                      className="object-cover"
                      fill
                      sizes="220px"
                      src="/couple.png"
                    />
                  </div>
                  <p className="font-display max-w-[11ch] text-[clamp(2.3rem,7.5vw,4rem)] font-bold leading-[0.92] text-rose-50">
                    Will you be my girlfriend and future wife Missy?
                  </p>
                  <p className="mt-3 max-w-sm text-base leading-7 text-rose-100/90">
                    You caught every heart. Now comes the easiest choice.
                  </p>

                  <div className="mt-7 flex w-full items-center gap-3">
                    <motion.button
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(255,127,160,0.35)",
                          "0 0 38px rgba(255,127,160,0.8)",
                          "0 0 0 rgba(255,127,160,0.35)",
                        ],
                      }}
                      className={`inline-flex min-h-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#fff4f6,#ff7ca3_45%,#e11d48)] px-6 text-2xl font-extrabold uppercase tracking-[0.22em] text-[#4a071d] ${
                        hasDodgedNo ? "w-full" : "flex-1"
                      }`}
                      disabled={yesLocked}
                      onClick={handleYesClick}
                      transition={{
                        duration: 1.8,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      type="button"
                    >
                      YES!
                    </motion.button>

                    {!hasDodgedNo ? (
                      <button
                        className="flex min-h-16 flex-1 items-center justify-center rounded-full border border-rose-200/40 bg-white/10 px-6 text-2xl font-extrabold uppercase tracking-[0.22em] text-rose-100"
                        onClick={blockNoClick}
                        onMouseEnter={dodgeNoButton}
                        onTouchStart={dodgeNoButton}
                        type="button"
                      >
                        No
                      </button>
                    ) : (
                      <button
                        className="absolute z-20 inline-flex min-h-14 min-w-32 items-center justify-center rounded-full border border-rose-200/40 bg-white/10 px-6 py-3 text-xl font-extrabold uppercase tracking-[0.18em] text-rose-100"
                        onClick={blockNoClick}
                        onMouseEnter={dodgeNoButton}
                        onTouchStart={dodgeNoButton}
                        style={{
                          left: `${noPosition.left}%`,
                          top: `${noPosition.top}%`,
                        }}
                        type="button"
                      >
                        No
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

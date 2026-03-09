"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useRef, useState } from "react";

const storySections = [
  {
    eyebrow: "The First Spark",
    title: "How it all started.",
    body: "It started with two people from Dhaka. One studying for her MSc, and a 19-year-old software engineer who dropped out to build his own path. I didn't know it then, but answering your stories was the best decision I ever made.",
  },
  {
    eyebrow: "The Unhinged Late Nights",
    title: "Where sleep stopped mattering.",
    body: "We basically survive on zero sleep now. Between the constant unhinged memes, debating who is actually taller, and you trying your best not to say the 'F' word... those late nights quickly became the highlight of my day.",
  },
  {
    eyebrow: "The Safe Space",
    title: "Where trust became everything.",
    body: "Very early on, I told you: 'If you wanna vent, I can listen. The words you share will go in the grave with me.' You told me those lines were beautiful. But the truth is, you trusting me with your thoughts was the most beautiful part. Being your comfort zone became my favorite job.",
  },
  {
    eyebrow: "The Nickname & The Vibe",
    title: "When Missy became Missy.",
    body: "Then came the day I officially named you Missy. We figured out exactly why we work so well together. Like I told you: 'A calm guy like me needs a chaotic charisma like yours.' You brought the chaos, and I brought the peace.",
  },
  {
    eyebrow: "The Weird & Wonderful",
    title: "Everything I learn makes me fall harder.",
    body: "I love that we can talk about everything. From joking about 'dark romance' to you showing me your art. I told you once: 'I love your weird side. I want to know everything about you.' Every new thing I learn just makes me fall harder.",
  },
  {
    eyebrow: "Is This Real?",
    title: "Yes. Entirely.",
    body: "You asked me once: 'Am I dreaming or is this real?' I promise you, it's as real as it gets. Knowing I get to talk to you makes the stressful days disappear. You are the absolute best part of my year.",
  },
  {
    eyebrow: "The Butterflies & Promises",
    title: "When it turned serious.",
    body: "I remember the day you said I gave you butterflies. That was the day I promised myself I would treat you like you've never been treated before. I told you: 'Don't leave, be with me till we get married, be with me till we get old... be with me till we get old and die in each other's arms.'",
  },
  {
    eyebrow: "The Challenge",
    title: "One last step before the question.",
    body: "I told you I would be manlier for you, and you told me you were happy. Now, I have one final question to ask you. But first... you have to help Kiki catch some love.",
  },
] as const;

const particleGlyphs = ["❤️", "✨", "🌸"] as const;

export default function Home() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasEntered, setHasEntered] = useState(false);
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, index) => ({
        id: index,
        glyph: particleGlyphs[index % particleGlyphs.length],
        left: `${Math.random() * 100}%`,
        size: 22 + Math.random() * 18,
        duration: 15 + Math.random() * 15,
        delay: Math.random() * 10,
        drift: Math.random() * 40 - 20,
        rotate: Math.random() > 0.5 ? 360 : -360,
        opacity: 0.2 + Math.random() * 0.2,
      })),
    [],
  );

  async function handleEnter() {
    const audio = audioRef.current;

    if (audio) {
      audio.volume = 0.2;

      try {
        await audio.play();
      } catch {
        audio.controls = true;
      }
    }

    setHasEntered(true);
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(180deg,#12020b_0%,#2a0413_40%,#0d0208_100%)] text-(--foreground)">
      <audio ref={audioRef} loop preload="auto" src="/co2.mp3" />

      <div className="pointer-events-none fixed inset-0 z-0 bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,221,230,0.14),transparent_24%),radial-gradient(circle_at_20%_60%,rgba(255,120,160,0.1),transparent_26%),radial-gradient(circle_at_bottom,rgba(236,95,134,0.12),transparent_28%)]" />
        {particles.map((particle) => (
          <motion.span
            key={particle.id}
            aria-hidden="true"
            animate={{ y: ["100dvh", "-10dvh"], x: [0, particle.drift], rotate: [0, particle.rotate] }}
            className="absolute left-0 top-0"
            style={{
              left: particle.left,
              fontSize: particle.size,
              opacity: particle.opacity,
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            {particle.glyph}
          </motion.span>
        ))}
      </div>

      <AnimatePresence>
        {!hasEntered ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-20 flex h-dvh items-center justify-center px-6"
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,239,244,0.14),transparent_28%),linear-gradient(180deg,rgba(24,1,8,0.82),rgba(24,1,8,0.96))] backdrop-blur-md" />
            <motion.button
              animate={{ scale: [1, 1.03, 1], boxShadow: ["0 0 0 rgba(255,133,169,0.2)", "0 0 44px rgba(255,133,169,0.4)", "0 0 0 rgba(255,133,169,0.2)"] }}
              className="relative w-full max-w-sm rounded-[34px] border border-white/15 bg-white/10 px-8 py-10 text-center shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              onClick={handleEnter}
              transition={{ duration: 2.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              type="button"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/80">
                For Missy
              </p>
              <h1 className="font-display mt-5 text-5xl font-semibold leading-none text-rose-50">
                A letter for Missy 💌
              </h1>
              <p className="mt-5 text-base leading-7 text-rose-100/88">
                Tap to open.
              </p>
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {hasEntered ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full flex flex-col overflow-x-hidden"
            initial={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {storySections.map((section, index) => {
              const isFirst = index === 0;
              const isLast = index === storySections.length - 1;

              return (
                <section
                  key={section.eyebrow}
                  className="relative flex min-h-dvh flex-col items-center justify-center px-6 py-16 text-center"
                >
                  <motion.div
                    className="w-full max-w-xl rounded-4xl border border-white/12 bg-white/8 px-6 py-8 shadow-[0_30px_90px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:px-8"
                    initial={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    viewport={{ once: true, margin: "-20%" }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/80">
                      {section.eyebrow}
                    </p>
                    <h2 className="font-display mt-4 text-5xl font-semibold leading-none text-rose-50 sm:text-6xl">
                      {section.title}
                    </h2>
                    <p className="mx-auto mt-6 max-w-lg text-base leading-8 text-rose-100/88 sm:text-lg">
                      {section.body}
                    </p>

                    {isFirst ? (
                      <motion.div
                        animate={{ y: [0, 10, 0] }}
                        className="mt-8 flex flex-col items-center justify-center text-rose-200/72"
                        transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      >
                        <span className="text-xs font-semibold uppercase tracking-[0.3em]">
                          Scroll Down
                        </span>
                        <span aria-hidden="true" className="mt-2 text-3xl leading-none">
                          ↓
                        </span>
                      </motion.div>
                    ) : null}

                    {isLast ? (
                      <motion.button
                        animate={{
                          y: [0, -6, 0],
                          boxShadow: [
                            "0 0 0 rgba(255,133,169,0.25)",
                            "0 0 40px rgba(255,133,169,0.72)",
                            "0 0 0 rgba(255,133,169,0.25)",
                          ],
                        }}
                        className="mt-10 min-h-16 w-full rounded-full bg-[linear-gradient(135deg,#fff4f6,#ff8aab_45%,#e11d48)] px-6 text-lg font-extrabold uppercase tracking-[0.14em] text-[#4a071d]"
                        onClick={() => router.push("/challenge")}
                        transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                        type="button"
                      >
                        Unlock the Final Question ➔
                      </motion.button>
                    ) : null}
                  </motion.div>
                </section>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
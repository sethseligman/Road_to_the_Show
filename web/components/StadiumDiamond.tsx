"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GameStateBar } from "@/components/GameStateBar";
import type { DiamondRenderable } from "@/hooks/useDiamondState";
import type { OccupiedBase } from "@/lib/game/diamondVisual";
import type { Outcome } from "@/types/game";

/** ViewBox 400×360 — 3/4-ish view (compressed Y). */
export const VB = { w: 400, h: 360 };

const OUTFIELD_PATH = "M 40 300 Q 200 20 360 300 L 200 310 Z";
const INFIELD_PATH = "M 200 308 L 338 198 L 200 62 L 62 198 Z";

const HOME = { x: 200, y: 308 };
const B1 = { x: 338, y: 198 };
const B2 = { x: 200, y: 62 };
const B3 = { x: 62, y: 198 };
const MOUND = { x: 200, y: 198 };
const FIELDER = { x: 268, y: 118 };
const SHALLOW = { x: 312, y: 168 };
const GAP = { x: 330, y: 95 };
const FENCE = { x: 200, y: 28 };

/** Deterministic confetti motion (no Math.random in render). */
function confettiMotion(i: number) {
  return {
    y: -150 - (i * 37) % 90,
    x: ((i * 71) % 221) - 110,
    rotate: (i * 49) % 280,
    duration: 1.75 + ((i * 13) % 36) / 100,
  };
}

function basePos(b: OccupiedBase): { x: number; y: number } {
  if (b === "1B") return B1;
  if (b === "2B") return B2;
  return B3;
}

export type DiamondFx = {
  stamp: null | "OUT" | "K" | "E";
  confetti: boolean;
  ball: null | { x1: number; y1: number; x2: number; y2: number };
  errorShake: boolean;
  /** Brief screen-edge glow (crowd energy). */
  crowdPulse: boolean;
};

type Props = {
  renderable: DiamondRenderable;
  fx: DiamondFx;
};

export function StadiumDiamond({ renderable, fx }: Props) {
  const { runners, outs, balls, strikes, us, them, inning, headline } =
    renderable;

  return (
    <div
      className="relative h-full min-h-[280px] w-full min-w-0 flex-1 overflow-hidden lg:min-h-[420px]"
      style={{
        background:
          "radial-gradient(ellipse 125% 100% at 50% 78%, var(--field-green-highlight) 0%, var(--field-green-base) 38%, var(--field-green-shade) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 z-[2] shadow-[inset_0_0_70px_rgba(0,0,0,0.42)]"
        aria-hidden
      />

      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[3]"
        initial={false}
        animate={
          fx.crowdPulse
            ? {
                opacity: 1,
                boxShadow:
                  "inset 0 0 0 3px rgba(251, 191, 36, 0.45), inset 0 0 100px rgba(96, 165, 250, 0.14)",
              }
            : {
                opacity: 0,
                boxShadow: "inset 0 0 0 0 rgba(0,0,0,0)",
              }
        }
        transition={{ duration: 0.32, ease: "easeOut" }}
      />

      <svg
        className="absolute inset-0 z-[1] h-full w-full"
        viewBox={`0 0 ${VB.w} ${VB.h}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden
      >
        <defs>
          <radialGradient id="outfieldGrassGrad" cx="50%" cy="64%" r="78%">
            <stop offset="0%" stopColor="var(--field-green-highlight)" />
            <stop offset="50%" stopColor="var(--field-green-base)" />
            <stop offset="100%" stopColor="var(--field-green-shade)" />
          </radialGradient>
          <linearGradient
            id="infieldDirtGrad"
            x1="15%"
            y1="85%"
            x2="85%"
            y2="10%"
          >
            <stop offset="0%" stopColor="var(--infield-tan-shade)" />
            <stop offset="42%" stopColor="var(--infield-tan-mid)" />
            <stop offset="100%" stopColor="var(--infield-tan-base)" />
          </linearGradient>
          <pattern
            id="mowStripes"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(-32)"
          >
            <rect width="14" height="14" fill="transparent" />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="14"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="7"
            />
          </pattern>
          <filter id="basePlateShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#0f172a" floodOpacity="0.35" />
          </filter>
          <clipPath id="clipOutfield">
            <path d={OUTFIELD_PATH} />
          </clipPath>
        </defs>

        <motion.g
          animate={
            fx.errorShake
              ? { x: [0, -5, 5, -3, 3, 0], y: [0, 2, -2, 0] }
              : { x: 0, y: 0 }
          }
          transition={{ duration: 0.48, ease: "easeOut" }}
        >
          <g transform="translate(0,8) scale(1,0.78) translate(0,24)">
            <path d={OUTFIELD_PATH} fill="url(#outfieldGrassGrad)" stroke="rgba(15,40,28,0.35)" strokeWidth="1" />
            <g clipPath="url(#clipOutfield)">
              <rect x="0" y="0" width={VB.w} height={VB.h} fill="url(#mowStripes)" opacity="0.85" />
            </g>
            <path
              d="M 52 210 Q 200 26 348 210"
              fill="none"
              stroke="rgba(8,22,14,0.32)"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.9"
            />
            <path
              d={INFIELD_PATH}
              fill="url(#infieldDirtGrad)"
              stroke="rgba(110, 88, 58, 0.55)"
              strokeWidth="1.2"
            />
            <ellipse
              cx={MOUND.x}
              cy={MOUND.y + 3}
              rx="22"
              ry="11"
              fill="rgba(15,23,20,0.22)"
            />
            <line
              x1={HOME.x}
              y1={HOME.y}
              x2={B1.x}
              y2={B1.y}
              stroke="#f8fafc"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.94"
            />
            <line
              x1={HOME.x}
              y1={HOME.y}
              x2={B3.x}
              y2={B3.y}
              stroke="#f8fafc"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.94"
            />
            <ellipse
              cx={MOUND.x}
              cy={MOUND.y}
              rx="14"
              ry="9"
              fill="var(--infield-tan-mid)"
              stroke="rgba(110, 88, 58, 0.65)"
              strokeWidth="1"
            />
            <rect
              x={HOME.x - 38}
              y={HOME.y - 8}
              width="22"
              height="14"
              rx="2"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              opacity="0.72"
            />
            <rect
              x={HOME.x + 16}
              y={HOME.y - 8}
              width="22"
              height="14"
              rx="2"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.2"
              opacity="0.72"
            />
            {(
              [
                ["home", HOME.x, HOME.y],
                ["1B", B1.x, B1.y],
                ["2B", B2.x, B2.y],
                ["3B", B3.x, B3.y],
              ] as const
            ).map(([id, x, y]) => {
              const occ =
                id === "home" ? false : runners.includes(id as OccupiedBase);
              return (
                <g key={id}>
                  <motion.rect
                    x={x - 9}
                    y={y - 4}
                    width="18"
                    height="8"
                    rx="1.5"
                    fill="#f8fafc"
                    stroke="#e2e8f0"
                    strokeWidth="1"
                    filter="url(#basePlateShadow)"
                    animate={
                      occ
                        ? {
                            fill: ["#fffef8", "#fff9e6", "#fffef8"],
                            stroke: ["#fde68a", "#facc15", "#fde68a"],
                          }
                        : { fill: "#f8fafc", stroke: "#e2e8f0" }
                    }
                    transition={
                      occ
                        ? {
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }
                        : { duration: 0.35, ease: "easeOut" }
                    }
                  />
                </g>
              );
            })}
            {runners.map((b) => {
              const p = basePos(b);
              return (
                <motion.circle
                  key={b}
                  r="8"
                  fill="#facc15"
                  stroke="#ca8a04"
                  strokeWidth="1.5"
                  initial={false}
                  animate={{ cx: p.x, cy: p.y - 14 }}
                  transition={{ type: "spring", stiffness: 140, damping: 16 }}
                />
              );
            })}
            <circle
              cx={HOME.x}
              cy={HOME.y - 18}
              r="7"
              fill="#38bdf8"
              stroke="#0ea5e9"
              strokeWidth="1.5"
              opacity="0.9"
            />

            <AnimatePresence>
              {fx.ball ? (
                <motion.circle
                  key="ball"
                  r="5"
                  fill="#fef08a"
                  stroke="#eab308"
                  strokeWidth="1"
                  initial={{ cx: fx.ball.x1, cy: fx.ball.y1, opacity: 1 }}
                  animate={{ cx: fx.ball.x2, cy: fx.ball.y2, opacity: 0.95 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.72, ease: "easeOut" }}
                />
              ) : null}
            </AnimatePresence>
          </g>
        </motion.g>
      </svg>

      <GameStateBar
        headline={headline}
        us={us}
        them={them}
        inning={inning}
        outs={outs}
        balls={balls}
        strikes={strikes}
      />

      <AnimatePresence>
        {fx.stamp ? (
          <motion.div
            key={fx.stamp}
            className="pointer-events-none absolute left-1/2 top-[42%] z-20 -translate-x-1/2 -translate-y-1/2 rounded-lg border-[3px] border-white/90 bg-zinc-950/92 px-5 py-2.5 font-mono text-2xl font-black tracking-[0.2em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] sm:text-3xl"
            initial={{ scale: 0.28, opacity: 0, rotate: -22 }}
            animate={{
              scale: [0.28, 1.12, 1],
              opacity: 1,
              rotate: [-22, 8, 0],
            }}
            transition={{
              duration: 0.62,
              times: [0, 0.55, 1],
              ease: "easeOut",
            }}
            exit={{
              opacity: 0,
              scale: 0.88,
              rotate: -6,
              transition: { duration: 0.42, ease: "easeIn" },
            }}
          >
            {fx.stamp}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {fx.confetti
          ? Array.from({ length: 22 }, (_, i) => {
              const c = confettiMotion(i);
              return (
                <motion.span
                  key={i}
                  className="pointer-events-none absolute left-1/2 top-[52%] z-30 block h-2 w-2 rounded-sm"
                  style={{
                    marginLeft: -4,
                    backgroundColor: ["#f472b6", "#60a5fa", "#facc15", "#4ade80"][
                      i % 4
                    ],
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1, rotate: 0 }}
                  animate={{
                    opacity: 0,
                    y: c.y,
                    x: c.x,
                    rotate: c.rotate,
                    scale: 0.35,
                  }}
                  transition={{
                    duration: c.duration,
                    ease: "easeOut",
                  }}
                />
              );
            })
          : null}
      </AnimatePresence>
    </div>
  );
}

export function ballPathForOutcome(
  kind: Outcome["outcomeType"],
): { x1: number; y1: number; x2: number; y2: number } | null {
  const h = HOME;
  switch (kind) {
    case "single":
      return { x1: h.x, y1: h.y - 20, x2: SHALLOW.x, y2: SHALLOW.y };
    case "double":
      return { x1: h.x, y1: h.y - 20, x2: GAP.x, y2: GAP.y };
    case "triple":
      return { x1: h.x, y1: h.y - 24, x2: GAP.x + 8, y2: GAP.y - 18 };
    case "hr":
      return { x1: h.x, y1: h.y - 24, x2: FENCE.x, y2: -35 };
    case "out":
      return { x1: h.x, y1: h.y - 20, x2: FIELDER.x, y2: FIELDER.y };
    case "strikeout":
      return { x1: h.x, y1: h.y - 18, x2: h.x - 28, y2: h.y - 6 };
    case "error":
      return {
        x1: SHALLOW.x - 6,
        y1: SHALLOW.y + 4,
        x2: SHALLOW.x + 10,
        y2: SHALLOW.y - 2,
      };
    default:
      return null;
  }
}

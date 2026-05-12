"use client";

import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Game, Outcome, Scene } from "@/types/game";
import { ballPathForOutcome, type DiamondFx } from "@/components/StadiumDiamond";

export type OutcomePlayEvent = {
  id: number;
  outcome: Outcome;
  sceneType: Scene["type"];
  stakes?: Game["stakes"];
};

type SetFx = Dispatch<SetStateAction<DiamondFx>>;

export function OutcomeAnimation({
  play,
  setFx,
  onComplete,
}: {
  play: OutcomePlayEvent | null;
  setFx: SetFx;
  onComplete: () => void;
}) {
  const idsRef = useRef<number[]>([]);

  useEffect(() => {
    idsRef.current.forEach(clearTimeout);
    idsRef.current = [];

    if (!play) {
      setFx({
        stamp: null,
        ball: null,
        confetti: false,
        errorShake: false,
        crowdPulse: false,
      });
      return;
    }

    const t = (ms: number, fn: () => void) => {
      const id = window.setTimeout(fn, ms);
      idsRef.current.push(id);
    };

    const resetFx = () =>
      setFx({
        stamp: null,
        ball: null,
        confetti: false,
        errorShake: false,
        crowdPulse: false,
      });

    const finish = (ms: number) =>
      t(ms, () => {
        resetFx();
        onComplete();
      });

    const pulseCrowd = (start: number, end: number) => {
      t(start, () => setFx((p) => ({ ...p, crowdPulse: true })));
      t(end, () => setFx((p) => ({ ...p, crowdPulse: false })));
    };

    resetFx();

    const { outcome, sceneType } = play;
    const o = outcome.outcomeType;
    const stakes = play.stakes ?? "regular";

    if (sceneType === "dugout") {
      finish(500);
      return () => idsRef.current.forEach(clearTimeout);
    }

    if (sceneType === "baserun") {
      if (o === "double") {
        const bp = ballPathForOutcome("double");
        if (bp) t(100, () => setFx((p) => ({ ...p, ball: bp })));
        t(820, () => setFx((p) => ({ ...p, ball: null })));
        finish(1950);
        return () => idsRef.current.forEach(clearTimeout);
      }
      if (o === "out") {
        const bp = ballPathForOutcome("strikeout");
        if (bp) t(100, () => setFx((p) => ({ ...p, ball: bp })));
        t(520, () => setFx((p) => ({ ...p, stamp: "OUT" })));
        t(880, () => setFx((p) => ({ ...p, ball: null })));
        finish(2280);
        return () => idsRef.current.forEach(clearTimeout);
      }
      finish(600);
      return () => idsRef.current.forEach(clearTimeout);
    }

    if (o === "walk") {
      finish(1300);
      return () => idsRef.current.forEach(clearTimeout);
    }

    if (o === "strikeout") {
      const bp = ballPathForOutcome("strikeout");
      if (bp) t(90, () => setFx((p) => ({ ...p, ball: bp })));
      t(400, () => setFx((p) => ({ ...p, stamp: "K" })));
      t(820, () => setFx((p) => ({ ...p, ball: null })));
      finish(2180);
      return () => idsRef.current.forEach(clearTimeout);
    }

    if (o === "out") {
      const bp = ballPathForOutcome("out");
      if (bp) t(100, () => setFx((p) => ({ ...p, ball: bp })));
      t(580, () => setFx((p) => ({ ...p, stamp: "OUT" })));
      t(920, () => setFx((p) => ({ ...p, ball: null })));
      finish(2320);
      return () => idsRef.current.forEach(clearTimeout);
    }

    if (o === "error") {
      const bp = ballPathForOutcome("error");
      if (bp) t(100, () => setFx((p) => ({ ...p, ball: bp, errorShake: true })));
      t(450, () => setFx((p) => ({ ...p, stamp: "E" })));
      t(900, () => setFx((p) => ({ ...p, ball: null, errorShake: false })));
      finish(2250);
      return () => idsRef.current.forEach(clearTimeout);
    }

    if (o === "hr") {
      const bp = ballPathForOutcome("hr");
      if (bp) t(80, () => setFx((p) => ({ ...p, ball: bp })));
      pulseCrowd(20, 720);
      t(220, () => setFx((p) => ({ ...p, confetti: true })));
      t(980, () => setFx((p) => ({ ...p, ball: null })));
      t(2350, () => setFx((p) => ({ ...p, confetti: false })));
      finish(2550);
      return () => idsRef.current.forEach(clearTimeout);
    }

    if (o === "single" || o === "double" || o === "triple") {
      const bp = ballPathForOutcome(o);
      if (bp) t(90, () => setFx((p) => ({ ...p, ball: bp })));
      if (stakes === "championship") pulseCrowd(35, 700);
      else if (stakes === "rivalry" && (o === "double" || o === "triple")) {
        pulseCrowd(45, 640);
      }
      t(880, () => setFx((p) => ({ ...p, ball: null })));
      finish(o === "triple" ? 2350 : o === "double" ? 2150 : 1950);
      return () => idsRef.current.forEach(clearTimeout);
    }

    finish(700);
    return () => idsRef.current.forEach(clearTimeout);
  }, [play?.id, play, setFx, onComplete]);

  return null;
}

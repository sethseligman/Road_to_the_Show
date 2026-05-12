"use client";

import dynamic from "next/dynamic";

const GameScreen = dynamic(() => import("./GameScreen"), { ssr: false });

export default function GamePage() {
  return <GameScreen />;
}

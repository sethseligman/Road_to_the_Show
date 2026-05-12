"use client";

import { useMotionValueEvent, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function AnimatedInteger({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const spring = useSpring(value, { stiffness: 100, damping: 20 });
  const [text, setText] = useState(String(value));

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useMotionValueEvent(spring, "change", (v) => {
    setText(String(Math.round(v)));
  });

  return (
    <span
      className={`inline-block font-mono tabular-nums ${className ?? ""}`}
    >
      {text}
    </span>
  );
}

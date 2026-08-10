"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

type Direction = "up" | "left" | "right";

/** Reveals content once when it enters the viewport. */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(element);
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal reveal-${direction}${visible ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={{ ...style, transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

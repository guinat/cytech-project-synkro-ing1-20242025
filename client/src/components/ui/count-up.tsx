"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "framer-motion";

interface CountUpProps {
  start?: number;
  end: number;
  duration?: number;
  delay?: number;
  decimals?: number;
  className?: string;
}

export function CountUp({
  start = 0,
  end,
  duration = 2,
  delay = 0,
  decimals = 0,
  className,
}: CountUpProps) {
  const [count, setCount] = useState(start);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      
      setCount(start + Math.floor(progress * (end - start)));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    // Add delay before starting animation
    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(updateCount);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [start, end, duration, delay, isInView]);

  const formattedCount = count.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return <span ref={ref} className={className}>{formattedCount}</span>;
} 
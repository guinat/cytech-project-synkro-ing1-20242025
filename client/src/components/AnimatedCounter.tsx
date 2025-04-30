import React from "react";
import { motion, useMotionValue, animate } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // seconds
  className?: string;
  format?: (n: number) => string;
  trigger?: boolean;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, duration = 1.2, className = '', format, trigger = true }) => {
  const nodeRef = React.useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = React.useState(0);
  const [hasAnimated, setHasAnimated] = React.useState(false);

  // Intersection observer to trigger animation when in view
  React.useEffect(() => {
    if (!nodeRef.current) return;
    const el = nodeRef.current;
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated && trigger) {
          animate(motionValue, value, { duration, ease: [0.4, 0, 0.2, 1] });
          setHasAnimated(true);
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [motionValue, value, duration, hasAnimated, trigger]);

  React.useEffect(() => {
    if (!trigger) return;
    if (hasAnimated) return;
    animate(motionValue, value, { duration, ease: [0.4, 0, 0.2, 1] });
    setHasAnimated(true);
  }, [motionValue, value, duration, trigger, hasAnimated]);

  React.useEffect(() => {
    return motionValue.on("change", v => setDisplay(v));
  }, [motionValue]);

  // Reset si on veut réanimer
  React.useEffect(() => {
    if (!trigger) {
      setHasAnimated(false);
      motionValue.set(0);
      setDisplay(0);
    }
  }, [trigger, motionValue]);

  return (
    <span ref={nodeRef} className={className}>
      {format ? format(Math.round(display)) : Math.round(display)}
    </span>
  );
};

export default AnimatedCounter;

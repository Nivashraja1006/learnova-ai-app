import React, { useEffect, useState, useRef, useMemo } from 'react';
import { parseNumericValue } from '../../utils/formatters';

/**
 * AnimatedNumber
 *
 * Displays numerical values with a smooth one-time counter animation on initial mount
 * or when the numeric target genuinely changes.
 *
 * Key stability guarantees:
 * 1. ZERO flickering or blinking on normal React renders.
 * 2. Never restarts animation from 0 on parent re-renders.
 * 3. When the underlying value genuinely updates (e.g. 70 -> 85), it animates
 *    smoothly from the current value to the new value instead of jumping back to zero.
 * 4. Only uses primitive values in useEffect dependencies to prevent dependency loops.
 * 5. Tabular numbers CSS styling to avoid horizontal layout jitter during transitions.
 */
export const AnimatedNumber = ({
  value,
  duration = 800,
  animateOnMount = true,
  className = ''
}) => {
  const parsed = useMemo(() => parseNumericValue(value), [value]);

  // Keep track of the last target we animated to and the current animated progress
  const prevTargetRef = useRef(null);
  const displayValRef = useRef(animateOnMount ? 0 : parsed.target);

  // Initialize display value
  const [displayVal, setDisplayVal] = useState(() => {
    if (!animateOnMount || duration <= 0) {
      return parsed.target;
    }
    return 0;
  });

  useEffect(() => {
    if (!parsed.isNumeric) {
      return;
    }

    // If the target has NOT changed since the last animation completion, do not re-animate!
    if (prevTargetRef.current !== null && prevTargetRef.current === parsed.target) {
      return;
    }

    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (duration <= 0 || prefersReducedMotion) {
      setDisplayVal(parsed.target);
      displayValRef.current = parsed.target;
      prevTargetRef.current = parsed.target;
      return;
    }

    // Interpolate from current displayed value (or 0 on initial mount) to the new target
    const startVal = prevTargetRef.current !== null ? displayValRef.current : 0;
    const targetVal = parsed.target;
    const diff = targetVal - startVal;

    if (diff === 0) {
      setDisplayVal(targetVal);
      displayValRef.current = targetVal;
      prevTargetRef.current = targetVal;
      return;
    }

    let startTime = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startVal + diff * eased;

      const rounded =
        parsed.decimals > 0
          ? parseFloat(current.toFixed(parsed.decimals))
          : Math.round(current);

      setDisplayVal(rounded);
      displayValRef.current = rounded;

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayVal(targetVal);
        displayValRef.current = targetVal;
        prevTargetRef.current = targetVal;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [parsed.target, parsed.isNumeric, parsed.decimals, duration]);

  if (!parsed.isNumeric) {
    return <span className={className}>{parsed.raw}</span>;
  }

  const formattedOutput =
    parsed.decimals > 0
      ? displayVal.toFixed(parsed.decimals)
      : displayVal;

  return (
    <span className={`inline-block tabular-nums ${className}`}>
      {parsed.prefix}
      {formattedOutput}
      {parsed.suffix}
    </span>
  );
};

// Also export as AnimatedCounter for backwards compatibility
export const AnimatedCounter = AnimatedNumber;

import React, { useEffect, useState } from 'react';

export const AnimatedCounter = ({ value, duration = 1000 }) => {
  const stringVal = String(value);
  const match = stringVal.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);

  const prefix = match ? match[1] : '';
  const targetNumber = match ? parseFloat(match[2]) : 0;
  const suffix = match ? match[3] : '';

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!match) {
      return;
    }

    let startTime;
    let animationFrame;

    const startValue = 0;
    const diff = targetNumber - startValue;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const val = startValue + diff * easedProgress;

      if (Number.isInteger(targetNumber)) {
        setCurrent(Math.round(val));
      } else {
        setCurrent(parseFloat(val.toFixed(1)));
      }

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrame);
  }, [targetNumber, duration, match]);

  if (!match) {
    return <span>{value}</span>;
  }

  return (
    <span>
      {prefix}
      {current}
      {suffix}
    </span>
  );
};

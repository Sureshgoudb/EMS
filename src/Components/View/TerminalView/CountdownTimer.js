import React, { useState, useEffect } from "react";

const CountdownTimer = ({ refreshInterval }) => {
  const [timeLeft, setTimeLeft] = useState(refreshInterval);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          return refreshInterval;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [refreshInterval]);

  return (
    <span className="text-xs opacity-70">Next refresh in {timeLeft}s</span>
  );
};

export default CountdownTimer;

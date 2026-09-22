import { useEffect, useRef, useState } from "react";

const useOtpResendTimer = (limit = 2) => {
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  };

  const start = () => {
    clear();
    setSecondsLeft(60);
    intervalRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clear();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const registerResend = () => setResendCount(prev => prev + 1);

  const reset = () => {
    clear();
    setSecondsLeft(0);
    setResendCount(0);
  };

  useEffect(() => clear, []);

  const attemptsLeft = Math.max(0, limit - resendCount);
  const canResend = secondsLeft === 0 && attemptsLeft > 0;

  return { secondsLeft, attemptsLeft, canResend, start, registerResend, reset };
};

export default useOtpResendTimer;

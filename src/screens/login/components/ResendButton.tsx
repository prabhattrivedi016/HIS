import React, { useEffect, useRef, useState } from "react";
import { ResendButtonProps } from "../type";

const TIMER_SECONDS = 60;

const ResendButton = ({ onResend }: ResendButtonProps) => {
  // null  → timer not started (no API call yet, or timer finished)
  // number → seconds remaining
  const [timer, setTimer] = useState<number | null>(null);
  const [isSending, setIsSending] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start countdown only after a successful API call
  const startTimer = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimer(TIMER_SECONDS);

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(intervalRef.current!);
          intervalRef.current = null;
          return null; // hide timer
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleClick = async () => {
    setIsSending(true);
    try {
      const success = await onResend();
      if (success) {
        startTimer();
      }
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (t: number) => {
    const m = String(Math.floor(t / 60)).padStart(2, "0");
    const s = String(t % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const isDisabled = isSending || timer !== null;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:items-center m-2">
      {/* Timer label — only visible while countdown is active */}
      {timer !== null && (
        <span className="text-sm text-gray-600 text-center sm:text-right">
          Resend OTP in {formatTime(timer)}
        </span>
      )}

      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`w-full sm:w-auto min-h-[40px] px-3 py-2 rounded-md transition text-sm  text-white font-medium ${
          isDisabled
            ? "bg-gray-300 cursor-not-allowed text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-white"
        }`}
      >
        {isSending ? "Sending…" : timer !== null ? "Resend" : "Send OTP"}
      </button>
    </div>
  );
};

export default React.memo(ResendButton);

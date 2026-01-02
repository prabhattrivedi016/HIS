import React, { useEffect, useState } from "react";
import { ResendButtonProps } from "../type";

const ResendButton = ({ onResend }: ResendButtonProps) => {
  const [timer, setTimer] = useState(60);
  const [isDisabled, setIsDisabled] = useState(true);

  useEffect(() => {
    if (!isDisabled) return;

    const intervalId = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setIsDisabled(false);
          clearInterval(intervalId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // cleanup
    return () => clearInterval(intervalId);
  }, [isDisabled]);

  const formatTime = (t: number) => {
    const m = String(Math.floor(t / 60)).padStart(2, "0");
    const s = String(t % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex justify-end items-center m-2">
      <span className="mr-2 text-gray-600">
        {isDisabled ? `Resend OTP in ${formatTime(timer)}` : ""}
      </span>

      <button
        onClick={() => {
          onResend();
          setTimer(60);
          setIsDisabled(true);
        }}
        disabled={isDisabled}
        className={`px-3 py-1 rounded-md transition ${
          isDisabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
        }`}
      >
        Resend
      </button>
    </div>
  );
};

export default React.memo(ResendButton);

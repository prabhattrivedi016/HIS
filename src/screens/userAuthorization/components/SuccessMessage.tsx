import { useEffect, useState } from "react";

interface SuccessMessageProps {
  text: string;
  onClose: () => void;
  duration?: number;
}

const SuccessMessage = ({ text, onClose, duration = 2000 }: SuccessMessageProps) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const intervalTime = 60;
    const step = 50 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress(prev => (prev > 0 ? prev - step : 0));
    }, intervalTime);

    const timeout = setTimeout(onClose, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [duration, onClose]);

  return (
    <>
      {/* Overlay (blocks UI until timer ends) */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 z-40" />

      {/* Popup */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md">
        <div className="bg-green-600 text-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-4 py-3 text-center font-medium">{text}</div>

          {/* Progress bar */}
          <div className="h-1 bg-green-800">
            <div
              className="h-full bg-white transition-all linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SuccessMessage;

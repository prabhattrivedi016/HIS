import React from "react";

interface SpinnerProps {
  height?: number | string; // e.g. 20 or "20px" or "2rem"
  width?: number | string;
  color?: string; // optional (fallbacks to currentColor)
}

const Spinner: React.FC<SpinnerProps> = ({ height = 20, width = 20, color }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="status"
      aria-label="loading"
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width: typeof width === "number" ? `${width}px` : width,
        color: color || "currentColor",
      }}
      className="animate-spin"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
};

const Loader: React.FC = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-20 h-20">
      <defs>
        <linearGradient id="a9">
          <stop offset="0" stopColor="#FF156D" stopOpacity="0" />
          <stop offset="1" stopColor="#FF156D" />
        </linearGradient>
      </defs>

      <circle
        fill="none"
        stroke="url(#a9)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="0 44 0 44 0 44 0 44 0 360"
        cx="100"
        cy="100"
        r="70"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          calcMode="discrete"
          dur="2s"
          values="360;324;288;252;216;180;144;108;72;36"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
};

export { Loader, Spinner };

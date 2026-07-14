interface CircularProgressProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  trackClassName?: string;
  progressClassName?: string;
  children?: React.ReactNode;
}

const CircularProgress = ({
  percent,
  size = 34,
  strokeWidth = 3.5,
  trackClassName = "text-slate-100",
  progressClassName = "text-emerald-500",
  children,
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackClassName}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={`${progressClassName} transition-[stroke-dashoffset] duration-500 ease-out`}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">{children}</div>
      )}
    </div>
  );
};

export default CircularProgress;

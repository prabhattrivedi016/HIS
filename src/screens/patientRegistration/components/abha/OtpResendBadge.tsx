type Props = {
  secondsLeft: number;
  attemptsLeft: number;
  canResend: boolean;
  onResend: () => void;
};

const attemptBadgeClass = (attemptsLeft: number) =>
  attemptsLeft === 0
    ? "bg-gray-800 text-white"
    : attemptsLeft === 1
      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
      : "bg-green-100 text-green-800 border border-green-300";

const OtpResendBadge = ({ secondsLeft, attemptsLeft, canResend, onResend }: Props) => (
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={onResend}
      disabled={!canResend}
      className="rounded px-3 py-1 text-xs font-semibold text-white disabled:cursor-not-allowed"
      style={{ backgroundColor: canResend ? "#00c0ef" : "#b0dff0" }}
    >
      Resend
    </button>
    {secondsLeft > 0 && <span className="text-xs text-gray-500">⏱ {secondsLeft}s</span>}
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${attemptBadgeClass(attemptsLeft)}`}>
      {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} left
    </span>
  </div>
);

export default OtpResendBadge;

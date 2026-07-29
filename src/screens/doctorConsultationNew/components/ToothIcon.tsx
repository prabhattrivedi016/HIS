import { useId } from "react";

export type ToothCategory = "incisor" | "canine" | "premolar" | "molar";

/** FDI numbering: tens digit = quadrant (1-4), units digit = position within the quadrant (1-8).
 * Position tells us the tooth's anatomical shape regardless of which quadrant it's in. */
export const toothCategoryForNumber = (tooth: number): ToothCategory => {
  const position = tooth % 10;
  if (position <= 2) return "incisor";
  if (position === 3) return "canine";
  if (position <= 5) return "premolar";
  return "molar";
};

interface ToothIconProps {
  category: ToothCategory;
  /** mark color (extraction/attachment) — when unset, the tooth renders as plain white enamel */
  color?: string;
  size?: number;
  className?: string;
}

const ToothIcon = ({ category, color, size = 22, className }: ToothIconProps) => {
  const uid = useId();
  const enamelId = `${uid}-enamel`;
  const rootId = `${uid}-root`;
  const markId = `${uid}-mark`;

  const stroke = color ?? "#b9c2cf";
  const crownFill = color ? `url(#${markId})` : `url(#${enamelId})`;
  const rootFill = color ? `url(#${markId})` : `url(#${rootId})`;
  const shapeProps = { stroke, strokeWidth: 1.3, strokeLinejoin: "round" as const };

  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 32 46"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={enamelId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e6ebf1" />
        </linearGradient>
        <linearGradient id={rootId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f6f2ea" />
          <stop offset="100%" stopColor="#e3dccb" />
        </linearGradient>
        {color && (
          <linearGradient id={markId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={color} stopOpacity="0.28" />
          </linearGradient>
        )}
      </defs>

      {category === "incisor" && (
        <>
          <path d="M13 20 L12 42 Q16 45 20 42 L19 20 Z" fill={rootFill} {...shapeProps} />
          <path d="M9 4 Q16 1 23 4 L22 18 Q16 22 10 18 Z" fill={crownFill} {...shapeProps} />
          <path
            d="M12 6 Q14 4 17 5"
            stroke="white"
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.7}
          />
        </>
      )}

      {category === "canine" && (
        <>
          <path
            d="M12 20 Q11 34 13 44 Q16 46 19 44 Q21 34 20 20 Z"
            fill={rootFill}
            {...shapeProps}
          />
          <path d="M16 2 L22 12 Q16 20 10 12 Z" fill={crownFill} {...shapeProps} />
          <path
            d="M14 6 Q15.5 4.5 17.5 6"
            stroke="white"
            strokeWidth={1.2}
            strokeLinecap="round"
            opacity={0.7}
          />
        </>
      )}

      {category === "premolar" && (
        <>
          <path
            d="M12 20 L11 38 Q13 42 16 40 Q19 42 21 38 L20 20 Z"
            fill={rootFill}
            {...shapeProps}
          />
          <path
            d="M8 8 Q11 3 15 6 Q16 4 17 6 Q21 3 24 8 L22 18 Q16 21 10 18 Z"
            fill={crownFill}
            {...shapeProps}
          />
          <path
            d="M11 9 Q13 6.5 15.5 8"
            stroke="white"
            strokeWidth={1.1}
            strokeLinecap="round"
            opacity={0.7}
          />
        </>
      )}

      {category === "molar" && (
        <>
          <path d="M9 20 L7 36 Q10 42 13 38 L13 22 Z" fill={rootFill} {...shapeProps} />
          <path d="M23 20 L25 36 Q22 42 19 38 L19 22 Z" fill={rootFill} {...shapeProps} />
          <path
            d="M5 10 Q8 4 12 8 Q16 4 20 8 Q24 4 27 10 L25 18 Q16 22 7 18 Z"
            fill={crownFill}
            {...shapeProps}
          />
          <path
            d="M8 11 Q11 7 14 10"
            stroke="white"
            strokeWidth={1.1}
            strokeLinecap="round"
            opacity={0.7}
          />
        </>
      )}
    </svg>
  );
};

export default ToothIcon;

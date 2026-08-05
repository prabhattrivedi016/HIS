import { useId } from "react";

/** the actual fundus/optic-disc reference diagram (both eyes, provided directly for this feature)
 * — ids are namespaced per instance via useId so multiple mounted copies (e.g. this control
 * rendered more than once on the same page) never collide on the same gradient/clipPath id. */
const OpticDiscDiagram = () => {
  const uid = useId();
  const discA = `${uid}-discA`;
  const discB = `${uid}-discB`;
  const clipA = `${uid}-clipA`;
  const clipB = `${uid}-clipB`;

  return (
    <svg
      viewBox="0 0 430 200"
      className="w-full max-w-md mx-auto"
      role="img"
      aria-label="Fundus / optic disc reference diagram"
    >
      <defs>
        <radialGradient id={discA} cx="46%" cy="40%" r="62%">
          <stop offset="0%" stopColor="#faf4de" />
          <stop offset="45%" stopColor="#f4ecd1" />
          <stop offset="78%" stopColor="#f0e2c4" />
          <stop offset="93%" stopColor="#d79180" />
          <stop offset="100%" stopColor="#a07255" />
        </radialGradient>
        <radialGradient id={discB} cx="50%" cy="46%" r="60%">
          <stop offset="0%" stopColor="#ede0b6" />
          <stop offset="50%" stopColor="#e7d39c" />
          <stop offset="80%" stopColor="#e2cc93" />
          <stop offset="92%" stopColor="#ce5d0d" />
          <stop offset="100%" stopColor="#a81b02" />
        </radialGradient>
        <clipPath id={clipA}>
          <circle cx="100" cy="100" r="100" />
        </clipPath>
        <clipPath id={clipB}>
          <circle cx="330" cy="100" r="100" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipA})`}>
        <circle cx="100" cy="100" r="100" fill={`url(#${discA})`} />
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke="#9c6a4e"
          strokeWidth="8"
          strokeOpacity="0.45"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
        <g fill="none" stroke="#8b2f1a" strokeLinecap="round" strokeOpacity="0.85">
          <path d="M100 100 C 112 74, 126 56, 148 40" strokeWidth="6" />
          <path d="M132 62 C 142 52, 156 50, 168 54" strokeWidth="4" />
          <path d="M100 100 C 118 104, 138 116, 150 138" strokeWidth="6" />
          <path d="M138 122 C 150 120, 162 126, 170 138" strokeWidth="4" />
          <path d="M100 100 C 96 128, 104 150, 122 172" strokeWidth="5" />
          <path d="M100 100 C 78 96, 58 92, 40 82" strokeWidth="4" strokeOpacity="0.7" />
          <path d="M62 56 C 74 66, 80 76, 84 88" strokeWidth="3" strokeOpacity="0.6" />
        </g>
        <g fill="#8b2f1a" fillOpacity="0.75">
          <ellipse cx="52" cy="66" rx="16" ry="5" transform="rotate(-28 52 66)" />
          <ellipse cx="152" cy="150" rx="14" ry="4.5" transform="rotate(40 152 150)" />
          <ellipse cx="88" cy="158" rx="12" ry="4" transform="rotate(-70 88 158)" />
        </g>
        <g stroke="#111" strokeWidth="1" strokeOpacity="0.9">
          <line x1="200.0" y1="100.0" x2="0.0" y2="100.0" />
          <line x1="186.6" y1="150.0" x2="13.4" y2="50.0" />
          <line x1="150.0" y1="186.6" x2="50.0" y2="13.4" />
          <line x1="100.0" y1="200.0" x2="100.0" y2="0.0" />
          <line x1="50.0" y1="186.6" x2="150.0" y2="13.4" />
          <line x1="13.4" y1="150.0" x2="186.6" y2="50.0" />
        </g>
      </g>
      <circle
        cx="100"
        cy="100"
        r="98.5"
        fill="none"
        stroke="#8a5a44"
        strokeWidth="3"
        strokeOpacity="0.8"
      />

      <g clipPath={`url(#${clipB})`}>
        <circle cx="330" cy="100" r="100" fill={`url(#${discB})`} />
        <circle
          cx="330"
          cy="100"
          r="93"
          fill="none"
          stroke="#8f3406"
          strokeWidth="12"
          strokeOpacity="0.5"
          strokeDasharray="3 5"
          strokeLinecap="round"
        />
        <g
          fill="none"
          stroke="#a3260c"
          strokeLinecap="round"
          strokeOpacity="0.9"
          transform="translate(230 0)"
        >
          <path d="M100 100 C 92 72, 86 52, 92 28" strokeWidth="7" />
          <path d="M92 44 C 78 36, 62 34, 46 40" strokeWidth="5" />
          <path d="M100 100 C 116 78, 132 62, 154 50" strokeWidth="6" />
          <path d="M100 100 C 92 128, 78 148, 58 164" strokeWidth="7" />
          <path d="M84 140 C 70 138, 56 144, 46 156" strokeWidth="4" />
          <path d="M100 100 C 120 118, 138 140, 146 166" strokeWidth="6" />
          <path d="M100 100 C 74 104, 52 108, 34 120" strokeWidth="4" strokeOpacity="0.75" />
        </g>
        <g fill="#a3260c" fillOpacity="0.8" transform="translate(230 0)">
          <ellipse cx="150" cy="108" rx="17" ry="5" transform="rotate(18 150 108)" />
          <ellipse cx="60" cy="80" rx="14" ry="4.5" transform="rotate(-40 60 80)" />
          <ellipse cx="118" cy="168" rx="13" ry="4" transform="rotate(62 118 168)" />
        </g>
        <g stroke="#111" strokeWidth="1" strokeOpacity="0.9">
          <line x1="430.0" y1="100.0" x2="230.0" y2="100.0" />
          <line x1="416.6" y1="150.0" x2="243.4" y2="50.0" />
          <line x1="380.0" y1="186.6" x2="280.0" y2="13.4" />
          <line x1="330.0" y1="200.0" x2="330.0" y2="0.0" />
          <line x1="280.0" y1="186.6" x2="380.0" y2="13.4" />
          <line x1="243.4" y1="150.0" x2="416.6" y2="50.0" />
        </g>
      </g>
      <circle
        cx="330"
        cy="100"
        r="98.5"
        fill="none"
        stroke="#7d1a02"
        strokeWidth="3"
        strokeOpacity="0.85"
      />
    </svg>
  );
};

export default OpticDiscDiagram;

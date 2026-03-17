export function PunadiLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Front face — warm orange with left-to-right gradient */}
      <path
        d="M3 11.5 L16 19 L16 30.5 L3 23 Z"
        fill="url(#pl-front)"
      />
      {/* Right face — darker burnt orange */}
      <path
        d="M16 19 L29 11.5 L29 23 L16 30.5 Z"
        fill="url(#pl-right)"
      />
      {/* Top face — bright golden-amber, rounded corners effect */}
      <path
        d="M4 11 Q3 10.5 4 10 L15 3 Q16 2.5 17 3 L28 10 Q29 10.5 28 11 L17 18 Q16 18.5 15 18 Z"
        fill="url(#pl-top)"
      />
      {/* Top face edge highlight */}
      <path
        d="M4.5 10.5 L15.5 3.5 Q16 3.2 16.5 3.5 L27.5 10.5"
        stroke="url(#pl-edge)"
        strokeWidth="0.4"
        strokeLinecap="round"
        fill="none"
      />

      {/* P cutout — carved into front face */}
      {/* Vertical stem */}
      <path
        d="M7.5 15 L7.5 26 Q7.5 26.8 8.3 26.3 L10 25.3 L10 17.5 L7.5 15 Z"
        fill="url(#pl-p-shadow)"
      />
      {/* P bowl (upper curve) */}
      <path
        d="M7.5 15 L12.5 15 Q14.8 15 14.8 17.5 Q14.8 20 12.5 20 L10 20 L10 17.5 L12 17.5 Q13 17.5 13 17 Q13 16.5 12 16.5 L9 16.5 L7.5 15 Z"
        fill="url(#pl-p-shadow)"
      />

      <defs>
        {/* Front face: warm orange top-left → burnt orange bottom-right */}
        <linearGradient id="pl-front" x1="3" y1="11" x2="16" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E8851A" />
          <stop offset="100%" stopColor="#B85C10" />
        </linearGradient>
        {/* Right face: medium orange → darker */}
        <linearGradient id="pl-right" x1="16" y1="19" x2="29" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#D47118" />
          <stop offset="100%" stopColor="#9A4E0E" />
        </linearGradient>
        {/* Top face: bright golden amber */}
        <linearGradient id="pl-top" x1="4" y1="12" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5A623" />
          <stop offset="50%" stopColor="#FFBF47" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
        {/* Top edge highlight */}
        <linearGradient id="pl-edge" x1="4" y1="10" x2="28" y2="10" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFD97A" />
          <stop offset="100%" stopColor="#F5A623" />
        </linearGradient>
        {/* P cutout shadow */}
        <linearGradient id="pl-p-shadow" x1="7" y1="15" x2="12" y2="27" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8B4513" />
          <stop offset="100%" stopColor="#6B3410" />
        </linearGradient>
      </defs>
    </svg>
  );
}

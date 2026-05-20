export function NordicPotIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      aria-hidden
    >
      <ellipse cx="24" cy="40" rx="14" ry="4" fill="#b8cee0" opacity="0.6" />
      <path
        d="M14 38V22c0-5 4-9 10-9s10 4 10 9v16"
        fill="#faf6ef"
        stroke="#5b8fad"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M10 22h28" stroke="#5b8fad" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M18 14c0-4 2.5-7 6-7s6 3 6 7"
        stroke="#8aa4b8"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="12" r="2" fill="#d4c4a8" />
    </svg>
  );
}

export function NordicEmptyIllustration({ className = "mx-auto h-28 w-28" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className} aria-hidden>
      <circle cx="88" cy="28" r="16" fill="#faf6ef" stroke="#c5d9ea" strokeWidth="2" />
      <circle cx="100" cy="22" r="10" fill="#faf6ef" stroke="#c5d9ea" strokeWidth="1.5" />
      <path
        d="M8 88 Q40 72 60 80 T112 76"
        stroke="#b8cee0"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <rect x="28" y="52" width="48" height="8" rx="2" fill="#8aa4b8" opacity="0.5" />
      <path
        d="M24 52h56l-8-24H32l-8 24z"
        fill="#faf6ef"
        stroke="#5b8fad"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M44 28c0-8 6-14 16-14s16 6 16 14"
        stroke="#5b8fad"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M52 18v-4M60 16l2-3M68 18v-4"
        stroke="#8aa4b8"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

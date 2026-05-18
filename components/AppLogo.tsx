import { APP_NAME, APP_TAGLINE } from "@/lib/branding";

interface AppLogoProps {
  size?: "sm" | "md";
  showTagline?: boolean;
  className?: string;
}

const iconSizes = { sm: 40, md: 48 } as const;

export function AppLogo({
  size = "md",
  showTagline = true,
  className = "",
}: AppLogoProps) {
  const px = iconSizes[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={px} />
      <div className="min-w-0">
        <p
          className={`font-display logo-brand leading-none ${
            size === "sm" ? "text-2xl" : "text-[1.9rem]"
          }`}
          aria-label={APP_NAME}
        >
          {APP_NAME}
        </p>
        {showTagline && (
          <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
            {APP_TAGLINE}
          </p>
        )}
      </div>
    </div>
  );
}

export function LogoMark({
  size = 48,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const id = `logo-grad-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_0_12px_rgba(255,77,77,0.4)] ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="8" y1="4" x2="40" y2="44">
          <stop offset="0%" stopColor="#ff5c5c" />
          <stop offset="100%" stopColor="#e02020" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill={`url(#${id})`} />
      <path
        d="M27 9L17 27h7.5l-2.5 12 13-20H26.5L27 9z"
        fill="white"
      />
    </svg>
  );
}

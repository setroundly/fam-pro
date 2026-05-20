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
  const hasRecipeSuffix = APP_NAME.endsWith("レシピ");
  const nameMain = hasRecipeSuffix
    ? APP_NAME.slice(0, -"レシピ".length).trim()
    : APP_NAME;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <LogoMark size={px} />
      <div className="min-w-0">
        <p
          className={`font-display logo-brand leading-tight ${
            size === "sm" ? "text-base" : "text-[1.05rem]"
          }`}
          aria-label={APP_NAME}
        >
          {hasRecipeSuffix ? (
            <>
              <span className="block">{nameMain}</span>
              <span className="block text-kitchen">レシピ</span>
            </>
          ) : (
            APP_NAME
          )}
        </p>
        {showTagline && (
          <p className="mt-1 text-[10px] font-semibold tracking-widest text-kitchen-muted uppercase">
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
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow-[0_3px_10px_rgba(91,143,173,0.25)] ${className}`}
      aria-hidden
    >
      <rect x="2" y="2" width="44" height="44" rx="16" fill="#faf6ef" stroke="#b8cee0" strokeWidth="2" />
      <ellipse cx="24" cy="38" rx="10" ry="3" fill="#c5d9ea" opacity="0.8" />
      <path
        d="M16 36V22c0-5 3.5-9 8-9s8 4 8 9v14"
        fill="#f5efe3"
        stroke="#5b8fad"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M12 22h24" stroke="#5b8fad" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M20 16c0-4 2-7 4-7s4 3 4 7"
        stroke="#8aa4b8"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="32" cy="14" r="2.5" fill="#d4c4a8" stroke="#8aa4b8" strokeWidth="1" />
    </svg>
  );
}

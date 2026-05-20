type PoodlePalette = {
  tail: [string, string, string];
  legDark: string;
  legFoot: string;
  legMid: string;
  body: [string, string, string, string, string];
  head: [string, string, string, string];
  cheek: string;
  ribbon: string;
  shadow: string;
};

const GRAY: PoodlePalette = {
  tail: ["#b8bcc4", "#a3a8b0", "#9ca3af"],
  legDark: "#8b919a",
  legFoot: "#7a8088",
  legMid: "#949aa3",
  body: ["#b0b5bd", "#a8adb5", "#a3a8b0", "#9ca3af", "#959ba3"],
  head: ["#b8bcc4", "#c4c8cf", "#d1d5db", "#e5e7eb"],
  cheek: "#9ca3af",
  ribbon: "#5b8fad",
  shadow: "#5b8fad",
};

const BROWN: PoodlePalette = {
  tail: ["#c4a882", "#b8956a", "#a8845c"],
  legDark: "#8b6914",
  legFoot: "#7a5c3e",
  legMid: "#a8845c",
  body: ["#c9a66b", "#c4a066", "#b8956a", "#b0885a", "#a67c52"],
  head: ["#c9a66b", "#d4b483", "#e0c49a", "#edd5b0"],
  cheek: "#a8845c",
  ribbon: "#c9956a",
  shadow: "#8b6914",
};

const BLACK: PoodlePalette = {
  tail: ["#4a4a4a", "#3a3a3a", "#2f2f2f"],
  legDark: "#252525",
  legFoot: "#1a1a1a",
  legMid: "#333333",
  body: ["#3d3d3d", "#353535", "#2e2e2e", "#2a2a2a", "#404040"],
  head: ["#454545", "#525252", "#5c5c5c", "#666666"],
  cheek: "#555555",
  ribbon: "#c45c5c",
  shadow: "#1a1a1a",
};

function Leg({
  rectX,
  footX,
  fill,
  footFill,
  pivotX,
  pivotY,
  delay = "0s",
  className,
}: {
  rectX: number;
  footX: number;
  fill: string;
  footFill: string;
  pivotX: number;
  pivotY: number;
  delay?: string;
  className: string;
}) {
  return (
    <g className={className}>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values={`-22 ${pivotX} ${pivotY}; 22 ${pivotX} ${pivotY}; -22 ${pivotX} ${pivotY}`}
        dur="0.34s"
        repeatCount="indefinite"
        begin={delay}
      />
      <rect x={rectX} y={38} width={5} height={12} rx={2.5} fill={fill} />
      <ellipse cx={footX} cy={50} rx={4} ry={2.5} fill={footFill} />
    </g>
  );
}

function Tail({
  colors,
  pivotX,
  pivotY,
  className,
}: {
  colors: PoodlePalette;
  pivotX: number;
  pivotY: number;
  className: string;
}) {
  return (
    <g className={className}>
      <animateTransform
        attributeName="transform"
        type="rotate"
        values={`-18 ${pivotX} ${pivotY}; 22 ${pivotX} ${pivotY}; -18 ${pivotX} ${pivotY}`}
        dur="0.28s"
        repeatCount="indefinite"
      />
      <circle cx={8} cy={28} r={7} fill={colors.tail[0]} />
      <circle cx={4} cy={22} r={5} fill={colors.tail[1]} />
      <circle cx={6} cy={16} r={4} fill={colors.tail[2]} />
    </g>
  );
}

export function ToyPoodleSvg({
  className = "h-full w-full",
  variant = "gray",
}: {
  className?: string;
  variant?: "gray" | "black" | "brown";
}) {
  const c =
    variant === "black" ? BLACK : variant === "brown" ? BROWN : GRAY;

  return (
    <svg
      viewBox="0 0 80 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx={40} cy={52} rx={18} ry={3} fill={c.shadow} opacity={0.15} />

      <Tail colors={c} pivotX={8} pivotY={28} className="poodle-tail-wag" />

      <Leg
        rectX={22}
        footX={24.5}
        fill={c.legDark}
        footFill={c.legFoot}
        pivotX={24.5}
        pivotY={38}
        delay="0.17s"
        className="poodle-leg poodle-leg-bl"
      />
      <Leg
        rectX={30}
        footX={32.5}
        fill={c.legMid}
        footFill={c.legFoot}
        pivotX={32.5}
        pivotY={38}
        className="poodle-leg poodle-leg-br"
      />

      <ellipse cx={38} cy={32} rx={18} ry={14} fill={c.body[0]} />
      <circle cx={28} cy={28} r={8} fill={c.body[1]} />
      <circle cx={44} cy={26} r={9} fill={c.body[2]} />
      <circle cx={36} cy={34} r={7} fill={c.body[3]} />
      <circle cx={48} cy={32} r={6} fill={c.body[4]} />

      <Leg
        rectX={46}
        footX={48.5}
        fill={c.legMid}
        footFill={c.legFoot}
        pivotX={48.5}
        pivotY={38}
        delay="0.17s"
        className="poodle-leg poodle-leg-fl"
      />
      <Leg
        rectX={54}
        footX={56.5}
        fill={c.legDark}
        footFill={c.legFoot}
        pivotX={56.5}
        pivotY={38}
        className="poodle-leg poodle-leg-fr"
      />

      <circle cx={58} cy={22} r={11} fill={c.head[0]} />
      <circle cx={62} cy={16} r={9} fill={c.head[1]} />
      <circle cx={68} cy={10} r={6} fill={c.head[2]} />
      <circle cx={64} cy={7} r={4.5} fill={c.head[3]} />

      <circle cx={70} cy={18} r={2} fill="#1a1a1a" />
      <circle cx={71.2} cy={17.2} r={0.6} fill="#f9fafb" />
      <ellipse cx={73} cy={21} rx={2.5} ry={2} fill="#333" />
      <circle cx={66} cy={20} r={1.2} fill={c.cheek} opacity={0.5} />

      <path d="M58 28 L54 32 L58 30 L62 32 Z" fill={c.ribbon} opacity={0.85} />
    </svg>
  );
}

export function AngelPoodleSvg({ className = "h-full w-full" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 68"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse
        cx={58}
        cy={5}
        rx={9}
        ry={2.5}
        fill="none"
        stroke="#e8c547"
        strokeWidth={1.8}
        opacity={0.9}
      />
      <ellipse cx={26} cy={36} rx={12} ry={7} fill="#fff" opacity={0.55} />
      <ellipse cx={36} cy={40} rx={10} ry={6} fill="#fff" opacity={0.42} />
      <g transform="translate(0 8) rotate(-16 40 28)">
        <ToyPoodleSvg variant="brown" className="h-full w-full" />
      </g>
    </svg>
  );
}

export function PoodlePlayground() {
  return (
    <>
      <div className="poodle-playground" aria-hidden>
        <div className="poodle-runner poodle-runner-a">
          <div className="poodle-bounce">
            <ToyPoodleSvg variant="gray" />
          </div>
        </div>
        <div className="poodle-runner poodle-runner-b">
          <div className="poodle-bounce poodle-bounce-delay">
            <ToyPoodleSvg variant="black" />
          </div>
        </div>
      </div>
      <div className="poodle-angel-layer" aria-hidden>
        <div className="poodle-angel">
          <div className="poodle-angel-float">
            <AngelPoodleSvg />
          </div>
        </div>
      </div>
    </>
  );
}

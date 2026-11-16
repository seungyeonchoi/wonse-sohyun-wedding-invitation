import { invitation } from "@/config/invitation";
import { cn } from "@/lib/utils";

/** Oval outline with an English caption, drawn on the same 134×40 box as the template's label art. */
export function SectionLabel({ children }: { children: string }) {
  const long = children.length >= 11;
  return (
    <svg viewBox="0 0 134 40" width={134} height={40} className="mx-auto block" aria-hidden>
      <ellipse
        cx={67.42}
        cy={19.46}
        rx={57.69}
        ry={16.72}
        fill="none"
        stroke={invitation.theme.label}
        strokeWidth={1}
        strokeLinecap="round"
        className="label-oval"
      />
      <text
        x={67.42}
        y={20.2}
        textAnchor="middle"
        dominantBaseline="central"
        fill={invitation.theme.label}
        className="font-label"
        style={{ fontSize: 14, letterSpacing: "-0.02em" }}
        {...(long ? { textLength: 92, lengthAdjust: "spacingAndGlyphs" } : {})}
      >
        {children}
      </text>
    </svg>
  );
}

export function SectionHeading({
  label,
  title,
  className,
}: {
  label: string;
  title: string;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col items-center", className)}>
      <SectionLabel>{label}</SectionLabel>
      <h2 className="mt-2.5 text-center text-[20px] leading-9 font-normal">{title}</h2>
    </header>
  );
}

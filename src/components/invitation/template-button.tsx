import type { ComponentProps, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = ComponentProps<typeof Button> & {
  tone?: "soft" | "dark";
  /** Trailing icon; when present the label is left-aligned like the template's icon buttons. */
  icon?: ReactNode;
};

/** The template's 48px rounded buttons (BtnBasic / BtnIcon), built on shadcn's Button. */
export function TemplateButton({ tone = "soft", icon, className, children, ...props }: Props) {
  return (
    <Button
      variant="ghost"
      className={cn(
        "h-12 w-full rounded-[12px] border px-6 font-myeongjo text-[14px] font-normal tracking-[-0.04em] transition-opacity hover:opacity-70 [&_svg:not([class*='size-'])]:size-4",
        tone === "soft"
          ? "border-line bg-paper-deep text-ink hover:bg-paper-deep hover:text-ink"
          : "border-[#111] bg-[#111] text-white shadow-[0_8px_20px_rgb(0_0_0/0.18)] hover:bg-[#111] hover:text-white",
        icon ? "justify-between" : "justify-center",
        className,
      )}
      {...props}
    >
      {props.asChild ? (
        children
      ) : (
        <>
          <span>{children}</span>
          {icon}
        </>
      )}
    </Button>
  );
}

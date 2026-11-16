"use client";

import { useRef, type FocusEvent, type FormEventHandler, type KeyboardEvent, type ReactNode } from "react";

/**
 * Shared pieces for the bottom-sheet forms (guestbook, time capsule), tuned for phone keyboards.
 *
 * When the keyboard opens, vaul shrinks the drawer to the space above it. SheetForm then lets the
 * fields scroll while the submit button stays pinned right above the keyboard.
 */

export const drawerClass = "mx-auto w-full max-w-[430px] bg-paper font-myeongjo tracking-[-0.04em] text-ink";
/** 16px text: iOS zooms the page into any focused field with smaller text. */
export const fieldClass = "h-11 rounded-[12px] border-line-strong bg-white/60 text-[16px] shadow-none md:text-[16px]";
export const textareaClass =
  "max-h-56 min-h-32 rounded-[12px] border-line-strong bg-white/60 text-[16px] leading-[24px] shadow-none md:text-[16px]";

/** Password fields: no "strong password" / save-password prompts from iOS or password managers. */
export const passwordProps = { type: "password", autoComplete: "off", "data-1p-ignore": true, "data-lpignore": "true" } as const;

/** Gap kept between a focused field and the edges of the scrolling area (e.g. the pinned submit button). */
const REVEAL_MARGIN = 12;

/** Scrolls only the sheet's own field area (never the page behind) so `field` is fully visible. */
function reveal(area: HTMLElement, field: HTMLElement) {
  const a = area.getBoundingClientRect();
  const f = field.getBoundingClientRect();
  const below = f.bottom - (a.bottom - REVEAL_MARGIN);
  const above = a.top + REVEAL_MARGIN - f.top;
  // a field taller than the area lines up with its top, where typing starts
  if (below > 0) area.scrollBy({ top: Math.min(below, -above), behavior: "smooth" });
  else if (above > 0) area.scrollBy({ top: -above, behavior: "smooth" });
}

export function SheetForm({ onSubmit, submit, children }: { onSubmit: FormEventHandler<HTMLFormElement>; submit: ReactNode; children: ReactNode }) {
  const area = useRef<HTMLDivElement>(null);

  // The keyboard opens (and vaul shrinks the sheet) only after focus, so check again once the
  // visual viewport has resized.
  const onFocus = (e: FocusEvent<HTMLDivElement>) => {
    const field = e.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    const run = () => area.current && document.activeElement === field && reveal(area.current, field);
    window.visualViewport?.addEventListener("resize", () => setTimeout(run, 60), { once: true });
    setTimeout(run, 350);
  };

  return (
    <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
      {/* data-vaul-no-drag: a swipe while typing scrolls the fields instead of closing the sheet (and losing the text) */}
      <div
        ref={area}
        data-vaul-no-drag
        onFocus={onFocus}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pt-1 pb-4"
      >
        {children}
      </div>
      <div className="shrink-0 border-t border-line px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]">{submit}</div>
    </form>
  );
}

/**
 * The keyboard's Enter/"next" key moves to the named field instead of submitting a half-filled form.
 * Ignored while a Korean syllable is still being composed.
 */
export function focusOnEnter(next: string) {
  return (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return;
    e.preventDefault();
    const target = e.currentTarget.form?.elements.namedItem(next);
    if (target instanceof HTMLElement) target.focus();
  };
}

/** Drop the keyboard before a sheet closes, so the page doesn't jump while both animate. */
export function dismissKeyboard() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
}

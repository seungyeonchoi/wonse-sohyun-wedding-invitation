import type { CSSProperties } from "react";

/**
 * Length on the 400px artboard the reference template was authored on.
 * `.artboard` defines --u as 1/400 of the column width, so every value scales together.
 */
export const u = (n: number) => `calc(var(--u) * ${n})`;

/** Absolutely position a box on the artboard. */
export function box(x: number, y: number, w: number, h: number): CSSProperties {
  return { position: "absolute", left: u(x), top: u(y), width: u(w), height: u(h) };
}

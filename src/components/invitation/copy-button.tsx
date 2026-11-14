"use client";

import type { ComponentProps } from "react";

import { copyText } from "@/lib/clipboard";

export function CopyButton({ text, message, ...props }: { text: string; message?: string } & Omit<ComponentProps<"button">, "onClick">) {
  return <button type="button" onClick={() => copyText(text, message)} {...props} />;
}

"use client";

import { toast } from "sonner";

/** Copy text and confirm with a toast. Falls back to execCommand where the async API is unavailable (e.g. http, old in-app browsers). */
export async function copyText(text: string, message = "복사되었습니다.") {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      if (!ok) throw new Error("copy failed");
    }
    toast(message);
  } catch {
    toast("복사하지 못했어요. 길게 눌러 직접 복사해 주세요.");
  }
}

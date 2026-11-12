import { Heart } from "lucide-react";

import { invitation } from "@/config/invitation";

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-1.5 border-t border-black/10 bg-paper-deep px-5 pt-[22px] pb-10 text-ink-soft">
      <Heart className="size-9" strokeWidth={1.4} aria-hidden />
      <p className="text-[10px] leading-[14px] tracking-[0.1px]">{invitation.footer.copyright}</p>
    </footer>
  );
}

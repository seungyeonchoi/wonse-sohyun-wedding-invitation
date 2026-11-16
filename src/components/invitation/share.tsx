"use client";

import { Link2, MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

import { invitation } from "@/config/invitation";
import { copyText } from "@/lib/clipboard";
import { loadKakaoSdk } from "@/lib/kakao";
import { shareInvitation } from "@/lib/share";

import { TemplateButton } from "./template-button";

export function Share() {
  const url = invitation.meta.siteUrl;
  const section = useRef<HTMLElement>(null);

  // Load the SDK while the guest scrolls toward the buttons, so a tap can open
  // KakaoTalk straight away (in-app browsers may block a share that only starts after a wait).
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        loadKakaoSdk().catch(() => {});
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={section} aria-label="공유하기" className="py-8">
      <div className="flex flex-col gap-2.5 p-4">
        <TemplateButton icon={<MessageCircle className="fill-ink/80 stroke-none" />} onClick={shareInvitation}>
          카카오톡으로 공유하기
        </TemplateButton>
        <TemplateButton icon={<Link2 />} onClick={() => copyText(url, "청첩장 주소가 복사되었습니다.")}>
          청첩장 주소 복사하기
        </TemplateButton>
      </div>
    </section>
  );
}

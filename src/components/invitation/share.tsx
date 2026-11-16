"use client";

import { Link2, MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

import { invitation } from "@/config/invitation";
import { copyText } from "@/lib/clipboard";
import { absoluteUrl } from "@/lib/invitation";
import { loadKakaoSdk } from "@/lib/kakao";

import { TemplateButton } from "./template-button";

export function Share() {
  const url = invitation.meta.siteUrl;
  const section = useRef<HTMLElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kakao = useRef<any>(null);

  // Load the SDK while the guest scrolls toward the buttons, so a tap can open
  // KakaoTalk straight away (in-app browsers may block a share that only starts after a wait).
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        loadKakaoSdk()
          .then((k) => (kakao.current = k))
          .catch(() => {});
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  async function shareKakao() {
    const Kakao = kakao.current ?? (await loadKakaoSdk().catch(() => null));
    if (Kakao?.Share) {
      const link = { mobileWebUrl: url, webUrl: url };
      Kakao.Share.sendDefault({
        objectType: "location",
        address: invitation.location.address,
        addressTitle: invitation.location.venue,
        content: {
          title: invitation.meta.title,
          description: invitation.meta.description,
          imageUrl: absoluteUrl(invitation.share.image),
          imageWidth: invitation.share.imageSize,
          imageHeight: invitation.share.imageSize,
          link,
        },
        buttons: [{ title: invitation.share.buttonTitle, link }],
      });
      return;
    }
    // No Kakao key configured: fall back to the OS share sheet, then to copying.
    if (navigator.share) {
      await navigator.share({ title: invitation.meta.title, text: invitation.meta.description, url }).catch(() => {});
      return;
    }
    await copyText(url, "청첩장 주소가 복사되었습니다.");
  }

  return (
    <section ref={section} aria-label="공유하기" className="py-8">
      <div className="flex flex-col gap-2.5 p-4">
        <TemplateButton icon={<MessageCircle className="fill-ink/80 stroke-none" />} onClick={shareKakao}>
          카카오톡으로 공유하기
        </TemplateButton>
        <TemplateButton icon={<Link2 />} onClick={() => copyText(url, "청첩장 주소가 복사되었습니다.")}>
          청첩장 주소 복사하기
        </TemplateButton>
      </div>
    </section>
  );
}

"use client";

import { Link2, MessageCircle } from "lucide-react";

import { invitation } from "@/config/invitation";
import { copyText } from "@/lib/clipboard";
import { absoluteUrl } from "@/lib/invitation";
import { loadKakaoSdk } from "@/lib/kakao";

import { TemplateButton } from "./template-button";

export function Share() {
  const url = invitation.meta.siteUrl;

  async function shareKakao() {
    const Kakao = await loadKakaoSdk().catch(() => null);
    if (Kakao?.Share) {
      Kakao.Share.sendDefault({
        objectType: "feed",
        content: {
          title: invitation.meta.title,
          description: invitation.meta.description,
          imageUrl: absoluteUrl(invitation.meta.ogImage),
          link: { mobileWebUrl: url, webUrl: url },
        },
        buttons: [{ title: "청첩장 보기", link: { mobileWebUrl: url, webUrl: url } }],
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
    <section aria-label="공유하기" className="py-8">
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

"use client";

import { Link2, MessageCircle } from "lucide-react";
import { useEffect, useRef } from "react";

import { invitation } from "@/config/invitation";
import { copyText } from "@/lib/clipboard";
import { absoluteUrl } from "@/lib/invitation";
import { loadKakaoSdk } from "@/lib/kakao";

import { TemplateButton } from "./template-button";

type Counts = { guestbook: number; cheers: number };

/** Guestbook entries and footer hearts, shown on the share card as 💬 / ♥ counts. */
async function fetchCounts(): Promise<Counts> {
  const json = (url: string) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const [guestbook, cheers] = await Promise.all([json("/api/guestbook"), json("/api/cheers")]);
  return { guestbook: guestbook?.entries?.length ?? 0, cheers: cheers?.count ?? 0 };
}

export function Share() {
  const url = invitation.meta.siteUrl;
  const section = useRef<HTMLElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const kakao = useRef<any>(null);
  const counts = useRef<Counts>({ guestbook: 0, cheers: 0 });

  // Load the SDK and the counts while the guest scrolls toward the buttons, so a tap can open
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
        fetchCounts().then((c) => (counts.current = c));
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
      const { guestbook, cheers } = counts.current;
      // Counts of zero would read as "nobody cares" — leave them off instead.
      const social = { ...(cheers ? { likeCount: cheers } : {}), ...(guestbook ? { commentCount: guestbook } : {}) };
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
        ...(Object.keys(social).length ? { social } : {}),
        buttons: [{ title: invitation.share.buttonTitle, link }],
      });
      // fresher numbers for the next share
      fetchCounts().then((c) => (counts.current = c));
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

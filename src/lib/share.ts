"use client";

import { invitation } from "@/config/invitation";
import { copyText } from "@/lib/clipboard";
import { absoluteUrl } from "@/lib/invitation";
import { loadKakaoSdk } from "@/lib/kakao";

/**
 * Shares the invitation as a KakaoTalk location card (photo + map + button).
 * Callers should load the SDK ahead of the tap: in-app browsers may block a share
 * that only starts after a network wait. Without a Kakao key it falls back to the
 * OS share sheet, then to copying the link.
 */
export async function shareInvitation() {
  const url = invitation.meta.siteUrl;
  const Kakao = await loadKakaoSdk().catch(() => null);
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
  if (navigator.share) {
    await navigator.share({ title: invitation.meta.title, text: invitation.meta.description, url }).catch(() => {});
    return;
  }
  await copyText(url, "청첩장 주소가 복사되었습니다.");
}

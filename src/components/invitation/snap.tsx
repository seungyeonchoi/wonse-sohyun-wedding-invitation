import { Camera } from "lucide-react";
import Image from "next/image";

import { invitation } from "@/config/invitation";

import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { TemplateButton } from "./template-button";

/** Guest photo event ("베스트 포토그래퍼"). The button opens whatever upload page you configure. */
export function Snap() {
  const { snap } = invitation;
  if (!snap.enabled) return null;
  return (
    <Reveal aria-label={snap.title} className="flex flex-col items-center px-4 py-12 text-center">
      <SectionHeading label="SNAP" title={snap.title} />
      <p className="mt-4 text-[15px] leading-[27px]">{snap.lead}</p>
      <div className="relative mt-[30px] aspect-[330/127] w-[calc(100%-28px)] overflow-hidden rounded-[8px] bg-white">
        <Image src={snap.image} alt="" fill sizes="(max-width: 430px) 85vw, 360px" className="object-cover" />
      </div>
      <div className="mt-[30px] text-[15px] leading-[27px]">
        {snap.paragraphs.map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
      <div className="mt-7 w-[calc(100%-28px)]">
        {snap.uploadUrl ? (
          <TemplateButton tone="dark" asChild>
            <a href={snap.uploadUrl} target="_blank" rel="noreferrer">
              <span>{snap.buttonText}</span>
              <Camera />
            </a>
          </TemplateButton>
        ) : (
          <TemplateButton tone="dark" icon={<Camera />} disabled className="disabled:opacity-100" title="config의 snap.uploadUrl을 설정하세요">
            {snap.buttonText}
          </TemplateButton>
        )}
      </div>
    </Reveal>
  );
}

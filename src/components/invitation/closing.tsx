import Image from "next/image";

import { invitation } from "@/config/invitation";

export function Closing() {
  const { closing } = invitation;
  return (
    <section aria-label="마무리 사진" className="relative mb-10 h-60 overflow-hidden">
      <Image src={closing.image} alt="" fill sizes="(max-width: 430px) 100vw, 430px" className="object-cover" />
      <div className="absolute inset-0 bg-black/30" aria-hidden />
      <p className="absolute inset-x-6 bottom-[38px] text-center text-[14px] leading-[21px] text-paper-deep">{closing.text}</p>
    </section>
  );
}

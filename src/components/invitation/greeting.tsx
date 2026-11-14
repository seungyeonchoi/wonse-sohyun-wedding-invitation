import { invitation } from "@/config/invitation";
import { brideName, groomName, parentName } from "@/lib/invitation";

import { Reveal } from "./reveal";
import { SectionLabel } from "./section-heading";

function Parents({ father, mother }: { father: { name: string; deceased?: boolean }; mother: { name: string; deceased?: boolean } }) {
  return (
    <span className="text-right">
      {parentName(father)}
      <span className="mx-2">∙</span>
      {parentName(mother)}
    </span>
  );
}

export function Greeting() {
  const { greeting, parents } = invitation;
  return (
    <Reveal aria-label="초대글" className="flex flex-col items-center px-4 py-12 text-center">
      <SectionLabel>INVITATION</SectionLabel>
      <h2 className="mt-2.5 mb-3 text-[20px] leading-9">{greeting.title}</h2>
      <div className="text-[15px] leading-[27px]">
        {greeting.paragraphs.map((line, i) => (
          <p key={i}>{line || " "}</p>
        ))}
      </div>

      <div className="mt-12 h-[60px] w-px bg-ink-muted" aria-hidden />

      <dl className="-mx-2.5 grid grid-cols-[auto_auto_auto] items-center gap-x-2.5 py-12 text-[15px] leading-[27px]">
        <dt className="contents">
          <Parents {...parents.groom} />
        </dt>
        <dd className="text-left text-ink-muted">
          의 <span className="ml-1">{parents.groom.relation}</span>
        </dd>
        <dd className="text-left">{groomName}</dd>

        <dt className="contents">
          <Parents {...parents.bride} />
        </dt>
        <dd className="text-left text-ink-muted">
          의 <span className="ml-1">{parents.bride.relation}</span>
        </dd>
        <dd className="text-left">{brideName}</dd>
      </dl>
    </Reveal>
  );
}

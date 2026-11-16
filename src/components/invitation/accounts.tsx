import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { invitation, type Account } from "@/config/invitation";

import { CopyButton } from "./copy-button";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";

const chip = "inline-flex h-[22px] items-center rounded-[12px] border border-line bg-paper-deep px-3 text-[12px] font-bold";

function AccountRow({ account }: { account: Account }) {
  return (
    <li className="flex items-start justify-between gap-2 border-b border-line py-3 last:border-b-0">
      <div className="text-[15px] leading-[27px]">
        <div>
          {account.role} <span>{account.holder}</span>
        </div>
        <div>
          {account.bank} <span className="tracking-normal whitespace-nowrap">{account.number}</span>
        </div>
      </div>
      <div className="mt-[3px] flex shrink-0 flex-col items-end gap-1.5">
        <CopyButton text={`${account.bank} ${account.number} ${account.holder}`} message="계좌번호가 복사되었습니다." className={chip}>
          복사하기
        </CopyButton>
        {account.kakaoPayUrl ? (
          <a href={account.kakaoPayUrl} target="_blank" rel="noreferrer" className={`${chip} border-[#fee500] bg-[#fee500] text-black`}>
            카카오페이
          </a>
        ) : null}
      </div>
    </li>
  );
}

export function Accounts() {
  const { accounts } = invitation;
  const groups = [
    { id: "groom", title: "신랑측 계좌번호", items: accounts.groom },
    { id: "bride", title: "신부측 계좌번호", items: accounts.bride },
  ];
  return (
    <Reveal aria-label="마음 전하실 곳" className="flex flex-col items-center px-4 py-12">
      <SectionHeading label="ACCOUNTS" title={accounts.title} />
      <Accordion type="multiple" defaultValue={groups.map((g) => g.id)} className="mt-4">
        {groups.map((group) => (
          <AccordionItem key={group.id} value={group.id} className="not-last:border-b-0">
            <AccordionTrigger className="mb-2 h-12 items-center rounded-[12px] border-line bg-paper-deep py-0 pr-4 pl-4 text-[14px] font-normal hover:no-underline **:data-[slot=accordion-trigger-icon]:text-ink">
              {group.title}
            </AccordionTrigger>
            <AccordionContent className="px-4 pt-0 pb-4">
              <ul>
                {group.items.map((account) => (
                  <AccountRow key={account.role} account={account} />
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Reveal>
  );
}

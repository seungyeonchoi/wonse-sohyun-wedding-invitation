import Image from "next/image";

import { invitation } from "@/config/invitation";
import { u } from "@/lib/artboard";
import { brideName, groomName } from "@/lib/invitation";
import { cn } from "@/lib/utils";
import { describeWeddingDate, monthMatrix } from "@/lib/wedding-date";

import { DDay } from "./dday";
import { Reveal } from "./reveal";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

/** Wedding-month calendar (template preset "포토 에디토리얼"): wide photo, ruled month grid, D-day line. */
export function Calendar() {
  const date = describeWeddingDate(invitation.date);
  const weeks = monthMatrix(date.year, date.month);

  return (
    <Reveal aria-label="예식 날짜" className="bg-paper">
      <div className="artboard flex flex-col items-center" style={{ paddingTop: u(31.8), paddingBottom: u(33) }}>
        <div className="relative overflow-hidden" style={{ width: u(359), height: u(150) }}>
          <Image src={invitation.calendar.photo} alt="" fill sizes="(max-width: 430px) 90vw, 390px" className="object-cover" />
        </div>

        <h2 className="flex items-center font-myeongjo" style={{ marginTop: u(20), gap: u(8), fontSize: u(19), lineHeight: 1.1 }}>
          <span>{date.year}</span>
          <span>{date.monthEn}</span>
        </h2>
        <p style={{ marginTop: u(8), fontSize: u(14), lineHeight: 1.1 }}>{date.weekdayTimeKo}</p>

        <table className="table-fixed border-collapse tracking-normal" style={{ width: u(347), marginTop: u(14) }}>
          <caption className="sr-only">{date.fullKo}</caption>
          <thead>
            <tr className="border-b border-black/16">
              {WEEKDAYS.map((d, i) => (
                <th
                  key={d}
                  scope="col"
                  className={cn("font-normal", i === 0 ? "text-ink-accent" : i === 6 ? "text-ink" : "text-ink-muted")}
                  style={{ height: u(43), fontSize: u(14) }}
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {weeks.map((week, w) => (
              <tr key={w} className="border-b border-black/16">
                {week.map((day, i) => {
                  const isWedding = day === date.day;
                  return (
                    <td key={i} className="relative p-0 align-top" style={{ height: u(66) }}>
                      {day ? (
                        <>
                          <span
                            className={cn(
                              "absolute grid place-items-center rounded-full font-medium",
                              isWedding ? "bg-ink-accent text-paper" : i === 0 ? "text-ink-accent" : "text-ink",
                            )}
                            style={{ left: u(2), top: u(4), width: u(24), height: u(24), fontSize: u(14) }}
                            aria-current={isWedding ? "date" : undefined}
                          >
                            {day}
                          </span>
                          {isWedding ? (
                            <span
                              className="absolute text-left text-ink-accent"
                              style={{ left: u(2), top: u(32), width: u(52), fontSize: u(10), lineHeight: 1.2 }}
                            >
                              {invitation.calendar.weddingDayNote}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: u(33) }}>
          <DDay date={invitation.date} groom={groomName} bride={brideName} />
        </div>
      </div>
    </Reveal>
  );
}

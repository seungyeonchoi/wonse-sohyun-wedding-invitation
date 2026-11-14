const TZ = "Asia/Seoul";

const KO_WEEKDAYS = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type DateParts = {
  year: number;
  month: number; // 1-12
  day: number;
  hour: number; // 0-23
  minute: number;
  weekday: number; // 0 = Sunday
};

/** Calendar parts of an instant, as seen in Korea (KST). */
export function kstParts(date: Date): DateParts {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  const year = get("year");
  const month = get("month");
  const day = get("day");
  return {
    year,
    month,
    day,
    hour: get("hour"),
    minute: get("minute"),
    weekday: new Date(Date.UTC(year, month - 1, day)).getUTCDay(),
  };
}

export function describeWeddingDate(iso: string) {
  const p = kstParts(new Date(iso));
  const ampm = p.hour < 12 ? "오전" : "오후";
  const hour12 = p.hour % 12 === 0 ? 12 : p.hour % 12;
  const minuteText = p.minute ? ` ${p.minute}분` : "";
  return {
    ...p,
    weekdayKo: KO_WEEKDAYS[p.weekday],
    monthEn: EN_MONTHS[p.month - 1],
    /** 7월 24일 */
    monthDayKo: `${p.month}월 ${p.day}일`,
    /** 11:30 (24h) */
    clock: `${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}`,
    /** 토요일 오전 11시 30분 */
    weekdayTimeKo: `${KO_WEEKDAYS[p.weekday]} ${ampm} ${hour12}시${minuteText}`,
    /** 2027년 7월 24일 토요일 오전 11시 30분 */
    fullKo: `${p.year}년 ${p.month}월 ${p.day}일 ${KO_WEEKDAYS[p.weekday]} ${ampm} ${hour12}시${minuteText}`,
    /** on July 24, 2027 */
    onDateEn: `on ${EN_MONTHS[p.month - 1]} ${p.day}, ${p.year}`,
  };
}

/** Weeks of the wedding month; empty cells are null. Weeks start on Sunday. */
export function monthMatrix(year: number, month: number): (number | null)[][] {
  const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Whole days from today (KST) until the wedding day (KST). Negative once it has passed. */
export function daysUntil(iso: string, now = new Date()): number {
  const a = kstParts(now);
  const b = kstParts(new Date(iso));
  const today = Date.UTC(a.year, a.month - 1, a.day);
  const target = Date.UTC(b.year, b.month - 1, b.day);
  return Math.round((target - today) / 86_400_000);
}

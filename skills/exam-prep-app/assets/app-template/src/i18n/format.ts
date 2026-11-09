/** Counted noun: "1 question", "3 questions". */
export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

/** Whole days from `now` until `iso`; 0 or less means due. */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.round((new Date(iso).getTime() - now.getTime()) / 86_400_000)
}

/** A YYYY-MM-DD content date as UTC midnight, so no time zone moves it to another day. */
export function utcDay(isoDay: string): Date {
  return new Date(`${isoDay}T00:00:00Z`)
}

export const isIsoDay = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s)

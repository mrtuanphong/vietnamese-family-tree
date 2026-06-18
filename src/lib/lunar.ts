import { Solar, Lunar } from "lunar-javascript";

// "MM-DD" conversions (for anniversaries — year-agnostic, uses current year)
export function solarToLunar(month: number, day: number): string {
  const year = new Date().getFullYear();
  const lunar = Solar.fromYmd(year, month, day).getLunar();
  return `${String(lunar.getMonth()).padStart(2, "0")}-${String(lunar.getDay()).padStart(2, "0")}`;
}

export function lunarToSolar(month: number, day: number): string {
  const year = new Date().getFullYear();
  const solar = Lunar.fromYmd(year, month, day).getSolar();
  return `${String(solar.getMonth()).padStart(2, "0")}-${String(solar.getDay()).padStart(2, "0")}`;
}

// Full date "YYYY-MM-DD" conversions (for birth/death dates)
export function solarFullToLunar(year: number, month: number, day: number): string {
  const lunar = Solar.fromYmd(year, month, day).getLunar();
  return `${lunar.getYear()}-${String(lunar.getMonth()).padStart(2, "0")}-${String(lunar.getDay()).padStart(2, "0")}`;
}

export function lunarFullToSolar(year: number, month: number, day: number): string {
  const solar = Lunar.fromYmd(year, month, day).getSolar();
  return `${solar.getYear()}-${String(solar.getMonth()).padStart(2, "0")}-${String(solar.getDay()).padStart(2, "0")}`;
}

export function formatMD(month: number, day: number): string {
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

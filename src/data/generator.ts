/**
 * Panchang Generator for Vikram Samvat 2083
 * 
 * Generates PanchangDay entries by iterating through Hindu months,
 * assigning tithis from the canonical 30-tithi cycle,
 * looking up nakshatras by date, and tagging festivals by month+tithi.
 */

import months from "./months.json";
import { TITHI_SEQUENCE, getPaksha } from "./tithiMap";
import { getFestivalForTithi, MONTH_SUMMARIES } from "./festivals";
import { getNakshatraForDate } from "./nakshatraMap";
import type { PanchangDay, MonthData } from "./types";

/**
 * Add days to a Date object (immutable)
 */
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/**
 * Format a Date as "YYYY-MM-DD" string
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Generate Panchang data for a single Hindu month.
 * 
 * @param monthName - Hindi name of the month (e.g., "चैत्र")
 * @param startDate - Start date string "YYYY-MM-DD"
 * @param endDate - End date string "YYYY-MM-DD"
 * @param vikramSamvat - Vikram Samvat year number
 * @returns Array of PanchangDay entries for this month
 */
function generateMonthPanchang(
  monthName: string,
  startDate: string,
  endDate: string,
  vikramSamvat: number
): PanchangDay[] {
  const days: PanchangDay[] = [];
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  
  let dayIndex = 0;
  let current = new Date(start);

  while (current <= end) {
    // Ensure tithi index stays within valid bounds (0-29)
    const tithiIndex = dayIndex % 30;
    const tithi = TITHI_SEQUENCE[tithiIndex];
    const dateStr = formatDate(current);
    const paksha = getPaksha(tithi);
    const nakshatra = getNakshatraForDate(dateStr);

    // Look up festival using month-specific mapping
    const festival = getFestivalForTithi(monthName, tithi);

    const panchangDay: PanchangDay = {
      date: dateStr,
      tithi,
      nakshatra,
      paksha,
      hinduMonth: monthName,
      vikramSamvat: String(vikramSamvat),
      dayNumber: dayIndex + 1,
    };

    // Only add festival if one exists for this month+tithi
    if (festival) {
      panchangDay.festival = festival;
    }

    days.push(panchangDay);
    current = addDays(current, 1);
    dayIndex++;
  }

  return days;
}

/**
 * Generate the complete Panchang dataset for Vikram Samvat 2083.
 * 
 * Iterates through all 12 Hindu months defined in months.json,
 * generates day entries with correct tithi, nakshatra, paksha, and festivals.
 * 
 * @returns Array of PanchangDay entries for the entire year
 */
export function generatePanchang(): PanchangDay[] {
  const allDays: PanchangDay[] = [];

  months.months.forEach((month) => {
    const monthDays = generateMonthPanchang(
      month.name,
      month.start,
      month.end,
      months.vikramSamvat
    );
    allDays.push(...monthDays);
  });

  return allDays;
}

/**
 * Generate Panchang data for a specific Hindu month.
 * Returns both the days data and the month summary.
 * 
 * @param hinduMonthName - Hindi name of the month
 * @param vikramSamvat - Vikram Samvat year (as string)
 * @returns MonthData object with days and summary
 */
export function generateMonthData(hinduMonthName: string, vikramSamvat: string): MonthData {
  const monthConfig = months.months.find((m) => m.name === hinduMonthName);
  
  if (!monthConfig) {
    return {
      days: [],
      summary: { festivals: [], ayurvedicAdvice: [] },
    };
  }

  const days = generateMonthPanchang(
    monthConfig.name,
    monthConfig.start,
    monthConfig.end,
    Number(vikramSamvat)
  );

  const summary = MONTH_SUMMARIES[hinduMonthName] || {
    festivals: [],
    ayurvedicAdvice: [],
  };

  return { days, summary };
}

/**
 * Generate complete Panchang data organized by month.
 * Returns a Record mapping "monthName-year" to MonthData.
 */
export function generateAllMonthData(): Record<string, MonthData> {
  const result: Record<string, MonthData> = {};

  months.months.forEach((month) => {
    const key = `${month.name}-${months.vikramSamvat}`;
    result[key] = generateMonthData(month.name, String(months.vikramSamvat));
  });

  return result;
}
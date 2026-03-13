/**
 * Shared type definitions for the Panchang data engine.
 * Vikram Samvat 2083 — Purnimanta Calendar System
 */

/** A single day entry in the Panchang */
export interface PanchangDay {
  date: string;
  tithi: string;
  nakshatra: string;
  paksha: string;
  hinduMonth: string;
  vikramSamvat: string;
  dayNumber: number;
  festival?: string;
  isHoliday?: boolean;
}

/** A festival entry in the month summary */
export interface FestivalEntry {
  name: string;
  tithi: string;
}

/** Ayurvedic advice entry */
export interface AyurvedicAdvice {
  category: string;
  advice: string;
}

/** Summary for a Hindu month */
export interface MonthSummary {
  festivals: FestivalEntry[];
  ayurvedicAdvice: AyurvedicAdvice[];
}

/** Complete data for a Hindu month */
export interface MonthData {
  days: PanchangDay[];
  summary: MonthSummary;
}

/** Month configuration from months.json */
export interface MonthConfig {
  name: string;
  start: string;
  end: string;
}

/** Root structure of months.json */
export interface MonthsConfig {
  vikramSamvat: number;
  months: MonthConfig[];
}

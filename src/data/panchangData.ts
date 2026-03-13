/**
 * Panchang Data Provider for Vikram Samvat 2083
 * 
 * This module uses the modular generator to produce Panchang data
 * from months.json, tithiMap.ts, festivals.ts, and nakshatraMap.ts.
 * 
 * Previously this file contained 642 lines of hardcoded data.
 * Now it generates data dynamically from the modular engine.
 */

import type { PanchangDay, MonthSummary, MonthData } from './types';
import { generateMonthData, generateAllMonthData } from './generator';

// Re-export types for backward compatibility
export type { PanchangDay, MonthSummary, MonthData };

// Cache the generated data so we don't regenerate on every call
let _cachedData: Record<string, MonthData> | null = null;

function getAllData(): Record<string, MonthData> {
  if (!_cachedData) {
    _cachedData = generateAllMonthData();
  }
  return _cachedData;
}

/**
 * Get Panchang data for a specific Hindu month.
 * Backward-compatible API matching the original panchangData.ts export.
 * 
 * @param hinduMonthName - Hindi name of the month (e.g., "चैत्र")
 * @param vikramSamvat - Vikram Samvat year as string (e.g., "2083")
 * @returns Object with days array and month summary
 */
export function getLocalPanchangForHinduMonth(
  hinduMonthName: string,
  vikramSamvat: string
): { days: PanchangDay[]; summary: MonthSummary } {
  const key = `${hinduMonthName}-${vikramSamvat}`;
  const allData = getAllData();
  const data = allData[key];
  
  if (data) {
    return data;
  }
  
  return { days: [], summary: { festivals: [], ayurvedicAdvice: [] } };
}

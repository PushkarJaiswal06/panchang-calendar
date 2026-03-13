/**
 * Panchang Service - Public API for Panchang data access
 * 
 * Thin wrapper around the data layer.
 * Re-exports types for external consumption.
 */

import { getLocalPanchangForHinduMonth } from '../data/panchangData';
import type { PanchangDay, MonthSummary } from '../data/types';

// Re-export types for backward compatibility with existing consumers
export type { PanchangDay, MonthSummary };

// Also re-export for legacy code that imports PanchangData
export type PanchangData = PanchangDay;

export function getPanchangForHinduMonth(
  hinduMonthName: string,
  vikramSamvat: string
): { days: PanchangDay[]; summary: MonthSummary } {
  return getLocalPanchangForHinduMonth(hinduMonthName, vikramSamvat);
}

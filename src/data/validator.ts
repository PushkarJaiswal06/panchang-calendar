/**
 * Validation utilities for Panchang data.
 * 
 * Detects invalid tithi sequences, verifies month lengths,
 * and confirms paksha transitions.
 */

import { TITHI_SEQUENCE } from "./tithiMap";
import type { PanchangDay } from "./types";

export interface ValidationIssue {
  type: "error" | "warning";
  message: string;
  dayNumber?: number;
  date?: string;
  month?: string;
}

export interface ValidationReport {
  valid: boolean;
  totalDays: number;
  issues: ValidationIssue[];
}

/**
 * Validate that tithis follow the canonical 30-tithi sequence within a month.
 */
export function validateTithiSequence(days: PanchangDay[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (let i = 0; i < days.length; i++) {
    const expectedTithi = TITHI_SEQUENCE[i % 30];
    if (days[i].tithi !== expectedTithi) {
      issues.push({
        type: "error",
        message: `Day ${days[i].dayNumber} (${days[i].date}): Expected tithi "${expectedTithi}", got "${days[i].tithi}"`,
        dayNumber: days[i].dayNumber,
        date: days[i].date,
        month: days[i].hinduMonth,
      });
    }
  }

  return issues;
}

/**
 * Validate that dayNumbers are sequential starting from 1.
 */
export function validateDayNumbers(days: PanchangDay[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (let i = 0; i < days.length; i++) {
    const expected = i + 1;
    if (days[i].dayNumber !== expected) {
      issues.push({
        type: "error",
        message: `Day ${days[i].date}: Expected dayNumber ${expected}, got ${days[i].dayNumber}`,
        dayNumber: days[i].dayNumber,
        date: days[i].date,
        month: days[i].hinduMonth,
      });
    }
  }

  return issues;
}

/**
 * Validate paksha transitions:
 * - Krishna Paksha tithis should have paksha "कृष्ण"
 * - Shukla Paksha tithis should have paksha "शुक्ल"
 * - Amavasya should be "कृष्ण", Purnima should be "शुक्ल"
 */
export function validatePakshaTransitions(days: PanchangDay[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const day of days) {
    const tithi = day.tithi;
    const expectedPaksha =
      tithi.includes("कृष्ण") || tithi === "अमावस्या" ? "कृष्ण" : "शुक्ल";

    if (day.paksha !== expectedPaksha) {
      issues.push({
        type: "error",
        message: `Day ${day.dayNumber} (${day.date}): Tithi "${tithi}" should have paksha "${expectedPaksha}", got "${day.paksha}"`,
        dayNumber: day.dayNumber,
        date: day.date,
        month: day.hinduMonth,
      });
    }
  }

  return issues;
}

/**
 * Validate month length is within reasonable bounds (28-31 days).
 */
export function validateMonthLength(days: PanchangDay[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (days.length < 28) {
    issues.push({
      type: "warning",
      message: `Month has only ${days.length} days (expected 28-31)`,
      month: days[0]?.hinduMonth,
    });
  }

  if (days.length > 31) {
    issues.push({
      type: "error",
      message: `Month has ${days.length} days (exceeds maximum 31)`,
      month: days[0]?.hinduMonth,
    });
  }

  return issues;
}

/**
 * Check that every day has a nakshatra assigned.
 */
export function validateNakshatras(days: PanchangDay[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  for (const day of days) {
    if (!day.nakshatra || day.nakshatra === "") {
      issues.push({
        type: "warning",
        message: `Day ${day.dayNumber} (${day.date}): Missing nakshatra`,
        dayNumber: day.dayNumber,
        date: day.date,
        month: day.hinduMonth,
      });
    }
  }

  return issues;
}

/**
 * Run all validations on a set of month days.
 */
export function validateMonth(days: PanchangDay[]): ValidationReport {
  if (days.length === 0) {
    return {
      valid: false,
      totalDays: 0,
      issues: [{ type: "error", message: "No days in month" }],
    };
  }

  const issues: ValidationIssue[] = [
    ...validateTithiSequence(days),
    ...validateDayNumbers(days),
    ...validatePakshaTransitions(days),
    ...validateMonthLength(days),
    ...validateNakshatras(days),
  ];

  return {
    valid: issues.filter((i) => i.type === "error").length === 0,
    totalDays: days.length,
    issues,
  };
}

/**
 * Run all validations on the full Panchang dataset (all months).
 */
export function validateFullPanchang(
  monthsData: Record<string, { days: PanchangDay[] }>
): ValidationReport {
  const allIssues: ValidationIssue[] = [];
  let totalDays = 0;

  for (const [key, data] of Object.entries(monthsData)) {
    const monthReport = validateMonth(data.days);
    totalDays += monthReport.totalDays;
    
    // Prefix issues with month key
    for (const issue of monthReport.issues) {
      allIssues.push({
        ...issue,
        message: `[${key}] ${issue.message}`,
      });
    }
  }

  return {
    valid: allIssues.filter((i) => i.type === "error").length === 0,
    totalDays,
    issues: allIssues,
  };
}

/**
 * Export script for generating panchang2083.json
 * 
 * Run with: npx tsx src/data/exportPanchang.ts
 * 
 * Generates the complete Panchang dataset, validates it,
 * and writes panchang2083.json for frontend consumption.
 */

import { generateAllMonthData, generatePanchang } from "./generator";
import { validateFullPanchang } from "./validator";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function main() {
  console.log("═══════════════════════════════════════════════════");
  console.log("  पंचांग जनरेटर — विक्रम संवत् २०८३");
  console.log("  Panchang Generator — Vikram Samvat 2083");
  console.log("═══════════════════════════════════════════════════\n");

  // Generate all month data
  console.log("📅 Generating Panchang data...");
  const allMonthData = generateAllMonthData();
  const flatDays = generatePanchang();

  console.log(`   ✅ Generated ${flatDays.length} total days across ${Object.keys(allMonthData).length} months\n`);

  // Print per-month summary
  console.log("📊 Month Summary:");
  console.log("─────────────────────────────────────────────");
  for (const [key, data] of Object.entries(allMonthData)) {
    const festivalCount = data.days.filter(d => d.festival).length;
    console.log(`   ${key}: ${data.days.length} days, ${festivalCount} festival days`);
  }
  console.log();

  // Run validation
  console.log("🔍 Running validation...");
  const report = validateFullPanchang(allMonthData);

  if (report.issues.length === 0) {
    console.log("   ✅ All validations passed!\n");
  } else {
    const errors = report.issues.filter(i => i.type === "error");
    const warnings = report.issues.filter(i => i.type === "warning");

    if (errors.length > 0) {
      console.log(`   ❌ ${errors.length} error(s) found:`);
      errors.forEach(e => console.log(`      ERROR: ${e.message}`));
    }

    if (warnings.length > 0) {
      console.log(`   ⚠️  ${warnings.length} warning(s):`);
      warnings.slice(0, 10).forEach(w => console.log(`      WARN: ${w.message}`));
      if (warnings.length > 10) {
        console.log(`      ... and ${warnings.length - 10} more warnings`);
      }
    }
    console.log();
  }

  // Write JSON output
  const outputPath = path.resolve(__dirname, "panchang2083.json");
  
  const outputData = {
    vikramSamvat: 2083,
    calendarType: "पूर्णिमांत",
    generatedAt: new Date().toISOString(),
    totalDays: flatDays.length,
    months: allMonthData,
  };

  fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), "utf-8");
  console.log(`💾 Written to: ${outputPath}`);
  console.log(`   File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB\n`);

  // Print sample entry
  if (flatDays.length > 0) {
    console.log("📋 Sample entry (first day):");
    console.log(JSON.stringify(flatDays[0], null, 2));
  }

  console.log("\n═══════════════════════════════════════════════════");
  console.log(report.valid ? "  ✅ GENERATION COMPLETE — ALL VALID" : "  ⚠️  GENERATION COMPLETE — WITH ISSUES");
  console.log("═══════════════════════════════════════════════════");
}

main();

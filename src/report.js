import { stringifyCsv } from "./csv.js";

export function generateMarkdownReport(screening, options = {}) {
  const title = options.title ?? "Narascreen vendor risk report";
  const lines = [
    `# ${title}`,
    "",
    `Generated: ${screening.generatedAt}`,
    "",
    "This report is a preliminary screening aid. It does not replace credit rating, legal review, accounting review, or the procuring agency's official evaluation.",
    "",
    "## Summary",
    "",
    `- Total vendors: ${screening.summary.total}`,
    `- Red: ${screening.summary.red}`,
    `- Yellow: ${screening.summary.yellow}`,
    `- Green: ${screening.summary.green}`,
    "",
    "## Vendor table",
    "",
    "| Level | Score | Vendor | Business number | Main issues |",
    "| --- | ---: | --- | --- | --- |"
  ];

  for (const result of screening.results) {
    lines.push(
      `| ${result.level.toUpperCase()} | ${result.riskScore} | ${escapeTable(result.vendor.companyName)} | ${escapeTable(result.vendor.formattedBusinessNumber)} | ${escapeTable(mainIssues(result))} |`
    );
  }

  lines.push("", "## Details", "");

  for (const result of screening.results) {
    lines.push(
      `### ${result.vendor.companyName}`,
      "",
      `- Level: ${result.level.toUpperCase()}`,
      `- Risk score: ${result.riskScore}`,
      `- Business number: ${result.vendor.formattedBusinessNumber}`,
      `- DART corp code: ${result.vendor.dartCorpCode ?? "not provided"}`,
      "",
      "Issues:"
    );

    if (result.issues.length === 0) {
      lines.push("- None");
    } else {
      for (const issue of result.issues) {
        lines.push(`- [${issue.severity}] ${issue.code}: ${issue.message}`);
      }
    }

    lines.push("", "Metrics:");
    const metricEntries = Object.entries(result.metrics);
    if (metricEntries.length === 0) {
      lines.push("- None");
    } else {
      for (const [key, value] of metricEntries) {
        lines.push(`- ${key}: ${formatMetric(value)}`);
      }
    }

    lines.push("", "Checklist:");
    if (result.checklist.length === 0) {
      lines.push("- No additional checklist items generated.");
    } else {
      for (const item of result.checklist) {
        lines.push(`- ${item}`);
      }
    }
    lines.push("");
  }

  return `${lines.join("\n")}\n`;
}

export function generateJsonReport(screening) {
  return `${JSON.stringify(screening, null, 2)}\n`;
}

export function generateCsvReport(screening) {
  return stringifyCsv(
    screening.results.map((result) => ({
      level: result.level,
      risk_score: result.riskScore,
      company_name: result.vendor.companyName,
      business_number: result.vendor.formattedBusinessNumber,
      dart_corp_code: result.vendor.dartCorpCode ?? "",
      issue_count: result.issues.length,
      issues: result.issues.map((issue) => `${issue.severity}:${issue.code}`).join("; "),
      checklist: result.checklist.join("; ")
    }))
  );
}

function mainIssues(result) {
  if (result.issues.length === 0) {
    return "none";
  }
  return result.issues
    .slice(0, 3)
    .map((issue) => `${issue.severity}:${issue.code}`)
    .join(", ");
}

function escapeTable(value) {
  return String(value ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

function formatMetric(value) {
  if (value === null || value === undefined) {
    return "not available";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}

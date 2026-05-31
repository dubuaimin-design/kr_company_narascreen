import { readFile, writeFile } from "node:fs/promises";
import { parseCsvToRecords } from "./csv.js";
import { normalizeVendor } from "./normalize.js";
import { NtsBusinessClient, makeNtsResultMap } from "./nts.js";
import {
  generateCsvReport,
  generateJsonReport,
  generateMarkdownReport
} from "./report.js";
import { SAMPLE_CSV } from "./sample.js";
import { screenVendors } from "./screen.js";
import { formatBusinessNumber, validateKoreanBusinessNumber } from "./validators.js";

const VERSION = "0.1.0";

export async function runCli(argv, io = defaultIo()) {
  const parsed = parseArgs(argv);

  if (parsed.command === "help") {
    io.stdout(helpText());
    return;
  }

  if (parsed.command === "version") {
    io.stdout(`${VERSION}\n`);
    return;
  }

  if (parsed.command === "sample") {
    io.stdout(SAMPLE_CSV);
    return;
  }

  if (parsed.command === "checksum") {
    runChecksum(parsed.values, io);
    return;
  }

  await runScreen(parsed, io);
}

function parseArgs(argv) {
  const args = [...argv];
  const parsed = {
    command: "screen",
    input: "",
    out: "",
    format: "",
    nts: false,
    serviceKey: "",
    failOnRed: false,
    values: []
  };

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    parsed.command = "help";
    return parsed;
  }

  const knownCommands = new Set(["screen", "sample", "checksum", "help", "version"]);
  if (knownCommands.has(args[0])) {
    parsed.command = args.shift();
  }

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--out" || arg === "-o") {
      parsed.out = requireValue(args, index, arg);
      index += 1;
    } else if (arg === "--format" || arg === "-f") {
      parsed.format = requireValue(args, index, arg);
      index += 1;
    } else if (arg === "--nts") {
      parsed.nts = true;
    } else if (arg === "--service-key") {
      parsed.serviceKey = requireValue(args, index, arg);
      index += 1;
    } else if (arg === "--service-key-env") {
      parsed.serviceKey = process.env[requireValue(args, index, arg)] ?? "";
      index += 1;
    } else if (arg === "--fail-on-red") {
      parsed.failOnRed = true;
    } else if (arg === "--version" || arg === "-v") {
      parsed.command = "version";
    } else if (arg.startsWith("-")) {
      throw new Error(`Unknown option: ${arg}`);
    } else if (parsed.command === "checksum") {
      parsed.values.push(arg);
    } else if (!parsed.input) {
      parsed.input = arg;
    } else {
      throw new Error(`Unexpected argument: ${arg}`);
    }
  }

  return parsed;
}

async function runScreen(parsed, io) {
  if (!parsed.input) {
    throw new Error("Input CSV is required. Try: narascreen screen vendors.csv --out report.md");
  }

  const text = await readFile(parsed.input, "utf8");
  const records = parseCsvToRecords(text);
  const vendors = records.map(normalizeVendor);
  let ntsResultsByBusinessNumber = new Map();

  if (parsed.nts) {
    const client = new NtsBusinessClient({ serviceKey: parsed.serviceKey });
    const ntsResults = await client.getStatus(vendors.map((vendor) => vendor.businessNumber));
    ntsResultsByBusinessNumber = makeNtsResultMap(ntsResults);
  }

  const screening = screenVendors(vendors, { ntsResultsByBusinessNumber });
  const format = normalizeFormat(parsed.format || inferFormat(parsed.out));
  const output = render(screening, format);

  if (parsed.out) {
    await writeFile(parsed.out, output, "utf8");
  } else {
    io.stdout(output);
  }

  if (parsed.failOnRed && screening.summary.red > 0) {
    process.exitCode = 2;
  }
}

function runChecksum(values, io) {
  if (values.length === 0) {
    throw new Error("At least one business number is required.");
  }

  for (const value of values) {
    const result = validateKoreanBusinessNumber(value);
    io.stdout(
      `${formatBusinessNumber(value)} ${result.valid ? "valid" : "invalid"}${result.reason ? ` - ${result.reason}` : ""}\n`
    );
  }
}

function render(screening, format) {
  if (format === "json") {
    return generateJsonReport(screening);
  }
  if (format === "csv") {
    return generateCsvReport(screening);
  }
  return generateMarkdownReport(screening);
}

function inferFormat(outPath) {
  if (!outPath) {
    return "md";
  }
  const lower = outPath.toLowerCase();
  if (lower.endsWith(".json")) {
    return "json";
  }
  if (lower.endsWith(".csv")) {
    return "csv";
  }
  return "md";
}

function normalizeFormat(format) {
  const normalized = String(format ?? "md").toLowerCase();
  if (!["md", "markdown", "json", "csv"].includes(normalized)) {
    throw new Error(`Unsupported format: ${format}`);
  }
  return normalized === "markdown" ? "md" : normalized;
}

function requireValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith("-")) {
    throw new Error(`${option} requires a value.`);
  }
  return value;
}

function defaultIo() {
  return {
    stdout: (text) => process.stdout.write(text)
  };
}

function helpText() {
  return `narascreen ${VERSION}

Preliminary risk screening for Korean public procurement service vendors.

Usage:
  narascreen sample
  narascreen checksum 123-45-67891
  narascreen screen vendors.csv --out report.md
  narascreen screen vendors.csv --format json
  narascreen screen vendors.csv --nts --service-key <data.go.kr-key>

Options:
  -o, --out <file>          Write report to a file
  -f, --format <md|json|csv> Report format
  --nts                    Call NTS business status API
  --service-key <key>      data.go.kr NTS service key
  --service-key-env <name> Read service key from an environment variable
  --fail-on-red            Exit with code 2 if any red vendor exists
  -h, --help               Show help
  -v, --version            Show version
`;
}

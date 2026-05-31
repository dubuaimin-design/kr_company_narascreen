export function parseCsv(text) {
  const input = String(text ?? "").replace(/^\uFEFF/, "");
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];

    if (inQuotes) {
      if (char === '"' && input[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && input[index + 1] === "\n") {
        index += 1;
      }
      row.push(field);
      if (!isBlankRow(row)) {
        rows.push(row);
      }
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (!isBlankRow(row)) {
      rows.push(row);
    }
  }

  if (inQuotes) {
    throw new Error("CSV has an unclosed quoted field.");
  }

  return rows;
}

export function parseCsvToRecords(text) {
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1).map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
}

export function stringifyCsv(records, columns = null) {
  const rows = Array.isArray(records) ? records : [];
  const headers = columns ?? collectColumns(rows);
  const lines = [headers.map(escapeCsvField).join(",")];

  for (const record of rows) {
    lines.push(headers.map((header) => escapeCsvField(record[header] ?? "")).join(","));
  }

  return `${lines.join("\n")}\n`;
}

function collectColumns(records) {
  const columns = [];
  const seen = new Set();

  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }

  return columns;
}

function escapeCsvField(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }
  return text;
}

function isBlankRow(row) {
  return row.every((field) => String(field).trim() === "");
}

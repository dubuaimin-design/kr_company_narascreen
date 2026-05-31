import assert from "node:assert/strict";
import { test } from "node:test";
import { parseCsvToRecords, stringifyCsv } from "../src/csv.js";

test("parses quoted CSV fields", () => {
  const records = parseCsvToRecords('name,memo\n"ACME, Inc.","line ""one"""\n');
  assert.deepEqual(records, [{ name: "ACME, Inc.", memo: 'line "one"' }]);
});

test("stringifies CSV fields", () => {
  const text = stringifyCsv([{ name: "ACME, Inc.", memo: 'line "one"' }]);
  assert.equal(text, 'name,memo\n"ACME, Inc.","line ""one"""\n');
});

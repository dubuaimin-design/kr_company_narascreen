import assert from "node:assert/strict";
import { test } from "node:test";
import {
  formatBusinessNumber,
  validateKoreanBusinessNumber
} from "../src/validators.js";

test("validates Korean business registration number checksum", () => {
  assert.equal(validateKoreanBusinessNumber("123-45-67891").valid, true);
  assert.equal(validateKoreanBusinessNumber("123-45-67890").valid, false);
});

test("formats a business registration number", () => {
  assert.equal(formatBusinessNumber("1234567891"), "123-45-67891");
});

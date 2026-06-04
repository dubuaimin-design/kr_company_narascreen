import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeVendor } from "../src/normalize.js";
import { screenVendors } from "../src/screen.js";

test("screens a strong vendor as green when no issues are present", () => {
  const vendor = normalizeVendor({
    사업자번호: "123-45-67891",
    업체명: "테스트용역 주식회사",
    신용등급: "BBB0",
    유동자산: "120000000",
    유동부채: "80000000",
    총부채: "180000000",
    자본총계: "100000000",
    공공계약수: "4",
    최근계약일: "2025-12-10",
    단일발주처의존도: "45"
  });

  const screening = screenVendors([vendor], {
    generatedAt: "2026-01-01T00:00:00.000Z"
  });

  assert.equal(screening.summary.green, 1);
  assert.equal(screening.results[0].level, "green");
});

test("flags weak financials and dependency as red", () => {
  const vendor = normalizeVendor({
    사업자번호: "111-22-33332",
    업체명: "시범시스템",
    신용등급: "B+",
    유동자산: "40000000",
    유동부채: "90000000",
    총부채: "250000000",
    자본총계: "50000000",
    공공계약수: "0",
    최근계약일: "2022-03-01",
    단일발주처의존도: "85"
  });

  const screening = screenVendors([vendor], {
    generatedAt: "2026-01-01T00:00:00.000Z"
  });

  assert.equal(screening.summary.red, 1);
  assert.equal(screening.results[0].level, "red");
  assert.ok(screening.results[0].issues.some((issue) => issue.code === "HIGH_DEBT_RATIO"));
  assert.ok(screening.results[0].issues.every((issue) => issue.explanation));
  assert.ok(screening.results[0].issues.every((issue) => issue.nextAction));
});

test("supports stricter IT service profile", () => {
  const vendor = normalizeVendor({
    사업자번호: "222-33-44440",
    업체명: "검토필요 데이터랩",
    신용등급: "BBB0",
    유동자산: "105000000",
    유동부채: "100000000",
    총부채: "170000000",
    자본총계: "100000000",
    공공계약수: "3",
    최근계약일: "2024-07-01",
    단일발주처의존도: "58"
  });

  const defaultScreening = screenVendors([vendor], {
    generatedAt: "2026-01-01T00:00:00.000Z"
  });
  const itScreening = screenVendors([vendor], {
    generatedAt: "2026-01-01T00:00:00.000Z",
    profile: "it-service"
  });

  assert.equal(defaultScreening.results[0].issues.length, 0);
  assert.equal(itScreening.results[0].level, "yellow");
  assert.equal(itScreening.profile.id, "it-service");
});

test("keeps accumulated medium issues in yellow band below red threshold", () => {
  const vendor = normalizeVendor({
    사업자번호: "222-33-44440",
    업체명: "검토필요 데이터랩",
    신용등급: "BB+",
    유동자산: "90000000",
    유동부채: "100000000",
    총부채: "190000000",
    자본총계: "90000000",
    공공계약수: "2",
    최근계약일: "2024-05-01",
    단일발주처의존도: "62"
  });

  const screening = screenVendors([vendor], {
    generatedAt: "2026-06-05T00:00:00.000Z"
  });

  assert.equal(screening.results[0].riskScore, 75);
  assert.equal(screening.results[0].level, "yellow");
});

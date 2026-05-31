import { scoreCreditRating } from "./rating.js";
import { formatBusinessNumber, validateKoreanBusinessNumber } from "./validators.js";

export function screenVendors(vendors, options = {}) {
  const ntsResultsByBusinessNumber = options.ntsResultsByBusinessNumber ?? new Map();
  const generatedAt = options.generatedAt ? new Date(options.generatedAt) : new Date();

  const results = vendors.map((vendor) =>
    screenVendor(vendor, {
      generatedAt,
      ntsResult: ntsResultsByBusinessNumber.get(vendor.businessNumber)
    })
  );

  return {
    generatedAt: generatedAt.toISOString(),
    summary: summarizeScreening(results),
    results
  };
}

export function screenVendor(vendor, options = {}) {
  const generatedAt = options.generatedAt ? new Date(options.generatedAt) : new Date();
  const issues = [];
  const checklist = [];
  const metrics = {};

  const businessValidation = validateKoreanBusinessNumber(vendor.businessNumber);
  if (!businessValidation.valid) {
    addIssue(issues, "high", "BUSINESS_NUMBER_INVALID", businessValidation.reason);
  }

  const ntsResult = options.ntsResult ?? null;
  if (ntsResult) {
    applyNtsStatus(issues, metrics, ntsResult);
  } else {
    checklist.push("국세청 사업자등록 상태조회 API 키로 정상/휴업/폐업 상태 확인");
  }

  applyCreditRating(issues, checklist, metrics, vendor.creditRating);
  applyLiquidity(issues, checklist, metrics, vendor);
  applyDebtRatio(issues, checklist, metrics, vendor);
  applyProcurementTrackRecord(issues, checklist, metrics, vendor, generatedAt);
  applyBuyerDependency(issues, checklist, metrics, vendor.singleBuyerDependencyPct);

  if (!vendor.dartCorpCode) {
    checklist.push("DART 고유번호가 있는 법인은 공시 기반 재무비율 보강");
  }

  const riskScore = calculateRiskScore(issues);
  const level = decideLevel(issues, riskScore);

  return {
    vendor: {
      companyName: vendor.companyName,
      businessNumber: vendor.businessNumber,
      formattedBusinessNumber: formatBusinessNumber(vendor.businessNumber),
      dartCorpCode: vendor.dartCorpCode || null
    },
    level,
    riskScore,
    issues,
    metrics,
    checklist,
    raw: vendor.raw
  };
}

export function summarizeScreening(results) {
  const summary = {
    total: results.length,
    red: 0,
    yellow: 0,
    green: 0
  };

  for (const result of results) {
    summary[result.level] += 1;
  }

  return summary;
}

function applyNtsStatus(issues, metrics, ntsResult) {
  metrics.ntsStatus = {
    businessStatus: ntsResult.b_stt || "",
    businessStatusCode: ntsResult.b_stt_cd || "",
    taxType: ntsResult.tax_type || "",
    taxTypeCode: ntsResult.tax_type_cd || "",
    endDate: ntsResult.end_dt || ""
  };

  if (ntsResult.b_stt_cd === "03" || /폐업/.test(ntsResult.b_stt ?? "")) {
    addIssue(issues, "high", "NTS_CLOSED", "국세청 상태조회 결과 폐업 사업자로 표시됩니다.");
  } else if (ntsResult.b_stt_cd === "02" || /휴업/.test(ntsResult.b_stt ?? "")) {
    addIssue(issues, "high", "NTS_SUSPENDED", "국세청 상태조회 결과 휴업 사업자로 표시됩니다.");
  } else if (ntsResult.b_stt_cd && ntsResult.b_stt_cd !== "01") {
    addIssue(issues, "medium", "NTS_UNKNOWN_STATUS", "국세청 상태조회 코드가 계속사업자 코드가 아닙니다.");
  }
}

function applyCreditRating(issues, checklist, metrics, creditRating) {
  const rating = scoreCreditRating(creditRating);
  metrics.creditRating = rating;

  if (rating.severity === "high" || rating.severity === "medium") {
    addIssue(issues, rating.severity, "CREDIT_RATING", rating.message);
  }

  if (!rating.rating) {
    checklist.push("입찰공고 기준에 맞는 신용평가등급확인서 수령 및 유효기간 확인");
  }
}

function applyLiquidity(issues, checklist, metrics, vendor) {
  if (vendor.currentAssets === null || vendor.currentLiabilities === null) {
    checklist.push("유동자산/유동부채 입력 후 단기 지급능력 확인");
    return;
  }

  if (vendor.currentLiabilities <= 0) {
    metrics.currentRatio = null;
    addIssue(issues, "medium", "LIQUIDITY_INPUT", "유동부채 값이 0 이하라 유동비율을 계산할 수 없습니다.");
    return;
  }

  const ratio = (vendor.currentAssets / vendor.currentLiabilities) * 100;
  metrics.currentRatio = round(ratio);

  if (ratio < 70) {
    addIssue(issues, "high", "LOW_CURRENT_RATIO", `유동비율이 ${round(ratio)}%로 낮습니다.`);
  } else if (ratio < 100) {
    addIssue(issues, "medium", "WATCH_CURRENT_RATIO", `유동비율이 ${round(ratio)}%로 100% 미만입니다.`);
  }
}

function applyDebtRatio(issues, checklist, metrics, vendor) {
  if (vendor.totalLiabilities === null || vendor.totalEquity === null) {
    checklist.push("부채총계/자본총계 입력 후 부채비율 확인");
    return;
  }

  if (vendor.totalEquity <= 0) {
    metrics.debtRatio = null;
    addIssue(issues, "high", "NEGATIVE_EQUITY", "자본총계가 0 이하라 부채비율 리스크가 큽니다.");
    return;
  }

  const ratio = (vendor.totalLiabilities / vendor.totalEquity) * 100;
  metrics.debtRatio = round(ratio);

  if (ratio > 400) {
    addIssue(issues, "high", "HIGH_DEBT_RATIO", `부채비율이 ${round(ratio)}%로 매우 높습니다.`);
  } else if (ratio > 200) {
    addIssue(issues, "medium", "WATCH_DEBT_RATIO", `부채비율이 ${round(ratio)}%로 높습니다.`);
  }
}

function applyProcurementTrackRecord(issues, checklist, metrics, vendor, generatedAt) {
  if (vendor.publicContractCount === null) {
    checklist.push("나라장터 계약/낙찰 이력 입력 또는 API 연동으로 수행실적 확인");
  } else {
    metrics.publicContractCount = vendor.publicContractCount;
    if (vendor.publicContractCount === 0) {
      addIssue(issues, "medium", "NO_PUBLIC_CONTRACTS", "입력된 공공계약 이력이 없습니다.");
    }
  }

  if (!vendor.recentContractDate) {
    checklist.push("최근 공공계약일 확인");
    return;
  }

  const recentDate = new Date(vendor.recentContractDate);
  if (Number.isNaN(recentDate.getTime())) {
    addIssue(issues, "medium", "RECENT_CONTRACT_DATE_INVALID", "최근계약일을 날짜로 해석할 수 없습니다.");
    return;
  }

  const daysAgo = Math.floor((generatedAt.getTime() - recentDate.getTime()) / 86_400_000);
  metrics.recentContractDaysAgo = daysAgo;

  if (daysAgo > 730) {
    addIssue(issues, "medium", "OLD_PUBLIC_CONTRACT", "최근 공공계약일이 2년보다 오래되었습니다.");
  }
}

function applyBuyerDependency(issues, checklist, metrics, dependencyPct) {
  if (dependencyPct === null) {
    checklist.push("특정 발주처 매출 의존도 확인");
    return;
  }

  metrics.singleBuyerDependencyPct = round(dependencyPct);

  if (dependencyPct >= 80) {
    addIssue(issues, "high", "HIGH_BUYER_DEPENDENCY", `단일 발주처 의존도가 ${round(dependencyPct)}%입니다.`);
  } else if (dependencyPct >= 60) {
    addIssue(issues, "medium", "WATCH_BUYER_DEPENDENCY", `단일 발주처 의존도가 ${round(dependencyPct)}%입니다.`);
  }
}

function addIssue(issues, severity, code, message) {
  issues.push({ severity, code, message });
}

function calculateRiskScore(issues) {
  const weights = {
    high: 35,
    medium: 15,
    low: 5,
    info: 0
  };

  return Math.min(
    100,
    issues.reduce((score, issue) => score + (weights[issue.severity] ?? 0), 0)
  );
}

function decideLevel(issues, riskScore) {
  if (issues.some((issue) => issue.severity === "high") || riskScore >= 60) {
    return "red";
  }
  if (issues.some((issue) => issue.severity === "medium") || riskScore >= 20) {
    return "yellow";
  }
  return "green";
}

function round(value) {
  return Math.round(value * 10) / 10;
}

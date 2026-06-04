# Narascreen vendor risk report

Generated: 2026-06-04T20:51:26.866Z
Profile: Public service vendor

This report is a preliminary screening aid. It does not replace credit rating, legal review, accounting review, or the procuring agency's official evaluation.

## Summary

- Total vendors: 3
- Red: 1
- Yellow: 1
- Green: 1

## Vendor table

| Level | Score | Vendor | Business number | Main issues | Next action |
| --- | ---: | --- | --- | --- | --- |
| GREEN | 0 | 테스트용역 주식회사 | 123-45-67891 | none | none |
| YELLOW | 75 | 검토필요 데이터랩 | 222-33-44440 | medium:CREDIT_RATING, medium:WATCH_CURRENT_RATIO, medium:WATCH_DEBT_RATIO | Request a current credit rating certificate and verify its validity period and issuer. |
| RED | 100 | 시범시스템 | 111-22-33332 | medium:CREDIT_RATING, high:LOW_CURRENT_RATIO, high:HIGH_DEBT_RATIO | Request a current credit rating certificate and verify its validity period and issuer. |

## Details

### 테스트용역 주식회사

- Level: GREEN
- Risk score: 0
- Business number: 123-45-67891
- DART corp code: not provided

Issues:
- None

Metrics:
- creditRating: {"rating":"BBB0","band":"acceptable","points":9,"severity":"info","message":"Credit rating is in the acceptable band."}
- currentRatio: 150
- debtRatio: 180
- publicContractCount: 4
- recentContractDaysAgo: 176
- singleBuyerDependencyPct: 45

Checklist:
- 국세청 사업자등록 상태조회 API 키로 정상/휴업/폐업 상태 확인
- DART 고유번호가 있는 법인은 공시 기반 재무비율 보강

### 검토필요 데이터랩

- Level: YELLOW
- Risk score: 75
- Business number: 222-33-44440
- DART corp code: not provided

Issues:
- [medium] CREDIT_RATING: Credit rating is below the common investment-grade band.
  - Why it matters: Credit rating certificates are commonly used in Korean procurement screening and partner review.
  - Next action: Request a current credit rating certificate and verify its validity period and issuer.
- [medium] WATCH_CURRENT_RATIO: 유동비율이 90%로 프로파일 기준보다 낮습니다.
  - Why it matters: A current ratio below the profile threshold deserves follow-up in service delivery reviews.
  - Next action: Confirm whether the vendor has enough working capital for the expected project duration.
- [medium] WATCH_DEBT_RATIO: 부채비율이 211.1%로 높습니다.
  - Why it matters: Elevated leverage should be understood before assigning critical service work.
  - Next action: Compare against industry norms and request explanations for recent debt increases.
- [medium] OLD_PUBLIC_CONTRACT: 최근 공공계약일이 730일보다 오래되었습니다.
  - Why it matters: Old public-sector history may not reflect the vendor's current delivery capability.
  - Next action: Ask for recent project references, staffing plan, and current public-sector experience.
- [medium] WATCH_BUYER_DEPENDENCY: 단일 발주처 의존도가 62%입니다.
  - Why it matters: Buyer concentration is not always bad, but it needs context before critical engagement.
  - Next action: Confirm the major buyer relationship, contract maturity, and capacity available for this project.

Metrics:
- creditRating: {"rating":"BB+","band":"watch","points":7,"severity":"medium","message":"Credit rating is below the common investment-grade band."}
- currentRatio: 90
- debtRatio: 211.1
- publicContractCount: 2
- recentContractDaysAgo: 764
- singleBuyerDependencyPct: 62

Checklist:
- 국세청 사업자등록 상태조회 API 키로 정상/휴업/폐업 상태 확인
- DART 고유번호가 있는 법인은 공시 기반 재무비율 보강

### 시범시스템

- Level: RED
- Risk score: 100
- Business number: 111-22-33332
- DART corp code: not provided

Issues:
- [medium] CREDIT_RATING: Credit rating is below the common investment-grade band.
  - Why it matters: Credit rating certificates are commonly used in Korean procurement screening and partner review.
  - Next action: Request a current credit rating certificate and verify its validity period and issuer.
- [high] LOW_CURRENT_RATIO: 유동비율이 44.4%로 낮습니다.
  - Why it matters: Low current ratio can indicate short-term payment or staffing continuity risk.
  - Next action: Ask for recent financial statements and review cash-flow support before relying on the vendor.
- [high] HIGH_DEBT_RATIO: 부채비율이 500%로 매우 높습니다.
  - Why it matters: Very high leverage can increase default, staffing, or service-continuity risk.
  - Next action: Review recent financials and consider risk mitigations such as milestone payments or guarantees.
- [medium] NO_PUBLIC_CONTRACTS: 입력된 공공계약 이력이 없습니다.
  - Why it matters: No recorded public contract history may mean the vendor has limited public-sector execution evidence.
  - Next action: Request comparable private-sector references or subcontracting performance records.
- [medium] OLD_PUBLIC_CONTRACT: 최근 공공계약일이 730일보다 오래되었습니다.
  - Why it matters: Old public-sector history may not reflect the vendor's current delivery capability.
  - Next action: Ask for recent project references, staffing plan, and current public-sector experience.
- [high] HIGH_BUYER_DEPENDENCY: 단일 발주처 의존도가 85%입니다.
  - Why it matters: High dependency on one buyer can create revenue shock or conflict-of-priority risk.
  - Next action: Check whether the vendor can allocate enough staff and whether revenue concentration affects continuity.

Metrics:
- creditRating: {"rating":"BB-","band":"watch","points":7,"severity":"medium","message":"Credit rating is below the common investment-grade band."}
- currentRatio: 44.4
- debtRatio: 500
- publicContractCount: 0
- recentContractDaysAgo: 1556
- singleBuyerDependencyPct: 85

Checklist:
- 국세청 사업자등록 상태조회 API 키로 정상/휴업/폐업 상태 확인
- DART 고유번호가 있는 법인은 공시 기반 재무비율 보강


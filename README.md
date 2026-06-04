# kr_company_narascreen

나라장터 용역 입찰·계약 전, 협력사와 수행사의 기본 리스크를 공개자료와 제출자료 기준으로 빠르게 점검하는 CLI/SDK입니다.

`kr_company_narascreen` is a lightweight CLI/SDK for preliminary risk screening of Korean public procurement service vendors. It helps teams review subcontractors, SI partners, and service providers before a bid, proposal, or contract workflow.

`narascreen`은 신용평가, 회계 실사, 법무 검토, 조달기관의 공식 심사를 대체하지 않습니다. 대신 실무자가 놓치기 쉬운 사전 확인 항목을 CSV 한 장으로 정리해줍니다.

`narascreen` does not replace credit ratings, accounting due diligence, legal review, or official procurement evaluation. It is a practical checklist and report generator for deciding what to inspect next.

## Why This Exists

한국 스타트업은 공공기관 프로젝트, SI/운영 용역, 데이터 구축, SaaS 납품 과정에서 협력사의 재무·계약 리스크를 빠르게 봐야 하는 순간이 많습니다. 그런데 실제 현장에서는 사업자번호, 신용평가등급확인서, 실적증명, 나라장터 이력, DART 공시, 내부 CSV가 흩어져 있습니다.

Korean startups and B2B teams often work with public-sector bids, SI projects, data-building contracts, SaaS delivery, and subcontracted service operations. Vendor evidence is usually scattered across business registration numbers, credit rating certificates, performance records, Nara Marketplace history, DART filings, and internal spreadsheets.

이 레포는 최종 판정을 내리는 도구가 아니라, **발주/제안/협력 전 반드시 확인할 질문을 자동으로 모으는 도구**를 목표로 합니다.

The goal is not to make a final award or rejection decision. The goal is to turn a messy vendor list into a structured pre-screening report.

## What It Checks

- 사업자등록번호 10자리 포맷과 체크섬
- 국세청 사업자등록 상태조회 API 연동 옵션
- 신용평가등급 누락/취약 구간
- 유동비율, 부채비율
- 공공계약 이력과 최근 계약일
- 특정 발주처 매출 의존도
- DART 공시 보강 필요 여부
- 제출자료 체크리스트

English summary:

- Korean business registration number format and checksum
- Optional National Tax Service business status lookup via data.go.kr
- Missing or weak credit rating bands
- Current ratio and debt ratio
- Public contract track record and most recent contract date
- Single-buyer revenue dependency
- Whether DART public filing enrichment is needed
- Follow-up evidence checklist

Each flag also includes:

- `explanation`: why the issue matters in a procurement/vendor-review context
- `nextAction`: what the reviewer should ask for or verify next

## Quick Start

Clone and run locally:

```bash
git clone https://github.com/dubuaimin-design/kr_company_narascreen.git
cd kr_company_narascreen
node ./bin/narascreen.js screen ./examples/vendors.sample.csv --out report.md
```

Generate sample input:

```bash
node ./bin/narascreen.js sample > vendors.csv
node ./bin/narascreen.js screen vendors.csv --out report.md
```

See [docs/sample-report.md](docs/sample-report.md) for an example Markdown report.

After npm publishing, the intended usage is:

```bash
npx kr-company-narascreen sample > vendors.csv
npx kr-company-narascreen screen vendors.csv --out report.md
```

국세청 사업자 상태조회 API 키가 있으면 다음처럼 붙입니다.

If you have a data.go.kr National Tax Service business status API key, enable live status lookup:

```bash
NTS_BUSINESS_SERVICE_KEY=... node ./bin/narascreen.js screen vendors.csv --nts --out report.md
```

Windows PowerShell:

```powershell
$env:NTS_BUSINESS_SERVICE_KEY="..."
node ./bin/narascreen.js screen vendors.csv --nts --out report.md
```

## CSV Columns

한국어/영어 컬럼명을 함께 지원합니다.

Both Korean and English column names are supported.

```csv
사업자번호,업체명,신용등급,유동자산,유동부채,총부채,자본총계,공공계약수,최근계약일,단일발주처의존도,dart_corp_code,메모
123-45-67891,테스트용역 주식회사,BBB0,120000000,80000000,180000000,100000000,4,2025-12-10,45,,format-valid sample only
```

English column names:

```csv
business_number,company_name,credit_rating,current_assets,current_liabilities,total_liabilities,total_equity,public_contract_count,recent_contract_date,single_buyer_dependency_pct,dart_corp_code,memo
```

## Commands

```bash
narascreen sample
narascreen profiles
narascreen checksum 123-45-67891
narascreen screen vendors.csv --out report.md
narascreen screen vendors.csv --format json
narascreen screen vendors.csv --format csv
narascreen screen vendors.csv --profile it-service
narascreen screen vendors.csv --nts --service-key <data.go.kr-key>
```

## Screening Profiles

Profiles tune thresholds without changing the underlying data model.

- `public-service`: default profile for Korean public procurement service vendors
- `it-service`: slightly stricter profile for IT/SI projects where track record, leverage, and buyer concentration may need earlier review

List profiles:

```bash
narascreen profiles
```

## Output Levels

- `green`: 입력된 정보 기준으로 즉시 걸리는 항목이 없습니다.
- `yellow`: 신용등급, 공공계약 이력, 재무비율 등 추가 확인이 필요합니다.
- `red`: 폐업/휴업, 잘못된 사업자번호, 취약한 신용등급, 과도한 부채비율처럼 계약 전 확인해야 할 강한 플래그가 있습니다.

English:

- `green`: No immediate flags from the provided data.
- `yellow`: Follow-up review is needed, usually around rating, track record, or financial ratios.
- `red`: Strong pre-contract flags, such as suspended/closed business status, invalid business number, weak credit rating, or excessive leverage.

## Report Formats

Markdown is the default because it works well for internal review, GitHub issues, and proposal checklists.

```bash
narascreen screen vendors.csv --out report.md
narascreen screen vendors.csv --format json --out report.json
narascreen screen vendors.csv --format csv --out report.csv
```

Use `--fail-on-red` in automation when red flags should stop a workflow.

```bash
narascreen screen vendors.csv --fail-on-red
```

Reports include the issue code, severity, explanation, and next action. This keeps the tool framed as a pre-screening aid rather than an automatic procurement decision engine.

## Programmatic Use

```js
import { normalizeVendor, parseCsvToRecords, screenVendors } from "kr-company-narascreen";

const records = parseCsvToRecords(csvText);
const vendors = records.map(normalizeVendor);
const screening = screenVendors(vendors);

console.log(screening.summary);
```

## Intended Users

- 공공기관 제안/입찰을 준비하는 스타트업
- SI, 데이터 구축, 운영 용역 협력사를 검토하는 팀
- 나라장터 계약 이력과 재무 리스크를 한 번에 정리하고 싶은 실무자
- Korean startups preparing public-sector proposals or bids
- Teams reviewing SI, data, operations, or outsourced service vendors
- Builders who want procurement-aware risk screening in a scriptable format

## Non-Goals

- 공식 신용평가 대체
- 조달청, 수요기관, 회계법인, 법무법인의 판단 대체
- 자동 낙찰/탈락 판정
- 민감정보 수집 또는 저장

English:

- This is not a replacement for official credit assessment.
- This is not a substitute for procurement agency, accounting, or legal judgment.
- This should not be used as an automatic award, rejection, or blacklist decision engine.
- This project does not aim to collect or store sensitive personal information.

## Roadmap

- 나라장터 입찰공고/계약현황 Open API 어댑터
- OpenDART 고유번호/재무제표 API 어댑터
- 조달청 적격심사 유형별 룰셋 프로파일
- GitHub Action 또는 cron 기반 협력사 정기 모니터링
- HTML 리포트와 Slack 알림

English roadmap:

- Nara Marketplace bid and contract Open API adapters
- OpenDART company code and financial statement adapters
- Procurement rule profiles by evaluation type
- GitHub Action or cron-based recurring vendor monitoring
- HTML reports and Slack notifications

## Release Notes

See [CHANGELOG.md](CHANGELOG.md). Local release checklist is in [docs/release.md](docs/release.md).

## License

MIT

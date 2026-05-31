# kr_company_narascreen

나라장터 용역 입찰·계약 전, 협력사와 수행사의 기본 리스크를 공개자료와 제출자료 기준으로 빠르게 점검하는 CLI/SDK입니다.

`narascreen`은 신용평가나 회계 검토를 대체하지 않습니다. 대신 실무자가 놓치기 쉬운 사전 확인 항목을 CSV 한 장으로 정리해줍니다.

## What it checks

- 사업자등록번호 10자리 포맷과 체크섬
- 국세청 사업자등록 상태조회 API 연동 옵션
- 신용평가등급 누락/취약 구간
- 유동비율, 부채비율
- 공공계약 이력과 최근 계약일
- 특정 발주처 매출 의존도
- DART 공시 보강 필요 여부
- 제출자료 체크리스트

## Quick start

```bash
npx kr-company-narascreen sample > vendors.csv
npx kr-company-narascreen screen vendors.csv --out report.md
```

로컬 체크아웃에서는 이렇게 실행할 수 있습니다.

```bash
node ./bin/narascreen.js screen ./examples/vendors.sample.csv --out report.md
```

국세청 사업자 상태조회 API 키가 있으면 다음처럼 붙입니다.

```bash
NTS_BUSINESS_SERVICE_KEY=... npx kr-company-narascreen screen vendors.csv --nts --out report.md
```

Windows PowerShell에서는 환경변수를 먼저 지정할 수 있습니다.

```powershell
$env:NTS_BUSINESS_SERVICE_KEY="..."
npx kr-company-narascreen screen vendors.csv --nts --out report.md
```

## CSV columns

한국어/영어 컬럼명을 함께 지원합니다.

```csv
사업자번호,업체명,신용등급,유동자산,유동부채,총부채,자본총계,공공계약수,최근계약일,단일발주처의존도,dart_corp_code,메모
123-45-67891,테스트용역 주식회사,BBB0,120000000,80000000,180000000,100000000,4,2025-12-10,45,,format-valid sample only
```

영어 컬럼을 선호하면 아래 이름을 쓰면 됩니다.

```csv
business_number,company_name,credit_rating,current_assets,current_liabilities,total_liabilities,total_equity,public_contract_count,recent_contract_date,single_buyer_dependency_pct,dart_corp_code,memo
```

## Commands

```bash
narascreen sample
narascreen checksum 123-45-67891
narascreen screen vendors.csv --out report.md
narascreen screen vendors.csv --format json
narascreen screen vendors.csv --format csv
narascreen screen vendors.csv --nts --service-key <data.go.kr-key>
```

## Output levels

- `green`: 입력된 정보 기준으로 즉시 걸리는 항목이 없습니다.
- `yellow`: 신용등급, 공공계약 이력, 재무비율 등 추가 확인이 필요합니다.
- `red`: 폐업/휴업, 잘못된 사업자번호, 취약한 신용등급, 과도한 부채비율처럼 계약 전 확인해야 할 강한 플래그가 있습니다.

## Programmatic use

```js
import { normalizeVendor, parseCsvToRecords, screenVendors } from "kr-company-narascreen";

const records = parseCsvToRecords(csvText);
const vendors = records.map(normalizeVendor);
const screening = screenVendors(vendors);

console.log(screening.summary);
```

## Why this exists

한국 스타트업은 공공기관 프로젝트, SI/운영 용역, 데이터 구축, SaaS 납품 과정에서 협력사의 재무·계약 리스크를 빠르게 봐야 하는 순간이 많습니다. 그런데 실제 현장에서는 사업자번호, 신용평가등급확인서, 실적증명, 나라장터 이력, DART 공시, 내부 CSV가 흩어져 있습니다.

이 레포는 최종 판정을 내리는 도구가 아니라, **발주/제안/협력 전 반드시 확인할 질문을 자동으로 모으는 도구**를 목표로 합니다.

## Roadmap

- 나라장터 입찰공고/계약현황 Open API 어댑터
- OpenDART 고유번호/재무제표 API 어댑터
- 조달청 적격심사 유형별 룰셋 프로파일
- GitHub Action 또는 cron 기반 협력사 정기 모니터링
- HTML 리포트와 Slack 알림

## License

MIT

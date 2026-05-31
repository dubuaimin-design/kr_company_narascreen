# Data sources and boundaries

Narascreen is designed as a preliminary screening tool, not as an official
credit assessment or procurement eligibility decision.

## Supported now

- CSV input from internal vendor lists.
- Business registration number checksum validation.
- Optional National Tax Service business registration status lookup through the
  data.go.kr NTS businessman status API.
- Manual credit rating, liquidity, debt ratio, contract count, recent contract
  date, and single-buyer dependency fields.

## Good next integrations

- Nara Marketplace bid and contract Open APIs from data.go.kr.
- OpenDART company code and financial statement APIs for vendors with public
  filings.
- Public procurement evaluation tables by bid type, agency, and contract method.

## Responsibility boundary

Use this tool to decide what to inspect next:

- whether the business registration number is structurally valid;
- whether NTS status should be checked;
- whether a credit rating certificate is missing or weak;
- whether basic liquidity/debt metrics need review;
- whether public-sector track record or buyer concentration needs evidence.

Do not use this tool as the final reason to award, reject, blacklist, or
otherwise make a legally binding procurement decision.

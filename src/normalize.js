import { normalizeBusinessNumber as normalizeDigits } from "./validators.js";
import { normalizeCreditRating } from "./rating.js";

const COLUMN_ALIASES = {
  businessNumber: [
    "business_number",
    "businessnumber",
    "b_no",
    "biz_no",
    "brn",
    "사업자번호",
    "사업자등록번호",
    "사업자 번호"
  ],
  companyName: [
    "company_name",
    "company",
    "name",
    "vendor",
    "vendor_name",
    "상호",
    "회사명",
    "업체명",
    "용역사"
  ],
  creditRating: [
    "credit_rating",
    "creditrating",
    "credit",
    "rating",
    "신용등급",
    "신용평가등급"
  ],
  currentAssets: ["current_assets", "currentassets", "유동자산"],
  currentLiabilities: ["current_liabilities", "currentliabilities", "유동부채"],
  totalLiabilities: [
    "total_liabilities",
    "totalliabilities",
    "debt",
    "liabilities",
    "총부채",
    "부채총계"
  ],
  totalEquity: ["total_equity", "totalequity", "equity", "자본총계", "자기자본"],
  publicContractCount: [
    "public_contract_count",
    "publiccontracts",
    "contract_count",
    "g2b_contract_count",
    "공공계약수",
    "나라장터계약수"
  ],
  recentContractDate: [
    "recent_contract_date",
    "last_contract_date",
    "latest_contract_date",
    "최근계약일",
    "최근낙찰일"
  ],
  singleBuyerDependencyPct: [
    "single_buyer_dependency_pct",
    "buyer_dependency_pct",
    "dependency_pct",
    "top_buyer_pct",
    "단일발주처의존도",
    "최대발주처비중"
  ],
  dartCorpCode: ["dart_corp_code", "corp_code", "dart", "고유번호", "dart고유번호"],
  memo: ["memo", "note", "notes", "비고", "메모"]
};

export function normalizeBusinessNumber(input) {
  return normalizeDigits(input);
}

export function normalizeVendor(record) {
  const vendor = {
    raw: { ...record },
    businessNumber: normalizeDigits(pick(record, "businessNumber")),
    companyName: pick(record, "companyName").trim(),
    creditRating: normalizeCreditRating(pick(record, "creditRating")),
    currentAssets: toNumber(pick(record, "currentAssets")),
    currentLiabilities: toNumber(pick(record, "currentLiabilities")),
    totalLiabilities: toNumber(pick(record, "totalLiabilities")),
    totalEquity: toNumber(pick(record, "totalEquity")),
    publicContractCount: toNumber(pick(record, "publicContractCount")),
    recentContractDate: pick(record, "recentContractDate").trim(),
    singleBuyerDependencyPct: toPercentNumber(pick(record, "singleBuyerDependencyPct")),
    dartCorpCode: pick(record, "dartCorpCode").trim(),
    memo: pick(record, "memo").trim()
  };

  if (!vendor.companyName) {
    vendor.companyName = vendor.businessNumber || "unknown vendor";
  }

  return vendor;
}

function pick(record, canonicalName) {
  const aliases = COLUMN_ALIASES[canonicalName] ?? [];
  const normalizedRecord = new Map(
    Object.entries(record).map(([key, value]) => [normalizeColumnName(key), value])
  );

  for (const alias of aliases) {
    const value = normalizedRecord.get(normalizeColumnName(alias));
    if (value !== undefined && String(value).trim() !== "") {
      return String(value);
    }
  }

  return "";
}

function normalizeColumnName(name) {
  return String(name ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_\-./()]/g, "");
}

function toNumber(input) {
  const raw = String(input ?? "").trim();
  if (raw === "") {
    return null;
  }

  const parsed = Number.parseFloat(raw.replace(/,/g, "").replace(/%$/, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function toPercentNumber(input) {
  const value = toNumber(input);
  if (value === null) {
    return null;
  }
  if (value > 0 && value <= 1) {
    return value * 100;
  }
  return value;
}

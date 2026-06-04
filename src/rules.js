export const SCREENING_PROFILES = {
  "public-service": {
    id: "public-service",
    label: "Public service vendor",
    description: "Default profile for Korean public procurement service vendors.",
    thresholds: {
      currentRatioHighRiskBelow: 70,
      currentRatioWatchBelow: 100,
      debtRatioHighRiskAbove: 400,
      debtRatioWatchAbove: 200,
      oldContractDays: 730,
      buyerDependencyHighRiskAt: 80,
      buyerDependencyWatchAt: 60
    },
    weights: {
      high: 35,
      medium: 15,
      low: 5,
      info: 0
    }
  },
  "it-service": {
    id: "it-service",
    label: "IT/SI service vendor",
    description: "Slightly stricter concentration and track-record profile for IT/SI projects.",
    thresholds: {
      currentRatioHighRiskBelow: 80,
      currentRatioWatchBelow: 110,
      debtRatioHighRiskAbove: 350,
      debtRatioWatchAbove: 180,
      oldContractDays: 545,
      buyerDependencyHighRiskAt: 75,
      buyerDependencyWatchAt: 55
    },
    weights: {
      high: 35,
      medium: 15,
      low: 5,
      info: 0
    }
  }
};

export const DEFAULT_PROFILE_ID = "public-service";

export const ISSUE_GUIDANCE = {
  BUSINESS_NUMBER_INVALID: {
    category: "identity",
    explanation: "A malformed business registration number can break tax, contract, and vendor-master workflows.",
    nextAction: "Ask the vendor to reconfirm the registration number before using it in bid or contract documents."
  },
  NTS_CLOSED: {
    category: "identity",
    explanation: "A closed business status is a strong pre-contract eligibility and payment risk signal.",
    nextAction: "Stop the workflow until the vendor provides corrected evidence or a different contracting entity."
  },
  NTS_SUSPENDED: {
    category: "identity",
    explanation: "A suspended business may not be able to perform or invoice normally during the contract period.",
    nextAction: "Confirm current operating status and whether the bid/contract entity is valid."
  },
  NTS_UNKNOWN_STATUS: {
    category: "identity",
    explanation: "The NTS status did not match the normal active-business code.",
    nextAction: "Review the raw NTS response and request supporting registration evidence from the vendor."
  },
  CREDIT_RATING: {
    category: "financial",
    explanation: "Credit rating certificates are commonly used in Korean procurement screening and partner review.",
    nextAction: "Request a current credit rating certificate and verify its validity period and issuer."
  },
  LIQUIDITY_INPUT: {
    category: "financial",
    explanation: "Liquidity cannot be interpreted when the liability input is missing or invalid.",
    nextAction: "Check the source financial statement and correct current asset/current liability fields."
  },
  LOW_CURRENT_RATIO: {
    category: "financial",
    explanation: "Low current ratio can indicate short-term payment or staffing continuity risk.",
    nextAction: "Ask for recent financial statements and review cash-flow support before relying on the vendor."
  },
  WATCH_CURRENT_RATIO: {
    category: "financial",
    explanation: "A current ratio below the profile threshold deserves follow-up in service delivery reviews.",
    nextAction: "Confirm whether the vendor has enough working capital for the expected project duration."
  },
  NEGATIVE_EQUITY: {
    category: "financial",
    explanation: "Negative or zero equity is a strong solvency warning signal.",
    nextAction: "Escalate to finance/legal review and request additional guarantees or alternative vendor options."
  },
  HIGH_DEBT_RATIO: {
    category: "financial",
    explanation: "Very high leverage can increase default, staffing, or service-continuity risk.",
    nextAction: "Review recent financials and consider risk mitigations such as milestone payments or guarantees."
  },
  WATCH_DEBT_RATIO: {
    category: "financial",
    explanation: "Elevated leverage should be understood before assigning critical service work.",
    nextAction: "Compare against industry norms and request explanations for recent debt increases."
  },
  NO_PUBLIC_CONTRACTS: {
    category: "track-record",
    explanation: "No recorded public contract history may mean the vendor has limited public-sector execution evidence.",
    nextAction: "Request comparable private-sector references or subcontracting performance records."
  },
  OLD_PUBLIC_CONTRACT: {
    category: "track-record",
    explanation: "Old public-sector history may not reflect the vendor's current delivery capability.",
    nextAction: "Ask for recent project references, staffing plan, and current public-sector experience."
  },
  RECENT_CONTRACT_DATE_INVALID: {
    category: "track-record",
    explanation: "An invalid recent-contract date prevents reliable track-record freshness checks.",
    nextAction: "Normalize the date to YYYY-MM-DD or remove the field until verified."
  },
  HIGH_BUYER_DEPENDENCY: {
    category: "concentration",
    explanation: "High dependency on one buyer can create revenue shock or conflict-of-priority risk.",
    nextAction: "Check whether the vendor can allocate enough staff and whether revenue concentration affects continuity."
  },
  WATCH_BUYER_DEPENDENCY: {
    category: "concentration",
    explanation: "Buyer concentration is not always bad, but it needs context before critical engagement.",
    nextAction: "Confirm the major buyer relationship, contract maturity, and capacity available for this project."
  }
};

export function resolveProfile(profileId = DEFAULT_PROFILE_ID) {
  const id = String(profileId || DEFAULT_PROFILE_ID).trim();
  const profile = SCREENING_PROFILES[id];
  if (!profile) {
    const supported = Object.keys(SCREENING_PROFILES).join(", ");
    throw new Error(`Unsupported screening profile: ${profileId}. Supported profiles: ${supported}`);
  }
  return profile;
}

export function listProfiles() {
  return Object.values(SCREENING_PROFILES).map(({ id, label, description }) => ({
    id,
    label,
    description
  }));
}

export function enrichIssue(issue) {
  const guidance = ISSUE_GUIDANCE[issue.code] ?? {
    category: "general",
    explanation: "This flag needs human review before the vendor is treated as cleared.",
    nextAction: "Review the source data and request supporting evidence from the vendor."
  };

  return {
    ...issue,
    ...guidance
  };
}

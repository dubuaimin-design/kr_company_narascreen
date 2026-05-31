const RATING_ORDER = [
  "AAA",
  "AA+",
  "AA0",
  "AA-",
  "A+",
  "A0",
  "A-",
  "BBB+",
  "BBB0",
  "BBB-",
  "BB+",
  "BB0",
  "BB-",
  "B+",
  "B0",
  "B-",
  "CCC+",
  "CCC0",
  "CCC-",
  "CC",
  "C",
  "D"
];

export function normalizeCreditRating(input) {
  const rating = String(input ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/ZERO/g, "0")
    .replace(/O/g, "0");

  if (rating === "") {
    return "";
  }

  if (/^(AAA|AA|A|BBB|BB|B|CCC)$/.test(rating)) {
    return `${rating}0`;
  }

  return rating;
}

export function scoreCreditRating(input) {
  const rating = normalizeCreditRating(input);
  if (!rating) {
    return {
      rating: "",
      band: "missing",
      points: null,
      severity: "medium",
      message: "Credit rating is missing."
    };
  }

  const rank = RATING_ORDER.indexOf(rating);
  if (rank === -1) {
    return {
      rating,
      band: "unknown",
      points: null,
      severity: "medium",
      message: "Credit rating format is not recognized."
    };
  }

  if (rank <= RATING_ORDER.indexOf("A-")) {
    return {
      rating,
      band: "strong",
      points: 10,
      severity: "info",
      message: "Credit rating is in the strong band."
    };
  }

  if (rank <= RATING_ORDER.indexOf("BBB-")) {
    return {
      rating,
      band: "acceptable",
      points: 9,
      severity: "info",
      message: "Credit rating is in the acceptable band."
    };
  }

  if (rank <= RATING_ORDER.indexOf("BB-")) {
    return {
      rating,
      band: "watch",
      points: 7,
      severity: "medium",
      message: "Credit rating is below the common investment-grade band."
    };
  }

  if (rank <= RATING_ORDER.indexOf("B-")) {
    return {
      rating,
      band: "weak",
      points: 5,
      severity: "high",
      message: "Credit rating is weak for a public-service vendor."
    };
  }

  return {
    rating,
    band: "distressed",
    points: 3,
    severity: "high",
    message: "Credit rating indicates distressed repayment capacity."
  };
}

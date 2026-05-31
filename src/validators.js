export function normalizeBusinessNumber(input) {
  return String(input ?? "").replace(/\D/g, "");
}

export function formatBusinessNumber(input) {
  const digits = normalizeBusinessNumber(input);
  if (digits.length !== 10) {
    return digits;
  }
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export function validateKoreanBusinessNumber(input) {
  const digits = normalizeBusinessNumber(input);
  if (!/^\d{10}$/.test(digits)) {
    return {
      valid: false,
      digits,
      reason: "Business registration number must contain 10 digits."
    };
  }

  const nums = [...digits].map((digit) => Number.parseInt(digit, 10));
  const weights = [1, 3, 7, 1, 3, 7, 1, 3];
  let sum = 0;

  for (let index = 0; index < weights.length; index += 1) {
    sum += nums[index] * weights[index];
  }

  const ninth = nums[8] * 5;
  sum += Math.floor(ninth / 10) + (ninth % 10);
  const checkDigit = (10 - (sum % 10)) % 10;

  return {
    valid: checkDigit === nums[9],
    digits,
    expectedCheckDigit: checkDigit,
    actualCheckDigit: nums[9],
    reason: checkDigit === nums[9] ? null : "Checksum digit does not match."
  };
}

import { normalizeBusinessNumber } from "./validators.js";

const DEFAULT_ENDPOINT = "https://api.odcloud.kr/api/nts-businessman/v1/status";

export class NtsBusinessClient {
  constructor(options = {}) {
    this.serviceKey = options.serviceKey ?? process.env.NTS_BUSINESS_SERVICE_KEY ?? "";
    this.endpoint = options.endpoint ?? DEFAULT_ENDPOINT;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
  }

  async getStatus(businessNumbers) {
    if (!this.serviceKey) {
      throw new Error("NTS service key is required. Pass --service-key or set NTS_BUSINESS_SERVICE_KEY.");
    }

    if (typeof this.fetchImpl !== "function") {
      throw new Error("fetch is not available. Use Node.js 20 or newer.");
    }

    const numbers = [...new Set(businessNumbers.map(normalizeBusinessNumber).filter(Boolean))];
    const results = [];

    for (const chunk of chunkArray(numbers, 100)) {
      const response = await this.fetchImpl(withServiceKey(this.endpoint, this.serviceKey), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json"
        },
        body: JSON.stringify({ b_no: chunk })
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(`NTS API request failed with ${response.status}: ${body.slice(0, 300)}`);
      }

      const payload = await response.json();
      if (!Array.isArray(payload.data)) {
        throw new Error("NTS API response did not contain a data array.");
      }

      results.push(...payload.data);
    }

    return results;
  }
}

export function makeNtsResultMap(results) {
  const map = new Map();
  for (const result of results ?? []) {
    const businessNumber = normalizeBusinessNumber(result.b_no);
    if (businessNumber) {
      map.set(businessNumber, result);
    }
  }
  return map;
}

function withServiceKey(endpoint, serviceKey) {
  const separator = endpoint.includes("?") ? "&" : "?";
  return `${endpoint}${separator}serviceKey=${serviceKey}`;
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

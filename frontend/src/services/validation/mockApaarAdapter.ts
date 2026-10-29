export interface MockAuthoritativeVerificationResponse {
  isSyntacticallyValid: boolean;
  simulatedAuthoritativeStatus:
    | "SIMULATED_VERIFIED_SANDBOX"
    | "SIMULATED_NOT_FOUND_IN_SANDBOX"
    | "SIMULATED_GATEWAY_UNAVAILABLE";
  disclaimer: string;
  simulatedGatewayLatencyMs: number;
}

/**
 * Mock Validation Adapter with explicit simulated statuses.
 * Transparently conveys that it is a sandbox demonstration adapter and does not claim
 * to be an authoritative national API gateway.
 */
export const queryMockApaarAdapter = async (
  apaarId: string
): Promise<MockAuthoritativeVerificationResponse> => {
  const normalized = (apaarId || "").replace(/[-\s]/g, "");
  const is12Digits = normalized.length === 12 && /^\d+$/.test(normalized);

  // Explicit simulated adapter disclaimer
  const disclaimer =
    "DEMONSTRATION ONLY: Syntactic validation verified. This simulated response does NOT represent an authoritative query against the official national APAAR registry.";

  if (!is12Digits) {
    return {
      isSyntacticallyValid: false,
      simulatedAuthoritativeStatus: "SIMULATED_NOT_FOUND_IN_SANDBOX",
      disclaimer,
      simulatedGatewayLatencyMs: 45,
    };
  }

  // Known mock test conditions
  if (apaarId.includes("0000")) {
    return {
      isSyntacticallyValid: true,
      simulatedAuthoritativeStatus: "SIMULATED_GATEWAY_UNAVAILABLE",
      disclaimer,
      simulatedGatewayLatencyMs: 250,
    };
  }

  return {
    isSyntacticallyValid: true,
    simulatedAuthoritativeStatus: "SIMULATED_VERIFIED_SANDBOX",
    disclaimer,
    simulatedGatewayLatencyMs: 65,
  };
};

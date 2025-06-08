export interface VerifiableCredential {
  type: string; // e.g., "IdentityAttestation", "EmploymentVerification", "HealthCreditEligibility", "OrganizationVerification", "MedicalLicense", "HealthCreditIssuer"
  issuerDID: string; // The DID of the entity issuing this credential
  issueDate: Date;
  data: any; // Flexible JSON payload for credential-specific data
  status: "valid" | "revoked" | "expired"; // Current status of the credential
  proof: string; // Mock cryptographic proof (placeholder for a real signature)
}

export interface DIDDocument {
  id: string; // The Decentralized Identifier (DID) string
  type: "issuer" | "worker" | "clinic"; // Role of the DID holder
  verified: boolean; // This will be a derived status in the UI, not from the mock data
  publicKey: string; // Public key associated with the DID
  credentials?: VerifiableCredential[]; // Optional array of associated verifiable credentials
} 
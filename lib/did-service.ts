import { DIDDocument, VerifiableCredential, VerificationMethod, Service } from '@/types/did';

// Helper function to generate a did:xrpl DID (consistent with previous file)
const generateXrplDID = (address: string, network: string = 'testnet'): string => {
  return `did:xrpl:${network}:${address}`;
};

// Helper function to create a basic XRPL verification method
const createXrplVerificationMethod = (did: string, address: string, publicKey: string): VerificationMethod => ({
  id: `${did}#master`, // Standard convention for master key
  type: 'Secp256k1VerificationKey2019', // XRPL uses secp256k1
  controller: did, // The DID controls this key
  publicKeyBase58: publicKey, // Assuming publicKey is Base58 encoded here for simplicity if it were real
  // blockchainAccountId: `eip155:0x${encodeAccountID(address)}@ripple`, // Requires xrpl/utils, omitted for pure mock
});

// Mock registry of DID documents conforming to W3C DID Document structure
const mockDIDRegistry: Record<string, DIDDocument> = {
  // Fully Verified Worker
  'rFullyVerifiedWorker123': {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1-2019/v1'],
    id: generateXrplDID('rFullyVerifiedWorker123'),
    controller: generateXrplDID('rFullyVerifiedWorker123'),
    verificationMethod: [
      createXrplVerificationMethod(generateXrplDID('rFullyVerifiedWorker123'), 'rFullyVerifiedWorker123', '03a0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47f247a7'),
    ],
    authentication: [`${generateXrplDID('rFullyVerifiedWorker123')}#master`],
    assertionMethod: [`${generateXrplDID('rFullyVerifiedWorker123')}#master`],
    credentials: [
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'IdentityAttestation'],
        issuer: generateXrplDID('rTrustedIssuer123'),
        issuanceDate: new Date('2024-01-15').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rFullyVerifiedWorker123'),
          name: 'John Doe',
          nationality: 'PH',
          birthDate: '1990-01-01'
        },
        proof: {
          type: 'JsonWebSignature2020', // Example proof type
          created: new Date('2024-01-15').toISOString(),
          verificationMethod: `${generateXrplDID('rTrustedIssuer123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-1' // Reusing your mock proof for simplicity
        },
        // Original status field, can be kept as custom property
        status: 'valid'
      },
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'EmploymentVerification'],
        issuer: generateXrplDID('rEmployer123'),
        issuanceDate: new Date('2024-02-01').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rFullyVerifiedWorker123'),
          employer: 'Acme Corp',
          position: 'Software Developer',
          startDate: '2023-06-01'
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2024-02-01').toISOString(),
          verificationMethod: `${generateXrplDID('rEmployer123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-2'
        },
        status: 'valid'
      },
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'HealthCreditEligibility'],
        issuer: generateXrplDID('rHealthPay123'),
        issuanceDate: new Date('2024-03-01').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rFullyVerifiedWorker123'),
          eligibilityLevel: 'A',
          monthlyLimit: 1000
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2024-03-01').toISOString(),
          verificationMethod: `${generateXrplDID('rHealthPay123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-3'
        },
        status: 'valid'
      }
    ]
  },

  // Partially Verified Worker
  'rPartiallyVerifiedWorker123': {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1-2019/v1'],
    id: generateXrplDID('rPartiallyVerifiedWorker123'),
    controller: generateXrplDID('rPartiallyVerifiedWorker123'),
    verificationMethod: [
      createXrplVerificationMethod(generateXrplDID('rPartiallyVerifiedWorker123'), 'rPartiallyVerifiedWorker123', '03b0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47f247a7'),
    ],
    authentication: [`${generateXrplDID('rPartiallyVerifiedWorker123')}#master`],
    assertionMethod: [`${generateXrplDID('rPartiallyVerifiedWorker123')}#master`],
    credentials: [
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'IdentityAttestation'],
        issuer: generateXrplDID('rTrustedIssuer123'),
        issuanceDate: new Date('2024-01-15').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rPartiallyVerifiedWorker123'),
          name: 'Jane Smith',
          nationality: 'ID',
          birthDate: '1992-05-15'
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2024-01-15').toISOString(),
          verificationMethod: `${generateXrplDID('rTrustedIssuer123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-4'
        },
        status: 'valid'
      }
    ]
  },

  // Worker with Revoked/Expired Credentials
  'rWorkerWithRevokedCreds123': {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1-2019/v1'],
    id: generateXrplDID('rWorkerWithRevokedCreds123'),
    controller: generateXrplDID('rWorkerWithRevokedCreds123'),
    verificationMethod: [
      createXrplVerificationMethod(generateXrplDID('rWorkerWithRevokedCreds123'), 'rWorkerWithRevokedCreds123', '03c0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47f247a7'),
    ],
    authentication: [`${generateXrplDID('rWorkerWithRevokedCreds123')}#master`],
    assertionMethod: [`${generateXrplDID('rWorkerWithRevokedCreds123')}#master`],
    credentials: [
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'IdentityAttestation'],
        issuer: generateXrplDID('rTrustedIssuer123'),
        issuanceDate: new Date('2024-01-15').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rWorkerWithRevokedCreds123'),
          name: 'Bob Wilson',
          nationality: 'MY',
          birthDate: '1988-11-30'
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2024-01-15').toISOString(),
          verificationMethod: `${generateXrplDID('rTrustedIssuer123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-5'
        },
        status: 'valid'
      },
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'EmploymentVerification'],
        issuer: generateXrplDID('rEmployer123'),
        issuanceDate: new Date('2023-12-01').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rWorkerWithRevokedCreds123'),
          employer: 'Old Corp',
          position: 'Factory Worker',
          startDate: '2023-01-01'
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2023-12-01').toISOString(),
          verificationMethod: `${generateXrplDID('rEmployer123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-6'
        },
        status: 'revoked' // Custom status
      },
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'HealthCreditEligibility'],
        issuer: generateXrplDID('rHealthPay123'),
        issuanceDate: new Date('2023-06-01').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rWorkerWithRevokedCreds123'),
          eligibilityLevel: 'B',
          monthlyLimit: 500
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2023-06-01').toISOString(),
          verificationMethod: `${generateXrplDID('rHealthPay123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-7'
        },
        status: 'expired' // Custom status
      }
    ]
  },

  // Verified Issuer
  'rVerifiedIssuer123': {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1-2019/v1'],
    id: generateXrplDID('rVerifiedIssuer123'),
    controller: generateXrplDID('rVerifiedIssuer123'),
    verificationMethod: [
      createXrplVerificationMethod(generateXrplDID('rVerifiedIssuer123'), 'rVerifiedIssuer123', '03d0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47f247a7'),
    ],
    authentication: [`${generateXrplDID('rVerifiedIssuer123')}#master`],
    assertionMethod: [`${generateXrplDID('rVerifiedIssuer123')}#master`],
    credentials: [
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'OrganizationVerification'],
        issuer: generateXrplDID('rRegulator123'),
        issuanceDate: new Date('2024-01-01').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rVerifiedIssuer123'),
          organizationName: 'HealthPay NGO',
          registrationNumber: 'NGO123456',
          jurisdiction: 'SG'
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2024-01-01').toISOString(),
          verificationMethod: `${generateXrplDID('rRegulator123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-8'
        },
        status: 'valid'
      },
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'HealthCreditIssuer'],
        issuer: generateXrplDID('rRegulator123'),
        issuanceDate: new Date('2024-01-15').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rVerifiedIssuer123'),
          issuerLevel: 'A',
          maxMonthlyIssuance: 100000
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2024-01-15').toISOString(),
          verificationMethod: `${generateXrplDID('rRegulator123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-9'
        },
        status: 'valid'
      }
    ]
  },

  // Verified Healthcare Provider
  'rVerifiedClinic123': {
    '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1-2019/v1'],
    id: generateXrplDID('rVerifiedClinic123'),
    controller: generateXrplDID('rVerifiedClinic123'),
    verificationMethod: [
      createXrplVerificationMethod(generateXrplDID('rVerifiedClinic123'), 'rVerifiedClinic123', '03e0434d9e47f3c86235477c7b1ae6ae5d3442d49b1943c2b752a68e2a47f247a7'),
    ],
    authentication: [`${generateXrplDID('rVerifiedClinic123')}#master`],
    assertionMethod: [`${generateXrplDID('rVerifiedClinic123')}#master`],
    credentials: [
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'OrganizationVerification'],
        issuer: generateXrplDID('rRegulator123'),
        issuanceDate: new Date('2024-01-01').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rVerifiedClinic123'),
          organizationName: 'Community Health Center',
          registrationNumber: 'CLINIC789012',
          jurisdiction: 'SG'
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2024-01-01').toISOString(),
          verificationMethod: `${generateXrplDID('rRegulator123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-10'
        },
        status: 'valid'
      },
      {
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: ['VerifiableCredential', 'MedicalLicense'],
        issuer: generateXrplDID('rMedicalBoard123'),
        issuanceDate: new Date('2024-01-15').toISOString(),
        credentialSubject: {
          id: generateXrplDID('rVerifiedClinic123'),
          licenseNumber: 'MED123456',
          specialties: ['General Medicine', 'Pediatrics'],
          validUntil: '2025-01-15'
        },
        proof: {
          type: 'JsonWebSignature2020',
          created: new Date('2024-01-15').toISOString(),
          verificationMethod: `${generateXrplDID('rMedicalBoard123')}#master`,
          proofPurpose: 'assertionMethod',
          jws: 'mock-proof-11'
        },
        status: 'valid'
      }
    ]
  }
};

/**
 * Simulates fetching a DID document from the XRPL network.
 * This mock now returns a DID Document that *conforms* to the W3C DID Core specification
 * as it would be constructed by the `resolveXrplDID` function in a real scenario.
 *
 * @param walletAddress The XRPL wallet address for which to resolve the DID Document.
 * @returns Promise resolving to the DID document or null if not found.
 */
export async function verifyDID(walletAddress: string): Promise<DIDDocument | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // The actual DID resolution logic (as per `resolveXrplDID` in the previous response)
  // would construct the DID Document from the XRPL account state.
  // Here, we directly return the pre-formatted mock DID Document.
  return mockDIDRegistry[walletAddress] || null;
}

/**
 * Helper function to get sample wallet addresses for testing
 */
export const sampleAddresses = {
  fullyVerifiedWorker: 'rFullyVerifiedWorker123',
  partiallyVerifiedWorker: 'rPartiallyVerifiedWorker123',
  workerWithRevokedCreds: 'rWorkerWithRevokedCreds123',
  verifiedIssuer: 'rVerifiedIssuer123',
  verifiedClinic: 'rVerifiedClinic123'
};
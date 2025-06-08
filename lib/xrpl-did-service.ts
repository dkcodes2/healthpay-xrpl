import { Client, Wallet, xrpToDrops, Payment, TransactionMetadata, AccountTxTransaction, AccountInfoResponse } from 'xrpl';
import { DIDDocument, VerifiableCredential, VerificationMethod, Service } from '@/types/did';
import { encodeAccountID } from 'xrpl/dist/npm/utils'; // For converting r-address to hex for DID resolution

// XRPL Testnet configuration
const TESTNET_URL = 'wss://testnet.xrpl-labs.com';

// DID Document Memo Types (keep for VC anchoring if desired)
const MEMO_TYPES = {
  VERIFIABLE_CREDENTIAL: 'VerifiableCredential', // DID Document memo is removed
};

// Transaction result types
type TransactionResultType = 'tesSUCCESS' | 'temREDUNDANT';

// Convert string to hex
const toHex = (str: string): string => Buffer.from(str).toString('hex');

// Timeout utility
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
}

interface Memo {
  Memo: {
    MemoType: string;
    MemoData: string;
    MemoFormat: string;
  };
}

interface TransactionWithMemos {
  tx: Payment & {
    Memos?: Memo[];
  };
  meta?: TransactionMetadata;
}

// Helper function to submit transaction with retries
async function submitTransactionWithRetry(
  client: Client,
  prepared: any,
  wallet: Wallet,
  maxRetries: number = 3
): Promise<string> {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      // Ensure client is connected
      if (!client.isConnected()) {
        await client.connect();
      }
      // Get the latest ledger index
      const serverInfo = await client.request({
        command: 'server_info',
      });
      const currentLedgerIndex = serverInfo.result.info.complete_ledgers.split('-').pop();

      // Set LastLedgerSequence with a buffer of 20 ledgers
      prepared.LastLedgerSequence = Number(currentLedgerIndex) + 20;

      const signed = wallet.sign(prepared);
      const result = await client.submitAndWait(signed.tx_blob);

      // Access the transaction result from the metadata
      const transactionResult = (result.result.meta as any)?.TransactionResult as TransactionResultType;

      if (transactionResult === 'tesSUCCESS') {
        return result.result.hash;
      }

      // If transaction failed but not due to LastLedgerSequence, throw error
      if (transactionResult !== 'temREDUNDANT') {
        throw new Error(`Transaction failed: ${transactionResult}`);
      }

      // If we get here, it was a LastLedgerSequence error, wait and retry
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    } catch (error) {
      lastError = error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
    }
  }

  throw lastError || new Error('Transaction failed after all retries');
}

/**
 * Generates a did:xrpl DID from an XRPL account address.
 * The network parameter is important for DID resolution context.
 * @param address The XRPL account address.
 * @param network The XRPL network (e.g., 'mainnet', 'testnet', 'devnet').
 * @returns A did:xrpl DID string.
 */
export function generateXrplDID(address: string, network: 'mainnet' | 'testnet' | 'devnet' | 'amm-devnet'): string {
  return `did:xrpl:${network}:${address}`;
}

/**
 * (REMOVED: createDIDDocument)
 * In did:xrpl, the DID Document is primarily derived from the XRPL account's state,
 * not explicitly created and stored as a standalone document.
 * The DID is simply the account itself.
 *
 * If you need to add custom data to the DID Document that isn't part of the core
 * XRPL account state (like service endpoints not covered by `Domain`),
 * you would use an `AccountSet` transaction or a similar mechanism,
 * or rely on off-chain discovery.
 *
 * For example, setting the Domain field on an account:
 * async function setDIDDomain(wallet: Wallet, domain: string): Promise<string> {
 * const client = new Client(TESTNET_URL);
 * try {
 * if (!client.isConnected()) {
 * await client.connect();
 * }
 * const tx = {
 * TransactionType: 'AccountSet',
 * Account: wallet.address,
 * SetFlag: 8, // sfUniversalNumber
 * Domain: toHex(domain), // Hex encoded domain name
 * };
 * const prepared = await client.autofill(tx);
 * return await withTimeout(submitTransactionWithRetry(client, prepared, wallet), 20000);
 * } finally {
 * if (client.isConnected()) await client.disconnect();
 * }
 * }
 */

/**
 * Issues a verifiable credential on XRPL using Memos.
 * This function remains largely the same as it's an anchoring mechanism for VCs.
 * @param issuerWallet The issuer's XRPL wallet
 * @param recipientAddress The recipient's XRPL address
 * @param credential The verifiable credential to issue
 * @returns Transaction hash
 */
export async function issueVerifiableCredential(
  issuerWallet: Wallet,
  recipientAddress: string,
  credential: VerifiableCredential
): Promise<string> {
  const client = new Client(TESTNET_URL);
  try {
    if (!client.isConnected()) {
      await client.connect();
    }
    const tx: Payment = {
      TransactionType: 'Payment',
      Account: issuerWallet.address,
      Destination: recipientAddress,
      Amount: xrpToDrops('1'), // Minimum amount
      Memos: [
        {
          Memo: {
            MemoType: toHex(MEMO_TYPES.VERIFIABLE_CREDENTIAL),
            MemoData: toHex(JSON.stringify(credential)),
            MemoFormat: toHex('application/json'),
          },
        },
      ],
    };
    const prepared = await client.autofill(tx);
    return await withTimeout(submitTransactionWithRetry(client, prepared, issuerWallet), 20000);
  } finally {
    if (client.isConnected()) await client.disconnect();
  }
}

/**
 * Resolves a did:xrpl DID by fetching its associated account state and VCs from XRPL.
 * This function constructs the DID Document based on XRPL account information.
 * @param xrplDID The did:xrpl DID to resolve (e.g., did:xrpl:testnet:r...)
 * @returns The DID document with its credentials or null if not found
 */
export async function resolveXrplDID(xrplDID: string): Promise<DIDDocument | null> {
  const client = new Client(TESTNET_URL);
  try {
    if (!client.isConnected()) {
      await client.connect();
    }

    const parts = xrplDID.split(':');
    if (parts.length !== 4 || parts[0] !== 'did' || parts[1] !== 'xrpl') {
      throw new Error('Invalid did:xrpl format');
    }
    const network = parts[2]; // e.g., 'testnet'
    const accountAddress = parts[3]; // e.g., 'rP9jD9L7sY6jX54tS8tS6s7fS7fS7fS7fS'

    let accountInfo: AccountInfoResponse;
    try {
      accountInfo = await withTimeout(client.request({
        command: 'account_info',
        account: accountAddress,
        ledger_index: 'current',
        signer_lists: true, // Request signer lists for multi-signing keys
      }), 20000);
    } catch (error: any) {
      if (error.message === 'actNotFound') {
        return null; // Account not found, so DID cannot be resolved
      }
      throw error; // Re-throw other errors
    }

    const accountData = accountInfo.result.account_data;

    // Construct the DID Document based on XRPL account info
    const didDocument: DIDDocument = {
      '@context': ['https://www.w3.org/ns/did/v1', 'https://w3id.org/security/suites/secp256k1-2019/v1'],
      id: xrplDID,
      controller: accountAddress, // The controller is the account itself

      verificationMethod: [
        {
          id: `${xrplDID}#master`,
          type: 'Secp256k1VerificationKey2019', // XRPL uses secp256k1 for master key
          controller: xrplDID,
          // publicKeyBase58 is not available from account_info; should be passed from wallet creation if needed
          // publicKeyBase58: undefined,
          blockchainAccountId: `eip155:0x${Buffer.from(accountAddress, 'utf-8').toString('hex')}@ripple`, // Example for blockchainAccountId
        },
      ],
      authentication: [`${xrplDID}#master`],
      assertionMethod: [`${xrplDID}#master`],
      // Add other verification methods for regular keys if available
      // if (accountData.RegularKey) {
      //   // You'd need to find the public key associated with the RegularKey
      //   // This is not directly available from account_info.
      //   // You might need a convention or another on-chain record for this.
      // }
    };

    // If a Domain is set on the account, add it as a service endpoint
    if (accountData.Domain) {
      try {
        const decodedDomain = Buffer.from(accountData.Domain, 'hex').toString();
        const service: Service = {
          id: `${xrplDID}#domain-service`,
          type: 'DomainService',
          serviceEndpoint: `https://${decodedDomain}`, // Assuming HTTPS for a web domain
        };
        if (!didDocument.service) {
          didDocument.service = [];
        }
        didDocument.service.push(service);
      } catch (e) {
        console.warn('Could not decode Domain field:', e);
      }
    }


    // --- Fetch Verifiable Credentials (unchanged logic for memos) ---
    // This part remains the same as your original implementation for VC discovery via memos.
    const response = await withTimeout(client.request({
      command: 'account_tx',
      account: accountAddress,
      limit: 100, // Adjust limit as needed, or paginate for more VCs
    }), 20000);

    const transactions = response.result.transactions as unknown as TransactionWithMemos[];
    if (transactions && transactions.length > 0) {
      const credentialTxs = transactions.filter(tx => {
        const memoType = tx.tx?.Memos?.[0]?.Memo?.MemoType;
        return memoType && Buffer.from(memoType, 'hex').toString() === MEMO_TYPES.VERIFIABLE_CREDENTIAL;
      });

      const credentials: VerifiableCredential[] = credentialTxs
        .map(tx => {
          const memoData = tx.tx?.Memos?.[0]?.Memo?.MemoData;
          if (!memoData) return null;
          try {
            return JSON.parse(Buffer.from(memoData, 'hex').toString()) as VerifiableCredential;
          } catch (e) {
            console.error("Error parsing credential memo data:", e);
            return null;
          }
        })
        .filter((cred): cred is VerifiableCredential => cred !== null);
      didDocument.credentials = credentials;
    }

    return didDocument;
  } finally {
    if (client.isConnected()) await client.disconnect();
  }
}

/**
 * Creates a new XRPL wallet for testing and generates its did:xrpl DID.
 * @returns An object containing the XRPL wallet and its corresponding did:xrpl DID.
 */
export async function createTestWalletWithDID(): Promise<{ wallet: Wallet, did: string }> {
  const client = new Client(TESTNET_URL);
  try {
    if (!client.isConnected()) {
      await client.connect();
    }
    const { wallet } = await withTimeout(client.fundWallet(), 20000);
    const did = generateXrplDID(wallet.address, 'testnet'); // Assuming 'testnet' for funding
    return { wallet, did };
  } finally {
    if (client.isConnected()) await client.disconnect();
  }
}
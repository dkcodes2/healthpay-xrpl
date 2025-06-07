import { Client, Wallet } from "xrpl"


// Types
interface HealthCreditIssueParams {
  recipientAddress: string
  amount: number
  memo?: string
}

interface HealthCreditRedeemParams {
  patientAddress: string
  amount: number
  serviceDescription: string
}

interface TransactionResult {
  transactionId: string
  success: boolean
  message?: string
}

// XRPL client configuration
const XRPL_TESTNET_URL = "wss://s.altnet.rippletest.net:51233"

// Issuer wallet (testnet credentials for demo purposes)
const ISSUER_WALLET = {
  address: "rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh",
  secret: "snoPBrXtMeMyMHUVTgbuqAfg1SUTb",
}

const CLINIC_WALLET = {
  address: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH",
  secret: "sn3nxiW7v8KXzPzAqzyHXbSSKNuN9",
}

// Mock DID verification system
interface DIDDocument {
  id: string
  type: "issuer" | "worker" | "clinic"
  verified: boolean
  publicKey: string
}

const mockDIDRegistry: Record<string, DIDDocument> = {
  [ISSUER_WALLET.address]: {
    id: "did:xrpl:issuer:1",
    type: "issuer",
    verified: true,
    publicKey: "ed25519:ABC123",
  },
  [CLINIC_WALLET.address]: {
    id: "did:xrpl:clinic:1",
    type: "clinic",
    verified: true,
    publicKey: "ed25519:DEF456",
  },
}


// Issue health credits to a worker
export async function issueHealthCredits(params: HealthCreditIssueParams): Promise<TransactionResult> {
  const client = await initializeXRPLClient()
  try {
    const issuerWallet = Wallet.fromSecret(ISSUER_WALLET.secret)
    const transaction = {
      TransactionType: "Payment",
      Account: issuerWallet.address,
      Destination: params.recipientAddress,
      Amount: {
        currency: "HC",
        value: params.amount.toString(),
        issuer: issuerWallet.address,
      },
      Memos: [
        {
          Memo: {
            MemoData: Buffer.from(params.memo || "").toString("hex"),
          },
        },
      ],
    }
    const prepared = await client.autofill(transaction)
    const signed = issuerWallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)
    return {
      transactionId: result.result.hash,
      success: result.result.meta.TransactionResult === "tesSUCCESS",
      message: "Transaction completed",
    }
  } finally {
    client.disconnect()
  }
}

// Redeem health credits at a clinic
export async function redeemHealthCredits(params: HealthCreditRedeemParams): Promise<TransactionResult> {
  const client = await initializeXRPLClient()
  try {
    const clinicWallet = Wallet.fromSecret(CLINIC_WALLET.secret)
    const transaction = {
      TransactionType: "Payment",
      Account: params.patientAddress,
      Destination: clinicWallet.address,
      Amount: {
        currency: "HC",
        value: params.amount.toString(),
        issuer: ISSUER_WALLET.address,
      },
      Memos: [
        {
          Memo: {
            MemoData: Buffer.from(params.serviceDescription).toString("hex"),
          },
        },
      ],
    }
    const prepared = await client.autofill(transaction)
    const signed = clinicWallet.sign(prepared)
    const result = await client.submitAndWait(signed.tx_blob)
    return {
      transactionId: result.result.hash,
      success: result.result.meta.TransactionResult === "tesSUCCESS",
      message: "Transaction completed",
    }
  } finally {
    client.disconnect()
  }
}

// Get worker's health credit balance
export async function getWorkerBalance(walletAddress: string): Promise<number> {
  const client = await initializeXRPLClient()
  try {
    const response = await client.request({
      command: "account_lines",
      account: walletAddress,
      ledger_index: "validated",
    })
    const line = response.result.lines.find(
      (l: any) => l.currency === "HC" && l.account === ISSUER_WALLET.address
    )
    return line ? parseFloat(line.balance) : 0
  } finally {
    client.disconnect()
  }
}

// Verify DID document
export async function verifyDID(walletAddress: string): Promise<DIDDocument | null> {
  try {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const didDocument = mockDIDRegistry[walletAddress]
    console.log(`[DID Service] Verifying DID for ${walletAddress}:`, didDocument)

    return didDocument || null
  } catch (error) {
    console.error("Failed to verify DID:", error)
    return null
  }
}

// Get transaction history for an address
export async function getTransactionHistory(walletAddress: string): Promise<any[]> {
  const client = await initializeXRPLClient()
  try {
    const response = await client.request({
      command: "account_tx",
      account: walletAddress,
      ledger_index_min: -1,
      ledger_index_max: -1,
    })
    return response.result.transactions
  } finally {
    client.disconnect()
  }
}

// Initialize XRPL connection
export async function initializeXRPLClient(): Promise<Client> {
  const client = new Client(XRPL_TESTNET_URL)
  await client.connect()
  return client
}

// Export constants for use in other parts of the app
export const XRPL_CONSTANTS = {
  TESTNET_URL: XRPL_TESTNET_URL,
  EXPLORER_URL: "https://testnet.xrpl.org",
  FAUCET_URL: "https://xrpl.org/xrp-testnet-faucet.html",
}

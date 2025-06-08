import { NextRequest, NextResponse } from 'next/server';
import { xrpl } from '@/scripts/hec/hec-utils';

// Hardcoded addresses and secrets from .hec-state
const addresses = {
  issuer: "rzZgrzU4GzbB6jNVHCq3NmufYpQWGW7Ci",
  operator: "rwksWbwwP3f2R7GaDDi5d4vRA63ZXkLy92",
  beneficiary: "rEmgtkaitKbrrTrobdaUKr7u4tsm4euTiR",
  clinic: "r3PQXDp5BJndbeKiiQGVcRAP6Mc7NF1kqk",
};
const secrets = {
  issuer: "sEdTwQgGjQPLW9RVNtNyiGThu3WHQBk",
  operator: "sEdVnBSrzq688hJsjEXv2MZQFnQDjCM",
  beneficiary: "sEd7A3CTfq35yyurUhWN9RdGLMJe2LG",
  clinic: "sEdV9Dmq9y9e6CEL3Gr3haMBpCWgh4Q",
};

export async function POST(request: NextRequest) {
  let client;
  try {
    const { action, amount } = await request.json();
    client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    let senderWallet, tx;
    if (action === "mint") {
      senderWallet = xrpl.Wallet.fromSeed(secrets.issuer);
      tx = {
        TransactionType: "Payment",
        Account: addresses.issuer,
        Destination: addresses.operator,
        Amount: {
          currency: "HEC",
          value: amount,
          issuer: addresses.issuer
        }
      };
    } else if (action === "distribute") {
      senderWallet = xrpl.Wallet.fromSeed(secrets.operator);
      tx = {
        TransactionType: "Payment",
        Account: addresses.operator,
        Destination: addresses.beneficiary,
        Amount: {
          currency: "HEC",
          value: amount,
          issuer: addresses.issuer
        }
      };
    } else if (action === "pay") {
      senderWallet = xrpl.Wallet.fromSeed(secrets.beneficiary);
      tx = {
        TransactionType: "Payment",
        Account: addresses.beneficiary,
        Destination: addresses.clinic,
        Amount: {
          currency: "HEC",
          value: amount,
          issuer: addresses.issuer
        }
      };
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const prepared = await client.autofill(tx);
    const result = await client.submitAndWait(prepared, { wallet: senderWallet });
    if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
      throw new Error(`XRPL error: ${result.result.meta.TransactionResult}`);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Quick action error:', error);
    return NextResponse.json({ error: 'Quick action failed' }, { status: 500 });
  } finally {
    if (client) await client.disconnect();
  }
} 
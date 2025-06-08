import { NextRequest, NextResponse } from 'next/server';
import { xrpl, readState } from '@/scripts/hec/hec-utils';

export async function POST(request: NextRequest) {
  let client;
  try {
    const { from, to, amount } = await request.json();

    if (!from || !to || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
    await client.connect();

    const issuer = readState("issuer");
    if (!issuer) {
      throw new Error("Issuer state not found");
    }

    // Get the sender's wallet
    let senderWallet;
    if (from === readState("operator")?.address) {
      senderWallet = xrpl.Wallet.fromSeed(readState("operator").secret);
    } else if (from === readState("beneficiary")?.address) {
      senderWallet = xrpl.Wallet.fromSeed(readState("beneficiary").secret);
    } else {
      throw new Error("Invalid sender address");
    }

    const transferTx = {
      TransactionType: "Payment",
      Account: from,
      Destination: to,
      Amount: {
        currency: "HEC",
        value: amount,
        issuer: issuer.address
      }
    };

    const prepared = await client.autofill(transferTx);
    const result = await client.submitAndWait(prepared, { wallet: senderWallet });

    if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
      throw new Error(`Transfer failed: ${result.result.meta.TransactionResult}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing transfer:', error);
    return NextResponse.json(
      { error: 'Transfer failed' },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.disconnect();
    }
  }
} 
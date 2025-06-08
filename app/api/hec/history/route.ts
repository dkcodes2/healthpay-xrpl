import { NextResponse } from 'next/server';
import { xrpl } from '@/scripts/hec/hec-utils';

const addresses = {
  issuer: "rzZgrzU4GzbB6jNVHCq3NmufYpQWGW7Ci",
  operator: "rwksWbwwP3f2R7GaDDi5d4vRA63ZXkLy92",
  beneficiary: "rEmgtkaitKbrrTrobdaUKr7u4tsm4euTiR",
  clinic: "r3PQXDp5BJndbeKiiQGVcRAP6Mc7NF1kqk",
};

const HEC_ISSUER = "rzZgrzU4GzbB6jNVHCq3NmufYpQWGW7Ci";

const addressToRole = {
  [addresses.issuer]: 'HealthPay Issuer',
  [addresses.operator]: 'ABC Corporation',
  [addresses.beneficiary]: 'Maria Worker',
  [addresses.clinic]: 'City Health Clinic',
};

function getType(from: string, to: string) {
  if (from === addresses.issuer && to === addresses.operator) return 'Mint';
  if (from === addresses.operator && to === addresses.beneficiary) return 'Distribute';
  if (from === addresses.beneficiary && to === addresses.clinic) return 'Pay';
  return 'Other';
}

export async function GET() {
  let client;
  try {
    client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
    await client.connect();
    const allAddresses = Object.values(addresses);
    let txs: any[] = [];
    // Fetch transactions for each account
    for (const addr of allAddresses) {
      const resp = await client.request({
        command: 'account_tx',
        account: addr,
        ledger_index_min: -1,
        ledger_index_max: -1,
        limit: 50,
        binary: false,
        forward: false,
      });
      txs = txs.concat(resp.result.transactions);
    }
    // Filter and deduplicate by hash
    const seen = new Set();
    const filtered = txs
      .filter((tx) => tx.tx.TransactionType === 'Payment' &&
        (allAddresses.includes(tx.tx.Account) || allAddresses.includes(tx.tx.Destination)) &&
        tx.tx.Amount && typeof tx.tx.Amount === 'object' &&
        tx.tx.Amount.currency === 'HEC' &&
        tx.tx.Amount.issuer === HEC_ISSUER
      )
      .filter((tx) => {
        if (seen.has(tx.tx.hash)) return false;
        seen.add(tx.tx.hash);
        return true;
      })
      .sort((a, b) => b.tx.date - a.tx.date)
      .slice(0, 50)
      .map((tx) => {
        const from = tx.tx.Account;
        const to = tx.tx.Destination;
        return {
          time: tx.tx.date ? new Date((tx.tx.date + 946684800) * 1000).toLocaleTimeString() : '',
          type: getType(from, to),
          from: addressToRole[from] || from,
          to: addressToRole[to] || to,
          amount: tx.tx.Amount.value,
          status: tx.meta.TransactionResult === 'tesSUCCESS' ? 'Completed' : tx.meta.TransactionResult,
        };
      });
    await client.disconnect();
    return NextResponse.json({ history: filtered });
  } catch (error) {
    if (client) await client.disconnect();
    return NextResponse.json({ history: [], error: 'Failed to fetch transaction history' }, { status: 500 });
  }
} 
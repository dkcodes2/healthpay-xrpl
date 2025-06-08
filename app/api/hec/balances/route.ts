import { NextResponse } from 'next/server';
import { xrpl } from '@/scripts/hec/hec-utils';

// Hardcoded addresses from .hec-state
const addresses = {
  issuer: "rzZgrzU4GzbB6jNVHCq3NmufYpQWGW7Ci",
  operator: "rwksWbwwP3f2R7GaDDi5d4vRA63ZXkLy92",
  beneficiary: "rEmgtkaitKbrrTrobdaUKr7u4tsm4euTiR",
  clinic: "r3PQXDp5BJndbeKiiQGVcRAP6Mc7NF1kqk",
};

export async function GET() {
  let client;
  let warning = '';
  try {
    // Try to fetch live balances from XRPL
    let balances: any = {
      issuer: '--',
      operator: '--',
      beneficiary: '--',
      clinic: '--',
    };
    try {
      client = new xrpl.Client('wss://s.altnet.rippletest.net:51233');
      await client.connect();

      // Helper to get balance for an account
      async function getBalance(key: string, address: string) {
        const resp = await client.request({
          command: 'account_lines',
          account: address
        });
        const hecLine = resp.result.lines.find(
          (line: any) => line.currency === 'HEC' && line.account === addresses.issuer
        );
        balances[key] = hecLine ? hecLine.balance : '0';
      }

      await getBalance('operator', addresses.operator);
      await getBalance('beneficiary', addresses.beneficiary);
      await getBalance('clinic', addresses.clinic);
    } catch (xrplError) {
      warning = 'XRPL is currently unreachable or slow. Balances may not be live.';
    } finally {
      if (client) await client.disconnect();
    }

    return NextResponse.json({ balances, addresses, warning });
  } catch (error) {
    // If something else goes wrong, return addresses if possible
    return NextResponse.json({
      balances: {
        issuer: '--',
        operator: '--',
        beneficiary: '--',
        clinic: '--',
      },
      addresses,
      warning: 'Unexpected error. Please check your server logs.'
    });
  }
} 
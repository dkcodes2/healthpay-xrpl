require('dotenv').config();
const { Client, Wallet } = require('xrpl');

const XRPL_WS = process.env.XRPL_ENDPOINT || 'wss://s.altnet.rippletest.net:51233';
// RLUSD as 20-byte hex (for XRPL currency codes longer than 3 chars)
const RLUSD_CODE = '524C555344000000000000000000000000000000';

const ISSUER_ADDRESS = process.env.ISSUER_ADDRESS;
const ISSUER_SECRET = process.env.ISSUER_SECRET;
const BENEFICIARY_ADDRESS = process.env.BENEFICIARY_ADDRESS;
const BENEFICIARY_SECRET = process.env.BENEFICIARY_SECRET;
const CLINIC_ADDRESS = process.env.CLINIC_ADDRESS;
const CLINIC_SECRET = process.env.CLINIC_SECRET;

async function setTrustLine(client, account, issuer, currency) {
  const trustSet = {
    TransactionType: 'TrustSet',
    Account: account.classicAddress,
    LimitAmount: {
      currency,
      issuer,
      value: '1000000',
    },
  };
  const result = await client.submitAndWait(trustSet, { wallet: account });
  console.log(`TrustSet for ${account.classicAddress}:`, result.result.meta.TransactionResult);
}

async function main() {
  const client = new Client(XRPL_WS);
  await client.connect();

  const issuer = Wallet.fromSecret(ISSUER_SECRET);
  const beneficiary = Wallet.fromSecret(BENEFICIARY_SECRET);
  const clinic = Wallet.fromSecret(CLINIC_SECRET);

  // Set trustlines
  await setTrustLine(client, beneficiary, issuer.classicAddress, RLUSD_CODE);
  await setTrustLine(client, clinic, issuer.classicAddress, RLUSD_CODE);

  await client.disconnect();
  console.log('Trustlines set up successfully.');
}

main().catch(console.error); 
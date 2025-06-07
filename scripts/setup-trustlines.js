require('dotenv').config();
const { Client, Wallet } = require('xrpl');

const XRPL_WS = process.env.XRPL_ENDPOINT || 'wss://s.altnet.rippletest.net:51233';
const RLUSDTEST_CODE = '524C555344000000000000000000000000000000';
//const USDTEST_CODE = '5553445445535400000000000000000000000000'; // 'USDTEST' in 20-byte hex

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
  try {
    const result = await client.submitAndWait(trustSet, { wallet: account });
    const txResult = result.result.meta.TransactionResult;
    const engineResult = result.result.engine_result;
    console.log(`TrustSet for ${account.classicAddress}: ${txResult} (engine_result: ${engineResult})`);
    if (txResult !== 'tesSUCCESS') {
      console.error('Full TrustSet result:', JSON.stringify(result.result, null, 2));
    }
    return txResult === 'tesSUCCESS';
  } catch (err) {
    console.error(`Error setting trustline for ${account.classicAddress}:`, err);
    return false;
  }
}

async function printTrustlines(client, address, label) {
  const resp = await client.request({
    command: 'account_lines',
    account: address,
    ledger_index: 'validated',
  });
  console.log(`\n${label} trustlines:`);
  for (const line of resp.result.lines) {
    console.log(`  currency: ${line.currency}, issuer: ${line.account}, balance: ${line.balance}`);
    // Print all flags and details
    console.log(`    no_ripple: ${line.no_ripple}, authorized: ${line.authorized}, freeze: ${line.freeze}, limit: ${line.limit}, limit_peer: ${line.limit_peer}`);
  }
}

async function main() {
  const client = new Client(XRPL_WS);
  await client.connect();

  const issuer = Wallet.fromSecret(ISSUER_SECRET);
  const beneficiary = Wallet.fromSecret(BENEFICIARY_SECRET);
  const clinic = Wallet.fromSecret(CLINIC_SECRET);

  // Set trustlines to the issuer only
  await setTrustLine(client, beneficiary, issuer.classicAddress, RLUSDTEST_CODE);
  await setTrustLine(client, clinic, issuer.classicAddress, RLUSDTEST_CODE);

  // Print trustlines for verification
  await printTrustlines(client, beneficiary.classicAddress, 'Beneficiary');
  await printTrustlines(client, clinic.classicAddress, 'Clinic');

  await client.disconnect();
  console.log('Trustlines set up and verified.');
}

main().catch(console.error); 
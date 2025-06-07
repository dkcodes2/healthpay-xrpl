require('xrpl').Client;
const { Client } = require('xrpl');

const XRPL_WS = process.env.XRPL_ENDPOINT || 'wss://s.altnet.rippletest.net:51233';

async function fundAccount(client) {
  // Use the faucet to fund a new wallet
  const { wallet } = await client.fundWallet();
  return wallet;
}

async function main() {
  const client = new Client(XRPL_WS);
  await client.connect();

  console.log('Funding Issuer account...');
  const issuer = await fundAccount(client);
  console.log('Issuer Address:', issuer.classicAddress);
  console.log('Issuer Seed:', issuer.seed);

  console.log('Funding Beneficiary account...');
  const beneficiary = await fundAccount(client);
  console.log('Beneficiary Address:', beneficiary.classicAddress);
  console.log('Beneficiary Seed:', beneficiary.seed);

  console.log('Funding Clinic account...');
  const clinic = await fundAccount(client);
  console.log('Clinic Address:', clinic.classicAddress);
  console.log('Clinic Seed:', clinic.seed);

  await client.disconnect();
  console.log('\nCopy these addresses and seeds into your .env file.');
}

main().catch(console.error); 
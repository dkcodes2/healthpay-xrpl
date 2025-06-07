require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

const ISSUER_ADDRESS = process.env.ISSUER_ADDRESS;
const BENEFICIARY_ADDRESS = process.env.BENEFICIARY_ADDRESS;
const CLINIC_ADDRESS = process.env.CLINIC_ADDRESS;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getRLUSDBalance(address) {
  const res = await axios.get(`${BASE_URL}/balance/${address}`);
  return res.data.rlusd;
}

async function pollBalance(address, label, expected, timeout = 20000, interval = 3000) {
  const start = Date.now();
  let last = null;
  while (Date.now() - start < timeout) {
    const bal = await getRLUSDBalance(address);
    if (bal !== last) {
      console.log(`${label} RLUSD: ${bal}`);
      if (expected === undefined || bal === expected) return bal;
      last = bal;
    }
    await sleep(interval);
  }
  console.log(`${label} RLUSD polling timed out. Last seen: ${last}`);
  return last;
}

async function checkBalance(address, label) {
  const res = await axios.get(`${BASE_URL}/balance/${address}`);
  console.log(`${label} RLUSD: ${res.data.rlusd}, XRP: ${res.data.xrp}`);
}

async function main() {
  // 1. Mint RLUSD to beneficiary (2.345 RLUSD)
  const mintAmountBeneficiary = '2.345';
  console.log(`\nMinting ${mintAmountBeneficiary} RLUSD to beneficiary...`);
  const mintResBeneficiary = await axios.post(`${BASE_URL}/mint-rlusd`, {
    toAddress: BENEFICIARY_ADDRESS,
    amount: mintAmountBeneficiary,
    memo: `Mint ${mintAmountBeneficiary} RLUSD to beneficiary`
  });
  console.log('Mint to beneficiary response:', mintResBeneficiary.data);
  await sleep(5000);
  await pollBalance(BENEFICIARY_ADDRESS, 'Beneficiary', undefined);

  // 2. Beneficiary sends 1.234 RLUSD to clinic
  const sendAmount1 = '1.234';
  console.log(`\nBeneficiary sends ${sendAmount1} RLUSD to clinic...`);
  const sendRes1 = await axios.post(`${BASE_URL}/pay-clinic`, {
    senderAddress: BENEFICIARY_ADDRESS,
    amount: sendAmount1,
    memo: `Send ${sendAmount1} RLUSD to clinic`
  });
  console.log('Beneficiary to clinic response 1:', sendRes1.data);
  await sleep(5000);
  await pollBalance(BENEFICIARY_ADDRESS, 'Beneficiary', undefined);
  await pollBalance(CLINIC_ADDRESS, 'Clinic', undefined);

  // 3. Beneficiary sends 0.123 RLUSD to clinic
  const sendAmount2 = '0.123';
  console.log(`\nBeneficiary sends ${sendAmount2} RLUSD to clinic...`);
  const sendRes2 = await axios.post(`${BASE_URL}/pay-clinic`, {
    senderAddress: BENEFICIARY_ADDRESS,
    amount: sendAmount2,
    memo: `Send ${sendAmount2} RLUSD to clinic`
  });
  console.log('Beneficiary to clinic response 2:', sendRes2.data);
  await sleep(5000);
  await pollBalance(BENEFICIARY_ADDRESS, 'Beneficiary', undefined);
  await pollBalance(CLINIC_ADDRESS, 'Clinic', undefined);
}

main().catch(err => {
  if (err.response) {
    console.error('API error:', err.response.data);
  } else {
    console.error(err);
  }
}); 
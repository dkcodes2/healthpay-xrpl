require('dotenv').config();
const { Client, Wallet } = require('xrpl');

const XRPL_WS = process.env.XRPL_ENDPOINT || 'wss://s.altnet.rippletest.net:51233';
const RLUSD_HEX = '524C555344000000000000000000000000000000';

// Required environment variables
const requiredEnvVars = [
  'ISSUER_ADDRESS',
  'ISSUER_SECRET',
  'BENEFICIARY_ADDRESS',
  'BENEFICIARY_SECRET',
  'CLINIC_ADDRESS',
  'CLINIC_SECRET',
  'XRPL_ENDPOINT'
];

async function checkAccountBalance(client, address, label) {
  try {
    const response = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });
    const xrpBalance = response.result.account_data.Balance;
    console.log(`\n${label} (${address}):`);
    console.log(`XRP Balance: ${Number(xrpBalance) / 1000000} XRP`);
    
    // Check trustlines
    const linesResponse = await client.request({
      command: 'account_lines',
      account: address,
      ledger_index: 'validated'
    });
    
    console.log('\nTrustlines:');
    for (const line of linesResponse.result.lines) {
      console.log(`  Currency: ${line.currency}`);
      console.log(`  Issuer: ${line.account}`);
      console.log(`  Balance: ${line.balance}`);
      console.log(`  Limit: ${line.limit}`);
      console.log(`  No Ripple: ${line.no_ripple}`);
      console.log(`  Authorized: ${line.authorized}`);
      console.log(`  Freeze: ${line.freeze}`);
      console.log('---');
    }
  } catch (error) {
    console.error(`Error checking ${label}:`, error.message);
  }
}

async function main() {
  console.log('Checking environment variables...\n');
  
  // Check environment variables
  let missingVars = false;
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      console.error(`Missing environment variable: ${varName}`);
      missingVars = true;
    } else {
      console.log(`${varName}: ${varName.includes('SECRET') ? '****' : process.env[varName]}`);
    }
  }
  
  if (missingVars) {
    console.error('\nPlease set all required environment variables before proceeding.');
    process.exit(1);
  }
  
  console.log('\nConnecting to XRPL...');
  const client = new Client(XRPL_WS);
  try {
    await client.connect();
    console.log('Connected successfully!\n');
    
    // Check all accounts
    await checkAccountBalance(client, process.env.ISSUER_ADDRESS, 'Issuer');
    await checkAccountBalance(client, process.env.BENEFICIARY_ADDRESS, 'Beneficiary');
    await checkAccountBalance(client, process.env.CLINIC_ADDRESS, 'Clinic');
    
    await client.disconnect();
  } catch (error) {
    console.error('Error connecting to XRPL:', error.message);
    process.exit(1);
  }
}

main().catch(console.error); 
# Health Coin (HEC) Implementation

This directory contains the implementation of Health Coin (HEC), a custom token on the XRP Ledger designed for use within the health ecosystem.

## Features

- Whitelisted token system (RequireAuth enabled)
- 1:1 peg with RLUSD (backed by RLUSD in treasury)
- Compliance features (clawback, freeze capabilities)
- Secure issuer/operator wallet separation
- Trust line authorization system

## Files

- `hec-implementation.js`: Core HEC implementation class
- `hec-demo.js`: Demo script to test HEC functionality

## Setup

1. Ensure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Demo

To run the demo script:

```bash
node scripts/hec/hec-demo.js
```

The demo will:
1. Create issuer and operator wallets
2. Set up security flags
3. Create a test holder wallet
4. Whitelist the holder
5. Mint HEC tokens
6. Perform a test transfer
7. Display final balances

## Security Features

- **RequireAuth**: Only whitelisted accounts can hold HEC
- **AllowClawback**: Enables token recovery if needed
- **Freeze Capability**: Can freeze individual trust lines
- **Issuer/Operator Split**: Cold issuer wallet for governance, hot operator wallet for daily operations

## Production Considerations

Before moving to production:
1. Change `NETWORK` to "mainnet" in `hec-implementation.js`
2. Update `RPC_ENDPOINT` to mainnet endpoint
3. Ensure proper key management for issuer and operator wallets
4. Implement proper backup procedures for wallet secrets
5. Set up monitoring for the treasury balance

## Integration

To integrate HEC into your application:

```javascript
const HECImplementation = require('./hec-implementation');

const hec = new HECImplementation();
await hec.initialize();

// Whitelist a new account
await hec.whitelistAccount(holderAddress);

// Mint HEC
await hec.mintHEC(amount, destination);

// Transfer HEC
await hec.transferHEC(fromWallet, toAddress, amount);
```

## Compliance

- Maintain 1:1 RLUSD backing in treasury
- Document all minting and burning operations
- Keep audit trail of all transactions
- Implement KYC/AML procedures for whitelisting 
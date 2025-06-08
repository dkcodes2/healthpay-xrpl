const xrpl = require('xrpl');

// Configuration
const CONFIG = {
    CURRENCY: "HEC",
    NETWORK: "testnet", // Change to "mainnet" for production
    RPC_ENDPOINT: "wss://s.altnet.rippletest.net:51233",
    MIN_XRP_RESERVE: "25", // Increased reserve for better stability
};

class HECImplementation {
    constructor() {
        this.client = null;
        this.issuerWallet = null;
        this.operatorWallet = null;
    }

    async initialize() {
        // Connect to XRPL
        this.client = new xrpl.Client(CONFIG.RPC_ENDPOINT);
        await this.client.connect();
        console.log("Connected to XRPL");
    }

    async createWallets() {
        try {
            // Create issuer wallet
            const issuerWallet = xrpl.Wallet.generate();
            const issuerFunded = await this.client.fundWallet({
                address: issuerWallet.address,
                amount: CONFIG.MIN_XRP_RESERVE
            });
            this.issuerWallet = issuerFunded.wallet;
            console.log("Issuer wallet created:", this.issuerWallet.address);

            // Create operator wallet
            const operatorWallet = xrpl.Wallet.generate();
            const operatorFunded = await this.client.fundWallet({
                address: operatorWallet.address,
                amount: CONFIG.MIN_XRP_RESERVE
            });
            this.operatorWallet = operatorFunded.wallet;
            console.log("Operator wallet created:", this.operatorWallet.address);

            return {
                issuer: this.issuerWallet,
                operator: this.operatorWallet
            };
        } catch (error) {
            console.error("Error creating wallets:", error);
            throw error;
        }
    }

    async setupIssuerSecurity() {
        try {
            // Enable RequireAuth flag
            const accountSet = {
                TransactionType: "AccountSet",
                Account: this.issuerWallet.address,
                SetFlag: xrpl.AccountSetAsfRequireAuth
            };
            const autofilledAccountSet = await this.client.autofill(accountSet);
            await this.client.submitAndWait(autofilledAccountSet, { wallet: this.issuerWallet });
            console.log("RequireAuth flag enabled for issuer");

            // Enable AllowClawback flag
            const clawbackFlag = {
                TransactionType: "AccountSet",
                Account: this.issuerWallet.address,
                SetFlag: xrpl.AccountSetAsfAllowClawback
            };
            const autofilledClawback = await this.client.autofill(clawbackFlag);
            await this.client.submitAndWait(autofilledClawback, { wallet: this.issuerWallet });
            console.log("AllowClawback flag enabled for issuer");
        } catch (error) {
            console.error("Error setting up issuer security:", error);
            throw error;
        }
    }

    async whitelistAccount(holderWallet, limit = "1000000") {
        try {
            // 1. Holder creates the trust line (signed by holder)
            const trustSetHolder = {
                TransactionType: "TrustSet",
                Account: holderWallet.address,
                LimitAmount: {
                    currency: CONFIG.CURRENCY,
                    issuer: this.issuerWallet.address, // counter-party is issuer
                    value: limit
                }
            };

            // Let the client handle LastLedgerSequence and other fields
            const autofilledTrustSet = await this.client.autofill(trustSetHolder);
            await this.client.submitAndWait(autofilledTrustSet, { wallet: holderWallet });
            console.log(`Trust line created for ${holderWallet.address}`);

            // 2. Issuer authorises the line (signed by issuer)
            const authorise = {
                TransactionType: "TrustSet",
                Account: this.issuerWallet.address,
                Flags: xrpl.TrustSetAuth,
                LimitAmount: {
                    currency: CONFIG.CURRENCY,
                    issuer: holderWallet.address, // counter-party is holder
                    value: "0"
                }
            };

            // Let the client handle LastLedgerSequence and other fields
            const autofilledAuthorise = await this.client.autofill(authorise);
            await this.client.submitAndWait(autofilledAuthorise, { wallet: this.issuerWallet });
            console.log(`Trust line authorized for ${holderWallet.address}`);

            // Verify the trust line was created and authorized
            const trustLines = await this.client.request({
                command: "account_lines",
                account: holderWallet.address,
                peer: this.issuerWallet.address
            });

            if (trustLines.result.lines.length === 0) {
                throw new Error("Trust line verification failed");
            }

            console.log("Trust line verified successfully");
            return trustLines.result.lines[0];
        } catch (error) {
            console.error("Error whitelisting account:", error);
            if (error.data) {
                console.error("Error details:", error.data);
            }
            throw error;
        }
    }

    async mintHEC(amount, destination) {
        try {
            const payment = {
                TransactionType: "Payment",
                Account: this.issuerWallet.address,
                Destination: destination,
                Amount: {
                    currency: CONFIG.CURRENCY,
                    value: amount,
                    issuer: this.issuerWallet.address
                }
            };
            const autofilledPayment = await this.client.autofill(payment);
            await this.client.submitAndWait(autofilledPayment, { wallet: this.issuerWallet });
            console.log(`Minted ${amount} HEC to ${destination}`);
        } catch (error) {
            console.error("Error minting HEC:", error);
            throw error;
        }
    }

    async transferHEC(fromWallet, toAddress, amount) {
        try {
            const payment = {
                TransactionType: "Payment",
                Account: fromWallet.address,
                Destination: toAddress,
                Amount: {
                    currency: CONFIG.CURRENCY,
                    value: amount,
                    issuer: this.issuerWallet.address
                }
            };
            const autofilledPayment = await this.client.autofill(payment);
            await this.client.submitAndWait(autofilledPayment, { wallet: fromWallet });
            console.log(`Transferred ${amount} HEC from ${fromWallet.address} to ${toAddress}`);
        } catch (error) {
            console.error("Error transferring HEC:", error);
            throw error;
        }
    }

    async freezeAccount(targetAddress) {
        try {
            const freeze = {
                TransactionType: "TrustSet",
                Account: this.issuerWallet.address,
                LimitAmount: {
                    currency: CONFIG.CURRENCY,
                    issuer: this.issuerWallet.address,
                    value: "0"
                },
                Flags: xrpl.TrustSetFreeze,
                Destination: targetAddress
            };
            const autofilledFreeze = await this.client.autofill(freeze);
            await this.client.submitAndWait(autofilledFreeze, { wallet: this.issuerWallet });
            console.log(`Froze account ${targetAddress}`);
        } catch (error) {
            console.error("Error freezing account:", error);
            throw error;
        }
    }

    async getBalance(address) {
        try {
            const response = await this.client.request({
                command: "account_lines",
                account: address,
                peer: this.issuerWallet.address
            });
            return response.result.lines;
        } catch (error) {
            console.error("Error getting balance:", error);
            throw error;
        }
    }

    async disconnect() {
        await this.client.disconnect();
        console.log("Disconnected from XRPL");
    }
}

module.exports = HECImplementation; 
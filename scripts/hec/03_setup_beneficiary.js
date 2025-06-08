const { xrpl, readState, writeState } = require("./hec-utils");

(async () => {
    let client;
    try {
        console.log("Connecting to XRPL...");
        client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await client.connect();
        console.log("Connected to XRPL");

        // Read existing state
        const issuer = readState("issuer");
        const operator = readState("operator");
        if (!issuer || !operator) {
            throw new Error("Issuer or operator state not found. Please run 01_setup_issuer.js and 02_setup_operator.js first.");
        }

        console.log("\nCreating new beneficiary wallet...");
        const beneficiary = xrpl.Wallet.generate();
        const fundedBeneficiary = await client.fundWallet({ wallet: beneficiary, amount: "25" });
        console.log("Beneficiary wallet created and funded:", fundedBeneficiary.wallet.address);

        // Create trust line from beneficiary to issuer
        console.log("\nSetting up trust line from beneficiary to issuer...");
        const trustSetTx = {
            TransactionType: "TrustSet",
            Account: fundedBeneficiary.wallet.address,
            LimitAmount: {
                currency: "HEC",
                issuer: issuer.address,
                value: "1000000" // High limit for testing
            }
        };

        const preparedTrustSet = await client.autofill(trustSetTx);
        const trustSetResult = await client.submitAndWait(preparedTrustSet, { wallet: fundedBeneficiary.wallet });
        
        if (trustSetResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to create trust line: ${trustSetResult.result.meta.TransactionResult}`);
        }
        console.log("Trust line created from beneficiary to issuer");

        // Authorize trust line from issuer to beneficiary
        console.log("\nAuthorizing trust line from issuer to beneficiary...");
        const issuerWallet = xrpl.Wallet.fromSeed(issuer.secret);
        const authorizeTx = {
            TransactionType: "TrustSet",
            Account: issuer.address,
            Flags: xrpl.TrustSetAuth,
            LimitAmount: {
                currency: "HEC",
                issuer: fundedBeneficiary.wallet.address,
                value: "0"
            }
        };

        const preparedAuthorize = await client.autofill(authorizeTx);
        const authorizeResult = await client.submitAndWait(preparedAuthorize, { wallet: issuerWallet });
        
        if (authorizeResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to authorize trust line: ${authorizeResult.result.meta.TransactionResult}`);
        }
        console.log("Trust line authorized from issuer to beneficiary");

        // Verify trust line
        console.log("\nVerifying trust line...");
        const trustLines = await client.request({
            command: "account_lines",
            account: fundedBeneficiary.wallet.address,
            peer: issuer.address
        });

        const hecTrustLine = trustLines.result.lines.find(
            line => line.currency === "HEC" && line.account === issuer.address
        );

        if (!hecTrustLine) {
            throw new Error("Trust line verification failed");
        }

        console.log("Trust line verified successfully");

        // Save beneficiary state
        writeState("beneficiary", {
            address: fundedBeneficiary.wallet.address,
            secret: fundedBeneficiary.wallet.seed
        });
        console.log("\nBeneficiary ready:", fundedBeneficiary.wallet.address);
        console.log("State saved to .hec-state/beneficiary.json");

    } catch (error) {
        console.error("Error:", error);
        if (error.data) {
            console.error("Error details:", error.data);
        }
    } finally {
        if (client) {
            await client.disconnect();
            console.log("\nDisconnected from XRPL");
        }
    }
})(); 
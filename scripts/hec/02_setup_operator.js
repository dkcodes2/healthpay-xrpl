const { xrpl, readState, writeState } = require("./hec-utils");

(async () => {
    let client;
    try {
        // Read issuer state
        const issuer = readState("issuer");
        if (!issuer) {
            throw new Error("Issuer state not found. Please run 01_setup_issuer.js first.");
        }
        console.log("Read issuer state:", issuer.address);

        console.log("\nConnecting to XRPL...");
        client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await client.connect();
        console.log("Connected to XRPL");

        console.log("\nCreating operator wallet...");
        const operator = xrpl.Wallet.generate();
        const fundedOperator = await client.fundWallet({ wallet: operator, amount: "25" });
        console.log("Operator wallet created and funded:", fundedOperator.wallet.address);

        // Create trust line from operator to issuer
        console.log("\nSetting up operator trust line...");
        const trustSetTx = {
            TransactionType: "TrustSet",
            Account: fundedOperator.wallet.address,
            LimitAmount: {
                currency: "HEC",
                issuer: issuer.address,
                value: "1000000" // High limit for testing
            }
        };

        const preparedTrustSet = await client.autofill(trustSetTx);
        const trustSetResult = await client.submitAndWait(preparedTrustSet, { wallet: fundedOperator.wallet });
        
        if (trustSetResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to create trust line: ${trustSetResult.result.meta.TransactionResult}`);
        }
        console.log("Trust line created");

        // Authorize trust line from issuer to operator
        console.log("\nAuthorizing trust line from issuer...");
        const issuerWallet = xrpl.Wallet.fromSeed(issuer.secret);
        const authorizeTx = {
            TransactionType: "TrustSet",
            Account: issuer.address,
            Flags: xrpl.TrustSetAuth,
            LimitAmount: {
                currency: "HEC",
                issuer: fundedOperator.wallet.address,
                value: "0"
            }
        };

        const preparedAuthorize = await client.autofill(authorizeTx);
        const authorizeResult = await client.submitAndWait(preparedAuthorize, { wallet: issuerWallet });
        
        if (authorizeResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to authorize trust line: ${authorizeResult.result.meta.TransactionResult}`);
        }
        console.log("Trust line authorized");

        // Save operator state
        writeState("operator", {
            address: fundedOperator.wallet.address,
            secret: fundedOperator.wallet.seed
        });
        console.log("\nOperator setup complete!");
        console.log("Operator address:", fundedOperator.wallet.address);

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
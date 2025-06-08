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

        console.log("\nCreating new clinic wallet...");
        const clinic = xrpl.Wallet.generate();
        const fundedClinic = await client.fundWallet({ wallet: clinic, amount: "25" });
        console.log("Clinic wallet created and funded:", fundedClinic.wallet.address);

        // Create trust line from clinic to issuer
        console.log("\nSetting up trust line from clinic to issuer...");
        const trustSetTx = {
            TransactionType: "TrustSet",
            Account: fundedClinic.wallet.address,
            LimitAmount: {
                currency: "HEC",
                issuer: issuer.address,
                value: "1000000" // High limit for testing
            }
        };

        const preparedTrustSet = await client.autofill(trustSetTx);
        const trustSetResult = await client.submitAndWait(preparedTrustSet, { wallet: fundedClinic.wallet });
        
        if (trustSetResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to create trust line: ${trustSetResult.result.meta.TransactionResult}`);
        }
        console.log("Trust line created from clinic to issuer");

        // Authorize trust line from issuer to clinic
        console.log("\nAuthorizing trust line from issuer to clinic...");
        const issuerWallet = xrpl.Wallet.fromSeed(issuer.secret);
        const authorizeTx = {
            TransactionType: "TrustSet",
            Account: issuer.address,
            Flags: xrpl.TrustSetAuth,
            LimitAmount: {
                currency: "HEC",
                issuer: fundedClinic.wallet.address,
                value: "0"
            }
        };

        const preparedAuthorize = await client.autofill(authorizeTx);
        const authorizeResult = await client.submitAndWait(preparedAuthorize, { wallet: issuerWallet });
        
        if (authorizeResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to authorize trust line: ${authorizeResult.result.meta.TransactionResult}`);
        }
        console.log("Trust line authorized from issuer to clinic");

        // Verify trust line
        console.log("\nVerifying trust line...");
        const trustLines = await client.request({
            command: "account_lines",
            account: fundedClinic.wallet.address,
            peer: issuer.address
        });

        const hecTrustLine = trustLines.result.lines.find(
            line => line.currency === "HEC" && line.account === issuer.address
        );

        if (!hecTrustLine) {
            throw new Error("Trust line verification failed");
        }

        console.log("Trust line verified successfully");

        // Save clinic state
        writeState("clinic", {
            address: fundedClinic.wallet.address,
            secret: fundedClinic.wallet.seed
        });
        console.log("\nClinic ready:", fundedClinic.wallet.address);
        console.log("State saved to .hec-state/clinic.json");

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
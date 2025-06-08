const { xrpl, readState } = require("./hec-utils");

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

        console.log("\nMinting HEC tokens to operator...");
        const issuerWallet = xrpl.Wallet.fromSeed(issuer.secret);
        
        const mintTx = {
            TransactionType: "Payment",
            Account: issuer.address,
            Destination: operator.address,
            Amount: {
                currency: "HEC",
                value: "1000",
                issuer: issuer.address
            }
        };

        const preparedMint = await client.autofill(mintTx);
        const mintResult = await client.submitAndWait(preparedMint, { wallet: issuerWallet });
        
        if (mintResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to mint tokens: ${mintResult.result.meta.TransactionResult}`);
        }

        console.log("Successfully minted 1000 HEC to operator");

        // Verify operator balance
        const operatorBalance = await client.request({
            command: "account_lines",
            account: operator.address,
            peer: issuer.address
        });

        const hecBalance = operatorBalance.result.lines.find(
            line => line.currency === "HEC" && line.account === issuer.address
        );

        if (!hecBalance) {
            throw new Error("Failed to verify operator balance");
        }

        console.log("Operator HEC balance:", hecBalance.balance);

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
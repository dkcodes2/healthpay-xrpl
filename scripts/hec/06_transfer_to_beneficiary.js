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
        const beneficiary = readState("beneficiary");
        if (!issuer || !operator || !beneficiary) {
            throw new Error("Required state not found. Please run all setup scripts first.");
        }

        console.log("\nTransferring HEC tokens from operator to beneficiary...");
        const operatorWallet = xrpl.Wallet.fromSeed(operator.secret);
        
        const transferTx = {
            TransactionType: "Payment",
            Account: operator.address,
            Destination: beneficiary.address,
            Amount: {
                currency: "HEC",
                value: "500",
                issuer: issuer.address
            }
        };

        const preparedTransfer = await client.autofill(transferTx);
        const transferResult = await client.submitAndWait(preparedTransfer, { wallet: operatorWallet });
        
        if (transferResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to transfer tokens: ${transferResult.result.meta.TransactionResult}`);
        }

        console.log("Successfully transferred 500 HEC to beneficiary");

        // Verify beneficiary balance
        const beneficiaryBalance = await client.request({
            command: "account_lines",
            account: beneficiary.address,
            peer: issuer.address
        });

        const hecBalance = beneficiaryBalance.result.lines.find(
            line => line.currency === "HEC" && line.account === issuer.address
        );

        if (!hecBalance) {
            throw new Error("Failed to verify beneficiary balance");
        }

        console.log("Beneficiary HEC balance:", hecBalance.balance);

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
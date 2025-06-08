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
        const beneficiary = readState("beneficiary");
        const clinic = readState("clinic");
        if (!issuer || !beneficiary || !clinic) {
            throw new Error("Required state not found. Please run all setup scripts first.");
        }

        console.log("\nTransferring HEC tokens from beneficiary to clinic...");
        const beneficiaryWallet = xrpl.Wallet.fromSeed(beneficiary.secret);
        
        const paymentTx = {
            TransactionType: "Payment",
            Account: beneficiary.address,
            Destination: clinic.address,
            Amount: {
                currency: "HEC",
                value: "200",
                issuer: issuer.address
            }
        };

        const preparedPayment = await client.autofill(paymentTx);
        const paymentResult = await client.submitAndWait(preparedPayment, { wallet: beneficiaryWallet });
        
        if (paymentResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to transfer tokens: ${paymentResult.result.meta.TransactionResult}`);
        }

        console.log("Successfully transferred 200 HEC to clinic");

        // Verify clinic balance
        const clinicBalance = await client.request({
            command: "account_lines",
            account: clinic.address,
            peer: issuer.address
        });

        const hecBalance = clinicBalance.result.lines.find(
            line => line.currency === "HEC" && line.account === issuer.address
        );

        if (!hecBalance) {
            throw new Error("Failed to verify clinic balance");
        }

        console.log("Clinic HEC balance:", hecBalance.balance);

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
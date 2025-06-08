const { xrpl, readState } = require("./hec-utils");

(async () => {
    try {
        console.log("Connecting to XRPL...");
        const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await client.connect();
        console.log("Connected to XRPL");

        // Read existing state
        const issuer = readState("issuer");
        const beneficiary = readState("beneficiary");
        const clinic = readState("clinic");
        if (!issuer || !beneficiary || !clinic) {
            throw new Error("Required state not found. Please run all setup scripts first.");
        }

        console.log("\nTransferring HEC from beneficiary to clinic...");
        const beneficiaryWallet = xrpl.Wallet.fromSeed(beneficiary.secret);
        
        const paymentTx = {
            TransactionType: "Payment",
            Account: beneficiary.address,
            Destination: clinic.address,
            Amount: {
                currency: "HEC",
                value: "150", // Payment amount to clinic
                issuer: issuer.address
            }
        };

        const preparedPayment = await client.autofill(paymentTx);
        const paymentResult = await client.submitAndWait(preparedPayment, { wallet: beneficiaryWallet });
        
        if (paymentResult.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to make payment: ${paymentResult.result.meta.TransactionResult}`);
        }

        console.log("Successfully transferred 150 HEC to clinic");

        // Verify balances
        console.log("\nVerifying final balances...");
        const beneficiaryBalance = await client.request({
            command: "account_lines",
            account: beneficiary.address,
            peer: issuer.address
        });
        const clinicBalance = await client.request({
            command: "account_lines",
            account: clinic.address,
            peer: issuer.address
        });

        const beneficiaryHecBalance = beneficiaryBalance.result.lines.find(
            line => line.currency === "HEC" && line.account === issuer.address
        );
        const clinicHecBalance = clinicBalance.result.lines.find(
            line => line.currency === "HEC" && line.account === issuer.address
        );

        console.log("\nFinal balances:");
        console.log("Beneficiary HEC balance:", beneficiaryHecBalance ? beneficiaryHecBalance.balance : "0");
        console.log("Clinic HEC balance:", clinicHecBalance ? clinicHecBalance.balance : "0");

    } catch (error) {
        console.error("Error:", error);
        if (error.data) {
            console.error("Error details:", error.data);
        }
    } finally {
        await client.disconnect();
        console.log("\nDisconnected from XRPL");
    }
})(); 
const { xrpl } = require("./hec-utils");

(async () => {
    try {
        console.log("Connecting to XRPL...");
        const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await client.connect();
        console.log("Connected to XRPL");

        // List of old accounts to deactivate
        const oldAccounts = [
            "rD17PhDZFEw4h1YQZfAqDwD5GpVSP5q9hu", // Issuer
            "r9qeSRa7WPSgnN8DhnMuHfCZqztRF7n2YJ", // Operator
            "rGp1dL7wMGGkWRNyCTPxbabsFgjPge3uuf", // Beneficiary
            "rwMGwziGkC93taY7zBgcFqzUGA4obPQYfZ"  // Clinic
        ];

        // Create a new account to receive the remaining XRP
        console.log("\nCreating new account to receive remaining XRP...");
        const receiver = xrpl.Wallet.generate();
        const fundedReceiver = await client.fundWallet({ wallet: receiver, amount: "10" });
        console.log("Receiver account created:", fundedReceiver.wallet.address);

        // Deactivate each old account
        for (const oldAddress of oldAccounts) {
            try {
                console.log(`\nDeactivating account ${oldAddress}...`);
                
                // Get the account's current balance
                const balance = await client.getXrpBalance(oldAddress);
                console.log(`Current balance: ${balance} XRP`);

                if (parseFloat(balance) > 10) { // Only transfer if there's more than reserve
                    const transferAmount = (parseFloat(balance) - 10).toString(); // Leave 10 XRP for reserve
                    
                    const payment = {
                        TransactionType: "Payment",
                        Account: oldAddress,
                        Destination: fundedReceiver.wallet.address,
                        Amount: xrpl.xrpToDrops(transferAmount)
                    };

                    const prepared = await client.autofill(payment);
                    const result = await client.submitAndWait(prepared, { wallet: xrpl.Wallet.fromSeed(oldAddress) });
                    
                    if (result.result.meta.TransactionResult === 'tesSUCCESS') {
                        console.log(`Successfully transferred ${transferAmount} XRP`);
                    } else {
                        console.log(`Failed to transfer: ${result.result.meta.TransactionResult}`);
                    }
                } else {
                    console.log("Insufficient balance to transfer");
                }
            } catch (error) {
                console.log(`Error processing account ${oldAddress}:`, error.message);
            }
        }

        console.log("\nOld accounts have been deactivated");
        console.log("Remaining XRP has been sent to:", fundedReceiver.wallet.address);

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
const { xrpl, writeState } = require("./hec-utils");

(async () => {
    let client;
    try {
        console.log("Connecting to XRPL...");
        client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await client.connect();
        console.log("Connected to XRPL");

        console.log("\nCreating issuer wallet...");
        const issuerWallet = xrpl.Wallet.generate();
        const fundResult = await client.fundWallet(issuerWallet);
        console.log("Issuer wallet created and funded:", issuerWallet.address);

        console.log("\nSetting DefaultRipple flag on issuer...");
        const setFlagTx = {
            TransactionType: "AccountSet",
            Account: issuerWallet.address,
            SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple
        };
        const prepared = await client.autofill(setFlagTx);
        const result = await client.submitAndWait(prepared, { wallet: issuerWallet });
        if (result.result.meta.TransactionResult !== 'tesSUCCESS') {
            throw new Error(`Failed to set DefaultRipple: ${result.result.meta.TransactionResult}`);
        }
        console.log("DefaultRipple flag set successfully.");

        // Save issuer state
        writeState("issuer", {
            address: issuerWallet.address,
            secret: issuerWallet.seed
        });
        console.log("\nIssuer ready:", issuerWallet.address);
        console.log("State saved to .hec-state/issuer.json");

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
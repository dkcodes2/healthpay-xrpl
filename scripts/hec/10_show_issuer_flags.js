const { xrpl, readState } = require("./hec-utils");

(async () => {
    let client;
    try {
        client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await client.connect();
        console.log("Connected to XRPL\n");

        const issuer = readState("issuer");
        if (!issuer) {
            throw new Error("Issuer state not found. Please run 01_setup_issuer.js first.");
        }

        const resp = await client.request({
            command: "account_info",
            account: issuer.address
        });
        const flags = resp.result.account_data.Flags;
        console.log(`Issuer address: ${issuer.address}`);
        console.log(`Account Flags: ${flags}`);

        // Print out known flag meanings
        const flagMap = {
            0x00010000: "DefaultRipple",
            0x00020000: "DepositAuth",
            0x00040000: "DisableMaster",
            0x00100000: "DisallowXRP",
            0x00200000: "AccountTxnID",
            0x00400000: "NoFreeze",
            0x00800000: "GlobalFreeze",
            0x01000000: "RequireAuth",
            0x02000000: "OptionalAuth",
            0x04000000: "RequireDestTag"
        };
        for (const [bit, name] of Object.entries(flagMap)) {
            if ((flags & bit) !== 0) {
                console.log(`  - ${name}`);
            }
        }
    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            await client.disconnect();
            console.log("\nDisconnected from XRPL");
        }
    }
})(); 
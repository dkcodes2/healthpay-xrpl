const { xrpl, readState } = require("./hec-utils");

(async () => {
    let client;
    try {
        client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await client.connect();
        console.log("Connected to XRPL\n");

        const operator = readState("operator");
        const beneficiary = readState("beneficiary");
        const clinic = readState("clinic");
        if (!operator || !beneficiary || !clinic) {
            throw new Error("Required state not found. Please run setup scripts first.");
        }

        // Helper to print trust lines
        async function printTrustLines(account, label) {
            const resp = await client.request({
                command: "account_lines",
                account: account.address
            });
            console.log(`Trust lines for ${label} (${account.address}):`);
            if (resp.result.lines.length === 0) {
                console.log("  (none)");
            } else {
                for (const line of resp.result.lines) {
                    console.log(`  Currency: ${line.currency}`);
                    console.log(`  Issuer:   ${line.account}`);
                    console.log(`  Balance:  ${line.balance}`);
                    console.log(`  Flags:    ${line.flags}`);
                    console.log(`    no_ripple: ${line.no_ripple}`);
                    console.log(`    no_ripple_peer: ${line.no_ripple_peer}`);
                    console.log(`    authorized: ${line.authorized}`);
                    console.log(`    freeze: ${line.freeze}`);
                    console.log("");
                }
            }
        }

        await printTrustLines(operator, "operator");
        await printTrustLines(beneficiary, "beneficiary");
        await printTrustLines(clinic, "clinic");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (client) {
            await client.disconnect();
            console.log("\nDisconnected from XRPL");
        }
    }
})(); 
const { xrpl, readState } = require("./hec-utils");

(async () => {
    try {
        console.log("Connecting to XRPL...");
        const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
        await client.connect();
        console.log("Connected to XRPL");

        // Read all states
        const states = {
            issuer: readState("issuer"),
            operator: readState("operator"),
            beneficiary: readState("beneficiary"),
            clinic: readState("clinic")
        };

        // Filter out undefined states
        const activeAccounts = Object.entries(states)
            .filter(([_, state]) => state !== undefined)
            .map(([name, state]) => ({ name, address: state.address }));

        if (activeAccounts.length === 0) {
            console.log("No active accounts found in state. Please run the setup scripts first.");
            return;
        }

        console.log("\nFetching balances for active accounts...");
        
        for (const account of activeAccounts) {
            console.log(`\n${account.name.toUpperCase()} (${account.address}):`);
            
            // Get XRP balance
            const xrpBalance = await client.getXrpBalance(account.address);
            console.log(`XRP Balance: ${xrpBalance}`);

            // Get HEC balance if issuer exists
            if (states.issuer) {
                const hecBalance = await client.request({
                    command: "account_lines",
                    account: account.address,
                    peer: states.issuer.address
                });

                const hecLine = hecBalance.result.lines.find(
                    line => line.currency === "HEC" && line.account === states.issuer.address
                );

                console.log(`HEC Balance: ${hecLine ? hecLine.balance : "0"}`);
            }
        }

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
const HECImplementation = require('./hec-implementation');
const xrpl = require('xrpl');

async function runDemo() {
    const hec = new HECImplementation();
    
    try {
        // Initialize connection
        await hec.initialize();
        
        // Create wallets
        console.log("\nCreating wallets...");
        const wallets = await hec.createWallets();
        console.log("\nWallets created:");
        console.log("Issuer:", wallets.issuer.address);
        console.log("Operator:", wallets.operator.address);
        
        // Setup issuer security
        console.log("\nSetting up issuer security...");
        await hec.setupIssuerSecurity();
        
        // Create a test holder wallet
        console.log("\nCreating test holder wallet...");
        const holderWallet = xrpl.Wallet.generate();
        const holderFunded = await hec.client.fundWallet({
            address: holderWallet.address,
            amount: "25" // Increased reserve for better stability
        });
        const fundedHolderWallet = holderFunded.wallet;
        console.log("Test holder wallet created:", fundedHolderWallet.address);
        
        // Whitelist the holder
        console.log("\nWhitelisting holder...");
        await hec.whitelistAccount(fundedHolderWallet);
        
        // Mint some HEC to the holder
        console.log("\nMinting HEC to holder...");
        await hec.mintHEC("1000", fundedHolderWallet.address);
        
        // Check holder's balance
        console.log("\nChecking holder's balance...");
        const balance = await hec.getBalance(fundedHolderWallet.address);
        console.log("Holder's balance:", balance);
        
        // Transfer some HEC to the operator
        console.log("\nTransferring HEC to operator...");
        await hec.transferHEC(fundedHolderWallet, wallets.operator.address, "500");
        
        // Check final balances
        console.log("\nChecking final balances...");
        const holderFinalBalance = await hec.getBalance(fundedHolderWallet.address);
        const operatorFinalBalance = await hec.getBalance(wallets.operator.address);
        
        console.log("\nFinal balances:");
        console.log("Holder:", holderFinalBalance);
        console.log("Operator:", operatorFinalBalance);
        
    } catch (error) {
        console.error("\nError in demo:", error);
        if (error.data) {
            console.error("Error details:", error.data);
        }
    } finally {
        await hec.disconnect();
    }
}

// Add proper error handling for the main execution
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
    process.exit(1);
});

runDemo(); 
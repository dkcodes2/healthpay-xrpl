const { Client, Wallet } = require("xrpl");
require("dotenv/config");

const XRPL_WS = process.env.XRPL_ENDPOINT || "wss://s.altnet.rippletest.net:51233";
const ISSUER_SECRET = process.env.ISSUER_SECRET;
const client = new Client(XRPL_WS);

(async () => {
  await client.connect();
  const issuer = Wallet.fromSecret(ISSUER_SECRET);

  const tx = {
    TransactionType: "AccountSet",
    Account: issuer.classicAddress,
    SetFlag: 8   // tfDefaultRipple
  };

  const resp = await client.submitAndWait(tx, { wallet: issuer });
  console.log("Set DefaultRipple:", resp.result.meta.TransactionResult); // should be tesSUCCESS
  await client.disconnect();
})(); 
import { Client, Wallet } from "xrpl"

async function setupHealthCreditToken() {
  const client = new Client("wss://s.altnet.rippletest.net:51233")
  await client.connect()
  const issuer = Wallet.fromSecret(process.env.ISSUER_SECRET!)
  await client.submitAndWait({
    TransactionType: "AccountSet",
    Account: issuer.address,
    SetFlag: 8,
  }, { wallet: issuer })
  console.log("Token issuer setup complete")
  await client.disconnect()
}

setupHealthCreditToken().catch(console.error)

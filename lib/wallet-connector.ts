import { XummSdk } from "xumm-sdk"

const xumm = new XummSdk(process.env.XUMM_API_KEY!, process.env.XUMM_API_SECRET!)

export async function connectWallet(): Promise<string> {
  const request = await xumm.payload.create({
    TransactionType: "SignIn",
  })
  return request.next.always
}

export async function checkConnection(payloadId: string): Promise<string | null> {
  const result = await xumm.payload.get(payloadId)
  if (result.meta.signed) {
    return result.response.account
  }
  return null
}

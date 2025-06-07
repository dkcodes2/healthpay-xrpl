"use client"

import { useState, useEffect } from "react"
import { connectWallet, checkConnection } from "@/lib/wallet-connector"
import { Button } from "@/components/ui/button"

export default function WalletConnector({ onConnected }: { onConnected?: (addr: string) => void }) {
  const [payloadUrl, setPayloadUrl] = useState<string | null>(null)
  const [payloadId, setPayloadId] = useState<string | null>(null)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  const initiateConnection = async () => {
    const url = await connectWallet()
    setPayloadUrl(url)
    // get payload uuid from url params if available
    const match = url.match(/payload=(.*)$/)
    if (match) {
      setPayloadId(match[1])
    }
  }

  useEffect(() => {
    if (!payloadId) return
    const interval = setInterval(async () => {
      const address = await checkConnection(payloadId)
      if (address) {
        setWalletAddress(address)
        onConnected?.(address)
        clearInterval(interval)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [payloadId, onConnected])

  if (walletAddress) {
    return <div className="text-sm">Connected: {walletAddress}</div>
  }

  return (
    <div className="flex flex-col items-center gap-2">
      {payloadUrl && <iframe src={payloadUrl} className="w-60 h-60" />}
      <Button onClick={initiateConnection}>Connect Wallet</Button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Search, Shield, User, Building, Stethoscope } from "lucide-react"
import { verifyDID } from "@/lib/xrpl-service"

interface DIDDocument {
  id: string
  type: "issuer" | "worker" | "clinic"
  verified: boolean
  publicKey: string
}

export function DIDVerification() {
  const [walletAddress, setWalletAddress] = useState("")
  const [didDocument, setDidDocument] = useState<DIDDocument | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleVerifyDID = async () => {
    if (!walletAddress.trim()) return

    setLoading(true)
    setSearched(true)

    try {
      const result = await verifyDID(walletAddress.trim())
      setDidDocument(result)
    } catch (error) {
      console.error("Failed to verify DID:", error)
      setDidDocument(null)
    } finally {
      setLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "issuer":
        return <Building className="h-4 w-4" />
      case "worker":
        return <User className="h-4 w-4" />
      case "clinic":
        return <Stethoscope className="h-4 w-4" />
      default:
        return <Shield className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "issuer":
        return "Issuer (Employer/NGO)"
      case "worker":
        return "Worker (Patient)"
      case "clinic":
        return "Healthcare Provider"
      default:
        return "Unknown"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          DID Verification
        </CardTitle>
        <CardDescription>
          Verify the decentralized identity (DID) of wallet addresses in the HealthPay network.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <Input
              id="wallet-address"
              placeholder="Enter XRPL wallet address (e.g., rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe)"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerifyDID()}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={handleVerifyDID} disabled={loading || !walletAddress.trim()}>
              {loading ? (
                "Verifying..."
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>
          </div>
        </div>

        {searched && (
          <div className="mt-6">
            {didDocument ? (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">DID Document Found</h3>
                  <Badge variant={didDocument.verified ? "default" : "destructive"} className="flex items-center gap-1">
                    {didDocument.verified ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {didDocument.verified ? "Verified" : "Unverified"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">DID</Label>
                    <p className="font-mono text-sm">{didDocument.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Type</Label>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(didDocument.type)}
                      <span className="text-sm">{getTypeLabel(didDocument.type)}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Public Key</Label>
                    <p className="font-mono text-sm">{didDocument.publicKey}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Wallet Address</Label>
                    <p className="font-mono text-sm break-all">{walletAddress}</p>
                  </div>
                </div>

                {didDocument.verified ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">Identity Verified</span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      This {didDocument.type} is authorized to participate in the HealthPay network.
                    </p>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">Identity Not Verified</span>
                    </div>
                    <p className="text-red-700 text-sm mt-1">
                      This address is not authorized to participate in the HealthPay network.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <XCircle className="h-4 w-4" />
                  <span className="font-medium">No DID Found</span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  No decentralized identity document found for this wallet address.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Try These Sample Addresses:</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Verified Worker:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWalletAddress("rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe")}
                className="text-blue-600 hover:text-blue-800"
              >
                rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Unverified Worker:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWalletAddress("rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH")}
                className="text-blue-600 hover:text-blue-800"
              >
                rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Verified Issuer:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setWalletAddress("rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh")}
                className="text-blue-600 hover:text-blue-800"
              >
                rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

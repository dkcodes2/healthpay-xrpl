"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Search, Shield, User, Building, Stethoscope } from "lucide-react"
import { verifyDID } from '@/lib/did-service'
import { sampleAddresses } from '@/lib/did-service'
import { DIDDocument, VerifiableCredential } from '@/types/did'

function getVerificationStatus(doc: DIDDocument | null): { status: string; color: string } {
  if (!doc) return { status: 'No DID found', color: 'bg-gray-400' }
  if (!doc.credentials || doc.credentials.length === 0) return { status: 'No credentials', color: 'bg-gray-400' }

  // Worker scenarios
  const hasIdentity = doc.credentials.some(c => c.type.includes('IdentityAttestation') && c.status === 'valid')
  const hasHealth = doc.credentials.some(c => c.type.includes('HealthCreditEligibility') && c.status === 'valid')
  const hasEmployment = doc.credentials.some(c => c.type.includes('EmploymentVerification') && c.status === 'valid')
  const hasRevoked = doc.credentials.some(c => c.status === 'revoked')
  const hasExpired = doc.credentials.some(c => c.status === 'expired')

  if (hasRevoked) return { status: 'Revoked Credential', color: 'bg-red-500' }
  if (hasExpired) return { status: 'Expired Credential', color: 'bg-yellow-500' }

  if (hasIdentity && hasHealth && hasEmployment) return { status: 'Fully Verified Worker', color: 'bg-green-600' }
  if (hasIdentity && hasHealth) return { status: 'Partially Verified Worker', color: 'bg-yellow-500' }
  if (hasIdentity) return { status: 'Identity Verified Only', color: 'bg-blue-500' }

  // Issuer
  if (doc.credentials.some(c => c.type.includes('OrganizationVerification')) && doc.credentials.some(c => c.type.includes('HealthCreditIssuer'))) {
    return { status: 'Verified Issuer', color: 'bg-green-600' }
  }
  // Clinic
  if (doc.credentials.some(c => c.type.includes('OrganizationVerification')) && doc.credentials.some(c => c.type.includes('MedicalLicense'))) {
    return { status: 'Verified Clinic', color: 'bg-green-600' }
  }

  return { status: 'Unverified', color: 'bg-gray-400' }
}

export function DIDVerification() {
  const [address, setAddress] = useState('')
  const [didDoc, setDidDoc] = useState<DIDDocument | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async (addr: string) => {
    setLoading(true)
    setError('')
    setDidDoc(null)
    try {
      const doc = await verifyDID(addr)
      setDidDoc(doc as DIDDocument | null)
      if (!doc) setError('No DID document found for this address.')
    } catch (e: any) {
      setError(e.message || 'Error verifying DID')
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
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVerify(address)}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={() => handleVerify(address)} disabled={loading || !address}>
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

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}

        {didDoc && (
          <div className="border rounded p-4 bg-white shadow">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-block w-3 h-3 rounded-full ${getVerificationStatus(didDoc).color}`}></span>
              <span className="font-semibold">{getVerificationStatus(didDoc).status}</span>
            </div>
            <div className="mb-2">
              <span className="font-mono text-xs">{didDoc.id}</span>
            </div>
            <div className="mb-2">
              <span className="text-xs text-gray-500">Verification Methods:</span>
              <pre className="bg-gray-50 rounded p-2 text-xs overflow-x-auto">{JSON.stringify(didDoc.verificationMethod, null, 2)}</pre>
            </div>
            {didDoc.credentials && didDoc.credentials.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Credentials</div>
                <div className="space-y-2">
                  {didDoc.credentials.map((cred, i) => (
                    <div key={i} className="border rounded p-2 bg-gray-50">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-xs">{cred.type.join(', ')}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${cred.status === 'valid' ? 'bg-green-200 text-green-800' : cred.status === 'revoked' ? 'bg-red-200 text-red-800' : cred.status === 'expired' ? 'bg-yellow-200 text-yellow-800' : 'bg-gray-200 text-gray-800'}`}>{cred.status || 'unknown'}</span>
                      </div>
                      <div className="text-xs text-gray-700">Issuer: {typeof cred.issuer === 'string' ? cred.issuer : cred.issuer.id}</div>
                      <div className="text-xs text-gray-700">Issued: {cred.issuanceDate}</div>
                      <div className="text-xs text-gray-700">Subject: {cred.credentialSubject && cred.credentialSubject.id}</div>
                      <pre className="bg-gray-100 rounded p-2 text-xs overflow-x-auto mt-1">{JSON.stringify(cred.credentialSubject, null, 2)}</pre>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Try These Sample Addresses:</h4>
          <div className="space-y-2 text-sm">
            {Object.entries(sampleAddresses).map(([label, addr]) => (
              <div key={String(addr)} className="flex items-center justify-between">
                <span className="text-blue-700">{label.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setAddress(String(addr)); handleVerify(String(addr)); }}
                  className="text-blue-600 hover:text-blue-800"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


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
import dayjs from "dayjs"
import * as xrplService from '@/lib/xrpl-did-service'

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
  const [useXRPL, setUseXRPL] = useState(false)

  const handleVerify = async (addr: string) => {
    setLoading(true)
    setError('')
    setDidDoc(null)
    try {
      let doc: DIDDocument | null
      if (useXRPL) {
        // Compose the XRPL DID string for testnet
        const xrplDid = xrplService.generateXrplDID(addr, 'testnet')
        doc = await xrplService.resolveXrplDID(xrplDid)
      } else {
        doc = await verifyDID(addr)
      }
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

  // Helper functions for issuer label and date formatting
  function getIssuerLabel(issuer: string | { id: string }) {
    // Example: map known DIDs to friendly names, fallback to last 6 chars
    const id = typeof issuer === 'string' ? issuer : issuer.id
    if (id.includes('issuer')) return 'TrustedIssuer123'
    if (id.includes('clinic')) return 'HealthClinic'
    if (id.includes('worker')) return 'WorkerOrg'
    // fallback: last 6 chars
    return 'Issuer ' + id.slice(-6)
  }
  function formatIssuedDate(dateStr: string) {
    return dayjs(dateStr).format('YYYY-MM-DD HH:mm')
  }

  return (
    <Card className="w-full shadow-none border-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 w-full">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            DID Verification
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-500">Lookup Mode:</span>
            <select
              className="border rounded px-2 py-1 text-xs bg-white"
              value={useXRPL ? 'xrpl' : 'mock'}
              onChange={e => setUseXRPL(e.target.value === 'xrpl')}
            >
              <option value="mock">Sample Data (Demo)</option>
              <option value="xrpl">XRPL Live Lookup</option>
            </select>
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${useXRPL ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{useXRPL ? 'XRPL Live' : 'Demo Mode'}</span>
          </div>
        </div>
        <CardDescription>
          Verify the decentralized identity (DID) of wallet addresses in the HealthPay network. Enter an address or try a sample scenario below.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 w-full px-0 pb-0">
        <div className="flex gap-2 w-full">
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
          <div className="border rounded-xl bg-white shadow space-y-4 w-full">
            <div className="flex items-center gap-3 mb-2">
              <span className={`inline-block w-3 h-3 rounded-full ${getVerificationStatus(didDoc).color}`}></span>
              <span className="font-semibold">{getVerificationStatus(didDoc).status}</span>
            </div>
            <div className="mb-2">
              <span className="font-mono text-xs">{didDoc.id}</span>
            </div>
            <div className="mb-2">
              <span className="text-xs text-gray-500">Wallet Address:</span>
              <span className="font-mono text-xs ml-2">{address}</span>
            </div>
            {/* Verification Methods - user friendly */}
            {didDoc.verificationMethod && didDoc.verificationMethod.length > 0 && (
              <div className="mb-2">
                <div className="font-semibold mb-1">Verification Methods</div>
                <div className="space-y-1">
                  {didDoc.verificationMethod.map((vm, i) => (
                    <div key={i} className="bg-gray-50 rounded p-2 text-xs">
                      <div><span className="font-medium">Type:</span> {vm.type}</div>
                      <div><span className="font-medium">Controller:</span> {vm.controller}</div>
                      <div><span className="font-medium">Public Key:</span> {vm.publicKeyMultibase || '—'}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Credentials - user friendly */}
            {didDoc.credentials && didDoc.credentials.length > 0 && (
              <div>
                <div className="font-semibold mb-1">Credentials</div>
                <div className="space-y-2">
                  {didDoc.credentials.map((cred, i) => (
                    <div key={i} className="border rounded-xl bg-gradient-to-br from-gray-50 to-white shadow-md p-4 text-sm flex flex-col gap-1">
                      <div className="flex flex-wrap gap-2 mb-1 items-center">
                        <span className="font-semibold text-gray-800">{cred.type.join(', ')}</span>
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${cred.status === 'valid' ? 'bg-green-100 text-green-700' : cred.status === 'revoked' ? 'bg-red-100 text-red-700' : cred.status === 'expired' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>{cred.status || 'unknown'}</span>
                      </div>
                      <div className="flex flex-wrap gap-4 items-center">
                        <span><span className="font-medium text-gray-500">Issuer:</span> <span className="text-gray-900">{getIssuerLabel(cred.issuer)}</span></span>
                        <span><span className="font-medium text-gray-500">Issued:</span> <span className="text-gray-900">{formatIssuedDate(cred.issuanceDate)}</span></span>
                      </div>
                      {/* Proof section */}
                      {cred.proof && (
                        <div className="mt-2 bg-white border border-gray-100 rounded-lg p-3 shadow-sm">
                          <div className="font-medium text-gray-700 mb-1">Proof</div>
                          <div className="flex flex-wrap gap-4 text-xs">
                            <span><span className="font-medium">Type:</span> {cred.proof.type}</span>
                            {cred.proof.created && <span><span className="font-medium">Created:</span> {formatIssuedDate(cred.proof.created)}</span>}
                            {cred.proof.jws && <span><span className="font-medium">Value:</span> <span className="font-mono">{String(cred.proof.jws).length > 24 ? String(cred.proof.jws).slice(0, 24) + '…' : String(cred.proof.jws)}</span></span>}
                            {cred.proof.signature && <span><span className="font-medium">Value:</span> <span className="font-mono">{String(cred.proof.signature).length > 24 ? String(cred.proof.signature).slice(0, 24) + '…' : String(cred.proof.signature)}</span></span>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Only show sample addresses in mock mode */}
        {!useXRPL && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg w-full">
            <h4 className="font-medium text-blue-900 mb-2">Try These Sample Addresses:</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(sampleAddresses).map(([label, addr]) => (
                <div key={String(addr)} className="flex items-center justify-between">
                  <span className="text-blue-700">{label.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</span>
                  <a
                    href="#"
                    className="text-blue-700 hover:underline font-mono text-xs"
                    onClick={e => { e.preventDefault(); setAddress(String(addr)); handleVerify(String(addr)); }}
                  >
                    {addr}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


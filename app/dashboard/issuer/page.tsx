"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Users, PlusCircle, Search, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { DIDVerification } from "@/components/did-verification"
import { issueVerifiableCredential, generateXrplDID } from '@/lib/xrpl-did-service'
import { Wallet } from 'xrpl'

const ISSUER_SECRET = process.env.ISSUER_SECRET

export default function IssuerDashboard() {
  const [issuingCredits, setIssuingCredits] = useState(false)
  const [issueSuccess, setIssueSuccess] = useState<boolean | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [credentialIssuing, setCredentialIssuing] = useState(false)
  const [credentialSuccess, setCredentialSuccess] = useState<boolean | null>(null)
  const [credentialTxId, setCredentialTxId] = useState("")

  // Use a persistent, funded issuer wallet from env
  let demoIssuerWallet: Wallet | null = null
  let issuerDid = ''
  if (ISSUER_SECRET) {
    demoIssuerWallet = Wallet.fromSeed(ISSUER_SECRET)
    issuerDid = generateXrplDID(demoIssuerWallet.address, 'testnet')
  }

  const handleIssueCredits = async (e: React.FormEvent) => {
    e.preventDefault()
    setIssuingCredits(true)

    try {
      // TODO: Implement health credits issuance logic here
      // const result = await issueHealthCredits({ ... })
      setTransactionId('demo-tx-id')
      setIssueSuccess(true)
    } catch (error) {
      console.error("Failed to issue credits:", error)
      setIssueSuccess(false)
    } finally {
      setIssuingCredits(false)
    }
  }

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault()
    setCredentialIssuing(true)
    setCredentialSuccess(null)
    setCredentialTxId("")
    if (!demoIssuerWallet) {
      setCredentialSuccess(false)
      setCredentialIssuing(false)
      alert('Issuer secret not set. Please set ISSUER_SECRET in your environment.')
      return
    }
    const formData = new FormData(e.target as HTMLFormElement)
    const workerAddress = formData.get('workerAddress') as string
    const credentialType = formData.get('credentialType') as string
    const workerDid = generateXrplDID(workerAddress, 'testnet')
    // Build credential
    const credential = {
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiableCredential', credentialType],
      issuer: issuerDid,
      issuanceDate: new Date().toISOString(),
      credentialSubject: {
        id: workerDid,
        // Add more fields as needed from form
        name: formData.get('workerName') as string,
        info: formData.get('workerInfo') as string,
      },
      proof: {
        type: 'JsonWebSignature2020',
        created: new Date().toISOString(),
        verificationMethod: `${issuerDid}#master`,
        proofPurpose: 'assertionMethod',
        jws: 'mock-proof',
      },
      status: 'valid',
    }
    try {
      const txHash = await issueVerifiableCredential(demoIssuerWallet, workerAddress, credential)
      setCredentialTxId(txHash)
      setCredentialSuccess(true)
    } catch (error) {
      console.error('Failed to issue credential:', error)
      setCredentialSuccess(false)
    } finally {
      setCredentialIssuing(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Issuer Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Credits Issued</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,000 HC</div>
            <p className="text-xs text-gray-500">≈ $5,000 USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-gray-500">Active workers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Participating Clinics</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-gray-500">Healthcare providers</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="issue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issue">Issue Credits</TabsTrigger>
          <TabsTrigger value="beneficiaries">Manage Beneficiaries</TabsTrigger>
          <TabsTrigger value="did">DID Verification</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="issue-credential">Issue Credential</TabsTrigger>
        </TabsList>

        <TabsContent value="issue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issue Health Credits</CardTitle>
              <CardDescription>
                Send health credits to workers that can be redeemed at participating clinics.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleIssueCredits}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient</Label>
                  <div className="flex gap-2">
                    <Input id="recipient" placeholder="Search by name or wallet address" />
                    <Button variant="outline" type="button" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (HC)</Label>
                  <Input id="amount" type="number" placeholder="100" defaultValue="100" />
                  <p className="text-sm text-gray-500">1 HC = 1 USD</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="memo">Memo (Optional)</Label>
                  <Input id="memo" placeholder="Monthly healthcare allowance" />
                </div>

                {issueSuccess === true && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Credits issued successfully</h4>
                      <p className="text-green-700 text-sm mt-1">Transaction ID: {transactionId || "tx_123456789"}</p>
                      <Link
                        href={`https://testnet.xrpl.org/transactions/${transactionId || "tx_123456789"}`}
                        target="_blank"
                        className="text-green-700 text-sm flex items-center gap-1 mt-2 hover:underline"
                      >
                        View on XRPL Explorer
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}

                {issueSuccess === false && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Failed to issue credits</h4>
                      <p className="text-red-700 text-sm mt-1">Please check the recipient address and try again.</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={issuingCredits}>
                  {issuingCredits ? "Processing..." : "Issue Credits"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bulk Issue</CardTitle>
              <CardDescription>Issue health credits to multiple workers at once.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Upload CSV File
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beneficiaries">
          <Card>
            <CardHeader>
              <CardTitle>Manage Beneficiaries</CardTitle>
              <CardDescription>View and manage workers who can receive health credits.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Search beneficiaries..." />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="ml-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Beneficiary
                </Button>
              </div>

              <div className="border rounded-md">
                <div className="grid grid-cols-4 gap-4 p-4 border-b font-medium text-sm">
                  <div>Name</div>
                  <div>Wallet Address</div>
                  <div>Credits Issued</div>
                  <div>Status</div>
                </div>

                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0 text-sm">
                    <div>Worker {i}</div>
                    <div className="font-mono text-xs">rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe</div>
                    <div>{i * 100} HC</div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="did">
          <DIDVerification />
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all credit issuance transactions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Search transactions..." />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="border rounded-md">
                <div className="grid grid-cols-5 gap-4 p-4 border-b font-medium text-sm">
                  <div>Date</div>
                  <div>Recipient</div>
                  <div>Amount</div>
                  <div>Transaction ID</div>
                  <div>Status</div>
                </div>

                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 text-sm">
                    <div>{new Date(2025, 5, i).toLocaleDateString()}</div>
                    <div>Worker {i}</div>
                    <div>{i * 100} HC</div>
                    <div className="font-mono text-xs">tx_{Math.random().toString(36).substring(2, 10)}</div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issue-credential" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issue Credential to Worker</CardTitle>
              <CardDescription>
                Issue a verifiable credential (e.g., Identity Attestation, Employment Verification) to a worker's DID on XRPL.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleIssueCredential} className="space-y-4">
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="workerAddress">Worker Wallet Address</Label>
                  <Input id="workerAddress" name="workerAddress" required placeholder="rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workerName">Worker Name</Label>
                  <Input id="workerName" name="workerName" required placeholder="Full Name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workerInfo">Additional Info</Label>
                  <Input id="workerInfo" name="workerInfo" placeholder="e.g., nationality, ID number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credentialType">Credential Type</Label>
                  <select id="credentialType" name="credentialType" className="border rounded px-2 py-1 w-full">
                    <option value="IdentityAttestation">Identity Attestation</option>
                    <option value="EmploymentVerification">Employment Verification</option>
                    <option value="HealthCreditEligibility">Health Credit Eligibility</option>
                  </select>
                </div>
                {credentialSuccess === true && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Credential issued successfully</h4>
                      <p className="text-green-700 text-sm mt-1">Transaction Hash: {credentialTxId}</p>
                      <Link
                        href={`https://testnet.xrpl.org/transactions/${credentialTxId}`}
                        target="_blank"
                        className="text-green-700 text-sm flex items-center gap-1 mt-2 hover:underline"
                      >
                        View on XRPL Explorer
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                )}
                {credentialSuccess === false && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Failed to issue credential</h4>
                      <p className="text-red-700 text-sm mt-1">Please check the worker address and try again.</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={credentialIssuing}>
                  {credentialIssuing ? "Processing..." : "Issue Credential"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Users, PlusCircle, Search, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { DIDVerification } from "@/components/did-verification"
import { toast } from "sonner"

const OPERATOR = {
  address: "rwksWbwwP3f2R7GaDDi5d4vRA63ZXkLy92",
  name: "ABC Corporation",
  role: "Operator",
  canSendTo: [{
    address: "rEmgtkaitKbrrTrobdaUKr7u4tsm4euTiR",
    name: "Maria Worker (Beneficiary)"
  }],
};

export default function IssuerDashboard() {
  const [issuingCredits, setIssuingCredits] = useState(false)
  const [issueSuccess, setIssueSuccess] = useState<boolean | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [balance, setBalance] = useState("--")
  const [loading, setLoading] = useState(false)
  const [amount, setAmount] = useState("")
  const [memo, setMemo] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleIssueCredits = async (e: React.FormEvent) => {
    e.preventDefault()
    setIssuingCredits(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/hec/quick-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "distribute", amount })
      });
      if (!res.ok) throw new Error("Transfer failed");
      toast.success("Credits distributed successfully");
      setAmount("");
      setMemo("");
      setSuccess(true);
      fetchBalance();
    } catch {
      setError("Failed to distribute credits. Please check the recipient address and try again.");
      toast.error("Failed to distribute credits");
    } finally {
      setIssuingCredits(false)
    }
  }

  const fetchBalance = async () => {
    try {
      const res = await fetch("/api/hec/balances");
      const data = await res.json();
      setBalance(data.balances.operator ?? "--");
    } catch {
      setBalance("--");
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/hec/quick-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "distribute", amount })
      });
      if (!res.ok) throw new Error("Transfer failed");
      toast.success("Transfer successful");
      setAmount("");
      fetchBalance();
    } catch {
      toast.error("Transfer failed");
    } finally {
      setLoading(false);
    }
  };

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
            <div className="mb-4 text-3xl font-bold">{balance} HEC</div>
            <div className="text-xs text-gray-500">≈ ${balance} USD</div>
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
              <CardTitle>Distribute Health Credits</CardTitle>
              <CardDescription>
                Send health credits to workers that can be redeemed at participating clinics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleIssueCredits} className="space-y-4">
                <div>
                  <Label>Recipient</Label>
                  <Input value={OPERATOR.canSendTo[0].address} disabled className="bg-gray-100 mt-1" />
                  <div className="text-xs text-gray-500 mt-1">Maria Worker (Beneficiary)</div>
                </div>
                <div>
                  <Label>Amount (HEC)</Label>
                  <Input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">1 HEC = 1 USD</div>
                </div>
                <div>
                  <Label>Memo (Optional)</Label>
                  <Input
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                    placeholder="Monthly healthcare allowance"
                  />
                </div>
                {error && <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>}
                {success && <div className="bg-green-100 text-green-700 p-2 rounded text-sm">Credits issued successfully!</div>}
                <Button type="submit" className="w-full" disabled={loading || !amount}>
                  {loading ? "Processing..." : "Issue Credits"}
                </Button>
              </form>
            </CardContent>
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
                    <div>{i * 100} HEC</div>
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
                    <div>{i * 100} HEC</div>
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
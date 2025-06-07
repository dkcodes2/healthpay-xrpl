"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Users, QrCode, Search, CheckCircle2, AlertCircle, ArrowRight, ExternalLink } from "lucide-react"
import { redeemHealthCredits } from "@/lib/xrpl-service"
import { DIDVerification } from "@/components/did-verification"

export default function ClinicDashboard() {
  const [redeeming, setRedeeming] = useState(false)
  const [redeemSuccess, setRedeemSuccess] = useState<boolean | null>(null)
  const [transactionId, setTransactionId] = useState("")

  const handleRedeemCredits = async (e: React.FormEvent) => {
    e.preventDefault()
    setRedeeming(true)

    try {
      // Call the XRPL service to redeem health credits
      const result = await redeemHealthCredits({
        patientAddress: "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe", // Example address
        amount: 50,
        serviceDescription: "General consultation",
      })

      setTransactionId(result.transactionId)
      setRedeemSuccess(true)
    } catch (error) {
      console.error("Failed to redeem credits:", error)
      setRedeemSuccess(false)
    } finally {
      setRedeeming(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Clinic Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Credits Redeemed</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,250 HC</div>
            <p className="text-xs text-gray-500">≈ $1,250 USD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Patients Served</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-gray-500">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Available for Withdrawal</CardTitle>
            <CreditCard className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">350 HC</div>
            <p className="text-xs text-gray-500">≈ $350 USD</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="redeem" className="space-y-4">
        <TabsList>
          <TabsTrigger value="redeem">Redeem Credits</TabsTrigger>
          <TabsTrigger value="patients">Patient Records</TabsTrigger>
          <TabsTrigger value="did">DID Verification</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="redeem" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Redeem Health Credits</CardTitle>
              <CardDescription>Process payment for healthcare services using patient's health credits.</CardDescription>
            </CardHeader>
            <form onSubmit={handleRedeemCredits}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Patient Wallet Address</Label>
                  <div className="flex gap-2">
                    <Input id="patient" placeholder="Enter patient's wallet address" />
                    <Button variant="outline" type="button" size="icon">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (HC)</Label>
                  <Input id="amount" type="number" placeholder="50" defaultValue="50" />
                  <p className="text-sm text-gray-500">1 HC = 1 USD</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="service">Service Description</Label>
                  <Input id="service" placeholder="General consultation" />
                </div>

                {redeemSuccess === true && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Credits redeemed successfully</h4>
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

                {redeemSuccess === false && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Failed to redeem credits</h4>
                      <p className="text-red-700 text-sm mt-1">
                        Please check the patient address and ensure they have sufficient credits.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={redeeming}>
                  {redeeming ? "Processing..." : "Redeem Credits"}
                </Button>
              </CardFooter>
            </form>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Clinic QR Code</CardTitle>
              <CardDescription>Patients can scan this code to quickly send health credits.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="bg-white p-4 rounded-md border">
                <QrCode className="h-48 w-48 text-gray-800" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients">
          <Card>
            <CardHeader>
              <CardTitle>Patient Records</CardTitle>
              <CardDescription>View and manage patient records.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <Input placeholder="Search patients..." />
                <Button variant="outline" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="border rounded-md">
                <div className="grid grid-cols-4 gap-4 p-4 border-b font-medium text-sm">
                  <div>Patient ID</div>
                  <div>Wallet Address</div>
                  <div>Last Visit</div>
                  <div>Total Spent</div>
                </div>

                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b last:border-0 text-sm">
                    <div>PAT-{1000 + i}</div>
                    <div className="font-mono text-xs">rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe</div>
                    <div>{new Date(2025, 5, i).toLocaleDateString()}</div>
                    <div>{i * 50} HC</div>
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
              <CardDescription>View all credit redemption transactions.</CardDescription>
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
                  <div>Patient</div>
                  <div>Service</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>

                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b last:border-0 text-sm">
                    <div>{new Date(2025, 5, i).toLocaleDateString()}</div>
                    <div>PAT-{1000 + i}</div>
                    <div>General consultation</div>
                    <div>{i * 50} HC</div>
                    <div>
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Link
                href="https://testnet.xrpl.org"
                target="_blank"
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
              >
                View all transactions on XRPL Explorer
                <ExternalLink className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

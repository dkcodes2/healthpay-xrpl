"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { QrCode, ArrowRight, ExternalLink, Copy, CheckCircle2 } from "lucide-react"
import { getWorkerBalance } from "@/lib/xrpl-service"

export default function WorkerDashboard() {
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const walletAddress = "rPT1Sjq2YGrBMTttX4GZHjKu9dyfzbpAYe"

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const refreshBalance = async () => {
    setRefreshing(true)
    try {
      // Call the XRPL service to get the latest balance
      await getWorkerBalance(walletAddress)
      // Balance would be updated in a real app
    } catch (error) {
      console.error("Failed to refresh balance:", error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Worker Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Health Credit Balance</CardTitle>
            <CardDescription>Your available health credits that can be used at participating clinics</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="text-4xl font-bold">350 HC</div>
              <p className="text-sm text-gray-500 mt-1">≈ $350 USD</p>
            </div>
            <Button onClick={refreshBalance} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "Refresh Balance"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Your Wallet</CardTitle>
            <CardDescription>Your XRPL wallet address for receiving health credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
              <div className="font-mono text-sm truncate flex-1">{walletAddress}</div>
              <Button variant="ghost" size="icon" onClick={copyToClipboard} className="h-8 w-8">
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="mt-4 flex justify-center">
              <div className="bg-white p-2 rounded-md border">
                <QrCode className="h-32 w-32 text-gray-800" />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Link
              href={`https://testnet.xrpl.org/accounts/${walletAddress}`}
              target="_blank"
              className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
            >
              View on XRPL Explorer
              <ExternalLink className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Participating Clinics</CardTitle>
            <CardDescription>Healthcare providers where you can use your health credits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                    C{i}
                  </div>
                  <div>
                    <h4 className="font-medium">Clinic {i}</h4>
                    <p className="text-sm text-gray-500">123 Healthcare St, City</p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-emerald-600">
                      <Link href="#" className="hover:underline flex items-center gap-1">
                        View details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Link href="#" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
              View all clinics
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardFooter>
        </Card>
      </div>

      <Tabs defaultValue="history" className="space-y-4">
        <TabsList>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your health credit transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md">
                <div className="grid grid-cols-5 gap-4 p-4 border-b font-medium text-sm">
                  <div>Date</div>
                  <div>Type</div>
                  <div>From/To</div>
                  <div>Amount</div>
                  <div>Status</div>
                </div>

                <div className="grid grid-cols-5 gap-4 p-4 border-b text-sm">
                  <div>{new Date(2025, 5, 5).toLocaleDateString()}</div>
                  <div>Received</div>
                  <div>ABC Corp</div>
                  <div className="text-green-600">+200 HC</div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 p-4 border-b text-sm">
                  <div>{new Date(2025, 5, 3).toLocaleDateString()}</div>
                  <div>Spent</div>
                  <div>City Health Clinic</div>
                  <div className="text-red-600">-50 HC</div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Confirmed
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-4 p-4 text-sm">
                  <div>{new Date(2025, 5, 1).toLocaleDateString()}</div>
                  <div>Received</div>
                  <div>ABC Corp</div>
                  <div className="text-green-600">+200 HC</div>
                  <div>
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Confirmed
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Link
                href={`https://testnet.xrpl.org/accounts/${walletAddress}`}
                target="_blank"
                className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
              >
                View all transactions on XRPL Explorer
                <ExternalLink className="h-3 w-3" />
              </Link>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              <CardDescription>Your scheduled healthcare appointments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-center p-8 text-gray-500 border rounded-md">
                  No upcoming appointments
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Schedule an Appointment</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Shield, ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Login() {
  const router = useRouter()
  const [userType, setUserType] = useState("issuer")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate login process
    setTimeout(() => {
      setLoading(false)

      // Redirect based on user type
      if (userType === "issuer") {
        router.push("/dashboard/issuer")
      } else if (userType === "worker") {
        router.push("/dashboard/worker")
      } else if (userType === "clinic") {
        router.push("/dashboard/clinic")
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container flex-1 flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-6 w-6 text-emerald-600" />
              <span className="font-bold text-xl">HealthPay</span>
            </div>
            <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-type">I am a:</Label>
                <RadioGroup
                  id="user-type"
                  defaultValue="issuer"
                  className="flex flex-col space-y-1"
                  onValueChange={setUserType}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="issuer" id="issuer" />
                    <Label htmlFor="issuer">Issuer (Employer/NGO)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="worker" id="worker" />
                    <Label htmlFor="worker">Worker (Patient)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="clinic" id="clinic" />
                    <Label htmlFor="clinic">Healthcare Provider</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-sm text-emerald-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </Button>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="text-emerald-600 hover:underline">
                  Register
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="container py-4">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  )
}

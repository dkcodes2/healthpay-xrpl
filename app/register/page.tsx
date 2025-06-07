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

export default function Register() {
  const router = useRouter()
  const [userType, setUserType] = useState("issuer")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate registration process
    setTimeout(() => {
      setLoading(false)
      router.push("/login")
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
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Enter your information to create your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-type">I am registering as a:</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="organization">
                  {userType === "issuer"
                    ? "Organization Name"
                    : userType === "clinic"
                      ? "Clinic Name"
                      : "Employer/Organization"}
                </Label>
                <Input id="organization" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </Button>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-emerald-600 hover:underline">
                  Sign in
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

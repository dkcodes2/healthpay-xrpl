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
import { Wallet } from 'xrpl'
import { generateXrplDID } from '@/lib/xrpl-did-service'

export default function Register() {
  const router = useRouter()
  const [userType, setUserType] = useState("issuer")
  const [loading, setLoading] = useState(false)
  // Dynamic fields state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    organization: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Worker
    idNumber: '',
    nationality: '',
    birthDate: '',
    // Issuer
    orgRegNumber: '',
    // Clinic
    licenseNumber: '',
    accreditation: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // 1. Create XRPL wallet
    const wallet = Wallet.generate()
    // 2. Generate DID
    const did = generateXrplDID(wallet.address, 'testnet')
    // 3. Build DID Document with extra details
    let credentialSubject: any = {
      id: did,
      name: form.firstName + ' ' + form.lastName,
    }
    if (userType === 'worker') {
      credentialSubject = {
        ...credentialSubject,
        idNumber: form.idNumber,
        nationality: form.nationality,
        birthDate: form.birthDate,
        employer: form.organization,
      }
    } else if (userType === 'issuer') {
      credentialSubject = {
        ...credentialSubject,
        organization: form.organization,
        orgRegNumber: form.orgRegNumber,
      }
    } else if (userType === 'clinic') {
      credentialSubject = {
        ...credentialSubject,
        clinicName: form.organization,
        licenseNumber: form.licenseNumber,
        accreditation: form.accreditation,
      }
    }
    const didDocument = {
      '@context': ['https://www.w3.org/ns/did/v1'],
      id: did,
      controller: did,
      verificationMethod: [
        {
          id: `${did}#master`,
          type: 'Secp256k1VerificationKey2019',
          controller: did,
          publicKeyBase58: wallet.publicKey,
        },
      ],
      authentication: [`${did}#master`],
      assertionMethod: [`${did}#master`],
      credentials: [
        {
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiableCredential', userType === 'worker' ? 'IdentityAttestation' : userType === 'issuer' ? 'OrganizationVerification' : 'MedicalLicense'],
          issuer: did,
          issuanceDate: new Date().toISOString(),
          credentialSubject,
          proof: {
            type: 'JsonWebSignature2020',
            created: new Date().toISOString(),
            verificationMethod: `${did}#master`,
            proofPurpose: 'assertionMethod',
            jws: 'mock-proof',
          },
          status: 'valid',
        },
      ],
    }
    // For demo: log the DID Document (replace with actual storage/anchoring as needed)
    console.log('DID Document:', didDocument)
    setLoading(false)
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-white to-emerald-50 dark:from-gray-950 dark:to-gray-900">
      <div className="w-full flex flex-col items-center justify-center py-8">
        <Link href="/" className="mb-6">
          <Button variant="ghost" className="flex items-center gap-2 text-emerald-700 text-base font-medium">
            <ArrowLeft className="h-5 w-5" />
            Back to home
          </Button>
        </Link>
        <Card className="w-full max-w-md shadow-xl">
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
                  <Input id="firstName" required value={form.firstName} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="lastName" required value={form.lastName} onChange={handleChange} />
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
                <Input id="organization" required value={form.organization} onChange={handleChange} />
              </div>
              {/* Dynamic fields based on userType */}
              {userType === 'worker' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="idNumber">ID Number</Label>
                    <Input id="idNumber" required value={form.idNumber} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input id="nationality" required value={form.nationality} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Birth Date</Label>
                    <Input id="birthDate" type="date" required value={form.birthDate} onChange={handleChange} />
                  </div>
                </>
              )}
              {userType === 'issuer' && (
                <div className="space-y-2">
                  <Label htmlFor="orgRegNumber">Organization Registration Number</Label>
                  <Input id="orgRegNumber" required value={form.orgRegNumber} onChange={handleChange} />
                </div>
              )}
              {userType === 'clinic' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="licenseNumber">License Number</Label>
                    <Input id="licenseNumber" required value={form.licenseNumber} onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accreditation">Accreditation</Label>
                    <Input id="accreditation" required value={form.accreditation} onChange={handleChange} />
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" required value={form.email} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={form.password} onChange={handleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={handleChange} />
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
    </div>
  )
}

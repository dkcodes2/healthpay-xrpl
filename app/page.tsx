import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Stethoscope, Wallet } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-emerald-600" />
            <span>HealthPay</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline">
              How It Works
            </Link>
            <Link href="#about" className="text-sm font-medium hover:underline">
              About
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/register">
              <Button>Register</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-32 bg-gradient-to-b from-white to-emerald-50 dark:from-gray-950 dark:to-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-12">
              <div className="flex-1 w-full max-w-xl space-y-4 text-center lg:text-left">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Accessible Healthcare Through Blockchain Technology
                </h1>
                <p className="text-gray-500 dark:text-gray-400 md:text-xl">
                  HealthPay enables employers, donors, and NGOs to issue prepaid health credits to migrant or low-income
                  workers, which can be redeemed at participating clinics.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto">
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="#how-it-works">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex-1 flex justify-center lg:justify-end w-full">
                <div className="w-full max-w-md rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 p-6 text-white shadow-lg relative h-[350px]">
                  <div className="absolute inset-0 bg-white/10 rounded-xl backdrop-blur-sm"></div>
                  <div className="relative z-10 h-full flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-bold">HealthPay Credits</h3>
                      <p className="mt-2 text-white/80">Powered by XRPL</p>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Available Balance</span>
                        <span className="text-2xl font-bold">500 HEC</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Backed by</span>
                        <span className="font-medium">RLUSD</span>
                      </div>
                      <div className="pt-4 border-t border-white/20">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Wallet ID</span>
                          <span className="font-mono text-xs">rHb9CJ...dTZs5</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">Core Features</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-[600px] mx-auto">
                HealthPay leverages XRPL technology to provide secure, transparent, and efficient healthcare financing.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 justify-center items-stretch">
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tokenized Health Credits</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Health credits as XRPL tokens tied to specific clinics and services, backed by stable RLUSD.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure Verification</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Beneficiary and clinic verification through DID, validating identities without heavy KYC.
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full max-w-sm mx-auto">
                <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4">
                  <Stethoscope className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Transparent Transactions</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Real-time balance tracking and transaction logging with block explorer integration.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter">How It Works</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-4 max-w-[600px] mx-auto">
                A simple three-step process connecting employers, workers, and healthcare providers.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3 justify-center items-stretch">
              <div className="relative w-full max-w-sm mx-auto">
                <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-bold mt-4 mb-2">Issuer Sends Credits</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Employers or NGOs send XRPL token credits to worker's digital wallet address.
                  </p>
                </div>
              </div>
              <div className="relative w-full max-w-sm mx-auto">
                <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-bold mt-4 mb-2">Worker Views Balance</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Workers can view their token balance on the HealthPay UI linked to their XRPL address.
                  </p>
                </div>
              </div>
              <div className="relative w-full max-w-sm mx-auto">
                <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm w-full">
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-bold mt-4 mb-2">Clinic Redeems Payment</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Healthcare providers accept the token and redeem it by burning or converting to RLUSD.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-2 items-center justify-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-4">About HealthPay</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  HealthPay addresses the critical challenge of healthcare access for migrant and low-income workers by
                  creating a transparent, efficient system for healthcare financing.
                </p>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  By leveraging the XRP Ledger's capabilities, we ensure that funds allocated for healthcare actually
                  reach their intended purpose, reducing fraud and administrative overhead.
                </p>
                <p className="text-gray-500 dark:text-gray-400">
                  Our vision is to expand this system globally, connecting employers, NGOs, and healthcare providers in
                  a seamless ecosystem that prioritizes patient care and financial transparency.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 justify-center items-center">
                <div className="bg-emerald-100 dark:bg-emerald-900 p-6 rounded-lg w-full max-w-xs mx-auto">
                  <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">100%</h3>
                  <p className="text-gray-500 dark:text-gray-400">Funds reach intended healthcare services</p>
                </div>
                <div className="bg-emerald-100 dark:bg-emerald-900 p-6 rounded-lg w-full max-w-xs mx-auto">
                  <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">Instant</h3>
                  <p className="text-gray-500 dark:text-gray-400">Credit issuance and verification</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 px-4 md:px-6">
          <div className="flex items-center gap-2 font-semibold">
            <Shield className="h-5 w-5 text-emerald-600" />
            <span>HealthPay</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">© 2025 HealthPay. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

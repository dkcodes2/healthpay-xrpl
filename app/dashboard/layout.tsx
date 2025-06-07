import type { ReactNode } from "react"
import Link from "next/link"
import { Shield, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <Shield className="h-6 w-6 text-emerald-600" />
            <Link href="/">HealthPay</Link>
          </div>
          <Link href="/login">
            <Button variant="ghost" size="sm" className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t py-4">
        <div className="container flex justify-between items-center">
          <p className="text-sm text-gray-500">© 2025 HealthPay. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-gray-500 hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

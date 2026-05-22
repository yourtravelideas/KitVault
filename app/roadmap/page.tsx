import Link from "next/link"
import { Shield, CheckCircle, Clock, Telescope } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const shipped = [
  "User accounts with secure authentication",
  "Create and manage multiple collections",
  "Add shirts with 20+ fields per shirt",
  "Multiple photos per shirt (up to 8)",
  "Public and private collections",
  "Wishlist with priority tracking",
  "Dashboard with collection statistics",
  "Dark mode support",
]

const coming = [
  { label: "Barcode scanner", desc: "Scan shirt tags to auto-fill details" },
  { label: "Marketplace", desc: "List shirts for sale or trade with other collectors" },
  { label: "Auctions", desc: "Auction rare shirts to the highest bidder" },
  { label: "Notifications", desc: "Get alerts when wishlist shirts are listed" },
  { label: "Forums & Community", desc: "Connect with other collectors" },
  { label: "Mobile App", desc: "Native iOS and Android app" },
  { label: "Collection sharing", desc: "Share public collection links" },
  { label: "Payments", desc: "Integrated payment processing for trades" },
  { label: "Advanced analytics", desc: "ROI tracking, value trends, collection stats" },
  { label: "CSV import/export", desc: "Import your existing spreadsheet collection" },
]

export default function RoadmapPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1e]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xl mb-8">
            <Shield className="h-6 w-6" />
            KitVault
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mt-4 mb-3">Product Roadmap</h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
            Here's what we've built and what's coming. We're building KitVault for collectors, by collectors.
          </p>
        </div>

        <div className="space-y-8">
          {/* Shipped */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
                Shipped — Available Now
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shipped.map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coming soon */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                <Telescope className="h-5 w-5" />
                Coming Soon
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {coming.map(({ label, desc }) => (
                  <div key={label} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">Have a feature request? We'd love to hear from you.</p>
            <div className="flex justify-center gap-4">
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

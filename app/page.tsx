import Link from "next/link"
import { Shield, ShirtIcon, FolderOpen, Heart, Star, ArrowRight, CheckCircle, Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const features = [
  {
    icon: FolderOpen,
    title: "Organised Collections",
    desc: "Group your shirts into collections — by era, club, nation, or anything that makes sense to you.",
  },
  {
    icon: ShirtIcon,
    title: "Detailed Records",
    desc: "Log 20+ fields per shirt: authenticity, condition, player, patches, purchase price, estimated value and more.",
  },
  {
    icon: Heart,
    title: "Wishlist Tracking",
    desc: "Track shirts you're hunting. Set priority from Low to Grail and update status as you search.",
  },
  {
    icon: Star,
    title: "Photo Gallery",
    desc: "Upload up to 8 photos per shirt. Front, back, collar, tags — document every detail.",
  },
]

const shirtExamples = [
  { club: "Manchester United", season: "1998/99", type: "Home", badge: "Match Worn", badgeVariant: "default" as const },
  { club: "Barcelona", season: "2004/05", type: "Home", badge: "Signed", badgeVariant: "warning" as const },
  { club: "Brazil", season: "1970", type: "Away", badge: "Player Issue", badgeVariant: "secondary" as const },
  { club: "AC Milan", season: "1994/95", type: "Away", badge: "BNWT", badgeVariant: "success" as const },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0f1e]">
      {/* Nav */}
      <nav className="border-b border-slate-100 dark:border-slate-800/60 sticky top-0 z-40 bg-white/90 dark:bg-[#0a0f1e]/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
            <Shield className="h-6 w-6" />
            <span>KitVault</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/roadmap">Roadmap</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 text-center">
        <Badge variant="secondary" className="mb-6 px-3 py-1 text-sm">
          Built for collectors, by collectors
        </Badge>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6">
          Build, track and{" "}
          <span className="text-slate-600 dark:text-slate-300">
            showcase
          </span>{" "}
          <br className="hidden sm:block" />
          your shirt collection.
        </h1>
        <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          KitVault is the personal vault for serious football shirt collectors.
          Log every detail, upload photos, track your wishlist, and keep it all in one place.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" asChild className="text-base px-8">
            <Link href="/signup">
              Start your vault — it&apos;s free
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild className="text-base px-8">
            <Link href="/roadmap">
              <Map className="h-4 w-4 mr-2" />
              View roadmap
            </Link>
          </Button>
        </div>
      </section>

      {/* Shirt card showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {shirtExamples.map((shirt) => (
            <Card key={shirt.club} className="overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center relative">
                <ShirtIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute top-2 right-2">
                  <Badge variant={shirt.badgeVariant} className="text-[10px] px-1.5">{shirt.badge}</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">{shirt.club}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{shirt.type} · {shirt.season}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 dark:bg-slate-900/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need to manage your collection
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
              No spreadsheets. No shoeboxes. Just a clean, fast, purpose-built vault.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="border-slate-200/60 dark:border-slate-700/60">
                <CardContent className="p-6">
                  <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit mb-4">
                    <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Detail showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Every detail. Nothing forgotten.
            </h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
              Log the information that actually matters to collectors — not just the basics.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[
                "Club & country", "Season", "Shirt type", "Manufacturer",
                "Player name & number", "Authenticity", "Condition", "Size",
                "Signed status", "Patches", "Purchase price", "Est. value",
                "Purchase source", "Purchase date", "Status", "Notes",
              ].map((field) => (
                <div key={field} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{field}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center shrink-0">
                  <ShirtIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Manchester United 1998/99</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Home · Sharp Electronics</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="default" className="text-xs">Match Worn</Badge>
                    <Badge variant="warning" className="text-xs">Signed</Badge>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-200 dark:border-slate-800 pt-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Player", "Roy Keane"],
                  ["Number", "16"],
                  ["Size", "L"],
                  ["Condition", "Excellent"],
                  ["Purchased", "Oct 2019"],
                  ["Est. Value", "£1,200"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <span className="text-slate-500 dark:text-slate-400 block text-xs">{label}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 dark:bg-slate-950 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="h-12 w-12 text-white mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Your collection deserves a proper home.
          </h2>
          <p className="text-lg text-slate-400 mb-8">
            Join collectors already using KitVault to archive their shirts.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base px-8">
            <Link href="/signup">
              Create your vault
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
            <Shield className="h-5 w-5" />
            KitVault
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
            <Link href="/roadmap" className="hover:text-slate-900 dark:hover:text-white transition-colors">Roadmap</Link>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sign in</Link>
            <Link href="/signup" className="hover:text-slate-900 dark:hover:text-white transition-colors">Sign up</Link>
          </div>
          <p className="text-sm text-slate-400">© 2026 KitVault</p>
        </div>
      </footer>
    </div>
  )
}

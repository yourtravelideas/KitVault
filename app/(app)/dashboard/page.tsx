import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShirtIcon, FolderOpen, Heart, TrendingUp, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatCurrency } from "@/lib/utils"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [collectionsRes, shirtsRes, wishlistRes, profileRes] = await Promise.all([
    supabase.from("collections").select("id, name, is_public", { count: "exact" }).eq("user_id", user!.id),
    supabase.from("shirts").select("id, status, estimated_value, currency, created_at, shirt_type, club, title, collection_id, shirt_images(url, is_primary)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(6),
    supabase.from("wishlist_items").select("id", { count: "exact" }).eq("user_id", user!.id),
    supabase.from("profiles").select("display_name").eq("id", user!.id).single(),
  ])

  const collections = collectionsRes.data || []
  const shirts = shirtsRes.data || []
  const wishlistCount = wishlistRes.count || 0
  const displayName = profileRes.data?.display_name || user?.email?.split("@")[0] || "Collector"

  const totalValue = shirts.reduce((sum, s) => sum + (s.estimated_value || 0), 0)
  const uniqueClubs = new Set(shirts.map(s => s.club)).size

  const stats = [
    { label: "Total Shirts", value: shirts.length, icon: ShirtIcon, color: "text-blue-600" },
    { label: "Collections", value: collections.length, icon: FolderOpen, color: "text-purple-600" },
    { label: "Wishlist Items", value: wishlistCount, icon: Heart, color: "text-rose-600" },
    { label: "Est. Value", value: totalValue > 0 ? formatCurrency(totalValue) : "—", icon: TrendingUp, color: "text-emerald-600" },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Welcome back, {displayName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {uniqueClubs > 0 ? `${uniqueClubs} clubs represented in your vault` : "Start building your collection"}
          </p>
        </div>
        <Button asChild>
          <Link href="/collections/new">
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent shirts */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Additions</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/collections">
              View all <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
        {shirts.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ShirtIcon className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No shirts yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">Create a collection to start adding shirts to your vault.</p>
              <Button asChild>
                <Link href="/collections/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Collection
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {shirts.map((shirt) => {
              const primaryImage = shirt.shirt_images?.find((img: { is_primary: boolean }) => img.is_primary) || shirt.shirt_images?.[0]
              return (
                <Link key={shirt.id} href={`/collections/${shirt.collection_id}/shirts/${shirt.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={shirt.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShirtIcon className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <p className="font-medium text-xs text-slate-900 dark:text-white truncate">{shirt.club}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{shirt.shirt_type}</p>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Collections quick view */}
      {collections.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Collections</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/collections">
                Manage <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {collections.slice(0, 3).map((col) => (
              <Link key={col.id} href={`/collections/${col.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <FolderOpen className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{col.name}</p>
                        <Badge variant={col.is_public ? "success" : "secondary"} className="mt-1 text-xs">
                          {col.is_public ? "Public" : "Private"}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

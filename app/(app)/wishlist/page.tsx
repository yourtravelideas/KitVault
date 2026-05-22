import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Plus, ArrowRight } from "lucide-react"
import Link from "next/link"
import { WishlistItemCard } from "@/components/wishlist/wishlist-item-card"

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: items } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  const wishlisted = items || []

  const priorityOrder = { Grail: 0, High: 1, Medium: 2, Low: 3 }
  const sorted = [...wishlisted].sort((a, b) => (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 3))

  const counts = {
    Grail: wishlisted.filter(i => i.priority === "Grail").length,
    High: wishlisted.filter(i => i.priority === "High").length,
    Searching: wishlisted.filter(i => i.status === "Searching").length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Wishlist</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {wishlisted.length} {wishlisted.length === 1 ? "item" : "items"} · {counts.Searching} searching
          </p>
        </div>
        <Button asChild>
          <Link href="/wishlist/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Link>
        </Button>
      </div>

      {wishlisted.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {counts.Grail > 0 && <Badge variant="default">{counts.Grail} Grail</Badge>}
          {counts.High > 0 && <Badge variant="destructive">{counts.High} High Priority</Badge>}
        </div>
      )}

      {wishlisted.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <Heart className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Wishlist is empty</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              Add shirts you're searching for to track your hunt.
            </p>
            <Button asChild>
              <Link href="/wishlist/new">
                <Plus className="h-4 w-4 mr-2" />
                Add First Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map((item) => (
            <WishlistItemCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  )
}

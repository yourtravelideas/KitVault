import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, ShirtIcon, ArrowLeft, Edit, Trash2, Globe, Lock } from "lucide-react"
import Link from "next/link"
import { CollectionActions } from "@/components/collections/collection-actions"

export default async function CollectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: collection } = await supabase
    .from("collections")
    .select("*")
    .eq("id", id)
    .single()

  if (!collection) notFound()
  if (collection.user_id !== user?.id) redirect("/collections")

  const { data: shirts } = await supabase
    .from("shirts")
    .select("*, shirt_images(id, url, is_primary, display_order)")
    .eq("collection_id", id)
    .order("created_at", { ascending: false })

  const shirtList = shirts || []

  const statusColors: Record<string, string> = {
    owned: "secondary",
    open_to_trade: "warning",
    not_for_sale: "outline",
  }

  const statusLabels: Record<string, string> = {
    owned: "Owned",
    open_to_trade: "Open to Trade",
    not_for_sale: "Not for Sale",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/collections"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{collection.name}</h1>
              <Badge variant={collection.is_public ? "success" : "secondary"}>
                {collection.is_public ? <><Globe className="h-3 w-3 mr-1" />Public</> : <><Lock className="h-3 w-3 mr-1" />Private</>}
              </Badge>
            </div>
            {collection.description && (
              <p className="text-slate-500 dark:text-slate-400 mt-1">{collection.description}</p>
            )}
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {shirtList.length} {shirtList.length === 1 ? "shirt" : "shirts"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <CollectionActions collectionId={id} collectionName={collection.name} />
          <Button asChild>
            <Link href={`/collections/${id}/shirts/new`}>
              <Plus className="h-4 w-4 mr-2" />
              Add Shirt
            </Link>
          </Button>
        </div>
      </div>

      {/* Shirt grid */}
      {shirtList.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <ShirtIcon className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No shirts yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Add your first shirt to this collection.</p>
            <Button asChild>
              <Link href={`/collections/${id}/shirts/new`}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Shirt
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {shirtList.map((shirt) => {
            const images = shirt.shirt_images || []
            const primaryImage = images.find((img: { is_primary: boolean }) => img.is_primary) || images[0]
            return (
              <Link key={shirt.id} href={`/collections/${id}/shirts/${shirt.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group cursor-pointer">
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={shirt.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShirtIcon className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                      </div>
                    )}
                    {shirt.signed && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        SIGNED
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{shirt.club}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{shirt.shirt_type} {shirt.season && `· ${shirt.season}`}</p>
                    {shirt.player_name && (
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{shirt.player_name}</p>
                    )}
                    <Badge variant={statusColors[shirt.status] as "secondary" | "warning" | "outline"} className="mt-2 text-[10px] px-1.5 py-0">
                      {statusLabels[shirt.status]}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderOpen, Lock, Globe, ArrowRight, ShirtIcon } from "lucide-react"
import Link from "next/link"

export default async function CollectionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: collections } = await supabase
    .from("collections")
    .select("*, shirts(count)")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Collections</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Organise your shirts into collections</p>
        </div>
        <Button asChild>
          <Link href="/collections/new">
            <Plus className="h-4 w-4 mr-2" />
            New Collection
          </Link>
        </Button>
      </div>

      {!collections || collections.length === 0 ? (
        <Card>
          <CardContent className="py-20 text-center">
            <FolderOpen className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No collections yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Create your first collection to start organising your football shirt vault.
            </p>
            <Button asChild>
              <Link href="/collections/new">
                <Plus className="h-4 w-4 mr-2" />
                Create First Collection
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((col) => {
            const shirtCount = col.shirts?.[0]?.count || 0
            return (
              <Link key={col.id} href={`/collections/${col.id}`}>
                <Card className="hover:shadow-lg transition-all duration-200 group h-full">
                  {col.cover_image_url ? (
                    <div className="h-40 overflow-hidden rounded-t-xl">
                      <img
                        src={col.cover_image_url}
                        alt={col.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-t-xl flex items-center justify-center">
                      <FolderOpen className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                    </div>
                  )}
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight">{col.name}</h3>
                      <Badge variant={col.is_public ? "success" : "secondary"} className="shrink-0">
                        {col.is_public ? <><Globe className="h-3 w-3 mr-1" />Public</> : <><Lock className="h-3 w-3 mr-1" />Private</>}
                      </Badge>
                    </div>
                    {col.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">{col.description}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <ShirtIcon className="h-4 w-4" />
                        <span>{shirtCount} {shirtCount === 1 ? "shirt" : "shirts"}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
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

"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { MoreHorizontal, Edit, Trash2, Search, Pause, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { Tables } from "@/lib/database.types"

const priorityColors: Record<string, "default" | "destructive" | "warning" | "secondary"> = {
  Grail: "default",
  High: "destructive",
  Medium: "warning",
  Low: "secondary",
}

const statusIcons: Record<string, React.ReactNode> = {
  Searching: <Search className="h-3 w-3" />,
  Found: <CheckCircle className="h-3 w-3" />,
  Paused: <Pause className="h-3 w-3" />,
}

export function WishlistItemCard({ item }: { item: Tables<"wishlist_items"> }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from("wishlist_items").delete().eq("id", item.id)
    router.refresh()
  }

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">{item.club}</h3>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                {item.shirt_type && <span className="text-xs text-slate-500 dark:text-slate-400">{item.shirt_type}</span>}
                {item.season && <span className="text-xs text-slate-400 dark:text-slate-500">· {item.season}</span>}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/wishlist/${item.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {item.player_name && (
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{item.player_name}</p>
          )}
          {item.size && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Size: {item.size}</p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={priorityColors[item.priority] || "secondary"}>{item.priority}</Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              {statusIcons[item.status]}
              {item.status}
            </Badge>
          </div>

          {item.notes && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">{item.notes}</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Wishlist Item</DialogTitle>
            <DialogDescription>Remove {item.club} from your wishlist?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { MoreHorizontal, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export function CollectionActions({ collectionId, collectionName }: { collectionId: string; collectionName: string }) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()

    // Remove all storage objects for every shirt in this collection before
    // the rows cascade away on delete.
    const { data: shirts } = await supabase
      .from("shirts")
      .select("id")
      .eq("collection_id", collectionId)
    const shirtIds = (shirts ?? []).map(s => s.id)
    if (shirtIds.length > 0) {
      const { data: images } = await supabase
        .from("shirt_images")
        .select("storage_path")
        .in("shirt_id", shirtIds)
      const paths = (images ?? [])
        .map(img => img.storage_path)
        .filter((p): p is string => !!p)
      if (paths.length > 0) {
        await supabase.storage.from("shirt-images").remove(paths)
      }
    }

    await supabase.from("collections").delete().eq("id", collectionId)
    router.push("/collections")
    router.refresh()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/collections/${collectionId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Collection
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Collection
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Collection</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{collectionName}&quot;? This will permanently delete all shirts in this collection.
            </DialogDescription>
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

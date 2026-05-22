import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, ShirtIcon, Star } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ShirtImageGallery } from "@/components/shirts/shirt-image-gallery"
import { ShirtActions } from "@/components/shirts/shirt-actions"

export default async function ShirtDetailPage({ params }: { params: Promise<{ id: string; shirtId: string }> }) {
  const { id: collectionId, shirtId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: shirt } = await supabase
    .from("shirts")
    .select("*, shirt_images(id, url, is_primary, display_order)")
    .eq("id", shirtId)
    .single()

  if (!shirt) notFound()
  if (shirt.user_id !== user?.id) redirect(`/collections/${collectionId}`)

  const images = (shirt.shirt_images || []).sort((a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order)

  const statusLabels: Record<string, string> = {
    owned: "Owned",
    open_to_trade: "Open to Trade",
    not_for_sale: "Not for Sale",
  }
  const statusVariants: Record<string, "secondary" | "warning" | "outline"> = {
    owned: "secondary",
    open_to_trade: "warning",
    not_for_sale: "outline",
  }

  const details = [
    { label: "Club", value: shirt.club },
    { label: "Country", value: shirt.country },
    { label: "Season", value: shirt.season },
    { label: "Type", value: shirt.shirt_type },
    { label: "Manufacturer", value: shirt.manufacturer },
    { label: "Sponsor", value: shirt.sponsor },
    { label: "Size", value: shirt.size },
    { label: "Condition", value: shirt.condition },
    { label: "Authenticity", value: shirt.authenticity_type },
    { label: "Player", value: shirt.player_name },
    { label: "Number", value: shirt.shirt_number },
    { label: "Patches", value: shirt.patches },
    { label: "Signed", value: shirt.signed ? "Yes" : null },
  ].filter(d => d.value)

  const purchaseDetails = [
    { label: "Source", value: shirt.purchase_source },
    { label: "Date", value: shirt.purchase_date ? formatDate(shirt.purchase_date) : null },
    { label: "Purchase Price", value: shirt.purchase_price ? formatCurrency(shirt.purchase_price, shirt.currency) : null },
    { label: "Est. Value", value: shirt.estimated_value ? formatCurrency(shirt.estimated_value, shirt.currency) : null },
  ].filter(d => d.value)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/collections/${collectionId}`}><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {shirt.title || `${shirt.club} ${shirt.shirt_type}`}
            </h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge variant={statusVariants[shirt.status]}>{statusLabels[shirt.status]}</Badge>
              <Badge variant="outline">{shirt.authenticity_type}</Badge>
              {shirt.signed && <Badge variant="warning">Signed</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ShirtActions shirtId={shirtId} collectionId={collectionId} />
          <Button asChild>
            <Link href={`/collections/${collectionId}/shirts/${shirtId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Images */}
        <div>
          <ShirtImageGallery images={images} shirtTitle={shirt.title || shirt.club} />
        </div>

        {/* Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {details.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4">
                    <dt className="text-sm text-slate-500 dark:text-slate-400 shrink-0">{label}</dt>
                    <dd className="text-sm font-medium text-slate-900 dark:text-white text-right">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          {purchaseDetails.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Purchase Info</CardTitle></CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {purchaseDetails.map(({ label, value }) => (
                    <div key={label} className="flex items-start justify-between gap-4">
                      <dt className="text-sm text-slate-500 dark:text-slate-400 shrink-0">{label}</dt>
                      <dd className="text-sm font-medium text-slate-900 dark:text-white text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          )}

          {shirt.notes && (
            <Card>
              <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{shirt.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

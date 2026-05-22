"use client"
import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

const SHIRT_TYPES = ["Home", "Away", "Third", "Goalkeeper", "Training", "Special"]
const AUTHENTICITY_TYPES = ["Replica", "Player Issue", "Match Worn", "Unknown"]
const STATUS_OPTIONS = [
  { value: "owned", label: "Owned" },
  { value: "open_to_trade", label: "Open to Trade" },
  { value: "not_for_sale", label: "Not for Sale" },
]
const CURRENCIES = ["DKK", "EUR", "USD", "GBP", "SEK", "NOK", "AUD", "CAD"]

interface FormData {
  title: string
  club: string
  country: string
  season: string
  shirt_type: string
  manufacturer: string
  sponsor: string
  size: string
  player_name: string
  shirt_number: string
  condition: string
  authenticity_type: string
  signed: boolean
  patches: string
  purchase_source: string
  purchase_date: string
  purchase_price: string
  estimated_value: string
  currency: string
  notes: string
  status: string
}

export default function AddShirtPage() {
  const router = useRouter()
  const params = useParams()
  const collectionId = params.id as string
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [form, setForm] = useState<FormData>({
    title: "",
    club: "",
    country: "",
    season: "",
    shirt_type: "Home",
    manufacturer: "",
    sponsor: "",
    size: "",
    player_name: "",
    shirt_number: "",
    condition: "",
    authenticity_type: "Replica",
    signed: false,
    patches: "",
    purchase_source: "",
    purchase_date: "",
    purchase_price: "",
    estimated_value: "",
    currency: "DKK",
    notes: "",
    status: "owned",
  })

  function set(field: keyof FormData, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const newFiles = [...images, ...files].slice(0, 8)
    setImages(newFiles)
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setPreviews(newPreviews)
  }

  function removeImage(index: number) {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)
    setImages(newImages)
    setPreviews(newPreviews)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.club.trim()) { setError("Club is required"); return }
    setLoading(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError("Not authenticated"); setLoading(false); return }

    const shirtData = {
      ...form,
      collection_id: collectionId,
      user_id: user.id,
      title: form.title || `${form.club} ${form.shirt_type} ${form.season}`.trim(),
      purchase_price: form.purchase_price ? parseFloat(form.purchase_price) : null,
      estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : null,
      purchase_date: form.purchase_date || null,
      country: form.country || null,
      season: form.season || null,
      manufacturer: form.manufacturer || null,
      sponsor: form.sponsor || null,
      size: form.size || null,
      player_name: form.player_name || null,
      shirt_number: form.shirt_number || null,
      condition: form.condition || null,
      patches: form.patches || null,
      purchase_source: form.purchase_source || null,
      notes: form.notes || null,
    }

    const { data: shirt, error: shirtErr } = await supabase.from("shirts").insert(shirtData).select().single()
    if (shirtErr) { setError(shirtErr.message); setLoading(false); return }

    // Upload images
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const ext = file.name.split(".").pop()
        const path = `${user.id}/${shirt.id}/${Date.now()}-${i}.${ext}`
        const { data: uploadData, error: uploadErr } = await supabase.storage
          .from("shirt-images")
          .upload(path, file)
        if (!uploadErr && uploadData) {
          const { data: { publicUrl } } = supabase.storage.from("shirt-images").getPublicUrl(path)
          await supabase.from("shirt_images").insert({
            shirt_id: shirt.id,
            url: publicUrl,
            storage_path: path,
            is_primary: i === 0,
            display_order: i,
          })
        }
      }
    }

    router.push(`/collections/${collectionId}/shirts/${shirt.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/collections/${collectionId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add Shirt</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Add a new shirt to your collection</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Images */}
        <Card>
          <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {previews.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-slate-900/70 text-white text-[10px] text-center py-1">Primary</div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {images.length < 8 && (
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors">
                <ImageIcon className="h-8 w-8 text-slate-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload photos</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG up to 10MB · Max 8 photos</p>
                </div>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </CardContent>
        </Card>

        {/* Core info */}
        <Card>
          <CardHeader><CardTitle>Shirt Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="club">Club *</Label>
                <Input id="club" value={form.club} onChange={e => set("club", e.target.value)} placeholder="e.g. Manchester United" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={e => set("title", e.target.value)} placeholder="Auto-generated if empty" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" value={form.country} onChange={e => set("country", e.target.value)} placeholder="e.g. England" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Input id="season" value={form.season} onChange={e => set("season", e.target.value)} placeholder="e.g. 1998/99" />
              </div>
              <div className="space-y-2">
                <Label>Shirt Type</Label>
                <Select value={form.shirt_type} onValueChange={v => set("shirt_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SHIRT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Authenticity</Label>
                <Select value={form.authenticity_type} onValueChange={v => set("authenticity_type", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AUTHENTICITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input id="manufacturer" value={form.manufacturer} onChange={e => set("manufacturer", e.target.value)} placeholder="e.g. Nike" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sponsor">Sponsor</Label>
                <Input id="sponsor" value={form.sponsor} onChange={e => set("sponsor", e.target.value)} placeholder="e.g. Sharp" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input id="size" value={form.size} onChange={e => set("size", e.target.value)} placeholder="e.g. L, XL, 40" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Input id="condition" value={form.condition} onChange={e => set("condition", e.target.value)} placeholder="e.g. Mint, BNWT, Good" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="player_name">Player Name</Label>
                <Input id="player_name" value={form.player_name} onChange={e => set("player_name", e.target.value)} placeholder="e.g. Cantona" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shirt_number">Shirt Number</Label>
                <Input id="shirt_number" value={form.shirt_number} onChange={e => set("shirt_number", e.target.value)} placeholder="e.g. 7" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="patches">Patches</Label>
              <Input id="patches" value={form.patches} onChange={e => set("patches", e.target.value)} placeholder="e.g. Premier League, Champions League" />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <div>
                <p className="font-medium text-slate-900 dark:text-white text-sm">Signed</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">This shirt has a player signature</p>
              </div>
              <Switch checked={form.signed} onCheckedChange={v => set("signed", v)} />
            </div>
          </CardContent>
        </Card>

        {/* Purchase info */}
        <Card>
          <CardHeader><CardTitle>Purchase Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="purchase_source">Source</Label>
                <Input id="purchase_source" value={form.purchase_source} onChange={e => set("purchase_source", e.target.value)} placeholder="e.g. eBay, Club Shop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_date">Date</Label>
                <Input id="purchase_date" type="date" value={form.purchase_date} onChange={e => set("purchase_date", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purchase_price">Purchase Price</Label>
                <Input id="purchase_price" type="number" min="0" step="0.01" value={form.purchase_price} onChange={e => set("purchase_price", e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_value">Estimated Value</Label>
                <Input id="estimated_value" type="number" min="0" step="0.01" value={form.estimated_value} onChange={e => set("estimated_value", e.target.value)} placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.currency} onValueChange={v => set("currency", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => set("status", v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Any additional notes about this shirt..." rows={4} />
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex gap-3 pb-8">
          <Button type="button" variant="outline" asChild className="flex-1">
            <Link href={`/collections/${collectionId}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Adding..." : "Add Shirt"}
          </Button>
        </div>
      </form>
    </div>
  )
}

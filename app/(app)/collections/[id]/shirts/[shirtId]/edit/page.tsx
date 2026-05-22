"use client"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, X, ImageIcon } from "lucide-react"
import Link from "next/link"

const SHIRT_TYPES = ["Home", "Away", "Third", "Goalkeeper", "Training", "Special"]
const AUTHENTICITY_TYPES = ["Replica", "Player Issue", "Match Worn", "Unknown"]
const STATUS_OPTIONS = [
  { value: "owned", label: "Owned" },
  { value: "open_to_trade", label: "Open to Trade" },
  { value: "not_for_sale", label: "Not for Sale" },
]
const CURRENCIES = ["USD", "EUR", "GBP", "SEK", "NOK", "DKK", "AUD", "CAD"]

export default function EditShirtPage() {
  const router = useRouter()
  const params = useParams()
  const collectionId = params.id as string
  const shirtId = params.shirtId as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [existingImages, setExistingImages] = useState<{ id: string; url: string; is_primary: boolean }[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const [form, setForm] = useState({
    title: "", club: "", country: "", season: "", shirt_type: "Home",
    manufacturer: "", sponsor: "", size: "", player_name: "", shirt_number: "",
    condition: "", authenticity_type: "Replica", signed: false, patches: "",
    purchase_source: "", purchase_date: "", purchase_price: "", estimated_value: "",
    currency: "EUR", notes: "", status: "owned",
  })

  function set(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from("shirts")
        .select("*, shirt_images(id, url, is_primary)")
        .eq("id", shirtId)
        .single()
      if (data) {
        setForm({
          title: data.title || "",
          club: data.club || "",
          country: data.country || "",
          season: data.season || "",
          shirt_type: data.shirt_type || "Home",
          manufacturer: data.manufacturer || "",
          sponsor: data.sponsor || "",
          size: data.size || "",
          player_name: data.player_name || "",
          shirt_number: data.shirt_number || "",
          condition: data.condition || "",
          authenticity_type: data.authenticity_type || "Replica",
          signed: data.signed || false,
          patches: data.patches || "",
          purchase_source: data.purchase_source || "",
          purchase_date: data.purchase_date || "",
          purchase_price: data.purchase_price?.toString() || "",
          estimated_value: data.estimated_value?.toString() || "",
          currency: data.currency || "EUR",
          notes: data.notes || "",
          status: data.status || "owned",
        })
        setExistingImages(data.shirt_images || [])
      }
      setLoading(false)
    }
    load()
  }, [shirtId])

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const allowed = Math.min(files.length, 8 - existingImages.length - newImages.length)
    const newFiles = [...newImages, ...files.slice(0, allowed)]
    setNewImages(newFiles)
    setNewPreviews(newFiles.map(f => URL.createObjectURL(f)))
  }

  async function removeExistingImage(imgId: string) {
    const supabase = createClient()
    await supabase.from("shirt_images").delete().eq("id", imgId)
    setExistingImages(imgs => imgs.filter(i => i.id !== imgId))
  }

  function removeNewImage(index: number) {
    setNewImages(imgs => imgs.filter((_, i) => i !== index))
    setNewPreviews(ps => ps.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError("")
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { error: err } = await supabase.from("shirts").update({
      ...form,
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
      updated_at: new Date().toISOString(),
    }).eq("id", shirtId)

    if (err) { setError(err.message); setSaving(false); return }

    if (newImages.length > 0 && user) {
      const startOrder = existingImages.length
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i]
        const ext = file.name.split(".").pop()
        const path = `${user.id}/${shirtId}/${Date.now()}-${i}.${ext}`
        const { data: uploadData } = await supabase.storage.from("shirt-images").upload(path, file)
        if (uploadData) {
          const { data: { publicUrl } } = supabase.storage.from("shirt-images").getPublicUrl(path)
          await supabase.from("shirt_images").insert({
            shirt_id: shirtId,
            url: publicUrl,
            is_primary: existingImages.length === 0 && i === 0,
            display_order: startOrder + i,
          })
        }
      }
    }

    router.push(`/collections/${collectionId}/shirts/${shirtId}`)
    router.refresh()
  }

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-500">Loading...</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/collections/${collectionId}/shirts/${shirtId}`}><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Shirt</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Photos</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {(existingImages.length > 0 || newPreviews.length > 0) && (
              <div className="grid grid-cols-4 gap-3">
                {existingImages.map((img, i) => (
                  <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                    {img.is_primary && <div className="absolute bottom-0 left-0 right-0 bg-slate-900/70 text-white text-[10px] text-center py-1">Primary</div>}
                    <button type="button" onClick={() => removeExistingImage(img.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {newPreviews.map((src, i) => (
                  <div key={`new-${i}`} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 group">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeNewImage(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {existingImages.length + newImages.length < 8 && (
              <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
                <ImageIcon className="h-8 w-8 text-slate-400" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Add more photos</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Shirt Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Club *</Label><Input value={form.club} onChange={e => set("club", e.target.value)} required /></div>
              <div className="space-y-2"><Label>Title</Label><Input value={form.title} onChange={e => set("title", e.target.value)} /></div>
              <div className="space-y-2"><Label>Country</Label><Input value={form.country} onChange={e => set("country", e.target.value)} /></div>
              <div className="space-y-2"><Label>Season</Label><Input value={form.season} onChange={e => set("season", e.target.value)} /></div>
              <div className="space-y-2"><Label>Shirt Type</Label><Select value={form.shirt_type} onValueChange={v => set("shirt_type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SHIRT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Authenticity</Label><Select value={form.authenticity_type} onValueChange={v => set("authenticity_type", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{AUTHENTICITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Manufacturer</Label><Input value={form.manufacturer} onChange={e => set("manufacturer", e.target.value)} /></div>
              <div className="space-y-2"><Label>Sponsor</Label><Input value={form.sponsor} onChange={e => set("sponsor", e.target.value)} /></div>
              <div className="space-y-2"><Label>Size</Label><Input value={form.size} onChange={e => set("size", e.target.value)} /></div>
              <div className="space-y-2"><Label>Condition</Label><Input value={form.condition} onChange={e => set("condition", e.target.value)} /></div>
              <div className="space-y-2"><Label>Player Name</Label><Input value={form.player_name} onChange={e => set("player_name", e.target.value)} /></div>
              <div className="space-y-2"><Label>Shirt Number</Label><Input value={form.shirt_number} onChange={e => set("shirt_number", e.target.value)} /></div>
            </div>
            <div className="space-y-2"><Label>Patches</Label><Input value={form.patches} onChange={e => set("patches", e.target.value)} /></div>
            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 p-4">
              <div><p className="font-medium text-sm text-slate-900 dark:text-white">Signed</p></div>
              <Switch checked={form.signed} onCheckedChange={v => set("signed", v)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Purchase Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Source</Label><Input value={form.purchase_source} onChange={e => set("purchase_source", e.target.value)} /></div>
              <div className="space-y-2"><Label>Date</Label><Input type="date" value={form.purchase_date} onChange={e => set("purchase_date", e.target.value)} /></div>
              <div className="space-y-2"><Label>Purchase Price</Label><Input type="number" min="0" step="0.01" value={form.purchase_price} onChange={e => set("purchase_price", e.target.value)} /></div>
              <div className="space-y-2"><Label>Estimated Value</Label><Input type="number" min="0" step="0.01" value={form.estimated_value} onChange={e => set("estimated_value", e.target.value)} /></div>
              <div className="space-y-2"><Label>Currency</Label><Select value={form.currency} onValueChange={v => set("currency", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CURRENCIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={form.status} onValueChange={v => set("status", v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUS_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} rows={4} />
          </CardContent>
        </Card>

        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-3 pb-8">
          <Button type="button" variant="outline" asChild className="flex-1">
            <Link href={`/collections/${collectionId}/shirts/${shirtId}`}>Cancel</Link>
          </Button>
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}

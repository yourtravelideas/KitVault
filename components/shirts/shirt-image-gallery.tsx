"use client"
import { useState } from "react"
import { ShirtIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Image { id: string; url: string; is_primary: boolean; display_order: number }

export function ShirtImageGallery({ images, shirtTitle }: { images: Image[]; shirtTitle: string }) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <ShirtIcon className="h-20 w-20 text-slate-300 dark:text-slate-600" />
      </div>
    )
  }

  const prev = () => setActiveIndex(i => (i === 0 ? images.length - 1 : i - 1))
  const next = () => setActiveIndex(i => (i === images.length - 1 ? 0 : i + 1))

  return (
    <div className="space-y-3">
      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
        <img
          src={images[activeIndex].url}
          alt={shirtTitle}
          className="w-full h-full object-contain"
        />
        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`h-1.5 rounded-full transition-all ${i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                i === activeIndex ? "border-slate-900 dark:border-white" : "border-transparent"
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

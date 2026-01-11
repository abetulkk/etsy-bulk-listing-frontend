"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImagePreviewProps {
  storeStyle: string
  imageUrl?: string
  infographicOverlay: boolean
  onInfographicToggle: (value: boolean) => void
}

export default function ImagePreview({
  storeStyle,
  imageUrl,
  infographicOverlay,
  onInfographicToggle,
}: ImagePreviewProps) {
  return (
    <div className="space-y-4">
      <Label>Image Preview - {storeStyle} Style</Label>
      <div className="grid grid-cols-2 gap-4">
        {/* Standard Preview */}
        <Card>
          <CardContent className="p-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={`${storeStyle} preview`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Standard
            </p>
          </CardContent>
        </Card>

        {/* Infographic Overlay Preview */}
        <Card>
          <CardContent className="p-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted">
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl}
                    alt={`${storeStyle} with infographic`}
                    className="h-full w-full object-cover"
                  />
                  {infographicOverlay && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <div className="rounded-lg bg-white/90 p-4 text-center">
                        <p className="text-sm font-semibold text-foreground">
                          Infographic Overlay
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Product details will appear here
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <input
                type="checkbox"
                id={`infographic-${storeStyle}`}
                checked={infographicOverlay}
                onChange={(e) => onInfographicToggle(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <label
                htmlFor={`infographic-${storeStyle}`}
                className="text-xs text-muted-foreground"
              >
                Infographic Overlay
              </label>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


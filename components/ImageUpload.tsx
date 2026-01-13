"use client"

import { useState, useCallback } from "react"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { uploadApi } from "@/lib/api"

interface ImageUploadProps {
  label: string
  value?: string
  onChange: (url: string) => void
  onRemove: () => void
}

export default function ImageUpload({ label, value, onChange, onRemove }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return
    
    setIsUploading(true)
    try {
      const result = await uploadApi.upload(file)
      onChange(result.url)
    } catch (error) {
      console.error("Upload error:", error)
      alert("Görsel yüklenirken hata oluştu!")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) {
        uploadFile(file)
      }
    },
    []
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        uploadFile(file)
      }
    },
    []
  )

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      {value ? (
        <div className="relative group">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-muted">
            <img src={value} alt={label} className="h-full w-full object-cover" />
          </div>
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 rounded-full bg-background p-1.5 shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault()
            setIsDragging(true)
          }}
          onDragLeave={() => setIsDragging(false)}
          className={cn(
            "cursor-pointer border-2 border-dashed rounded-lg transition-colors",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            isUploading && "pointer-events-none opacity-50"
          )}
        >
          <div className="flex flex-col items-center justify-center p-8">
            <div className={cn(
              "mb-3 p-3 rounded-full",
              isDragging ? "bg-primary/10" : "bg-muted"
            )}>
              {isUploading ? (
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              ) : isDragging ? (
                <Upload className="h-6 w-6 text-primary" />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <p className="text-sm font-medium mb-1">
              {isUploading ? "Yükleniyor..." : isDragging ? "Bırakın" : "Görsel sürükleyin"}
            </p>
            <p className="text-xs text-muted-foreground mb-3">veya</p>
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="file-upload"
                onChange={handleFileInput}
                disabled={isUploading}
              />
              <Button 
                size="sm" 
                variant="outline" 
                disabled={isUploading}
                onClick={() => document.getElementById('file-upload')?.click()}
                type="button"
              >
                Dosya Seç
              </Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              PNG, JPG, WEBP - max 10MB
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

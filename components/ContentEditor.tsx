"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StoreContent } from "@/types"

interface ContentEditorProps {
  storeName: string
  storeStyle: string
  content: StoreContent
  aboutTemplate: string
  shippingTemplate: string
  returnTemplate: string
  onUpdate: (content: StoreContent) => void
}

export default function ContentEditor({
  storeName,
  storeStyle,
  content,
  aboutTemplate,
  shippingTemplate,
  returnTemplate,
  onUpdate,
}: ContentEditorProps) {
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, 140)
    onUpdate({ ...content, title: value })
  }

  const handleTagChange = (index: number, value: string) => {
    const newTags = [...content.tags]
    newTags[index] = value.slice(0, 20)
    onUpdate({ ...content, tags: newTags })
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...content, description: e.target.value })
  }

  const fullDescription = `${content.description}\n\n--- Hakkımızda ---\n${aboutTemplate}\n\n--- Kargo ---\n${shippingTemplate}\n\n--- İade ---\n${returnTemplate}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{storeName} - {storeStyle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Title Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">Title</Label>
              <span className="text-xs text-muted-foreground">
                {content.title.length}/140
              </span>
            </div>
            <Input
              id="title"
              value={content.title}
              onChange={handleTitleChange}
              placeholder="Enter product title..."
              maxLength={140}
            />
          </div>

          {/* Tags Field */}
          <div className="space-y-2">
            <Label>Tags (13 tags, max 20 characters each)</Label>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: 13 }).map((_, index) => (
                <div key={index} className="space-y-1">
                  <Input
                    value={content.tags[index] || ""}
                    onChange={(e) => handleTagChange(index, e.target.value)}
                    placeholder={`Tag ${index + 1}`}
                    maxLength={20}
                    className="text-sm"
                  />
                  <span className="text-xs text-muted-foreground">
                    {(content.tags[index] || "").length}/20
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={content.description}
              onChange={handleDescriptionChange}
              placeholder="Enter product description..."
              rows={8}
              className="font-mono text-sm"
            />
            <div className="rounded-md border border-border bg-muted p-4">
              <p className="mb-2 text-xs font-semibold text-muted-foreground">
                Preview (with templates):
              </p>
              <pre className="whitespace-pre-wrap text-xs text-foreground">
                {fullDescription}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


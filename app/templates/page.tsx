"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Save, Plus, Trash2, FileText, AlertCircle, Loader2 } from "lucide-react"
import { Template, Store } from "@/types"
import { templatesApi, storesApi, checkBackendHealth } from "@/lib/api"

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [isClient, setIsClient] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const init = async () => {
      const isOnline = await checkBackendHealth()
      setBackendOnline(isOnline)
      
      if (isOnline) {
        try {
          const [templateList, storeList] = await Promise.all([
            templatesApi.getAll(),
            storesApi.getAll()
          ])
          setTemplates(templateList)
          setStores(storeList)
        } catch (error) {
          console.error("Error loading data:", error)
        }
      }
    }
    
    init()
  }, [])

  const addTemplate = async () => {
    if (!backendOnline) {
      alert("Backend çalışmıyor!")
      return
    }
    
    try {
      const newTemplate = await templatesApi.create({
        name: `Yeni Şablon ${templates.length + 1}`,
        content: "",
        type: "description",
        stores: [],
      })
      setTemplates(prev => [...prev, newTemplate])
    } catch (error) {
      console.error("Error creating template:", error)
      alert("Şablon oluşturulamadı!")
    }
  }

  const updateTemplate = (templateId: string, updates: Partial<Template>) => {
    setTemplates((prev) =>
      prev.map((template) =>
        template.id === templateId ? { ...template, ...updates } : template
      )
    )
  }

  const deleteTemplate = async (templateId: string) => {
    if (!backendOnline) {
      alert("Backend çalışmıyor!")
      return
    }
    
    try {
      await templatesApi.delete(templateId)
      setTemplates(prev => prev.filter((t) => t.id !== templateId))
    } catch (error) {
      console.error("Error deleting template:", error)
      alert("Şablon silinemedi!")
    }
  }

  const toggleStoreForTemplate = (templateId: string, storeId: string) => {
    setTemplates((prev) =>
      prev.map((template) => {
        if (template.id === templateId) {
          const stores = template.stores.includes(storeId)
            ? template.stores.filter((id) => id !== storeId)
            : [...template.stores, storeId]
          return { ...template, stores }
        }
        return template
      })
    )
  }

  const handleSave = async () => {
    if (!backendOnline) {
      alert("Backend çalışmıyor!")
      return
    }
    
    setIsSaving(true)
    
    try {
      await Promise.all(
        templates.map((template) => templatesApi.update(template.id, template))
      )
      alert("Şablonlar kaydedildi!")
    } catch (error) {
      console.error("Error saving templates:", error)
      alert("Kaydetme hatası!")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {!isClient ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Yükleniyor...</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-5xl space-y-6">
              {/* Backend Status */}
              {backendOnline === false && (
                <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="font-medium text-destructive">Backend servisi çalışmıyor</p>
                    <p className="text-sm text-muted-foreground">
                      Backend klasöründe <code className="rounded bg-muted px-1.5 py-0.5 text-xs">make up</code> komutunu çalıştırın
                    </p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Şablonlar</h1>
                  <p className="text-muted-foreground">İçerik şablonlarınızı yönetin</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    onClick={addTemplate}
                    disabled={!backendOnline}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Şablon
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={!backendOnline || isSaving || templates.length === 0}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Kaydet
                  </Button>
                </div>
              </div>

              {/* Templates */}
              {templates.length > 0 ? (
                <div className="grid gap-4">
                  {templates.map((template) => (
                    <Card key={template.id}>
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`name-${template.id}`}>Şablon Adı</Label>
                            <Input
                              id={`name-${template.id}`}
                              value={template.name}
                              onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
                              placeholder="Şablon adı"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`type-${template.id}`}>Şablon Tipi</Label>
                            <select
                              id={`type-${template.id}`}
                              value={template.type}
                              onChange={(e) => updateTemplate(template.id, { type: e.target.value as any })}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                              <option value="description">Açıklama</option>
                              <option value="shipping">Kargo</option>
                              <option value="return">İade Politikası</option>
                              <option value="about">Hakkında</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`content-${template.id}`}>İçerik</Label>
                          <Textarea
                            id={`content-${template.id}`}
                            value={template.content}
                            onChange={(e) => updateTemplate(template.id, { content: e.target.value })}
                            placeholder="Şablon içeriği..."
                            rows={4}
                            className="resize-none font-mono text-sm"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Mağazalara Uygula</Label>
                          <div className="flex flex-wrap gap-2">
                            {stores.map((store) => (
                              <label
                                key={store.id}
                                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-secondary"
                              >
                                <input
                                  type="checkbox"
                                  checked={template.stores.includes(store.id)}
                                  onChange={() => toggleStoreForTemplate(template.id, store.id)}
                                  className="h-4 w-4 rounded border-input"
                                />
                                {store.name}
                              </label>
                            ))}
                            {stores.length === 0 && (
                              <p className="text-sm text-muted-foreground">Mağaza yok</p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-1">Henüz şablon yok</h3>
                    <p className="text-sm text-muted-foreground mb-4">Başlamak için ilk şablonunuzu oluşturun</p>
                    <Button onClick={addTemplate} disabled={!backendOnline}>
                      <Plus className="mr-2 h-4 w-4" />
                      Şablon Ekle
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

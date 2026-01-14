"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
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
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {!isClient ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="font-bold uppercase">Yükleniyor...</div>
          </div>
        ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Backend Status */}
            {backendOnline === false && (
              <div className="flex items-center gap-4 border-4 border-black bg-red-500 p-4 shadow-brutal font-bold uppercase">
                <AlertCircle className="h-6 w-6" />
                <div>
                  <p className="text-sm">Backend servisi çalışmıyor</p>
                  <p className="text-xs mt-1 font-normal normal-case">
                    Backend klasöründe <code className="border-2 border-black bg-white px-2 py-0.5 text-xs">make up</code> komutunu çalıştırın
                  </p>
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold uppercase">Şablonlar</h1>
                <p className="text-sm mt-1">İçerik şablonlarınızı yönetin</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  onClick={addTemplate}
                  disabled={!backendOnline}
                  className="border-4 border-black bg-white hover:bg-gray-100 font-bold uppercase shadow-brutal-sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni Şablon
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={!backendOnline || isSaving || templates.length === 0}
                  className="border-4 border-black bg-yellow-400 hover:bg-yellow-500 font-bold uppercase shadow-brutal-sm"
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
                  <div key={template.id} className="border-4 border-black bg-white shadow-brutal">
                    <div className="flex items-center justify-between p-4 border-b-4 border-black">
                      <h3 className="text-base font-bold uppercase">{template.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 border-2 border-black hover:bg-red-500 hover:text-white"
                        onClick={() => deleteTemplate(template.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`name-${template.id}`} className="font-bold uppercase text-xs">Şablon Adı</Label>
                          <Input
                            id={`name-${template.id}`}
                            value={template.name}
                            onChange={(e) => updateTemplate(template.id, { name: e.target.value })}
                            placeholder="Şablon adı"
                            className="border-4 border-black focus:ring-4 focus:ring-yellow-400"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`type-${template.id}`} className="font-bold uppercase text-xs">Şablon Tipi</Label>
                          <select
                            id={`type-${template.id}`}
                            value={template.type}
                            onChange={(e) => updateTemplate(template.id, { type: e.target.value as any })}
                            className="flex h-10 w-full border-4 border-black bg-white px-3 py-2 text-sm font-bold"
                          >
                            <option value="description">Açıklama</option>
                            <option value="shipping">Kargo</option>
                            <option value="return">İade Politikası</option>
                            <option value="about">Hakkında</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`content-${template.id}`} className="font-bold uppercase text-xs">İçerik</Label>
                        <Textarea
                          id={`content-${template.id}`}
                          value={template.content}
                          onChange={(e) => updateTemplate(template.id, { content: e.target.value })}
                          placeholder="Şablon içeriği..."
                          rows={4}
                          className="resize-none font-mono text-sm border-4 border-black focus:ring-4 focus:ring-yellow-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="font-bold uppercase text-xs">Mağazalara Uygula</Label>
                        <div className="flex flex-wrap gap-2">
                          {stores.map((store) => (
                            <label
                              key={store.id}
                              className="flex items-center gap-2 border-2 border-black px-3 py-2 text-sm cursor-pointer hover:bg-yellow-400 font-medium"
                            >
                              <input
                                type="checkbox"
                                checked={template.stores.includes(store.id)}
                                onChange={() => toggleStoreForTemplate(template.id, store.id)}
                                className="h-4 w-4 border-2 border-black"
                              />
                              {store.name}
                            </label>
                          ))}
                          {stores.length === 0 && (
                            <p className="text-sm">Mağaza yok</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-4 border-black bg-white shadow-brutal">
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <FileText className="h-16 w-16 mb-4 border-4 border-black p-2" />
                  <h3 className="text-lg font-bold uppercase mb-2">Henüz şablon yok</h3>
                  <p className="text-sm mb-6">Başlamak için ilk şablonunuzu oluşturun</p>
                  <Button 
                    onClick={addTemplate} 
                    disabled={!backendOnline}
                    className="border-4 border-black bg-yellow-400 hover:bg-yellow-500 font-bold uppercase shadow-brutal"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Şablon Ekle
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

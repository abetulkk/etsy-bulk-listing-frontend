"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit2, X, Check, AlertCircle, Store as StoreIcon, Download, FileDown } from "lucide-react"
import { Store } from "@/types"
import { storesApi, checkBackendHealth, exportApi } from "@/lib/api"

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [isClient, setIsClient] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Store>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [newStore, setNewStore] = useState({ name: "", concept: "", imageCount: 3 })

  useEffect(() => {
    setIsClient(true)
    
    const init = async () => {
      const isOnline = await checkBackendHealth()
      setBackendOnline(isOnline)
      
      if (isOnline) {
        try {
          const storeList = await storesApi.getAll()
          setStores(storeList)
        } catch (error) {
          console.error("Error loading stores:", error)
        }
      }
    }
    
    init()
  }, [])

  const addStore = async () => {
    if (!backendOnline || !newStore.name.trim()) return
    
    try {
      const created = await storesApi.create({
        name: newStore.name,
        concept: newStore.concept,
        imageCount: newStore.imageCount,
        titleTemplate: "",
        descriptionTemplate: "",
        tagsTemplate: "",
        aboutTemplate: "",
        shippingTemplate: "",
        returnTemplate: "",
        hasInfographic: false,
        hasVideo: false,
      })
      setStores(prev => [...prev, created])
      setNewStore({ name: "", concept: "", imageCount: 3 })
      setIsAdding(false)
      window.dispatchEvent(new Event('stores-updated'))
    } catch (error) {
      console.error("Error creating store:", error)
      alert("Mağaza oluşturulamadı!")
    }
  }

  const startEdit = (store: Store) => {
    setEditingId(store.id)
    setEditForm({ ...store })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async () => {
    if (!editingId || !backendOnline) return
    
    try {
      // Sadece güncellenebilir alanları gönder (id, createdAt, updatedAt hariç)
      const { id, createdAt, updatedAt, ...updateData } = editForm as Store
      const updated = await storesApi.update(editingId, updateData)
      setStores(prev => prev.map(s => s.id === editingId ? updated : s))
      setEditingId(null)
      setEditForm({})
      window.dispatchEvent(new Event('stores-updated'))
    } catch (error) {
      console.error("Error updating store:", error)
      alert("Güncelleme hatası!")
    }
  }

  const deleteStore = async (id: string) => {
    if (!confirm("Bu mağazayı silmek istediğinizden emin misiniz?")) return
    
    try {
      await storesApi.delete(id)
      setStores(prev => prev.filter(s => s.id !== id))
      window.dispatchEvent(new Event('stores-updated'))
    } catch (error) {
      console.error("Error deleting store:", error)
      alert("Silme hatası!")
    }
  }

  const handleExportStore = async (storeId: string) => {
    try {
      const blob = await exportApi.exportStore(storeId, "csv")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      const store = stores.find(s => s.id === storeId)
      link.download = `${store?.name.replace(/\s+/g, "_") || storeId}-export.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Export işlemi başarısız!")
    }
  }

  const handleExportAll = async () => {
    try {
      const blob = await exportApi.exportAll("csv")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `all-stores-export.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Export işlemi başarısız!")
    }
  }

  const conceptOptions = [
    { value: "", label: "Seçiniz..." },
    { value: "Boho", label: "Boho" },
    { value: "Minimalist", label: "Minimalist" },
    { value: "Vintage", label: "Vintage" },
    { value: "Modern", label: "Modern" },
    { value: "Rustic", label: "Rustic" },
    { value: "Elegant", label: "Elegant" },
    { value: "Industrial", label: "Industrial" },
    { value: "Scandinavian", label: "Scandinavian" },
    { value: "Bohemian", label: "Bohemian" },
    { value: "Contemporary", label: "Contemporary" },
  ]

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

            {/* Stores Table */}
            <div className="border-4 border-black bg-white shadow-brutal">
              <div className="flex items-center justify-between p-6 border-b-4 border-black">
                <div>
                  <h1 className="text-xl font-bold uppercase">Mağazalar</h1>
                  <p className="text-sm mt-1">{stores.length} mağaza</p>
                </div>
                <div className="flex items-center gap-2">
                  {stores.length > 0 && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={handleExportAll}
                      className="border-4 border-black bg-white hover:bg-yellow-400 font-bold uppercase shadow-brutal-sm"
                    >
                      <FileDown className="mr-2 h-4 w-4" />
                      Export Tümü
                    </Button>
                  )}
                  <Button 
                    size="sm"
                    onClick={() => setIsAdding(true)}
                    disabled={!backendOnline || isAdding}
                    className="border-4 border-black bg-yellow-400 hover:bg-yellow-500 font-bold uppercase shadow-brutal-sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Mağaza
                  </Button>
                </div>
              </div>
              <div>
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mağaza Adı</TableHead>
                        <TableHead>Konsept</TableHead>
                        <TableHead className="text-center">Görsel</TableHead>
                        <TableHead className="text-center">Infografik</TableHead>
                        <TableHead className="text-center">Video</TableHead>
                        <TableHead className="w-[120px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Add New Row */}
                      {isAdding && (
                        <TableRow>
                          <TableCell>
                            <Input
                              value={newStore.name}
                              onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Mağaza adı"
                              className="h-8"
                              autoFocus
                            />
                          </TableCell>
                          <TableCell>
                            <select
                              value={newStore.concept}
                              onChange={(e) => setNewStore(prev => ({ ...prev, concept: e.target.value }))}
                              className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                            >
                              {conceptOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={newStore.imageCount}
                              onChange={(e) => setNewStore(prev => ({ ...prev, imageCount: parseInt(e.target.value) || 1 }))}
                              className="h-8 w-16 mx-auto text-center"
                            />
                          </TableCell>
                          <TableCell className="text-center text-gray-400">—</TableCell>
                          <TableCell className="text-center text-gray-400">—</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsAdding(false)}>
                                <X className="h-4 w-4" />
                              </Button>
                              <Button size="icon" className="h-8 w-8" onClick={addStore} disabled={!newStore.name.trim()}>
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Store Rows */}
                      {stores.map((store) => (
                        <TableRow key={store.id}>
                          {editingId === store.id ? (
                            <>
                              <TableCell>
                                <Input
                                  value={editForm.name || ""}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <select
                                  value={editForm.concept || ""}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, concept: e.target.value }))}
                                  className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm"
                                >
                                  {conceptOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                  ))}
                                </select>
                              </TableCell>
                              <TableCell className="text-center">
                                <Input
                                  type="number"
                                  min={1}
                                  max={10}
                                  value={editForm.imageCount || 1}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, imageCount: parseInt(e.target.value) || 1 }))}
                                  className="h-8 w-16 mx-auto text-center"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <input
                                  type="checkbox"
                                  checked={editForm.hasInfographic || false}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, hasInfographic: e.target.checked }))}
                                  className="h-4 w-4 rounded border-input"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <input
                                  type="checkbox"
                                  checked={editForm.hasVideo || false}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, hasVideo: e.target.checked }))}
                                  className="h-4 w-4 rounded border-input"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" className="h-8 w-8" onClick={saveEdit}>
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="font-medium">{store.name}</TableCell>
                              <TableCell>
                                {store.concept ? (
                                  <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                                    {store.concept}
                                  </span>
                                ) : (
                                  <span className="text-gray-400">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">{store.imageCount}</TableCell>
                              <TableCell className="text-center">
                                {store.hasInfographic ? "✓" : "—"}
                              </TableCell>
                              <TableCell className="text-center">
                                {store.hasVideo ? "✓" : "—"}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleExportStore(store.id)}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startEdit(store)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-red-600 hover:text-red-700" 
                                    onClick={() => deleteStore(store.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}

                      {/* Empty State */}
                      {stores.length === 0 && !isAdding && (
                        <TableRow>
                          <TableCell colSpan={6} className="h-32 text-center">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <StoreIcon className="h-8 w-8 text-gray-300" />
                              <p className="text-sm text-gray-500">Henüz mağaza eklenmemiş</p>
                              <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} disabled={!backendOnline}>
                                <Plus className="mr-2 h-4 w-4" />
                                İlk Mağazanızı Ekleyin
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
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
      const updated = await storesApi.update(editingId, editForm)
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        {!isClient ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Yükleniyor...</div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-6xl space-y-6">
              {/* Backend Status */}
              {backendOnline === false && (
                <div className="glass rounded-xl border border-red-500/50 bg-red-500/10 p-4 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">Backend servisi çalışmıyor</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Backend klasöründe <code className="rounded bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 text-xs">make up</code> komutunu çalıştırın
                    </p>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="glass-strong rounded-2xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold gradient-text font-poppins mb-2">Mağazalar</h1>
                    <p className="text-gray-600 dark:text-gray-400">Mağazalarınızı ekleyin, yönetin ve export edin</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {stores.length > 0 && (
                      <Button
                        onClick={handleExportAll}
                        variant="outline"
                        className="glass border-white/20"
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Tümünü Export
                      </Button>
                    )}
                    <Button 
                      onClick={() => setIsAdding(true)}
                      disabled={!backendOnline || isAdding}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni Mağaza
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stores Table */}
              <Card className="glass-strong border-white/20 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border-b border-white/20">
                  <div className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold font-poppins">Mağaza Listesi</CardTitle>
                      <CardDescription className="mt-1">{stores.length} mağaza</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-white/50 dark:bg-gray-900/50">
                        <TableHead className="font-semibold">Mağaza Adı</TableHead>
                        <TableHead className="font-semibold">Konsept</TableHead>
                        <TableHead className="text-center font-semibold">Görsel</TableHead>
                        <TableHead className="text-center font-semibold">Infografik</TableHead>
                        <TableHead className="text-center font-semibold">Video</TableHead>
                        <TableHead className="w-[150px] font-semibold">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Add New Row */}
                      {isAdding && (
                        <TableRow className="bg-purple-50/50 dark:bg-purple-900/10">
                          <TableCell>
                            <Input
                              value={newStore.name}
                              onChange={(e) => setNewStore(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Mağaza adı"
                              className="h-9 glass border-white/20"
                              autoFocus
                            />
                          </TableCell>
                          <TableCell>
                            <select
                              value={newStore.concept}
                              onChange={(e) => setNewStore(prev => ({ ...prev, concept: e.target.value }))}
                              className="h-9 w-full rounded-lg glass border border-white/20 bg-background px-3 text-sm"
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
                              className="h-9 w-16 mx-auto text-center glass border-white/20"
                            />
                          </TableCell>
                          <TableCell className="text-center text-muted-foreground">—</TableCell>
                          <TableCell className="text-center text-muted-foreground">—</TableCell>
                          <TableCell>
                            <div className="flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setIsAdding(false)}>
                                <X className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="icon" 
                                className="h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                                onClick={addStore} 
                                disabled={!newStore.name.trim()}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}

                      {/* Store Rows */}
                      {stores.map((store) => (
                        <TableRow key={store.id} className="hover:bg-white/30 dark:hover:bg-gray-800/30 transition-colors">
                          {editingId === store.id ? (
                            <>
                              <TableCell>
                                <Input
                                  value={editForm.name || ""}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                  className="h-9 glass border-white/20"
                                />
                              </TableCell>
                              <TableCell>
                                <select
                                  value={editForm.concept || ""}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, concept: e.target.value }))}
                                  className="h-9 w-full rounded-lg glass border border-white/20 bg-background px-3 text-sm"
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
                                  className="h-9 w-16 mx-auto text-center glass border-white/20"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <input
                                  type="checkbox"
                                  checked={editForm.hasInfographic || false}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, hasInfographic: e.target.checked }))}
                                  className="h-4 w-4 rounded border-input accent-purple-600"
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <input
                                  type="checkbox"
                                  checked={editForm.hasVideo || false}
                                  onChange={(e) => setEditForm(prev => ({ ...prev, hasVideo: e.target.checked }))}
                                  className="h-4 w-4 rounded border-input accent-purple-600"
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={cancelEdit}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    className="h-8 w-8 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700" 
                                    onClick={saveEdit}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="font-semibold">{store.name}</TableCell>
                              <TableCell>
                                {store.concept ? (
                                  <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 px-3 py-1 text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50">
                                    {store.concept}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center font-medium">{store.imageCount}</TableCell>
                              <TableCell className="text-center">
                                {store.hasInfographic ? (
                                  <span className="text-emerald-600 font-semibold">✓</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                {store.hasVideo ? (
                                  <span className="text-emerald-600 font-semibold">✓</span>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30" 
                                    onClick={() => handleExportStore(store.id)}
                                    title="Export"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 hover:bg-purple-100 dark:hover:bg-purple-900/30" 
                                    onClick={() => startEdit(store)}
                                    title="Düzenle"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30" 
                                    onClick={() => deleteStore(store.id)}
                                    title="Sil"
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
                          <TableCell colSpan={6} className="h-64 text-center">
                            <div className="flex flex-col items-center justify-center gap-4">
                              <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 blur-2xl" />
                                <StoreIcon className="relative h-16 w-16 text-purple-500/50" />
                              </div>
                              <div>
                                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">Henüz mağaza eklenmemiş</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">İlk mağazanızı ekleyerek başlayın</p>
                                <Button 
                                  size="lg" 
                                  variant="outline" 
                                  onClick={() => setIsAdding(true)} 
                                  disabled={!backendOnline}
                                  className="glass border-white/20 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  İlk Mağazanızı Ekleyin
                                </Button>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

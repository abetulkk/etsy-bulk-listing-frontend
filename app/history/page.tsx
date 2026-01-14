"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History as HistoryIcon, Package, Clock, CheckCircle2, AlertCircle, Trash2, Image as ImageIcon, X, Eye, Download } from "lucide-react"
import { productsApi, storesApi, checkBackendHealth } from "@/lib/api"

interface ProductWithStores {
  id: string
  name: string | null
  mainImageUrl: string | null
  createdAt: string
  stores: Array<{
    storeId: string
    title: string | null
    description: string | null
    tags: string[]
    images: string[]
    status: string
  }>
}

export default function HistoryPage() {
  const [products, setProducts] = useState<ProductWithStores[]>([])
  const [stores, setStores] = useState<any[]>([])
  const [isClient, setIsClient] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [selectedStoreProduct, setSelectedStoreProduct] = useState<any | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    const init = async () => {
      const isOnline = await checkBackendHealth()
      setBackendOnline(isOnline)
      
      if (isOnline) {
        try {
          const [productList, storeList] = await Promise.all([
            productsApi.getAll(),
            storesApi.getAll(),
          ])
          setProducts(productList)
          setStores(storeList)
        } catch (error) {
          console.error("Error loading data:", error)
        }
      }
    }
    
    init()
  }, [])

  const deleteProduct = async (productId: string) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) return
    
    try {
      await productsApi.delete(productId)
      setProducts(prev => prev.filter(p => p.id !== productId))
    } catch (error) {
      console.error("Error deleting product:", error)
      alert("Ürün silinemedi!")
    }
  }

  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId)
    return store?.name || "Bilinmeyen Mağaza"
  }

  const exportToCSV = (storeProduct: any) => {
    const store = stores.find(s => s.id === storeProduct.storeId)
    if (!store) return

    const rows = storeProduct.images.map((url: string, idx: number) => [
      storeProduct.title || "",
      storeProduct.description || "",
      (storeProduct.tags || []).join(", "),
      url,
      idx === 0 ? "1" : "0"
    ])

    const headers = ["Title", "Description", "Tags", "Image URL", "Primary"]
    const csv = [headers.join(","), ...rows.map((r: string[]) => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${store.name}_export.csv`
    link.click()
  }

  const totalImages = products.reduce((acc, p) => acc + (p.stores || []).reduce((a, s) => a + (s.images?.length || 0), 0), 0)

  const DetailModal = () => {
    if (!selectedStoreProduct) return null
    const store = stores.find(s => s.id === selectedStoreProduct.storeId)

    return (
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStoreProduct(null)}>
        <div className="bg-white border-4 border-black shadow-brutal-lg max-w-2xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b-4 border-black bg-yellow-400">
            <div>
              <h2 className="font-bold uppercase">{store?.name || "Mağaza"}</h2>
              <p className="text-sm mt-1">{store?.concept}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => exportToCSV(selectedStoreProduct)}
                className="border-2 border-black bg-white hover:bg-black hover:text-white font-bold uppercase"
              >
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                onClick={() => setSelectedStoreProduct(null)}
                className="h-8 w-8 border-2 border-black hover:bg-red-500 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)] space-y-3 bg-gray-50">
            <div className="bg-white border-4 border-black p-3 shadow-brutal-sm">
              <p className="text-xs font-bold uppercase bg-yellow-400 px-2 py-1 border-2 border-black mb-2 inline-block">BAŞLIK</p>
              <p className="text-sm font-medium">{selectedStoreProduct.title || "—"}</p>
            </div>

            <div className="bg-white border-4 border-black p-3 shadow-brutal-sm">
              <p className="text-xs font-bold uppercase bg-yellow-400 px-2 py-1 border-2 border-black mb-2 inline-block">AÇIKLAMA</p>
              <p className="text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                {selectedStoreProduct.description || "—"}
              </p>
            </div>

            <div className="bg-white border-4 border-black p-3 shadow-brutal-sm">
              <p className="text-xs font-bold uppercase bg-yellow-400 px-2 py-1 border-2 border-black mb-2 inline-block">
                TAGLER ({selectedStoreProduct.tags?.length || 0})
              </p>
              <div className="flex flex-wrap gap-2">
                {(selectedStoreProduct.tags || []).map((tag: string, i: number) => (
                  <span key={i} className="text-xs border-2 border-black px-2 py-1 font-bold">{tag}</span>
                ))}
                {(!selectedStoreProduct.tags || selectedStoreProduct.tags.length === 0) && (
                  <span className="text-sm">—</span>
                )}
              </div>
            </div>

            <div className="bg-white border-4 border-black p-3 shadow-brutal-sm">
              <p className="text-xs font-bold uppercase bg-yellow-400 px-2 py-1 border-2 border-black mb-3 inline-block">
                GÖRSELLER ({selectedStoreProduct.images?.length || 0})
              </p>
              <div className="grid grid-cols-3 gap-2">
                {(selectedStoreProduct.images || []).map((url: string, idx: number) => (
                  <div key={idx} className="relative border-4 border-black">
                    <img src={url} alt="" className="aspect-square object-cover" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-yellow-400 border-2 border-black text-[10px] font-bold px-2 py-0.5">
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
            <div>
              <h1 className="text-2xl font-bold uppercase">Geçmiş</h1>
              <p className="text-sm mt-1">Üretim geçmişinizi görüntüleyin</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="border-4 border-black bg-white p-4 shadow-brutal">
                <p className="text-xs font-bold uppercase mb-2">Toplam Ürün</p>
                <p className="text-3xl font-bold">{products.length}</p>
              </div>
              <div className="border-4 border-black bg-white p-4 shadow-brutal">
                <p className="text-xs font-bold uppercase mb-2">Toplam Görsel</p>
                <p className="text-3xl font-bold">{totalImages}</p>
              </div>
              <div className="border-4 border-black bg-white p-4 shadow-brutal">
                <p className="text-xs font-bold uppercase mb-2">Mağaza</p>
                <p className="text-3xl font-bold">{stores.length}</p>
              </div>
            </div>

            {/* Products */}
            {products.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-lg font-bold uppercase bg-yellow-400 border-4 border-black px-4 py-2 shadow-brutal inline-block">
                  Ürünler
                </h2>
                
                {products.map((product) => (
                  <div key={product.id} className="border-4 border-black bg-white shadow-brutal">
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {product.mainImageUrl ? (
                          <img src={product.mainImageUrl} alt="" className="w-20 h-20 object-cover border-4 border-black" />
                        ) : (
                          <div className="w-20 h-20 border-4 border-black bg-gray-100 flex items-center justify-center">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-bold truncate">
                                {product.name || `Ürün #${product.id.slice(0, 8)}`}
                              </h3>
                              <div className="flex items-center gap-3 mt-2 text-sm">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                                </span>
                                <span className="bg-yellow-400 border-2 border-black px-2 py-0.5 font-bold text-xs">
                                  {(product.stores || []).length} mağaza
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 border-2 border-black hover:bg-red-500 hover:text-white"
                              onClick={() => deleteProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {(product.stores || []).length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                              {(product.stores || []).map((sp) => (
                                <button
                                  key={sp.storeId}
                                  className="flex items-center gap-2 border-2 border-black px-3 py-1.5 text-sm hover:bg-yellow-400 transition-colors font-medium"
                                  onClick={() => setSelectedStoreProduct(sp)}
                                >
                                  {sp.status === "COMPLETED" ? (
                                    <CheckCircle2 className="h-4 w-4 bg-green-400 border border-black" />
                                  ) : (
                                    <div className="h-4 w-4 border-2 border-black" />
                                  )}
                                  <span className="font-bold">{getStoreName(sp.storeId)}</span>
                                  <span>·</span>
                                  <span>{sp.images?.length || 0}</span>
                                  <Eye className="h-4 w-4" />
                                </button>
                              ))}
                            </div>
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
                  <HistoryIcon className="h-16 w-16 mb-4 border-4 border-black p-2" />
                  <h3 className="text-lg font-bold uppercase mb-2">Henüz geçmiş yok</h3>
                  <p className="text-sm mb-6">Dashboard'dan ilk ürününüzü oluşturun</p>
                  <Button 
                    asChild
                    className="border-4 border-black bg-yellow-400 hover:bg-yellow-500 font-bold uppercase shadow-brutal"
                  >
                    <a href="/">Dashboard'a Git</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      <DetailModal />
    </div>
  )
}

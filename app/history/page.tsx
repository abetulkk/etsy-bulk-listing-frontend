"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/Sidebar"
import Header from "@/components/Header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { History as HistoryIcon, Package, Clock, CheckCircle2, AlertCircle, Trash2, Image as ImageIcon, X, Eye, Download } from "lucide-react"
import { productsApi, storesApi, generateApi, checkBackendHealth } from "@/lib/api"

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
  const [tasks, setTasks] = useState<any[]>([])
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
          const [productList, storeList, taskList] = await Promise.all([
            productsApi.getAll(),
            storesApi.getAll(),
            generateApi.getTasks({ limit: 50 })
          ])
          setProducts(productList)
          setStores(storeList)
          setTasks(taskList)
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

  const totalImages = products.reduce((acc, p) => acc + p.stores.reduce((a, s) => a + s.images.length, 0), 0)

  const DetailModal = () => {
    if (!selectedStoreProduct) return null
    const store = stores.find(s => s.id === selectedStoreProduct.storeId)

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedStoreProduct(null)}>
        <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden border" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="font-semibold">{store?.name || "Mağaza"}</h2>
              <p className="text-sm text-muted-foreground">{store?.concept}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => exportToCSV(selectedStoreProduct)}>
                <Download className="h-4 w-4 mr-2" />
                CSV
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setSelectedStoreProduct(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)] space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">BAŞLIK</p>
              <p className="text-sm bg-muted p-2 rounded">{selectedStoreProduct.title || "—"}</p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">AÇIKLAMA</p>
              <p className="text-sm bg-muted p-2 rounded whitespace-pre-wrap max-h-32 overflow-y-auto">
                {selectedStoreProduct.description || "—"}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">TAGLER ({selectedStoreProduct.tags?.length || 0})</p>
              <div className="flex flex-wrap gap-1">
                {(selectedStoreProduct.tags || []).map((tag: string, i: number) => (
                  <span key={i} className="text-xs bg-secondary px-2 py-1 rounded">{tag}</span>
                ))}
                {(!selectedStoreProduct.tags || selectedStoreProduct.tags.length === 0) && (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">GÖRSELLER ({selectedStoreProduct.images?.length || 0})</p>
              <div className="grid grid-cols-3 gap-2">
                {(selectedStoreProduct.images || []).map((url: string, idx: number) => (
                  <div key={idx} className="relative">
                    <img src={url} alt="" className="aspect-square rounded object-cover border" />
                    {idx === 0 && (
                      <span className="absolute top-1 left-1 bg-primary text-primary-foreground text-[10px] font-medium px-1.5 py-0.5 rounded">
                        Primary
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
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Geçmiş</h1>
                <p className="text-muted-foreground">Üretim geçmişinizi görüntüleyin</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Toplam Ürün</CardDescription>
                    <CardTitle className="text-2xl">{products.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Toplam Görsel</CardDescription>
                    <CardTitle className="text-2xl">{totalImages}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Mağaza</CardDescription>
                    <CardTitle className="text-2xl">{stores.length}</CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Products */}
              {products.length > 0 ? (
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold">Ürünler</h2>
                  
                  {products.map((product) => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {product.mainImageUrl ? (
                            <img src={product.mainImageUrl} alt="" className="w-16 h-16 rounded object-cover border" />
                          ) : (
                            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-medium truncate">
                                  {product.name || `Ürün #${product.id.slice(0, 8)}`}
                                </h3>
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {new Date(product.createdAt).toLocaleDateString('tr-TR')}
                                  </span>
                                  <span>{product.stores.length} mağaza</span>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => deleteProduct(product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {product.stores.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {product.stores.map((sp) => (
                                  <button
                                    key={sp.storeId}
                                    className="flex items-center gap-2 rounded border px-2.5 py-1.5 text-sm hover:bg-secondary transition-colors"
                                    onClick={() => setSelectedStoreProduct(sp)}
                                  >
                                    {sp.status === "COMPLETED" ? (
                                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                                    ) : (
                                      <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground" />
                                    )}
                                    <span>{getStoreName(sp.storeId)}</span>
                                    <span className="text-muted-foreground">·</span>
                                    <span className="text-muted-foreground">{sp.images.length}</span>
                                    <Eye className="h-3 w-3 text-muted-foreground" />
                                  </button>
                                ))}
                              </div>
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
                    <HistoryIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium mb-1">Henüz geçmiş yok</h3>
                    <p className="text-sm text-muted-foreground mb-4">Dashboard'dan ilk ürününüzü oluşturun</p>
                    <Button asChild>
                      <a href="/">Dashboard'a Git</a>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      <DetailModal />
    </div>
  )
}

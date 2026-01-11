"use client"

import { useState, useEffect } from "react"
import ImageUpload from "./ImageUpload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, ChevronDown, ChevronUp, CheckCircle2, Circle, Download, AlertCircle, Loader2 } from "lucide-react"
import { ProductData, StoreContent, Store } from "@/types"
import { storesApi, productsApi, generateApi, checkBackendHealth } from "@/lib/api"

export default function ProductWorkspace() {
  const [productData, setProductData] = useState<ProductData>({
    mainImage: undefined,
    infographicCount: 0,
    stores: {},
  })
  const [currentProductId, setCurrentProductId] = useState<string | null>(null)
  const [productDescription, setProductDescription] = useState<string>("")
  const [stores, setStores] = useState<Store[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [expandedStores, setExpandedStores] = useState<Set<string>>(new Set())
  const [isClient, setIsClient] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  const [generationStatus, setGenerationStatus] = useState<Record<string, string>>({})

  useEffect(() => {
    setIsClient(true)
    
    const init = async () => {
      const isOnline = await checkBackendHealth()
      setBackendOnline(isOnline)
      
      if (isOnline) {
        try {
          const storeList = await storesApi.getAll()
          setStores(storeList)
          
          const products = await productsApi.getAll()
          if (products.length > 0) {
            const lastProduct = products[0]
            setCurrentProductId(lastProduct.id)
            
            if (lastProduct.mainImageUrl) {
              const storesData: Record<string, StoreContent> = {}
              lastProduct.stores?.forEach((sp: any) => {
                storesData[sp.storeId] = {
                  title: sp.title || "",
                  description: sp.description || "",
                  tags: sp.tags || [],
                  images: sp.images || [],
                }
              })
              
              setProductData({
                mainImage: lastProduct.mainImageUrl,
                infographicCount: lastProduct.infographicCount || 0,
                stores: storesData,
              })
            }
          }
        } catch (error) {
          console.error("Error loading data:", error)
        }
      }
    }
    
    init()
    
    const handleStoresUpdate = async () => {
      if (backendOnline) {
        const storeList = await storesApi.getAll()
        setStores(storeList)
      }
    }
    
    window.addEventListener('stores-updated', handleStoresUpdate)
    return () => window.removeEventListener('stores-updated', handleStoresUpdate)
  }, [])

  const handleImageChange = async (url: string | undefined) => {
    const updated = { ...productData, mainImage: url }
    setProductData(updated)
    
    if (backendOnline && url) {
      try {
        if (currentProductId) {
          await productsApi.update(currentProductId, { mainImageUrl: url })
        } else {
          const product = await productsApi.create({ mainImageUrl: url })
          setCurrentProductId(product.id)
        }
      } catch (error) {
        console.error("Error saving image:", error)
      }
    }
  }

  useEffect(() => {
    if (!currentProductId || !isGenerating) return
    
    const interval = setInterval(async () => {
      try {
        const status = await generateApi.getStatus(currentProductId)
        
        const newStatus: Record<string, string> = {}
        let allCompleted = true
        
        status.stores.forEach((s: any) => {
          newStatus[s.storeId] = s.status
          if (s.status === "GENERATING") {
            allCompleted = false
          }
        })
        
        setGenerationStatus(newStatus)
        
        if (allCompleted && Object.keys(newStatus).length > 0) {
          setIsGenerating(false)
          
          const product = await productsApi.getById(currentProductId)
          const newStores: Record<string, StoreContent> = {}
          
          product.stores.forEach((sp: any) => {
            newStores[sp.storeId] = {
              title: sp.title || "",
              description: sp.description || "",
              tags: sp.tags || [],
              images: sp.images || [],
            }
          })
          
          setProductData(prev => ({
            ...prev,
            stores: newStores,
          }))
        }
      } catch (error) {
        console.error("Error checking status:", error)
      }
    }, 3000)
    
    return () => clearInterval(interval)
  }, [currentProductId, isGenerating])

  const generateContent = async () => {
    if (!productData.mainImage) {
      alert("Lütfen önce bir görsel yükleyin!")
      return
    }

    if (!backendOnline) {
      alert("Backend servisi çalışmıyor!")
      return
    }

    if (stores.length === 0) {
      alert("Lütfen önce mağaza ekleyin!")
      return
    }

    setIsGenerating(true)

    try {
      let productId = currentProductId
      
      if (!productId) {
        const product = await productsApi.create({
          mainImageUrl: productData.mainImage,
          infographicCount: productData.infographicCount,
        })
        productId = product.id
        setCurrentProductId(productId)
      }
      
      await generateApi.generateAll({
        productId,
        mainImageUrl: productData.mainImage,
        productDescription,
      })
    } catch (error) {
      console.error("Generation error:", error)
      alert("İçerik üretiminde hata oluştu!")
      setIsGenerating(false)
    }
  }

  const startNewProduct = async () => {
    setProductData({ mainImage: undefined, infographicCount: 0, stores: {} })
    setCurrentProductId(null)
    setProductDescription("")
    setGenerationStatus({})
  }

  const toggleStore = (storeId: string) => {
    const newExpanded = new Set(expandedStores)
    if (newExpanded.has(storeId)) {
      newExpanded.delete(storeId)
    } else {
      newExpanded.add(storeId)
    }
    setExpandedStores(newExpanded)
  }

  const isStoreReady = (storeId: string) => {
    const storeContent = productData.stores[storeId]
    return storeContent && storeContent.images.length > 0
  }

  const getStoreStatus = (storeId: string) => {
    if (generationStatus[storeId]) {
      return generationStatus[storeId]
    }
    return isStoreReady(storeId) ? "COMPLETED" : "PENDING"
  }

  const exportToGetVela = (storeId: string) => {
    const storeContent = productData.stores[storeId]
    const store = stores.find(s => s.id === storeId)
    
    if (!storeContent || !store) return

    const rows: string[][] = []
    storeContent.images.forEach((imageUrl, index) => {
      rows.push([
        storeContent.title,
        storeContent.description,
        storeContent.tags.join(", "),
        imageUrl,
        index === 0 ? "1" : "0",
      ])
    })

    const headers = ["Title", "Description", "Tags", "Image URL", "Primary Image"]
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `${store.name.replace(/\s+/g, "_")}_getvela.csv`
    link.click()
  }

  if (!isClient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-4xl space-y-6">
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

        {/* No Stores Warning */}
        {stores.length === 0 && backendOnline && (
          <div className="flex items-center gap-3 rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-700">Mağaza bulunamadı</p>
              <p className="text-sm text-muted-foreground">
                Lütfen önce <a href="/stores" className="underline">Mağazalar</a> sayfasından mağaza ekleyin
              </p>
            </div>
          </div>
        )}

        {/* Image & Description */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ürün Görseli</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                label=""
                value={productData.mainImage}
                onChange={handleImageChange}
                onRemove={() => handleImageChange(undefined)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ürün Açıklaması</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Ürün özelliklerini, malzemelerini, boyutlarını yazın..."
                rows={8}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          {currentProductId && (
            <Button variant="outline" onClick={startNewProduct}>
              Yeni Ürün
            </Button>
          )}
          <Button
            onClick={generateContent}
            disabled={!productData.mainImage || isGenerating || !backendOnline || stores.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Üretiliyor...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                AI ile Üret
              </>
            )}
          </Button>
        </div>

        {/* Store Results */}
        {stores.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Mağaza Çıktıları</h2>
            
            {stores.map((store) => {
              const status = getStoreStatus(store.id)
              const isReady = status === "COMPLETED" && isStoreReady(store.id)
              const storeContent = productData.stores[store.id]
              const isExpanded = expandedStores.has(store.id)

              return (
                <Card key={store.id}>
                  <CardHeader 
                    className="cursor-pointer py-4"
                    onClick={() => toggleStore(store.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {status === "GENERATING" ? (
                          <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
                        ) : isReady ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <CardTitle className="text-base">{store.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {store.concept || "Konsept yok"}
                            {storeContent && ` • ${storeContent.images.length} görsel`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isReady && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => { e.stopPropagation(); exportToGetVela(store.id) }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Export
                          </Button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && storeContent && storeContent.images.length > 0 && (
                    <CardContent className="border-t pt-4">
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">BAŞLIK</p>
                          <p className="text-sm">{storeContent.title}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">AÇIKLAMA</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{storeContent.description}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">TAGLER ({storeContent.tags.length})</p>
                          <div className="flex flex-wrap gap-1">
                            {storeContent.tags.map((tag, i) => (
                              <span key={i} className="text-xs bg-secondary px-2 py-0.5 rounded">{tag}</span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-2">GÖRSELLER</p>
                          <div className="grid grid-cols-4 gap-2">
                            {storeContent.images.map((url, idx) => (
                              <img key={idx} src={url} alt="" className="aspect-square rounded object-cover border" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

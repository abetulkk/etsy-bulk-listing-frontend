"use client"

import { useState, useEffect } from "react"
import ImageUpload from "./ImageUpload"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  Circle, 
  Download, 
  AlertCircle, 
  Loader2,
  FileDown,
  Store as StoreIcon,
  X,
  Copy,
  Check
} from "lucide-react"
import { ProductData, StoreContent, Store } from "@/types"
import { storesApi, productsApi, generateApi, checkBackendHealth, exportApi } from "@/lib/api"
import { cn } from "@/lib/utils"

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
  const [copiedStoreId, setCopiedStoreId] = useState<string | null>(null)

  useEffect(() => {
    setIsClient(true)
    
    const init = async () => {
      const isOnline = await checkBackendHealth()
      setBackendOnline(isOnline)
      
      if (isOnline) {
        try {
          // Sadece mağaza listesini yükle, eski ürün verilerini yükleme
          const storeList = await storesApi.getAll()
          setStores(storeList)
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
      
      if (!productId) {
        throw new Error("Product ID is required")
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
    setExpandedStores(new Set())
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
    return storeContent && storeContent.title && storeContent.description
  }

  const getStoreStatus = (storeId: string) => {
    if (generationStatus[storeId]) {
      return generationStatus[storeId]
    }
    return isStoreReady(storeId) ? "COMPLETED" : "PENDING"
  }

  const handleExportProduct = async () => {
    if (!currentProductId) return
    
    try {
      const blob = await exportApi.exportProduct(currentProductId, "csv")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `product-${currentProductId}-export.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Export işlemi başarısız!")
    }
  }

  const handleExportStore = async (storeId: string) => {
    try {
      const blob = await exportApi.exportStore(storeId, "csv")
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `store-${storeId}-export.csv`
      link.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export error:", error)
      alert("Export işlemi başarısız!")
    }
  }

  const copyToClipboard = async (text: string, storeId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStoreId(storeId)
      setTimeout(() => setCopiedStoreId(null), 2000)
    } catch (error) {
      console.error("Copy error:", error)
    }
  }

  if (!isClient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const readyStoresCount = stores.filter(s => isStoreReady(s.id)).length

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-white">
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

        {/* No Stores Warning */}
        {stores.length === 0 && backendOnline && (
          <div className="flex items-center gap-4 border-4 border-black bg-yellow-400 p-4 shadow-brutal font-bold uppercase">
            <AlertCircle className="h-6 w-6" />
            <div>
              <p className="text-sm">Mağaza bulunamadı</p>
              <p className="text-xs mt-1 font-normal normal-case">
                Lütfen önce <a href="/stores" className="underline font-bold">Mağazalar</a> sayfasından mağaza ekleyin
              </p>
            </div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="flex items-center justify-between border-4 border-black bg-white p-4 shadow-brutal">
          <div className="flex items-center gap-8 text-sm font-bold uppercase">
            <div className="flex items-center gap-2">
              <span className="text-black">Mağaza:</span>
              <span className="bg-yellow-400 border-2 border-black px-3 py-1">{stores.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black">Hazır:</span>
              <span className="bg-yellow-400 border-2 border-black px-3 py-1">{readyStoresCount}</span>
            </div>
          </div>
          {currentProductId && readyStoresCount > 0 && (
            <Button
              onClick={handleExportProduct}
              variant="outline"
              size="sm"
              className="border-4 border-black bg-white hover:bg-yellow-400 font-bold uppercase shadow-brutal-sm hover:-translate-x-0.5 hover:-translate-y-0.5"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Export Tümü
            </Button>
          )}
        </div>

        {/* Image & Description */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="border-4 border-black bg-white p-6 shadow-brutal">
            <h3 className="text-sm font-bold uppercase mb-4 bg-yellow-400 border-2 border-black px-2 py-1 inline-block">
              Ürün Görseli
            </h3>
            <div className="mt-4">
              <ImageUpload
                label=""
                value={productData.mainImage}
                onChange={handleImageChange}
                onRemove={() => handleImageChange(undefined)}
              />
            </div>
          </div>

          <div className="border-4 border-black bg-white p-6 shadow-brutal">
            <h3 className="text-sm font-bold uppercase mb-4 bg-yellow-400 border-2 border-black px-2 py-1 inline-block">
              Ürün Açıklaması (Opsiyonel)
            </h3>
            <Textarea
              value={productDescription}
              onChange={(e) => setProductDescription(e.target.value)}
              placeholder="Ürün özelliklerini, malzemelerini, boyutlarını yazın..."
              rows={8}
              className="resize-none text-sm border-4 border-black mt-4 focus:ring-4 focus:ring-yellow-400"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4">
          {currentProductId && (
            <Button 
              variant="outline" 
              onClick={startNewProduct} 
              size="default"
              className="border-4 border-black bg-white hover:bg-gray-100 font-bold uppercase shadow-brutal hover:-translate-x-1 hover:-translate-y-1 transition-all"
            >
              <X className="mr-2 h-5 w-5" />
              Yeni Ürün
            </Button>
          )}
          <Button
            onClick={generateContent}
            disabled={!productData.mainImage || isGenerating || !backendOnline || stores.length === 0}
            size="default"
            className="border-4 border-black bg-yellow-400 hover:bg-yellow-500 font-bold uppercase shadow-brutal-lg hover:-translate-x-1 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed px-8 py-6 text-lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Üretiliyor...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                İçerik Oluştur
              </>
            )}
          </Button>
        </div>

        {/* Store Results */}
        {stores.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold uppercase flex items-center gap-2 bg-yellow-400 border-4 border-black px-4 py-2 shadow-brutal inline-block">
              <StoreIcon className="h-5 w-5" />
              Mağaza Çıktıları
            </h2>
            
            {stores.map((store) => {
              const status = getStoreStatus(store.id)
              const isReady = status === "COMPLETED" && isStoreReady(store.id)
              const storeContent = productData.stores[store.id]
              const isExpanded = expandedStores.has(store.id)

              return (
                <div key={store.id} className="border-4 border-black bg-white shadow-brutal">
                  <div 
                    className="cursor-pointer p-4 hover:bg-yellow-400 transition-colors"
                    onClick={() => toggleStore(store.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {status === "GENERATING" ? (
                          <Loader2 className="h-6 w-6 animate-spin" />
                        ) : isReady ? (
                          <CheckCircle2 className="h-6 w-6 bg-green-400 border-2 border-black p-0.5" />
                        ) : (
                          <Circle className="h-6 w-6 border-2 border-black" />
                        )}
                        <div>
                          <h3 className="text-sm font-bold uppercase">{store.name}</h3>
                          <p className="text-xs font-normal mt-1">
                            {store.concept || "Konsept yok"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isReady && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleExportStore(store.id) }}
                            className="h-8 text-xs border-2 border-black bg-white hover:bg-yellow-400 font-bold uppercase"
                          >
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                            Export
                          </Button>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5" />
                        ) : (
                          <ChevronDown className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                  </div>

                  {isExpanded && storeContent && storeContent.title && (
                    <div className="border-t-4 border-black bg-gray-50 p-4 space-y-3">
                      {/* Title */}
                      <div className="bg-white border-4 border-black p-3 shadow-brutal-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold uppercase bg-yellow-400 px-2 py-1 border-2 border-black">Başlık</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(storeContent.title, `${store.id}-title`)}
                            className="h-8 w-8 p-0 border-2 border-black hover:bg-yellow-400"
                          >
                            {copiedStoreId === `${store.id}-title` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm font-medium">{storeContent.title}</p>
                      </div>

                      {/* Description */}
                      <div className="bg-white border-4 border-black p-3 shadow-brutal-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold uppercase bg-yellow-400 px-2 py-1 border-2 border-black">Açıklama</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(storeContent.description, `${store.id}-desc`)}
                            className="h-8 w-8 p-0 border-2 border-black hover:bg-yellow-400"
                          >
                            {copiedStoreId === `${store.id}-desc` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{storeContent.description}</p>
                      </div>

                      {/* Tags */}
                      <div className="bg-white border-4 border-black p-3 shadow-brutal-sm">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold uppercase bg-yellow-400 px-2 py-1 border-2 border-black">
                            Etiketler ({storeContent.tags.length})
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(storeContent.tags.join(", "), `${store.id}-tags`)}
                            className="h-8 w-8 p-0 border-2 border-black hover:bg-yellow-400"
                          >
                            {copiedStoreId === `${store.id}-tags` ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {storeContent.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="px-2 py-1 text-xs font-bold border-2 border-black bg-white"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Images */}
                      {storeContent.images && storeContent.images.length > 0 && (
                        <div className="bg-white border-4 border-black p-3 shadow-brutal-sm">
                          <p className="text-xs font-bold uppercase bg-yellow-400 px-2 py-1 border-2 border-black mb-3 inline-block">
                            Görseller ({storeContent.images.length})
                          </p>
                          <div className="grid grid-cols-4 gap-3">
                            {storeContent.images.map((url, idx) => (
                              <div key={idx} className="relative aspect-square border-4 border-black shadow-brutal-sm">
                                <img 
                                  src={url} 
                                  alt={`${store.name} - ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                {idx === 0 && (
                                  <div className="absolute top-1 right-1 px-2 py-0.5 text-[10px] font-bold border-2 border-black bg-yellow-400">
                                    ANA
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

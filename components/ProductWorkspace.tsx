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
  Store,
  Zap,
  Image as ImageIcon,
  FileText,
  Tags,
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
    return storeContent && storeContent.images.length > 0
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
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    )
  }

  const readyStoresCount = stores.filter(s => isStoreReady(s.id)).length

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Hero Section */}
        <div className="glass-strong rounded-2xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold gradient-text font-poppins mb-2">
                AI İçerik Üretici
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Ürün görselinizi yükleyin, AI tüm mağazalarınız için içerik oluştursun
              </p>
            </div>
            {currentProductId && readyStoresCount > 0 && (
              <Button
                onClick={handleExportProduct}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Tümünü Export Et
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold gradient-text">{stores.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Mağaza</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold gradient-text">{readyStoresCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Hazır</div>
            </div>
            <div className="glass rounded-xl p-4 border border-white/20">
              <div className="text-2xl font-bold gradient-text">
                {Object.values(productData.stores).reduce((acc, s) => acc + (s.images?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Görsel</div>
            </div>
          </div>
        </div>

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

        {/* No Stores Warning */}
        {stores.length === 0 && backendOnline && (
          <div className="glass rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold text-yellow-700 dark:text-yellow-400">Mağaza bulunamadı</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Lütfen önce <a href="/stores" className="underline font-semibold">Mağazalar</a> sayfasından mağaza ekleyin
              </p>
            </div>
          </div>
        )}

        {/* Image & Description */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="glass-strong border-white/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border-b border-white/20">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-600" />
                Ürün Görseli
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ImageUpload
                label=""
                value={productData.mainImage}
                onChange={handleImageChange}
                onRemove={() => handleImageChange(undefined)}
              />
            </CardContent>
          </Card>

          <Card className="glass-strong border-white/20 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-indigo-500/10 border-b border-white/20">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-pink-600" />
                Ürün Açıklaması
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Textarea
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Ürün özelliklerini, malzemelerini, boyutlarını yazın..."
                rows={8}
                className="resize-none glass border-white/20"
              />
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          {currentProductId && (
            <Button 
              variant="outline" 
              onClick={startNewProduct}
              className="glass border-white/20"
            >
              <X className="mr-2 h-4 w-4" />
              Yeni Ürün
            </Button>
          )}
          <Button
            onClick={generateContent}
            disabled={!productData.mainImage || isGenerating || !backendOnline || stores.length === 0}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-700 hover:via-pink-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                AI İçerik Üretiliyor...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                <Zap className="mr-2 h-5 w-5" />
                AI ile Tüm Mağazalar İçin Üret
              </>
            )}
          </Button>
        </div>

        {/* Store Results */}
        {stores.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold gradient-text font-poppins flex items-center gap-2">
              <Store className="h-6 w-6" />
              Mağaza Çıktıları
            </h2>
            
            {stores.map((store) => {
              const status = getStoreStatus(store.id)
              const isReady = status === "COMPLETED" && isStoreReady(store.id)
              const storeContent = productData.stores[store.id]
              const isExpanded = expandedStores.has(store.id)

              return (
                <Card key={store.id} className="glass-strong border-white/20 overflow-hidden hover:shadow-xl transition-all">
                  <CardHeader 
                    className="cursor-pointer py-5 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-indigo-500/5 border-b border-white/20"
                    onClick={() => toggleStore(store.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {status === "GENERATING" ? (
                          <div className="relative">
                            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                            <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-md" />
                          </div>
                        ) : isReady ? (
                          <div className="relative">
                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                            <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md" />
                          </div>
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400" />
                        )}
                        <div>
                          <CardTitle className="text-lg font-bold font-poppins">{store.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2 mt-1">
                            <span>{store.concept || "Konsept yok"}</span>
                            {storeContent && storeContent.images.length > 0 && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <ImageIcon className="h-3 w-3" />
                                  {storeContent.images.length} görsel
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isReady && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => { e.stopPropagation(); handleExportStore(store.id) }}
                              className="glass border-white/20 hover:bg-purple-500/10"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Export
                            </Button>
                          </>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {isExpanded && storeContent && storeContent.images.length > 0 && (
                    <CardContent className="p-6 space-y-6">
                      {/* Title */}
                      <div className="glass rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">BAŞLIK</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(storeContent.title, `${store.id}-title`)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedStoreId === `${store.id}-title` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-base font-semibold">{storeContent.title}</p>
                      </div>

                      {/* Description */}
                      <div className="glass rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">AÇIKLAMA</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(storeContent.description, `${store.id}-desc`)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedStoreId === `${store.id}-desc` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{storeContent.description}</p>
                      </div>

                      {/* Tags */}
                      <div className="glass rounded-xl p-4 border border-white/20">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-2">
                            <Tags className="h-3 w-3" />
                            TAGLER ({storeContent.tags.length})
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(storeContent.tags.join(", "), `${store.id}-tags`)}
                            className="h-6 w-6 p-0"
                          >
                            {copiedStoreId === `${store.id}-tags` ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {storeContent.tags.map((tag, i) => (
                            <span 
                              key={i} 
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-700/50"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Images */}
                      <div className="glass rounded-xl p-4 border border-white/20">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                          <ImageIcon className="h-3 w-3" />
                          GÖRSELLER ({storeContent.images.length})
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {storeContent.images.map((url, idx) => (
                            <div key={idx} className="relative group">
                              <img 
                                src={url} 
                                alt={`${store.name} - Image ${idx + 1}`}
                                className="aspect-square rounded-xl object-cover border-2 border-white/20 shadow-lg group-hover:scale-105 transition-transform"
                              />
                              {idx === 0 && (
                                <div className="absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
                                  Ana
                                </div>
                              )}
                            </div>
                          ))}
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

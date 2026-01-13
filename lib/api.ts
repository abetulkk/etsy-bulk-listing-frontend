const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Stores API
export const storesApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/stores`)
    if (!res.ok) throw new Error("Failed to fetch stores")
    return res.json()
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/api/stores/${id}`)
    if (!res.ok) throw new Error("Failed to fetch store")
    return res.json()
  },

  create: async (data: any) => {
    const res = await fetch(`${API_URL}/api/stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create store")
    return res.json()
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/api/stores/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update store")
    return res.json()
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/api/stores/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete store")
  },
}

// Products API
export const productsApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/products`)
    if (!res.ok) throw new Error("Failed to fetch products")
    const products = await res.json()
    // Backend storeProducts döndürüyor, frontend stores bekliyor - dönüştür
    return products.map((p: any) => ({
      ...p,
      stores: (p.storeProducts || []).map((sp: any) => ({
        ...sp,
        storeId: sp.storeId || sp.store?.id,
      })),
    }))
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/api/products/${id}`)
    if (!res.ok) throw new Error("Failed to fetch product")
    const product = await res.json()
    // Backend storeProducts döndürüyor, frontend stores bekliyor - dönüştür
    return {
      ...product,
      stores: (product.storeProducts || []).map((sp: any) => ({
        ...sp,
        storeId: sp.storeId || sp.store?.id,
      })),
    }
  },

  create: async (data: any) => {
    const res = await fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create product")
    return res.json()
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update product")
    return res.json()
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete product")
  },
}

// Store Products API
export const storeProductsApi = {
  getAll: async (params?: { storeId?: string; productId?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.storeId) searchParams.set("storeId", params.storeId)
    if (params?.productId) searchParams.set("productId", params.productId)
    
    const res = await fetch(`${API_URL}/api/store-products?${searchParams}`)
    if (!res.ok) throw new Error("Failed to fetch store products")
    return res.json()
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/api/store-products/${id}`)
    if (!res.ok) throw new Error("Failed to fetch store product")
    return res.json()
  },

  getByStoreAndProduct: async (storeId: string, productId: string) => {
    const res = await fetch(`${API_URL}/api/store-products?storeId=${storeId}&productId=${productId}`)
    if (!res.ok) throw new Error("Failed to fetch store product")
    const data = await res.json()
    return data[0] || null
  },
}

// Templates API
export const templatesApi = {
  getAll: async (type?: string) => {
    const searchParams = type ? `?type=${type}` : ''
    const res = await fetch(`${API_URL}/api/templates${searchParams}`)
    if (!res.ok) throw new Error("Failed to fetch templates")
    return res.json()
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/api/templates/${id}`)
    if (!res.ok) throw new Error("Failed to fetch template")
    return res.json()
  },

  create: async (data: any) => {
    const res = await fetch(`${API_URL}/api/templates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to create template")
    return res.json()
  },

  update: async (id: string, data: any) => {
    const res = await fetch(`${API_URL}/api/templates/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to update template")
    return res.json()
  },

  delete: async (id: string) => {
    const res = await fetch(`${API_URL}/api/templates/${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete template")
  },
}

// Generation API
export const generateApi = {
  generateAll: async (data: { productId: string; mainImageUrl?: string; productDescription?: string }) => {
    const res = await fetch(`${API_URL}/api/generate/all`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to start generation")
    return res.json()
  },

  generateForStore: async (data: { storeId: string; productId: string; mainImageUrl?: string; productDescription?: string }) => {
    const res = await fetch(`${API_URL}/api/generate/store`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to start generation")
    return res.json()
  },

  generateContent: async (data: { storeId: string; productId: string; productDescription?: string; mainImageUrl?: string }) => {
    const res = await fetch(`${API_URL}/api/generate/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to generate content")
    return res.json()
  },

  generateImage: async (data: { storeId: string; productId: string; prompt?: string; imageUrls: string[] }) => {
    const res = await fetch(`${API_URL}/api/generate/image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to generate image")
    return res.json()
  },

  getStatus: async (productId: string) => {
    const res = await fetch(`${API_URL}/api/generate/status/${productId}`)
    if (!res.ok) throw new Error("Failed to fetch status")
    return res.json()
  },

  getTasks: async (params?: { limit?: number }) => {
    // Backend'de ayrı bir tasks endpoint'i yok, boş array döndür
    return []
  },
}

// Upload API
export const uploadApi = {
  upload: async (file: File): Promise<{ url: string; id: string; filename: string; mimetype: string; size: number }> => {
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: formData,
    })
    if (!res.ok) throw new Error("Failed to upload file")
    return res.json()
  },
}

// Export API
export const exportApi = {
  exportProduct: async (productId: string, format: "json" | "csv" = "csv"): Promise<Blob> => {
    const res = await fetch(`${API_URL}/api/export/product/${productId}?format=${format}`)
    if (!res.ok) throw new Error("Failed to export product")
    return res.blob()
  },

  exportStore: async (storeId: string, format: "json" | "csv" = "csv"): Promise<Blob> => {
    const res = await fetch(`${API_URL}/api/export/store/${storeId}?format=${format}`)
    if (!res.ok) throw new Error("Failed to export store")
    return res.blob()
  },

  exportAll: async (format: "json" | "csv" = "csv"): Promise<Blob> => {
    const res = await fetch(`${API_URL}/api/export/all?format=${format}`)
    if (!res.ok) throw new Error("Failed to export all")
    return res.blob()
  },
}

// Health check
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/api/stores`)
    return res.ok
  } catch {
    return false
  }
}

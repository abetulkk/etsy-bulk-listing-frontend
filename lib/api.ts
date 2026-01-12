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
      method: "PUT",
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
    return res.json()
  },

  getById: async (id: string) => {
    const res = await fetch(`${API_URL}/api/products/${id}`)
    if (!res.ok) throw new Error("Failed to fetch product")
    return res.json()
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
      method: "PUT",
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

  getStoreContent: async (productId: string, storeId: string) => {
    const res = await fetch(`${API_URL}/api/products/${productId}/stores/${storeId}`)
    if (!res.ok) throw new Error("Failed to fetch store content")
    return res.json()
  },
}

// Templates API
export const templatesApi = {
  getAll: async () => {
    const res = await fetch(`${API_URL}/api/templates`)
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
      method: "PUT",
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

  generateContent: async (data: { storeId: string; productId: string; productDescription?: string }) => {
    const res = await fetch(`${API_URL}/api/generate/content`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error("Failed to generate content")
    return res.json()
  },

  generateImage: async (data: { storeId: string; productId: string; prompt?: string; referenceImageUrl?: string }) => {
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

  getTasks: async (params?: { status?: string; type?: string; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set("status", params.status)
    if (params?.type) searchParams.set("type", params.type)
    if (params?.limit) searchParams.set("limit", params.limit.toString())
    
    const res = await fetch(`${API_URL}/api/generate/tasks?${searchParams}`)
    if (!res.ok) throw new Error("Failed to fetch tasks")
    return res.json()
  },
}

// Upload API
export const uploadApi = {
  upload: async (file: File): Promise<{ url: string; filename: string }> => {
    // Dosyayı base64'e çevir
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    const res = await fetch(`${API_URL}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ file: base64, filename: file.name }),
    })
    if (!res.ok) throw new Error("Failed to upload file")
    return res.json()
  },
}

// Health check
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const res = await fetch(`${API_URL}/health`)
    return res.ok
  } catch {
    return false
  }
}

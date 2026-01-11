export interface Store {
  id: string
  name: string
  concept: string
  imageCount: number
  titleTemplate: string
  descriptionTemplate: string
  tagsTemplate: string
  aboutTemplate: string
  shippingTemplate: string
  returnTemplate: string
  hasInfographic: boolean
  hasVideo: boolean
  createdAt?: string
  updatedAt?: string
}

export interface StoreContent {
  title: string
  description: string
  tags: string[]
  images: string[]
}

export interface ProductData {
  mainImage?: string
  infographicCount: number
  stores: Record<string, StoreContent>
}

export interface Template {
  id: string
  name: string
  content: string
  type: "shipping" | "description" | "return" | "about" | "other"
  stores: string[]
  createdAt?: string
  updatedAt?: string
}

export interface GenerationTask {
  id: string
  type: "IMAGE_GENERATION" | "CONTENT_GENERATION"
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
  storeId: string
  productId: string
  taskId: string | null
  prompt: string | null
  resultUrl: string | null
  errorMsg: string | null
  createdAt: string
  updatedAt: string
}

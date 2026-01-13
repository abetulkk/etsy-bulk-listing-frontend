"use client"

import { usePathname } from "next/navigation"
import { Sparkles } from "lucide-react"

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "Dashboard", description: "AI ile ürün içeriği oluşturun" },
  "/stores": { title: "Mağazalar", description: "Mağazalarınızı yönetin ve organize edin" },
  "/templates": { title: "Şablonlar", description: "İçerik şablonlarınızı düzenleyin" },
  "/history": { title: "Geçmiş", description: "Geçmiş üretimleri görüntüleyin ve yönetin" },
}

export default function Header() {
  const pathname = usePathname()
  const page = pageTitles[pathname] || { title: "EtsyMultiLister", description: "" }

  return (
    <header className="glass-strong sticky top-0 z-50 border-b border-white/20">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-75 blur-md animate-glow" />
              <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text font-poppins">
                {page.title}
              </h1>
              {page.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {page.description}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600" />
        </div>
      </div>
    </header>
  )
}

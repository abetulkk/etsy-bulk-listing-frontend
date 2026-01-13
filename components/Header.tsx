"use client"

import { usePathname } from "next/navigation"

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "Dashboard", description: "Ürün içeriği oluşturun" },
  "/stores": { title: "Mağazalar", description: "Mağazalarınızı yönetin ve organize edin" },
  "/templates": { title: "Şablonlar", description: "İçerik şablonlarınızı düzenleyin" },
  "/history": { title: "Geçmiş", description: "Geçmiş üretimleri görüntüleyin ve yönetin" },
}

export default function Header() {
  const pathname = usePathname()
  const page = pageTitles[pathname] || { title: "EtsyMultiLister", description: "" }

  return (
    <header className="sticky top-0 z-50 border-b bg-white dark:bg-gray-950">
      <div className="flex h-16 items-center justify-between px-6">
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {page.title}
          </h1>
          {page.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {page.description}
            </p>
          )}
        </div>
      </div>
    </header>
  )
}

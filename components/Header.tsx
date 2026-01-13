"use client"

import { usePathname } from "next/navigation"

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "Dashboard", description: "Ürün içeriği oluşturun" },
  "/stores": { title: "Mağazalar", description: "Mağazalarınızı yönetin" },
  "/templates": { title: "Şablonlar", description: "İçerik şablonlarınızı düzenleyin" },
  "/history": { title: "Geçmiş", description: "Geçmiş üretimleri görüntüleyin" },
}

export default function Header() {
  const pathname = usePathname()
  const page = pageTitles[pathname] || { title: "EtsyMultiLister", description: "" }

  return (
    <header className="flex h-14 items-center border-b bg-white px-6">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{page.title}</h1>
        {page.description && (
          <p className="text-sm text-gray-500">{page.description}</p>
        )}
      </div>
    </header>
  )
}

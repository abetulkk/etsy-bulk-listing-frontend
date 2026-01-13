"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  Store, 
  FileText, 
  History, 
  LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { checkBackendHealth } from "@/lib/api"

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Store, label: "Mağazalar", href: "/stores" },
  { icon: FileText, label: "Şablonlar", href: "/templates" },
  { icon: History, label: "Geçmiş", href: "/history" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)

  useEffect(() => {
    const checkHealth = async () => {
      const isOnline = await checkBackendHealth()
      setBackendOnline(isOnline)
    }
    
    checkHealth()
    const interval = setInterval(checkHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
            E
          </div>
          <span className="text-lg font-semibold text-gray-900">EtsyMultiLister</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Status */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className={cn(
            "h-2 w-2 rounded-full",
            backendOnline ? "bg-green-500" : backendOnline === false ? "bg-red-500" : "bg-gray-300"
          )} />
          <span>
            {backendOnline ? "Bağlı" : backendOnline === false ? "Bağlantı yok" : "Kontrol ediliyor..."}
          </span>
        </div>
      </div>
    </div>
  )
}

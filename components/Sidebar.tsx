"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Store, FileText, History, LucideIcon } from "lucide-react"
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
    <div className="flex h-screen w-64 flex-col border-r bg-background">
      {/* Logo */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            E
          </div>
          <span>Etsy Studio</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Status */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "h-2 w-2 rounded-full",
            backendOnline ? "bg-green-500" : backendOnline === false ? "bg-red-500" : "bg-muted-foreground"
          )} />
          <span className="text-muted-foreground">
            {backendOnline ? "Backend çalışıyor" : backendOnline === false ? "Backend kapalı" : "Kontrol ediliyor..."}
          </span>
        </div>
      </div>
    </div>
  )
}

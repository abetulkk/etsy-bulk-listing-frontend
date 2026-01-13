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
  Sparkles,
  Download,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { checkBackendHealth } from "@/lib/api"

interface NavItem {
  icon: LucideIcon
  label: string
  href: string
  badge?: string
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
    <div className="flex h-screen w-72 flex-col glass border-r border-white/20">
      {/* Logo */}
      <div className="flex h-20 items-center border-b border-white/20 px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 opacity-60 blur-lg group-hover:opacity-80 transition-opacity" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 shadow-lg group-hover:scale-105 transition-transform">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <div className="text-lg font-bold gradient-text font-poppins">
              EtsyMultiLister
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              AI-Powered Content
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 text-purple-700 dark:text-purple-300 shadow-lg"
                  : "text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 hover:text-purple-600 dark:hover:text-purple-400"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-gradient-to-b from-purple-500 via-pink-500 to-indigo-500" />
              )}
              <Icon className={cn(
                "h-5 w-5 transition-transform",
                isActive && "scale-110"
              )} />
              <span className="font-poppins">{item.label}</span>
              {item.badge && (
                <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Status & Quick Actions */}
      <div className="border-t border-white/20 p-4 space-y-3">
        {/* Status */}
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <div className={cn(
              "h-2.5 w-2.5 rounded-full transition-all",
              backendOnline ? "bg-emerald-500 shadow-lg shadow-emerald-500/50" : 
              backendOnline === false ? "bg-red-500 shadow-lg shadow-red-500/50" : 
              "bg-gray-400 animate-pulse"
            )} />
            <span className="text-gray-700 dark:text-gray-300 font-poppins">
              {backendOnline ? "Backend Aktif" : backendOnline === false ? "Backend Kapalı" : "Kontrol ediliyor..."}
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="glass rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-gray-700 dark:text-gray-300 font-medium">
              AI Powered
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

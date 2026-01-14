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
    <div className="flex h-screen w-64 flex-col border-r-4 border-black bg-white">
      {/* Logo */}
      <div className="flex h-20 items-center border-b-4 border-black px-6 bg-yellow-400">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center border-4 border-black bg-white font-bold text-xl shadow-brutal-sm">
            E
          </div>
          <span className="text-lg font-bold uppercase tracking-tight">Etsy<br/>MultiLister</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 border-4 border-black px-4 py-3 font-bold uppercase text-sm transition-all",
                isActive
                  ? "bg-yellow-400 shadow-brutal translate-x-0 translate-y-0"
                  : "bg-white hover:bg-yellow-400 hover:shadow-brutal hover:-translate-x-1 hover:-translate-y-1"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Status */}
      <div className="border-t-4 border-black p-4 bg-white">
        <div className="flex items-center gap-3 border-4 border-black px-4 py-3 bg-white font-bold text-xs uppercase">
          <div className={cn(
            "h-4 w-4 border-2 border-black",
            backendOnline ? "bg-green-400" : backendOnline === false ? "bg-red-500" : "bg-gray-300"
          )} />
          <span>
            {backendOnline ? "ONLINE" : backendOnline === false ? "OFFLINE" : "..."}
          </span>
        </div>
      </div>
    </div>
  )
}

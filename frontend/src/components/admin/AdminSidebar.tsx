"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Package, 
  UserCircle, 
  Layers, 
  UserCog, 
  BarChart, 
  Settings, 
  Menu, 
  X,
  ClipboardList,
  Calendar
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MenuItem {
  name: string
  path: string
  icon: React.ReactNode
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { name: "Orders", path: "/admin/orders", icon: <ShoppingCart className="h-5 w-5" /> },
  { name: "Job Queue", path: "/admin/job-queue", icon: <ClipboardList className="h-5 w-5" /> },
  { name: "Work Order", path: "/admin/work-order", icon: <Calendar className="h-5 w-5" /> },
  { name: "Customers", path: "/admin/customers", icon: <Users className="h-5 w-5" /> },
  { name: "Payments", path: "/admin/payments", icon: <CreditCard className="h-5 w-5" /> },
  { name: "Services", path: "/admin/services", icon: <Package className="h-5 w-5" /> },
  { name: "Users", path: "/admin/users", icon: <UserCircle className="h-5 w-5" /> },
  { name: "Inventory", path: "/admin/inventory", icon: <Layers className="h-5 w-5" /> },
  { name: "Employees", path: "/admin/employees", icon: <UserCog className="h-5 w-5" /> },
  { name: "Reports", path: "/admin/reports", icon: <BarChart className="h-5 w-5" /> },
  { name: "Settings", path: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
]

interface AdminSidebarProps {
  className?: string
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkScreenSize()
    
    // Add event listener for window resize
    window.addEventListener("resize", checkScreenSize)
    
    // Clean up
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const isActive = (path: string) => {
    if (!pathname) return false;
    return pathname.includes(path);
  }

  const SidebarContent = (
    <div className="flex h-full flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
          </svg>
          <span>Laundry Admin</span>
        </Link>
      </div>
      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive(item.path)
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )

  if (isMobile) {
    return (
      <div className="block md:hidden absolute left-2 top-2 z-40">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[250px]">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <aside className={cn("sticky top-0 hidden h-screen flex-shrink-0 md:flex", className)}>
      {SidebarContent}
    </aside>
  )
} 
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, Users, Calendar, CreditCard, BarChart3, Settings, FileText, UserCheck, Building } from "lucide-react"
import { cn } from "@/lib/utils"

const adminMenuItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: BarChart3,
  },
  {
    title: "Véhicules",
    href: "/admin/vehicules",
    icon: Car,
  },
  {
    title: "Réservations",
    href: "/admin/reservations",
    icon: Calendar,
  },
  {
    title: "Clients",
    href: "/admin/clients",
    icon: Users,
  },
  {
    title: "Employés",
    href: "/admin/employes",
    icon: UserCheck,
  },
  {
    title: "Paiements",
    href: "/admin/paiements",
    icon: CreditCard,
  },
  {
    title: "Rapports",
    href: "/admin/rapports",
    icon: FileText,
  },
  {
    title: "Agences",
    href: "/admin/agences",
    icon: Building,
  },
  {
    title: "Paramètres",
    href: "/admin/parametres",
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-16 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Administration</h2>
        <nav className="space-y-2">
          {adminMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
                  isActive ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}

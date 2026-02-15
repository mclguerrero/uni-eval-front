"use client"

import { BarChart, FileText, Users, FileCode, Download, Star } from "lucide-react"
import { AppSidebar, type SidebarMenuItem } from "../../../../../components/ui/app-sidebar"

const adminMenuItems: SidebarMenuItem[] = [
  {
    href: "/admin/dashboard",
    icon: BarChart,
    label: "Dashboard",
    description: "Panel principal"
  },
  {
    href: "/admin/docente",
    icon: Users,
    label: "Docentes",
    description: "Gestión docentes"
  },
  {
    href: "/admin/roles",
    icon: Star,
    label: "Roles",
    description: "Permisos usuario"
  },
  {
    href: "/admin/formulario",
    icon: FileCode,
    label: "Formulario",
    description: "Crear formularios"
  },
  {
    href: "/admin/informes",
    icon: FileText,
    label: "Informes",
    description: "Evaluaciones genéricas"
  },
  {
    href: "/admin/reportes",
    icon: Download,
    label: "Reportes",
    description: "Reportes y análisis IA"
  }
]

interface AdminSidebarProps {
  isCollapsed?: boolean
  onToggle?: (collapsed: boolean) => void
}

export function AdminSidebar({ isCollapsed = false, onToggle }: AdminSidebarProps) {
  return (
    <AppSidebar
      title="Admin"
      titleIcon={BarChart}
      menuItems={adminMenuItems}
      primaryColor="blue"
      secondaryColor="indigo"
      isCollapsed={isCollapsed}
      onToggle={onToggle}
    />
  )
}

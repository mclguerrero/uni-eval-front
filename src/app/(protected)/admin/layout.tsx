"use client"

import type React from "react"
import { AdminSidebar } from "./components/admin-sidebar"
import { useSidebar } from "@/hooks/useSidebar"
import { useRequireRole } from "@/src/api/core/auth/useAuth"
import { APP_ROLE_IDS } from "@/src/api/core/auth/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isCollapsed, toggle } = useSidebar()
  const { isAuthorized } = useRequireRole(APP_ROLE_IDS.ADMIN)

  // Si no está autorizado, mostrar mensaje de acceso denegado
  if (isAuthorized === false) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              No tienes permisos para acceder al panel de administración. 
              Solo los administradores pueden acceder a esta área.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Sidebar */}
      <AdminSidebar 
        isCollapsed={isCollapsed} 
        onToggle={toggle} 
      />
      
      {/* Contenido principal - padding-left para compensar sidebar fijo sin desbordar */}
      <main
        className={`min-h-screen min-w-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="min-w-0">
          {children}
        </div>
      </main>
    </div>
  )
}
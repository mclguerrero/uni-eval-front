// ================================
// FILE: app/(protected)/estudiante/materias/[id]/page.tsx
// ================================

"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { configuracionEvaluacionService, type EvalByUserItem } from "@/src/api"
import { useParams } from "next/navigation"
import { BookOpen, GraduationCap } from "lucide-react"
import EvaluationCard from "../../components/EvaluationCard"

export default function EstudianteDashboard() {
  const { toast } = useToast()
  const [evaluaciones, setEvaluaciones] = useState<EvalByUserItem[]>([])
  const [loading, setLoading] = useState(true)
  const params = useParams()

  const configId = params?.id
  const id = configId ? (Array.isArray(configId) ? Number(configId[0]) : Number(configId)) : null

  useEffect(() => {
    const cargarDatos = async () => {
      if (id === null || isNaN(id)) {
        toast({
          title: "Error",
          description: "No se pudo identificar la configuración",
          variant: "destructive",
        })
        setLoading(false)
        return
      }

      try {
        const response = await configuracionEvaluacionService.getEvaluacionesByCfgT(id)

        if (response.success && Array.isArray(response.data)) {
          setEvaluaciones(response.data)
        } else {
          setEvaluaciones([])
        }
      } catch (error) {
        console.error(error)
        toast({
          title: "Error",
          description: "No se pudieron cargar las evaluaciones",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (configId !== undefined) cargarDatos()
  }, [toast, id, configId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-800"></div>
      </div>
    )
  }

  return (
    <div className="">
      <main className="container mx-auto px-3 sm:px-4 md:px-8 py-4 sm:py-8 max-w-7xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">

          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-gray-900 flex items-center justify-center shadow-lg shrink-0">
              <GraduationCap className="text-white w-6 h-6 sm:w-7 sm:h-7" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Evaluaciones Académicas
              </h1>
              <p className="text-gray-500 mt-1 text-sm sm:text-base">
                Selecciona una materia y evalúa el desempeño del docente
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-0">

            {evaluaciones.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-7">
                {evaluaciones.map(e => (
                  <EvaluationCard key={e.id} evaluacion={e} />
                ))}
              </div>
            )}

          </CardContent>
        </Card>
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string, value: number }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm text-center">
      <p className="text-xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center">
        <BookOpen className="w-9 h-9 text-gray-400" />
      </div>

      <h3 className="text-xl font-semibold text-gray-800">
        No tienes evaluaciones asignadas
      </h3>

      <p className="text-gray-500 mt-2">
        Cuando tengas evaluaciones disponibles aparecerán aquí.
      </p>
    </div>
  )
}


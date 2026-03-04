"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  BookOpen, 
  Users, 
  CheckCircle2, 
  BarChart3, 
  ArrowRight, 
  X,
  Target,
  GraduationCap,
  Layers,
  Search,
  TrendingUp
} from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import AspectoMetricsModal from "./AspectoMetricsModal"
import CompletionModal from "./CompletionModal"
import { metricService } from "@/src/api/services/metric/metric.service"
import type { DocenteGeneralMetrics, DocenteMateriasMetrics, MateriaMetric } from "@/src/api/services/metric/metric.service"

interface FiltrosState {
  configuracionSeleccionada: number | null
  semestreSeleccionado: string
  periodoSeleccionado: string
  programaSeleccionado: string
  grupoSeleccionado: string
  sedeSeleccionada: string
}

interface MateriasModalProps {
  docente: DocenteGeneralMetrics
  filtros: FiltrosState
  onClose: () => void
}

export default function MateriasModal({ docente, filtros, onClose }: MateriasModalProps) {
  const [materiasData, setMateriasData] = useState<DocenteMateriasMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMateria, setSelectedMateria] = useState<MateriaMetric | null>(null)
  const [showAspectoModal, setShowAspectoModal] = useState(false)
  const [showCompletionModal, setShowCompletionModal] = useState(false)

  useEffect(() => {
    cargarMaterias()
  }, [])

  const cargarMaterias = async () => {
    try {
      setLoading(true)
      const response = await metricService.getDocenteMaterias(docente.docente, {
        cfg_t: filtros.configuracionSeleccionada!,
        sede: filtros.sedeSeleccionada || undefined,
        periodo: filtros.periodoSeleccionado || undefined,
        programa: filtros.programaSeleccionado || undefined,
        semestre: filtros.semestreSeleccionado || undefined,
      })

      // Mantener las materias tal cual sin aplanar grupos
      setMateriasData(response)
    } catch (error) {
      console.error('Error cargando materias:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewAspectos = (materia: MateriaMetric) => {
    setSelectedMateria(materia)
    setShowAspectoModal(true)
  }

  const handleViewCompletion = (materia: MateriaMetric) => {
    setSelectedMateria(materia)
    setShowCompletionModal(true)
  }

  return (
    <>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4 overflow-hidden" onClick={onClose}>
        <div
          className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-white border-b border-slate-100 p-8 flex items-center justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 p-8 opacity-[0.03] pointer-events-none">
              <Layers className="w-48 h-48 rotate-12 text-slate-900" />
            </div>
            <div className="flex items-center gap-6 relative z-10">
              <div className="h-16 w-16 bg-indigo-50 rounded-[1.5rem] border border-indigo-100 flex items-center justify-center shadow-sm">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-3xl font-black italic tracking-tight uppercase leading-none mb-2 text-slate-900">Cátedras Asignadas</h2>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                    Identificador Docente: <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg ml-1 border border-indigo-100">{docente.docente}</span>
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-12 w-12 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center transition-all duration-300 group z-10"
            >
              <X className="w-6 h-6 text-slate-400 group-hover:rotate-90 group-hover:text-slate-900 transition-all" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-10 bg-slate-50/30 custom-scrollbar">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-8 bg-white rounded-[2.5rem] border-2 border-slate-100/50 space-y-6">
                    <div className="flex justify-between">
                      <div className="space-y-3">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-16 rounded-2xl" />
                      <Skeleton className="h-16 rounded-2xl" />
                    </div>
                    <div className="space-y-2">
                       <Skeleton className="h-2 w-full" />
                    </div>
                    <div className="flex gap-4">
                      <Skeleton className="h-10 flex-1 rounded-2xl" />
                      <Skeleton className="h-10 flex-1 rounded-2xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !materiasData || materiasData.materias.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <BookOpen className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-black italic">Sin registros</h3>
                <p className="font-medium text-sm">No se encontraron materias vinculadas.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {materiasData.materias.map((materia, index) => {
                  // Determinar si tiene múltiples grupos
                  const tieneMultiplesGrupos = materia.grupos && materia.grupos.length > 0
                  const gruposDisplay = tieneMultiplesGrupos 
                    ? materia.grupos!.map(g => g.grupo).join(', ') 
                    : materia.grupo || 'N/A'
                  
                  return (
                  <div
                    key={`${materia.codigo_materia}-${index}`}
                    className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all duration-500 hover:border-indigo-100 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform duration-700 pointer-events-none">
                      <BookOpen className="w-24 h-24 text-indigo-900" />
                    </div>

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 italic tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">
                          {materia.nombre_materia}
                        </h3>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide leading-snug">
                          {materia.nom_programa}
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          {materia.semestre}
                        </p>
                        <div className="flex items-center gap-3">
                           <Badge variant="outline" className="rounded-full bg-slate-50 border-slate-100 text-slate-500 font-black text-[9px] px-3 uppercase tracking-widest">
                            {tieneMultiplesGrupos ? 'GRUPOS' : 'GRUPO'}: {gruposDisplay}
                          </Badge>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {materia.codigo_materia}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-5 mb-8 relative z-10">
                      <div className="p-5 rounded-2xl bg-slate-50/50 border-2 border-slate-100/50 group-hover:bg-white group-hover:border-indigo-50 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest italic flex items-center gap-1.5">
                          <TrendingUp className="w-3 h-3" />
                          Calificación
                        </p>
                        <p className={`text-3xl font-black tracking-tight ${materia.promedio_general && materia.promedio_general >= 4.0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                          {materia.promedio_general ? materia.promedio_general.toFixed(2) : '—'}
                        </p>
                      </div>
                      <div className="p-5 rounded-2xl bg-slate-50/50 border-2 border-slate-100/50 group-hover:bg-white group-hover:border-indigo-50 transition-all">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest italic flex items-center gap-1.5">
                          <Users className="w-3 h-3" />
                          Participantes
                        </p>
                        <p className="text-2xl font-black text-slate-900 tracking-tight">
                          {materia.total_realizadas} <span className="text-[11px] font-bold text-slate-300 uppercase tracking-tighter">/ {materia.total_evaluaciones}</span>
                        </p>
                      </div>
                    </div>

                    {/* Progress Segment */}
                    <div className="space-y-3 mb-10 px-1 relative z-10">
                      <div className="flex justify-between items-end">
                        <div className="flex items-center gap-2">
                           <div className={`h-2 w-2 rounded-full ${materia.porcentaje_cumplimiento === 100 ? 'bg-emerald-500 animate-pulse' : 'bg-indigo-500'}`} />
                           <span className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Estado Cumplimiento</span>
                        </div>
                        <span className="text-xs font-black text-slate-900 italic">{materia.porcentaje_cumplimiento.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                            materia.porcentaje_cumplimiento === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                          }`}
                          style={{ width: `${materia.porcentaje_cumplimiento}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons Segments */}
                    <div className="flex gap-4 relative z-10">
                      <Button
                        variant="ghost"
                        onClick={() => handleViewCompletion(materia)}
                        className="flex-1 rounded-[1.2rem] font-bold text-[11px] uppercase tracking-widest h-12 hover:bg-slate-50 transition-all border-2 border-transparent hover:border-slate-100 text-slate-500 hover:text-slate-900"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Participación
                      </Button>
                      <Button
                        onClick={() => handleViewAspectos(materia)}
                        className="flex-1 rounded-[1.2rem] font-black text-[11px] uppercase tracking-widest h-12 bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 active:scale-95 transition-all"
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analítica
                      </Button>
                    </div>
                  </div>
                )})
              }
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white p-8 border-t border-slate-100 flex justify-between items-center bg-slate-50/20">
            <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Carga Operativa</p>
                <p className="text-sm font-black text-slate-900 tracking-tight">
                  {materiasData?.materias.length || 0} Materias Registradas
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8 rounded-2xl h-12 font-black text-[11px] uppercase tracking-[0.2em] text-slate-500 border-2 border-slate-100 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all duration-300"
            >
              Cerrar Panel
            </Button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>

      {/* Aspecto Metrics Modal */}
      {showAspectoModal && selectedMateria && (
        <AspectoMetricsModal
          docente={docente}
          materia={selectedMateria}
          filtros={filtros}
          onClose={() => {
            setShowAspectoModal(false)
            setSelectedMateria(null)
          }}
        />
      )}

      {/* Completion Modal */}
      {showCompletionModal && selectedMateria && (
        <CompletionModal
          docente={docente.docente}
          nombreDocente={docente.nombre_docente!}
          codigoMateria={selectedMateria.codigo_materia}
          nombreMateria={selectedMateria.nombre_materia}
          grupo={selectedMateria.grupo}
          grupos={selectedMateria.grupos}
          filtros={filtros}
          onClose={() => {
            setShowCompletionModal(false)
            setSelectedMateria(null)
          }}
        />
      )}
    </>
  )
}

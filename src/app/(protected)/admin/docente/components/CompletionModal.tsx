"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  BookOpen,
  Target,
  History as HistoryIcon,
  X,
  PieChart as PieChartIcon,
  TrendingUp
} from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts'
import { metricService } from "@/src/api/services/metric/metric.service"
import type { MateriaCompletionMetrics, GrupoCompletion, StudentInfo, MateriaGrupoMetric } from "@/src/api/services/metric/metric.service"

interface FiltrosState {
  configuracionSeleccionada: number | null
  semestreSeleccionado: string
  periodoSeleccionado: string
  programaSeleccionado: string
  grupoSeleccionado: string
  sedeSeleccionada: string
}

interface CompletionModalProps {
  docente: string
  nombreDocente?: string
  codigoMateria: string
  nombreMateria?: string
  grupo?: string
  grupos?: MateriaGrupoMetric[]
  filtros: FiltrosState
  onClose: () => void
}

export default function CompletionModal({
  docente,
  nombreDocente,
  codigoMateria,
  nombreMateria,
  grupo,
  grupos,
  filtros,
  onClose,
}: CompletionModalProps) {
  const [completionData, setCompletionData] = useState<MateriaCompletionMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Determinar si la materia tiene múltiples grupos
  const tieneMultiplesGrupos = grupos && grupos.length > 1

  const filteredGroups = useMemo(() => {
    if (!completionData) return []
    // Si la materia tiene múltiples grupos, mostrar todos
    // Si hay un grupo específico (materia con un solo grupo), filtramos por él
    if (tieneMultiplesGrupos) {
      // Ordenar grupos alfabéticamente para mejor organización
      return [...completionData.grupos].sort((a, b) => a.grupo.localeCompare(b.grupo))
    }
    if (grupo) {
      return completionData.grupos.filter(g => g.grupo === grupo)
    }
    return completionData.grupos
  }, [completionData, grupo, tieneMultiplesGrupos])

  const totalStats = useMemo(() => {
    return filteredGroups.reduce((acc, g) => ({
      completados: acc.completados + g.completados.length,
      pendientes: acc.pendientes + g.pendientes.length,
      total: acc.total + g.completados.length + g.pendientes.length,
    }), { completados: 0, pendientes: 0, total: 0 })
  }, [filteredGroups])

  useEffect(() => {
    cargarCompletion()
  }, [])

  const cargarCompletion = async () => {
    if (!filtros.configuracionSeleccionada) {
      setError('Falta configuración seleccionada')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await metricService.getMateriaCompletion(docente, codigoMateria, {
        cfg_t: filtros.configuracionSeleccionada,
        sede: filtros.sedeSeleccionada || undefined,
        periodo: filtros.periodoSeleccionado || undefined,
        programa: filtros.programaSeleccionado || undefined,
        semestre: filtros.semestreSeleccionado || undefined,
        // Si tiene múltiples grupos, no filtrar; si es un solo grupo, pasar el filtro
        grupo: tieneMultiplesGrupos ? undefined : (filtros.grupoSeleccionado || grupo || undefined),
      })

      setCompletionData(response)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al cargar los datos: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const renderStudentList = (students: StudentInfo[], status: 'completado' | 'pendiente') => {
    if (students.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-slate-400">
          <div className="h-16 w-16 bg-white rounded-3xl border border-slate-100 flex items-center justify-center shadow-inner mb-4">
            <HistoryIcon className="w-8 h-8 opacity-20" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest italic">
            {status === 'completado' ? 'Sin evaluaciones' : 'Todo al día'}
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 gap-2">
        {students.map((student) => (
          <div key={student.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-100 hover:shadow-md transition-all duration-300 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm transition-transform group-hover:scale-110 ${
              status === 'completado' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}>
              {student.nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate group-hover:text-indigo-900 transition-colors uppercase italic tracking-tight">{student.nombre}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-black text-slate-400 font-mono uppercase tracking-widest px-2 py-0.5 bg-slate-50 rounded-lg border border-slate-100 group-hover:bg-indigo-50/50 group-hover:border-indigo-100/50 transition-colors">ID: {student.id}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderGrupoStats = (grupo: GrupoCompletion) => {
    const totalEstudiantes = grupo.completados.length + grupo.pendientes.length
    const porcentaje = totalEstudiantes > 0 ? Math.round((grupo.completados.length / totalEstudiantes) * 100) : 0

    return (
      <div key={grupo.grupo} className="bg-white rounded-[2.5rem] border-2 border-slate-50 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 mb-8 group/card">
        <div className="px-8 py-6 bg-slate-50/30 border-b border-slate-50 flex items-center justify-between group-hover/card:bg-indigo-50/20 transition-colors">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm group-hover/card:rotate-6 transition-transform">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest italic leading-tight">Grupo {grupo.grupo}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{totalEstudiantes} Registros en Curso</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black italic tracking-tighter ${porcentaje === 100 ? 'text-emerald-500' : 'text-slate-900'}`}>{porcentaje}</span>
                <span className="text-xs font-black text-slate-400 font-mono">%</span>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Participación</p>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${
                porcentaje === 100 ? 'bg-emerald-500' : 'bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
              }`}
              style={{ width: `${porcentaje}%` }}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] italic">Evaluaciones Exitosas</h4>
                </div>
                <Badge variant="outline" className="rounded-xl bg-emerald-50 border-emerald-100 text-emerald-700 font-black px-3 py-1 text-[10px] uppercase tracking-widest">
                  {grupo.completados.length} DOCS
                </Badge>
              </div>
              <div className="bg-slate-50/30 rounded-[2rem] p-4 border border-slate-100 max-h-[350px] overflow-y-auto custom-scrollbar shadow-inner">
                {renderStudentList(grupo.completados, 'completado')}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] italic">Pendientes de Firma</h4>
                </div>
                <Badge variant="outline" className="rounded-xl bg-amber-50 border-amber-100 text-amber-700 font-black px-3 py-1 text-[10px] uppercase tracking-widest">
                  {grupo.pendientes.length} DOCS
                </Badge>
              </div>
              <div className="bg-slate-50/30 rounded-[2rem] p-4 border border-slate-100 max-h-[350px] overflow-y-auto custom-scrollbar shadow-inner">
                {renderStudentList(grupo.pendientes, 'pendiente')}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-center justify-center p-4 overflow-hidden" onClick={onClose}>
      <div
        className="bg-white rounded-[2.5rem] shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Premium */}
        <div className="bg-white border-b border-slate-100 p-8 text-slate-900 relative overflow-hidden flex-shrink-0">
          <div className="absolute right-0 top-0 p-8 opacity-[0.03] pointer-events-none">
            <TrendingUp className="w-64 h-64 text-slate-900" />
          </div>
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-6 w-full">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm">
                  <CheckCircle2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-black italic tracking-tight uppercase leading-none mb-2">Estado de Participación</h2>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">Auditoría de cumplimiento académico</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-x-12 gap-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Docente:</span>
                  <span className="text-sm font-black text-slate-900 italic uppercase tracking-tight">{completionData?.nombre_docente || nombreDocente || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-200" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cátedra:</span>
                  <span className="text-sm font-black text-slate-900 italic uppercase">
                    {nombreMateria} <span className="text-blue-500 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 ml-1 text-xs">{codigoMateria}</span>
                  </span>
                </div>
                {tieneMultiplesGrupos && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-slate-200" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configuración:</span>
                    <Badge variant="outline" className="rounded-xl bg-indigo-50 border-indigo-100 text-indigo-700 font-black px-3 py-1 text-[10px] uppercase tracking-widest">
                      {grupos!.length} Grupos Activos
                    </Badge>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all duration-300 group shadow-sm"
            >
              <X className="w-6 h-6 text-slate-400 group-hover:rotate-90 group-hover:text-slate-900 transition-all" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-8 bg-slate-50/30 custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-12 h-12 text-slate-900 animate-spin mb-4" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Analizando registros de participación...</p>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-8 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-rose-100">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-lg font-black text-slate-900 italic mb-2">Error de Sincronización</h3>
              <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed">{error}</p>
              <Button onClick={cargarCompletion} variant="outline" className="rounded-2xl border-slate-200 font-bold text-xs uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                Reintentar Análisis
              </Button>
            </div>
          )}

          {!loading && !error && completionData && (
            <div className="space-y-12 max-w-5xl mx-auto">
              {/* Summary Visualization Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                {/* Stats Cards */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      label: 'Procesados', 
                      value: totalStats.completados,
                      icon: <CheckCircle2 className="w-5 h-5" />,
                      color: 'text-emerald-600',
                      bg: 'bg-emerald-50',
                      desc: 'Evaluaciones registradas'
                    },
                    { 
                      label: 'Pendientes', 
                      value: totalStats.pendientes,
                      icon: <AlertCircle className="w-5 h-5" />,
                      color: 'text-amber-600',
                      bg: 'bg-amber-50',
                      desc: 'Aún por participar'
                    },
                    { 
                      label: 'Total Cuerpo', 
                      value: totalStats.total,
                      icon: <Users className="w-5 h-5" />,
                      color: 'text-indigo-600',
                      bg: 'bg-indigo-50',
                      desc: 'Población total materia'
                    },
                    { 
                      label: 'Meta Global', 
                      value: `${Math.round((totalStats.completados / (totalStats.total || 1)) * 100)}%`,
                      icon: <TrendingUp className="w-5 h-5" />,
                      color: 'text-blue-600',
                      bg: 'bg-blue-50',
                      desc: 'Eficiencia de retorno'
                    }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50/50 p-6 rounded-[2rem] border border-slate-50 flex items-center justify-between group hover:bg-white hover:shadow-lg hover:border-indigo-100 transition-all duration-500">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic mb-1">{stat.label}</p>
                        <h4 className={`text-4xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</h4>
                        <p className="text-[9px] font-bold text-slate-300 uppercase mt-1 tracking-tighter">{stat.desc}</p>
                      </div>
                      <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:rotate-12 transition-transform`}>
                        {stat.icon}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pie Chart Visualization */}
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="relative w-full h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Completados', value: totalStats.completados },
                            { name: 'Pendientes', value: totalStats.pendientes }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          <Cell fill="#10b981" stroke="none" />
                          <Cell fill="#f1f5f9" stroke="none" />
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-4xl font-black text-slate-900 tracking-tighter italic">
                        {Math.round((totalStats.completados / (totalStats.total || 1)) * 100)}%
                       </span>
                       <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Participación</span>
                    </div>
                  </div>
                  <div className="flex gap-6 mt-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LOGRADO</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-200" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PENDIENTE</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4 px-4">
                   <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center shadow-lg">
                    <PieChartIcon className="w-5 h-5 text-white" />
                   </div>
                   <div>
                    <h3 className="text-xl font-black text-slate-900 italic tracking-tight uppercase">Desglose Operativo por Sección</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Control de auditoría por grupos registrados</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map((grupo) => renderGrupoStats(grupo))
                  ) : (
                    <div className="bg-white border-2 border-dashed border-slate-100 rounded-[3rem] py-32 text-center">
                      <div className="h-20 w-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <HistoryIcon className="w-10 h-10 text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-black italic uppercase tracking-widest text-sm">Sin grupos asignados para auditoría</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-8 bg-white border-t border-slate-100 flex justify-between items-center flex-shrink-0">
          <Button 
            onClick={cargarCompletion} 
            disabled={loading} 
            variant="ghost" 
            className="rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <HistoryIcon className="w-4 h-4 mr-2" />}
            Actualizar Sincronización
          </Button>
          <div className="flex gap-4 items-center">
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-3 h-3" /> Auditoría en tiempo real
            </p>
            <Button 
              onClick={onClose} 
              className="px-10 rounded-2xl font-black text-xs uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-xl shadow-slate-200 transition-all hover:-translate-y-1"
            >
              Cerrar Reporte
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
    </div>
  )
}

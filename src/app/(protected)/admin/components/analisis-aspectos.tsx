"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Users, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import { Skeleton } from "@/components/ui/skeleton"
import { 
  AspectoMetric,
  DocenteAspectosMetrics,
  metricService,
  MetricFilters 
} from "@/src/api/services/metric/metric.service";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';

interface AnalisisAspectosProps {
  filters: MetricFilters;
  loading?: boolean;
  mostrar?: boolean;
}

export default function AnalisisAspectos({
  filters,
  loading = false,
  mostrar = true,
}: AnalisisAspectosProps) {
  const [aspectosAgregados, setAspectosAgregados] = useState<DocenteAspectosMetrics | null>(null);
  const [aspectosAgregadosLoading, setAspectosAgregadosLoading] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [visibleSeries, setVisibleSeries] = useState({
    est: true,
    auto: true
  });

  const toggleSeries = (data: any) => {
    const { dataKey } = data;
    setVisibleSeries(prev => ({
      ...prev,
      [dataKey === 'est' ? 'est' : 'auto']: !prev[dataKey === 'est' ? 'est' : 'auto']
    }));
  };

  // Helper para obtener color del promedio
  const getPromedioColor = (promedio: number) => {
    if (promedio >= 4.0) return "text-green-600";
    if (promedio >= 3.5) return "text-blue-600";
    if (promedio >= 3.0) return "text-yellow-600";
    if (promedio > 0) return "text-red-600";
    return "text-gray-400";
  };

  // Handler para cargar aspectos agregados de todos los docentes
  const loadAspectosAgregados = async () => {
    if (!filters || !filters.cfg_t) {
      console.error("Filtros incompletos: cfg_t es requerido");
      return;
    }

    setAspectosAgregadosLoading(true);

    try {
      const response = await metricService.getDocenteAspectos({
        ...filters,
        // Sin especificar docente para obtener el agregado de todos
      });

      // Manejar el envoltorio 'data' si existe en la respuesta
      const data = (response as any).data || response;
      setAspectosAgregados(data);
    } catch (error) {
      console.error("Error al obtener aspectos agregados:", error);
    } finally {
      setAspectosAgregadosLoading(false);
    }
  };

  // Cargar aspectos agregados cuando cambian los filtros
  useEffect(() => {
    if (filters && filters.cfg_t && mostrar) {
      loadAspectosAgregados();
    }
  }, [filters, mostrar]);

  if (!mostrar) {
    return null;
  }

  if (loading || aspectosAgregadosLoading) {
    return (
      <Card className="rounded-[2.5rem] border-2 border-amber-100 shadow-md bg-white overflow-hidden">
        <CardHeader className="pb-6 border-b border-amber-50 bg-amber-50/30">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl bg-amber-100/50" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-3 gap-6 mb-8">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
          <Skeleton className="h-[400px] w-full rounded-2xl" />
        </CardContent>
      </Card>
    );
  }

  // Helper para calcular la diferencia entre evaluación y autoevaluación
  const calcularDiferencia = (evaluacion: number, autoevaluacion: number) => {
    return evaluacion - autoevaluacion;
  };

  // Helper para obtener color de la diferencia
  const getDiferenciaColor = (diferencia: number) => {
    if (Math.abs(diferencia) <= 0.3) return "text-green-600";
    if (Math.abs(diferencia) <= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  const evaluacionEstudiantes = aspectosAgregados?.evaluacion_estudiantes;
  const autoevaluacionDocente = aspectosAgregados?.autoevaluacion_docente;
  const resultadoFinal = aspectosAgregados?.resultado_final;

  // Preparar datos unificados para comparación (Unión de todos los aspectos)
  const uniqueNames = Array.from(new Set([
    ...(evaluacionEstudiantes?.aspectos?.map(a => a.nombre) || []),
    ...(autoevaluacionDocente?.aspectos?.map(a => a.nombre) || [])
  ])).filter(Boolean) as string[];

  const combinedData = uniqueNames.map(name => {
    const est = evaluacionEstudiantes?.aspectos?.find(a => a.nombre === name);
    const auto = autoevaluacionDocente?.aspectos?.find(a => a.nombre === name);

    const estPromedio = est?.promedio ?? (est?.suma && est?.total_respuestas ? est.suma / est.total_respuestas : null);
    const autoPromedio = auto?.promedio ?? (auto?.suma && auto?.total_respuestas ? auto.suma / auto.total_respuestas : null);

    return {
      name,
      est: estPromedio !== null ? Number(estPromedio.toFixed(2)) : null,
      auto: autoPromedio !== null ? Number(autoPromedio.toFixed(2)) : null,
      estTotal: est?.total_respuestas || 0,
      autoTotal: auto?.total_respuestas || 0,
    };
  });

  // Radar Data filtrando nulos para que las formas sean más claras
  const radarData = combinedData.map(d => ({
    subject: d.name,
    Estudiantes: d.est,
    Docente: d.auto,
    fullMark: 5
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-xl rounded-xl min-w-[200px]">
          <p className="font-bold text-gray-900 mb-2 text-xs border-b pb-1">{label}</p>
          {payload.map((entry: any, index: number) => {
            if (entry.value === null || entry.value === undefined) return null;
            return (
              <div key={index} className="flex items-center justify-between gap-4 mb-1">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                  <span className="text-[10px] text-gray-600 font-medium">{entry.name}:</span>
                </div>
                <span className="text-xs font-bold text-gray-900">{entry.value.toFixed(2)}</span>
              </div>
            );
          })}
          <div className="mt-2 pt-1 border-t border-gray-50 flex flex-col gap-0.5">
            {payload[0]?.payload.estTotal > 0 && (
              <p className="text-[9px] text-blue-500 italic">Respuestas Estudiantes: {payload[0].payload.estTotal}</p>
            )}
            {payload[0]?.payload.autoTotal > 0 && (
              <p className="text-[9px] text-purple-500 italic">Respuestas Docente: {payload[0].payload.autoTotal}</p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="rounded-[2.5rem] border-2 border-amber-100 shadow-md bg-white hover:shadow-xl transition-all duration-500 overflow-hidden">
      <CardHeader className="pb-6 border-b border-amber-50 bg-amber-50/30">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-amber-200 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              Análisis de Aspectos Evaluados
            </CardTitle>
            <CardDescription className="text-slate-500 text-sm font-medium mt-0.5">
              Comparación entre evaluación de estudiantes y autoevaluación docente
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {aspectosAgregados && evaluacionEstudiantes && autoevaluacionDocente ? (
          <div className="space-y-6">
            {/* Resumen General Comparativo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Evaluación Estudiantes */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  <p className="text-sm text-blue-700 font-semibold">Evaluación Estudiantes</p>
                </div>
                <p className={`text-4xl font-bold mb-2 ${getPromedioColor(evaluacionEstudiantes.promedio_general || 0)}`}>
                  {(evaluacionEstudiantes.promedio_general || 0).toFixed(2)}
                </p>
                <p className="text-xs text-blue-600 mb-3">/5.0 - Escala Máxima</p>
                <div className="space-y-1 text-xs">
                  <p className="text-blue-700"><span className="font-medium">Respuestas:</span> {evaluacionEstudiantes.total_respuestas}</p>
                  <p className="text-blue-700"><span className="font-medium">Peso:</span> {(evaluacionEstudiantes.peso * 100).toFixed(0)}%</p>
                  <p className="text-blue-700"><span className="font-medium">Ponderado:</span> {(evaluacionEstudiantes.ponderado || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Autoevaluación Docente */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-purple-600"></div>
                  <p className="text-sm text-purple-700 font-semibold">Autoevaluación Docente</p>
                </div>
                <p className={`text-4xl font-bold mb-2 ${getPromedioColor(autoevaluacionDocente.promedio_general || 0)}`}>
                  {(autoevaluacionDocente.promedio_general || 0).toFixed(2)}
                </p>
                <p className="text-xs text-purple-600 mb-3">/5.0 - Escala Máxima</p>
                <div className="space-y-1 text-xs">
                  <p className="text-purple-700"><span className="font-medium">Respuestas:</span> {autoevaluacionDocente.total_respuestas}</p>
                  <p className="text-purple-700"><span className="font-medium">Peso:</span> {(autoevaluacionDocente.peso * 100).toFixed(0)}%</p>
                  <p className="text-purple-700"><span className="font-medium">Ponderado:</span> {(autoevaluacionDocente.ponderado || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Resultado Final */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-green-600"></div>
                  <p className="text-sm text-green-700 font-semibold">Resultado Final</p>
                </div>
                <p className={`text-4xl font-bold mb-2 ${getPromedioColor(resultadoFinal?.nota_final_ponderada || 0)}`}>
                  {(resultadoFinal?.nota_final_ponderada || 0).toFixed(2)}
                </p>
                <p className="text-xs text-green-600 mb-3">/5.0 - Nota Ponderada</p>
                <div className="space-y-1 text-xs">
                  <p className="text-green-700">
                    <span className="font-medium">Diferencia:</span>{" "}
                    <span className={getDiferenciaColor(calcularDiferencia(evaluacionEstudiantes.promedio_general || 0, autoevaluacionDocente.promedio_general || 0))}>
                      {calcularDiferencia(evaluacionEstudiantes.promedio_general || 0, autoevaluacionDocente.promedio_general || 0).toFixed(2)}
                    </span>
                  </p>
                  <p className="text-green-700"><span className="font-medium">Escala:</span> {aspectosAgregados.escala_maxima}</p>
                </div>
              </div>
            </div>

            {/* Gráfico Comparativo de Radar */}
            {radarData.length > 3 && (
              <div className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col items-center">
                <div className="flex items-center justify-between w-full mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-amber-500 shadow-sm"></div>
                    Balance General Estudiantes vs Autoevaluación
                  </h3>
                  <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-600 border-amber-200">
                    Vista de Competencias
                  </Badge>
                </div>
                <div className="w-full h-[600px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis 
                        dataKey="subject" 
                        tick={({ payload, x, y, textAnchor, index }: any) => (
                          <text
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            fill="#334155"
                            fontSize={14}
                            fontWeight={700}
                          >
                            {payload.value.length > 25 ? `${payload.value.substring(0, 25)}...` : payload.value}
                          </text>
                        )}
                      />
                      <PolarRadiusAxis 
                        angle={30} 
                        domain={[0, 5]} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        axisLine={false}
                      />
                      <Radar
                        name="Docente"
                        dataKey="Docente"
                        stroke="#8b5cf6"
                        fill="#8b5cf6"
                        fillOpacity={0.25}
                        strokeWidth={2}
                        connectNulls
                        hide={!visibleSeries.auto}
                      />
                      <Radar
                        name="Estudiantes"
                        dataKey="Estudiantes"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.25}
                        strokeWidth={2}
                        connectNulls
                        hide={!visibleSeries.est}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        iconType="circle" 
                        wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }}
                        onClick={(e) => {
                          const key = e.dataKey === 'Estudiantes' ? 'est' : 'auto';
                          setVisibleSeries(prev => ({ ...prev, [key]: !prev[key as keyof typeof visibleSeries] }));
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Comparativa Detallada por Aspecto (Grouped Bar Chart) */}
            <div className="space-y-4">
              <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                      Detalle Comparativo por Aspecto
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Visualización agrupada de todos los criterios evaluados</p>
                  </div>
                  <button 
                    onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-blue-600 transition-all duration-200 shadow-sm"
                  >
                    {showDetailedAnalysis ? (
                      <>Ocultar detalles</>
                    ) : (
                      <>Mostrar detalles</>
                    )}
                  </button>
                </div>
                
                {showDetailedAnalysis && (
                  <div className="h-[700px] w-full mt-4">
                  {combinedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={combinedData}
                        margin={{ top: 20, right: 40, left: 10, bottom: 20 }}
                        barGap={8}
                      >
                        <defs>
                          <linearGradient id="colorEst" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="colorAuto" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#9333ea" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={true} stroke="#f1f5f9" />
                        <XAxis 
                          type="number" 
                          domain={[0, 5]} 
                          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <YAxis 
                          type="category" 
                          dataKey="name" 
                          width={180} 
                          tick={({ payload, x, y }: any) => (
                            <text
                              x={x}
                              y={y}
                              dy={4}
                              fill="#334155"
                              fontSize={11}
                              fontWeight={600}
                              textAnchor="end"
                            >
                              {payload.value.length > 30 ? `${payload.value.substring(0, 30)}...` : payload.value}
                            </text>
                          )}
                          axisLine={{ stroke: '#e2e8f0' }}
                          tickLine={false}
                        />
                        <Tooltip 
                          content={<CustomTooltip />} 
                          cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} 
                        />
                        <Legend 
                          verticalAlign="top" 
                          align="center" 
                          wrapperStyle={{ paddingBottom: '30px', cursor: 'pointer' }}
                          onClick={(e) => {
                            const key = e.dataKey === 'est' ? 'est' : 'auto';
                            setVisibleSeries(prev => ({ ...prev, [key]: !prev[key as keyof typeof visibleSeries] }));
                          }}
                        />
                        <Bar 
                          dataKey="est" 
                          name="Evaluación Estudiantes" 
                          fill="url(#colorEst)" 
                          radius={[0, 6, 6, 0]}
                          barSize={18}
                          hide={!visibleSeries.est}
                          animationBegin={0}
                          animationDuration={1500}
                          label={{ position: 'right', fill: '#3b82f6', fontSize: 10, fontWeight: 'bold' }}
                        />
                        <Bar 
                          dataKey="auto" 
                          name="Autoevaluación Docente" 
                          fill="url(#colorAuto)" 
                          radius={[0, 6, 6, 0]}
                          barSize={18}
                          hide={!visibleSeries.auto}
                          animationBegin={200}
                          animationDuration={1500}
                          label={{ position: 'right', fill: '#a855f7', fontSize: 10, fontWeight: 'bold' }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-dashed">
                      <p className="text-sm text-gray-400 italic">No hay datos comparativos disponibles</p>
                    </div>
                  )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center text-gray-400">
            <AlertTriangle className="h-12 w-12 mb-3 opacity-30" />
            <p className="text-base font-medium text-gray-500">
              No hay datos de aspectos disponibles
            </p>
            <p className="text-sm mt-2 text-gray-400">
              Los aspectos aparecerán cuando se evalúen los docentes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

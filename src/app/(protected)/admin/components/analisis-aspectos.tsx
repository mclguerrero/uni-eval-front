"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

import { 
  AspectoMetric,
  DocenteAspectosMetrics,
  metricService,
  MetricFilters 
} from "@/src/api/services/metric/metric.service";

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

      setAspectosAgregados(response);
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
      <Card className="rounded-2xl border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shadow-sm">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Análisis de Aspectos Evaluados
              </CardTitle>
              <CardDescription className="text-gray-500 mt-1">
                Cargando datos...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-lg bg-white hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shadow-sm">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              Análisis de Aspectos Evaluados
            </CardTitle>
            <CardDescription className="text-gray-500 mt-1">
              Evaluación agregada de todos los docentes por aspecto
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {aspectosAgregados && aspectosAgregados.aspectos && aspectosAgregados.aspectos.length > 0 ? (
          <div>
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                <p className="text-sm text-amber-600 font-medium mb-1">Promedio General</p>
                <p className={`text-3xl font-bold ${getPromedioColor(aspectosAgregados.promedio || 0)}`}>
                  {(aspectosAgregados.promedio || 0).toFixed(2)}
                </p>
                <p className="text-xs text-amber-600 mt-2">/5.0</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-1">Total Respuestas</p>
                <p className="text-3xl font-bold text-blue-700">
                  {aspectosAgregados.total_respuestas}
                </p>
                <p className="text-xs text-blue-600 mt-2">evaluaciones registradas</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                <p className="text-sm text-purple-600 font-medium mb-1">Suma Total</p>
                <p className="text-3xl font-bold text-purple-700">
                  {aspectosAgregados.suma_total}
                </p>
                <p className="text-xs text-purple-600 mt-2">puntos acumulados</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 border border-rose-200">
                <p className="text-sm text-rose-600 font-medium mb-1">Desviación Estándar</p>
                <p className="text-3xl font-bold text-rose-700">
                  {(aspectosAgregados.desviacion || 0).toFixed(2)}
                </p>
                <p className="text-xs text-rose-600 mt-2">variabilidad</p>
              </div>
            </div>

            {/* Lista de Aspectos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Detalle por Aspecto
              </h3>
              {aspectosAgregados.aspectos.map((aspecto: AspectoMetric, idx: number) => {
                const promedioAspecto = aspecto.suma && aspecto.total_respuestas ? aspecto.suma / aspecto.total_respuestas : 0;
                const porcentajeRespuestas = aspectosAgregados.total_respuestas > 0 ? Math.round((aspecto.total_respuestas / aspectosAgregados.total_respuestas) * 100) : 0;

                return (
                  <div key={idx} className="p-4 rounded-xl border border-gray-200 hover:border-amber-300 transition-all hover:shadow-md bg-gradient-to-r from-gray-50 to-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-amber-700">{idx + 1}</span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {aspecto.nombre}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {aspecto.total_respuestas} respuestas ({porcentajeRespuestas}% del total)
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Métricas del aspecto */}
                      <div className="flex items-center gap-3">
                        {/* Suma */}
                        <div className="text-center px-3 py-1.5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                          <p className="text-xs text-blue-600 font-medium">Suma</p>
                          <p className="text-lg font-bold text-blue-700">{aspecto.suma}</p>
                        </div>

                        {/* Promedio */}
                        <div className="text-center px-3 py-1.5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                          <p className="text-xs text-amber-600 font-medium">Promedio</p>
                          <p className={`text-lg font-bold ${getPromedioColor(promedioAspecto)}`}>
                            {promedioAspecto.toFixed(2)}
                          </p>
                        </div>

                        {/* Badge de estado */}
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                          promedioAspecto >= 4.0
                            ? "bg-green-100 text-green-700 border-green-200"
                            : promedioAspecto >= 3.5
                            ? "bg-blue-100 text-blue-700 border-blue-200"
                            : promedioAspecto >= 3.0
                            ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                            : "bg-red-100 text-red-700 border-red-200"
                        }`}>
                          {promedioAspecto >= 4.0
                            ? "Excelente"
                            : promedioAspecto >= 3.5
                            ? "Bueno"
                            : promedioAspecto >= 3.0
                            ? "Regular"
                            : "Necesita mejora"}
                        </div>
                      </div>
                    </div>

                    {/* Barra de progreso */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">Desempeño</span>
                        <span className="text-xs text-gray-500">{(promedioAspecto / 5 * 100).toFixed(0)}% de 5.0</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            promedioAspecto >= 4.0 ? 'bg-green-500' :
                            promedioAspecto >= 3.5 ? 'bg-blue-500' :
                            promedioAspecto >= 3.0 ? 'bg-yellow-500' :
                            promedioAspecto > 0 ? 'bg-red-500' : 'bg-gray-300'
                          }`}
                          style={{ width: `${(promedioAspecto / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
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

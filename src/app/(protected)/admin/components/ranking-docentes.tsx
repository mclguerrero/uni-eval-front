"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import type { RankingItem } from "@/src/api/services/metric/metric.service";

interface RankingDocentesProps {
  docentes: RankingItem[];
  loading?: boolean;
}

const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return "0.0";
  
  let numValue: number;
  if (typeof value === "string") {
    numValue = parseFloat(value);
  } else if (typeof value === "number") {
    numValue = value;
  } else {
    return "0.0";
  }
  
  if (!isFinite(numValue)) {
    console.warn('Valor inválido para formatNumber:', value);
    return "0.0";
  }
  return numValue.toFixed(1);
};

export default function RankingDocentes({ docentes, loading }: RankingDocentesProps) {
  // Ordenar docentes por promedio ajustado (de mayor a menor)
  const docentesOrdenados = [...docentes].sort((a, b) => {
    const promedioA = a.adjusted || 0;
    const promedioB = b.adjusted || 0;
    return promedioB - promedioA;
  });

  if (loading) {
    return (
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
        <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
              <User className="h-6 w-6 text-gray-500" />
            </div>
            <div>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Ranking Global de Docentes
              </CardTitle>
              <CardDescription className="text-gray-500 text-base mt-1">
                Evaluación integral del cuerpo docente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
      <CardHeader className="pb-4 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
            <User className="h-6 w-6 text-gray-500" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-800">
              Ranking Global de Docentes
            </CardTitle>
            <CardDescription className="text-gray-500 text-base mt-1">
              Evaluación integral del cuerpo docente
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
          {docentesOrdenados.map((docente, index) => (
            <div
              key={`ranking-${docente.docente || "no-docente"}-${index}`}
              className="group flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              {/* Posición */}
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold 
                ${
                  index < 3
                    ? "bg-blue-100 text-blue-800 shadow-md"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {index + 1}
              </div>

              {/* Avatar */}
              <div
                className={`h-12 w-12 rounded-full flex items-center justify-center shadow-inner
                ${
                  index < 3
                    ? "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                <User className="h-5 w-5" />
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-gray-800 truncate">
                    {docente.nombre_docente}
                  </h3>
                  <span className="text-base font-bold text-gray-700 ml-2 px-3 py-1 bg-gray-100 rounded-full">
                    {formatNumber(docente.adjusted || 0)}/5
                  </span>
                </div>

                {/* Barra de progreso mejorada */}
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700
                    ${
                      index < 3
                        ? "bg-gradient-to-r from-blue-400 to-blue-600"
                        : "bg-gradient-to-r from-gray-300 to-gray-400"
                    }`}
                    style={{
                      width: `${((docente.adjusted || 0) / 5) * 100}%`,
                    }}
                  />
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {docente.realizados || 0}/{docente.universo || 0} evaluaciones
                  </span>
                  <span className="px-2 py-1 bg-gray-50 rounded-full text-xs font-medium">
                    {Math.round(
                      ((docente.realizados || 0) / (docente.universo || 1)) * 100
                    )}
                    % completado
                  </span>
                </div>
              </div>
            </div>
          ))}

          {docentesOrdenados.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-base font-medium">No hay datos disponibles</p>
              <p className="text-sm mt-2">
                Los resultados aparecerán después del proceso de evaluación
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

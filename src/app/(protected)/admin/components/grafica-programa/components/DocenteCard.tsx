import React from "react";
import { Badge } from "@/components/ui/badge";
import { Book, Users } from "lucide-react";
import {
  getEstadoInfo,
  getPromedioColor,
} from "../utils/estadoHelper";
import type { DocenteGeneralMetrics, MetricFilters } from "@/src/api/services/metric/metric.service";

export interface DocenteConMetricas extends DocenteGeneralMetrics {
  avg?: number;
  adjusted?: number;
  realizados?: number;
  universo?: number;
  aspectos?: any[];
  estado?: "excelente" | "bueno" | "regular" | "necesita_mejora" | "sin_evaluar";
}

interface DocenteCardProps {
  docente: DocenteConMetricas;
  filters: MetricFilters;
  programa: string;
  onOpenMateriasModal: (docente: DocenteConMetricas) => void;
}

export const DocenteCard: React.FC<DocenteCardProps> = ({
  docente,
  filters,
  programa,
  onOpenMateriasModal,
}) => {
  const estadoInfo = getEstadoInfo(docente.estado || "sin_evaluar");
  const promedio = docente.promedio_general || docente.avg || docente.adjusted || 0;
  const realizados = docente.total_realizadas;
  const esperados = docente.total_evaluaciones;
  const porcentaje = esperados > 0 ? Math.round((realizados / esperados) * 100) : 0;
  const IconComponent = estadoInfo.icon;

  return (
    <div
      className={`p-4 rounded-xl border transition-all hover:shadow-md bg-gradient-to-r ${estadoInfo.bgGradient} cursor-pointer group`}
    >
      {/* Información general del docente */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${estadoInfo.color} border`}>
              <IconComponent className="h-4 w-4" />
              <span className="ml-1.5">{estadoInfo.label}</span>
            </Badge>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1 tracking-tight">
            {docente.nombre_docente || docente.docente}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {realizados}/{esperados} evaluaciones
            </span>
            <span className="font-medium text-gray-700">{porcentaje}% completado</span>
          </div>
        </div>

        {/* Promedio */}
        <div className="text-right">
          <p className={`text-3xl font-bold ${getPromedioColor(promedio)}`}>
            {promedio.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500">/5.0</p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="mb-3">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              promedio >= 4.0
                ? "bg-green-500"
                : promedio >= 3.5
                ? "bg-blue-500"
                : promedio >= 3.0
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
            style={{ width: `${(promedio / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <button
          onClick={() => onOpenMateriasModal(docente)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
        >
          <Book className="h-4 w-4" />
          Ver Materias
        </button>
      </div>
    </div>
  );
};

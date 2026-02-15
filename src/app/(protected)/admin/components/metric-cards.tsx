"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, ClipboardList } from "lucide-react";

interface MetricCardsProps {
  data: {
    total_estudiantes: number;
    total_estudiantes_pendientes: number;
    total_estudiantes_registrados: number;
    total_docentes: number;
    total_docentes_pendientes: number;
    total_evaluaciones: number;
    total_evaluaciones_registradas: number;
    total_realizadas: number;
    total_pendientes: number;
  } | null | undefined;
}

/**
 * Formatea un número a 1 decimal
 */
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
    return "0.0";
  }
  return numValue.toFixed(1);
};

/**
 * Retorna color de progreso basado en porcentaje
 * - >= 80%: verde
 * - >= 50%: amarillo
 * - < 50%: rojo
 */
const getProgressColor = (value: number) => {
  if (value >= 80) return "bg-green-500";
  if (value >= 50) return "bg-yellow-500";
  return "bg-red-500";
};

/**
 * Componente de cards de métricas generales del dashboard
 * 
 * Muestra 3 tarjetas con información de:
 * 1. Estudiantes - Total y completados
 * 2. Docentes - Total y evaluados
 * 3. Evaluaciones - Total y realizadas
 * 
 * Cada card incluye:
 * - Total (universo de vista_academica_insitus)
 * - Completados/Realizados
 * - Barra de progreso con colores
 * - Porcentaje de completitud
 */
export default function MetricCards({ data }: MetricCardsProps) {
  if (!data) {
    return null;
  }

  // ESTUDIANTES: Un estudiante se considera "completado" cuando ha finalizado TODAS sus evaluaciones asignadas
  const estudiantesCompletados = (data.total_estudiantes || 0) - (data.total_estudiantes_pendientes || 0);
  const porcentajeEstudiantes = ((estudiantesCompletados / (data.total_estudiantes || 1)) * 100);

  // DOCENTES: Un docente se considera "evaluado" cuando TODOS sus estudiantes completaron TODAS sus evaluaciones
  const docentesEvaluados = (data.total_docentes || 0) - (data.total_docentes_pendientes || 0);
  const porcentajeDocentes = ((docentesEvaluados / (data.total_docentes || 1)) * 100);

  // EVALUACIONES: Total realizadas son las que tienen al menos 1 respuesta en eval_det
  const porcentajeEvaluaciones = ((data.total_realizadas || 0) / (data.total_evaluaciones || 1)) * 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Card 1: Estudiantes */}
      <Card className="relative rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
        <Users className="absolute top-4 right-4 w-10 h-10 text-indigo-400/30" />
        <CardHeader className="pb-1">
          <CardTitle className="text-sm uppercase text-gray-500 tracking-wide">
            Estudiantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Total estudiantes del universo (vista_academica_insitus) */}
          <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
            {data.total_estudiantes}
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Completados</span>
              <span className="font-medium text-gray-700">
                {estudiantesCompletados}
              </span>
            </div>
            {/* Barra de progreso */}
            <div className="relative h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out ${getProgressColor(porcentajeEstudiantes)}`}
                style={{ width: `${porcentajeEstudiantes}%` }}
              />
            </div>
            <div className="text-xs mt-1 text-right text-gray-600">
              {formatNumber(porcentajeEstudiantes)}% completado
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Docentes */}
      <Card className="relative rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
        <GraduationCap className="absolute top-4 right-4 w-10 h-10 text-indigo-400/30" />
        <CardHeader className="pb-1">
          <CardTitle className="text-sm uppercase text-gray-500 tracking-wide">
            Docentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Total docentes del universo (vista_academica_insitus) */}
          <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
            {data.total_docentes}
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Evaluados</span>
              <span className="font-medium text-gray-700">
                {docentesEvaluados}
              </span>
            </div>
            {/* Barra de progreso */}
            <div className="relative h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out ${getProgressColor(porcentajeDocentes)}`}
                style={{ width: `${porcentajeDocentes}%` }}
              />
            </div>
            <div className="text-xs mt-1 text-right text-gray-600">
              {formatNumber(porcentajeDocentes)}% completado
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Evaluaciones */}
      <Card className="relative rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-white">
        <ClipboardList className="absolute top-4 right-4 w-10 h-10 text-indigo-400/30" />
        <CardHeader className="pb-1">
          <CardTitle className="text-sm uppercase text-gray-500 tracking-wide">
            Evaluaciones
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Total evaluaciones esperadas (filas en vista_academica_insitus) */}
          <div className="text-5xl font-extrabold text-gray-900 tracking-tight">
            {data.total_evaluaciones}
          </div>
          <div className="mt-4 space-y-1">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Realizadas</span>
              <span className="font-medium text-gray-700">
                {data.total_realizadas}
              </span>
            </div>
            {/* Barra de progreso */}
            <div className="relative h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full transition-all duration-700 ease-out ${getProgressColor(porcentajeEvaluaciones)}`}
                style={{ width: `${porcentajeEvaluaciones}%` }}
              />
            </div>
            <div className="text-xs mt-1 text-right text-gray-600">
              {formatNumber(porcentajeEvaluaciones)}% completado
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

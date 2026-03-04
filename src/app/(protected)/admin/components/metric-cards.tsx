"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, UserCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { SummaryMetrics } from "@/src/api/services/metric/metric.service";

interface MetricCardsProps {
  data: SummaryMetrics['generales'] | null | undefined;
}

type MetricStatus = {
  label: "Crítico" | "Bajo" | "Medio" | "Óptimo";
  badgeClassName: string;
};

interface MetricCardProps {
  title: string;
  icon: LucideIcon;
  completed: number;
  total: number;
  pending: number;
  accentClassName: string;
}

const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return "0";
  let numValue: number;
  if (typeof value === "string") {
    numValue = parseFloat(value);
  } else if (typeof value === "number") {
    numValue = value;
  } else {
    return "0";
  }
  return isFinite(numValue) ? numValue.toLocaleString("es-CO") : "0";
};

const calculatePercentage = (completed: number, total: number): number => {
  if (total <= 0) return 0;
  const value = (completed / total) * 100;
  return Number.isFinite(value) ? value : 0;
};

const getMetricStatus = (percentage: number): MetricStatus => {
  if (percentage <= 0) {
    return {
      label: "Crítico",
      badgeClassName: "bg-red-100 text-red-700 border-red-200"
    };
  }

  if (percentage < 30) {
    return {
      label: "Bajo",
      badgeClassName: "bg-orange-100 text-orange-700 border-orange-200"
    };
  }

  if (percentage < 70) {
    return {
      label: "Medio",
      badgeClassName: "bg-yellow-100 text-yellow-700 border-yellow-200"
    };
  }

  return {
    label: "Óptimo",
    badgeClassName: "bg-emerald-100 text-emerald-700 border-emerald-200"
  };
};

function MetricCard({ title, icon: Icon, completed, total, pending, accentClassName }: MetricCardProps) {
  const percentage = calculatePercentage(completed, total);
  const status = getMetricStatus(percentage);
  const progressWidth = `${Math.min(Math.max(percentage, 0), 100)}%`;

  return (
    <Card className="min-h-[280px] rounded-[2.5rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <CardContent className="p-7 md:p-8">
        <div className="mb-6 flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold text-slate-700 tracking-tight">{title}</h3>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-slate-500">
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mb-2 text-5xl font-semibold leading-none tracking-tight text-slate-900 md:text-6xl">
          {percentage.toFixed(2)}%
        </div>

        <p className="mb-6 text-base text-slate-500">
          {formatNumber(completed)} de {formatNumber(total)} completadas
        </p>

        <div className="mb-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${accentClassName}`}
            style={{ width: progressWidth }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-base font-medium text-red-600">{formatNumber(pending)} pendientes</p>
          <Badge variant="outline" className={status.badgeClassName}>
            {status.label}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default function MetricCards({ data }: MetricCardsProps) {
  if (!data) return null;

  const totalEvaluaciones = data.total_evaluaciones || 0;
  const totalRealizadas = data.total_realizadas || 0;
  const totalPendientesEvaluaciones = data.total_pendientes ?? Math.max(totalEvaluaciones - totalRealizadas, 0);

  const totalEstudiantes = data.total_estudiantes || 0;
  const estudiantesPendientes = data.total_estudiantes_pendientes || 0;
  const estudiantesCompletados = Math.max(totalEstudiantes - estudiantesPendientes, 0);

  const totalDocentes = data.total_docentes || 0;
  const docentesPendientes = data.total_docentes_pendientes || 0;
  const docentesCompletados = Math.max(totalDocentes - docentesPendientes, 0);

  const metrics: MetricCardProps[] = [
    {
      title: "Evaluaciones",
      icon: ClipboardList,
      completed: totalRealizadas,
      total: totalEvaluaciones,
      pending: totalPendientesEvaluaciones,
      accentClassName: "bg-indigo-500"
    },
    {
      title: "Población Estudiantil",
      icon: Users,
      completed: estudiantesCompletados,
      total: totalEstudiantes,
      pending: estudiantesPendientes,
      accentClassName: "bg-blue-500"
    },
    {
      title: "Cátedra Docente",
      icon: UserCheck,
      completed: docentesCompletados,
      total: totalDocentes,
      pending: docentesPendientes,
      accentClassName: "bg-emerald-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          icon={metric.icon}
          completed={metric.completed}
          total={metric.total}
          pending={metric.pending}
          accentClassName={metric.accentClassName}
        />
      ))}
    </div>
  );
}

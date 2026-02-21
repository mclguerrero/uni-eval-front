"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, GraduationCap, ClipboardList, TrendingUp, CheckCircle2, UserCheck } from "lucide-react";

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
  return isFinite(numValue) ? numValue.toFixed(1) : "0.0";
};

export default function MetricCards({ data }: MetricCardsProps) {
  if (!data) return null;

  const estudiantesCompletados = (data.total_estudiantes || 0) - (data.total_estudiantes_pendientes || 0);
  const porcentajeEstudiantes = ((estudiantesCompletados / (data.total_estudiantes || 1)) * 100);

  const docentesEvaluados = (data.total_docentes || 0) - (data.total_docentes_pendientes || 0);
  const porcentajeDocentes = ((docentesEvaluados / (data.total_docentes || 1)) * 100);

  const porcentajeEvaluaciones = ((data.total_realizadas || 0) / (data.total_evaluaciones || 1)) * 100;

  const metrics = [
    {
      title: "Población Estudiantil",
      total: data.total_estudiantes,
      subValue: estudiantesCompletados,
      subLabel: "Participación Total",
      percent: porcentajeEstudiantes,
      icon: <Users className="w-5 h-5" />,
      color: "blue",
      description: "Estudiantes que finalizaron todas sus cargas"
    },
    {
      title: "Cátedra Docente",
      total: data.total_docentes,
      subValue: docentesEvaluados,
      subLabel: "Auditados",
      percent: porcentajeDocentes,
      icon: <UserCheck className="w-5 h-5" />,
      color: "emerald",
      description: "Docentes con evaluación de estudiantes completa"
    },
    {
      title: "Volumen Evaluativo",
      total: data.total_evaluaciones,
      subValue: data.total_realizadas,
      subLabel: "Ejecutadas",
      percent: porcentajeEvaluaciones,
      icon: <ClipboardList className="w-5 h-5" />,
      color: "indigo",
      description: "Total de instrumentos aplicados individualmente"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {metrics.map((m, i) => {
        // Mapeo manual de colores para asegurar que Tailwind genere las clases correctamente
        const colorVariants: Record<string, any> = {
          blue: {
            bg: "bg-blue-50/50",
            iconBg: "bg-blue-50",
            iconText: "text-blue-600",
            border: "border-blue-100",
            accent: "bg-blue-600",
            accentBg: "bg-blue-50",
            darkText: "text-blue-700"
          },
          emerald: {
            bg: "bg-emerald-50/50",
            iconBg: "bg-emerald-50",
            iconText: "text-emerald-600",
            border: "border-emerald-100",
            accent: "bg-emerald-600",
            accentBg: "bg-emerald-50",
            darkText: "text-emerald-700"
          },
          indigo: {
            bg: "bg-indigo-50/50",
            iconBg: "bg-indigo-50",
            iconText: "text-indigo-600",
            border: "border-indigo-100",
            accent: "bg-indigo-600",
            accentBg: "bg-indigo-50",
            darkText: "text-indigo-700"
          }
        };

        const variant = colorVariants[m.color] || colorVariants.blue;

        return (
          <Card key={i} className={`group relative rounded-[2.5rem] border-2 ${variant.border} shadow-md hover:shadow-2xl transition-all duration-500 bg-white overflow-hidden`}>
            {/* Fondo de acento sutil */}
            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full ${variant.bg} opacity-20 group-hover:scale-150 transition-transform duration-700`} />
            
            <div className={`absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition-all duration-700 ${variant.iconText}`}>
               {m.icon}
            </div>
            
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-2xl ${variant.iconBg} ${variant.iconText} border border-white shadow-sm ring-1 ring-black/5`}>
                  {m.icon}
                </div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{m.title}</h3>
              </div>
  
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-black text-slate-900 tracking-tight italic">{m.total}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Registrados</span>
              </div>
  
              <p className="text-[10px] font-bold text-slate-400 mb-8 leading-none uppercase tracking-tight">{m.description}</p>
  
              <div className={`space-y-4 ${variant.accentBg} p-5 rounded-[2rem] border-2 ${variant.border}`}>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{m.subLabel}</p>
                    <p className={`text-2xl font-black ${variant.darkText} italic leading-none`}>{m.subValue}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-black text-slate-900 italic">{formatNumber(m.percent)}%</span>
                  </div>
                </div>
  
                <div className="h-2 w-full bg-white rounded-full overflow-hidden border border-slate-100 p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${variant.accent} shadow-sm`}
                    style={{ width: `${m.percent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

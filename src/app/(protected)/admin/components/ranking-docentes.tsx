"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Trophy, Award, Medal, Users, TrendingUp, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { RankingItem } from "@/src/api/services/metric/metric.service";

interface RankingDocentesProps {
  docentes: RankingItem[];
  loading?: boolean;
}

const formatNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null) return "0.00";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (!isFinite(numValue)) return "0.00";
  return numValue.toFixed(2);
};

export default function RankingDocentes({ docentes, loading }: RankingDocentesProps) {
  const docentesOrdenados = [...docentes].sort((a, b) => {
    const scoreA = a.adjusted || 0;
    const scoreB = b.adjusted || 0;
    return scoreB - scoreA;
  });

  const getRankStyle = (index: number) => {
    switch (index) {
      case 0:
        return {
          bg: "bg-amber-50 border-amber-200",
          text: "text-amber-700",
          icon: <Trophy className="h-5 w-5 text-amber-500" />,
          medal: "bg-amber-500 text-white shadow-amber-200",
          bar: "bg-gradient-to-r from-amber-400 to-amber-600",
          avatar: "ring-amber-200 bg-amber-100 text-amber-600"
        };
      case 1:
        return {
          bg: "bg-slate-50 border-slate-200",
          text: "text-slate-700",
          icon: <Award className="h-5 w-5 text-slate-400" />,
          medal: "bg-slate-400 text-white shadow-slate-200",
          bar: "bg-gradient-to-r from-slate-300 to-slate-500",
          avatar: "ring-slate-200 bg-slate-100 text-slate-500"
        };
      case 2:
        return {
          bg: "bg-orange-50 border-orange-200",
          text: "text-orange-700",
          icon: <Medal className="h-5 w-5 text-orange-400" />,
          medal: "bg-orange-500 text-white shadow-orange-200",
          bar: "bg-gradient-to-r from-orange-300 to-orange-500",
          avatar: "ring-orange-200 bg-orange-100 text-orange-500"
        };
      default:
        return {
          bg: "bg-white border-gray-100 hover:border-blue-100",
          text: "text-gray-700",
          icon: null,
          medal: "bg-gray-100 text-gray-500",
          bar: "bg-gradient-to-r from-blue-400 to-indigo-500",
          avatar: "ring-gray-100 bg-gray-50 text-gray-400"
        };
    }
  };

  const ScoreColor = (score: number) => {
    if (score >= 4.5) return "text-emerald-600";
    if (score >= 4.0) return "text-blue-600";
    if (score >= 3.0) return "text-amber-600";
    return "text-rose-600";
  };

  if (loading) {
    return (
      <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-md bg-white overflow-hidden">
        <CardHeader className="pb-6 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-2xl bg-slate-100" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-6 p-5 rounded-2xl border border-slate-50">
              <Skeleton className="h-12 w-12 rounded-xl" />
              <Skeleton className="h-14 w-14 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-[2.5rem] border-2 border-slate-100 shadow-md bg-white hover:shadow-xl transition-all duration-500 overflow-hidden">
      <CardHeader className="pb-6 border-b border-slate-50 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center">
              <Trophy className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
                Ranking de Excelencia
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm font-medium flex items-center gap-1.5 mt-0.5">
                Basado en el puntaje ajustado por participación
                <TooltipProvider>
                  <Tooltip delayDuration={300}>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] bg-slate-900 border-none text-white p-3 rounded-xl shadow-2xl">
                      <p className="text-xs leading-relaxed">
                        El puntaje ajustado considera tanto el promedio de la evaluación como el volumen de participación para asegurar una comparación justa.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="px-3 py-1 bg-white shadow-sm border-slate-200 text-slate-600 font-semibold gap-1">
            <Users className="h-3 w-3" />
            {docentes.length} Docentes
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[650px] overflow-y-auto px-6 py-6 space-y-4 custom-scrollbar">
          {docentesOrdenados.map((docente, index) => {
            const style = getRankStyle(index);
            const score = docente.adjusted || 0;
            const participationPercent = Math.round(((docente.realizados || 0) / (docente.universo || 1)) * 100);

            return (
              <div
                key={`ranking-${docente.docente || index}`}
                className={`group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${style.bg} hover:border-blue-200`}
              >
                {/* Position & Icon */}
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border border-white/50 ${style.medal}`}>
                    {index + 1}
                  </div>
                  
                  <div className={`h-14 w-14 rounded-2xl ring-4 flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-110 ${style.avatar}`}>
                    <User className="h-7 w-7 opacity-80" />
                    {style.icon && <div className="absolute -top-1 -right-1">{style.icon}</div>}
                  </div>
                </div>

                {/* Info Container */}
                <div className="flex-1 min-w-0 w-full space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="space-y-0.5">
                      <h3 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                        {docente.nombre_docente}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                        <span className="flex items-center gap-1 uppercase tracking-wider">
                          ID: {docente.docente}
                        </span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {docente.realizados} de {docente.universo} eval.
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-black ${ScoreColor(score)}`}>
                        {formatNumber(score)}
                      </span>
                      <span className="text-xs font-bold text-slate-400">/5.00</span>
                    </div>
                  </div>

                  {/* Enhanced Progress Section */}
                  <div className="space-y-2">
                    <div className="relative h-2.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out ${style.bar}`}
                        style={{ width: `${(score / 5) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-3 w-3 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                          Rendimiento Ajustado
                        </span>
                      </div>
                      <Badge className={`text-[10px] font-bold py-0 h-5 px-2 ${participationPercent > 50 ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-500'} border-none`}>
                        {participationPercent}% Participación
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {docentesOrdenados.length === 0 && (
            <div className="text-center py-20 px-10">
              <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-dashed border-slate-200">
                <Medal className="h-10 w-10 text-slate-200" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aún no hay líderes</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto mb-8 font-medium">
                El ranking se actualizará automáticamente a medida que los estudiantes completen sus evaluaciones.
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </Card>
  );
}

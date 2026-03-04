import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GraduationCap, TrendingUp } from "lucide-react";
import { DocenteCard } from "./DocenteCard";
import { DocentesPagination } from "./DocentesPagination";
import MateriasModal from "@/src/app/(protected)/admin/docente/components/MateriasModal";
import { calcularEstado } from "../utils/estadoHelper";
import { MetricFilters } from "@/src/api/services/metric/metric.service";
import type { DocenteGeneralMetrics } from "@/src/api/services/metric/metric.service";

interface DialogDocentesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programa: string;
  tipo: "completadas" | "pendientes";
  docentes: DocenteGeneralMetrics[];
  isLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  onLoadMoreDocentes: (programa: string, tipo: "completadas" | "pendientes", page: number) => void;
  filters: MetricFilters;
}

export const DialogDocentes: React.FC<DialogDocentesProps> = ({
  open,
  onOpenChange,
  programa,
  tipo,
  docentes,
  isLoading,
  pagination,
  onLoadMoreDocentes,
  filters,
}) => {
  const [selectedDocente, setSelectedDocente] = useState<any>(null);
  const [showMateriasModal, setShowMateriasModal] = useState(false);

  const handleOpenMateriasModal = (docente: any) => {
    setSelectedDocente(docente);
    setShowMateriasModal(true);
    // Cerrar el Dialog después de un pequeño delay para que la animación sea suave
    setTimeout(() => {
      onOpenChange(false);
    }, 50);
  };

  const handleCloseMateriasModal = () => {
    setShowMateriasModal(false);
    setSelectedDocente(null);
    // Reabrir el Dialog después de un pequeño delay
    setTimeout(() => {
      onOpenChange(true);
    }, 50);
  };

  const enriquecerDocente = (docente: DocenteGeneralMetrics) => {
    return {
      ...docente,
      estado: calcularEstado(docente.promedio_general),
      avg: docente.promedio_general || 0,
      adjusted: docente.promedio_general || 0,
      realizados: docente.total_realizadas,
      universo: docente.total_evaluaciones,
      aspectos: [],
    };
  };

  const docentesEnriquecidos = docentes.map(enriquecerDocente);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-0 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Rendimiento de Docentes</DialogTitle>
            <DialogDescription>Detalles de docentes por programa</DialogDescription>
          </DialogHeader>

          {/* Header Premium */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-8 relative overflow-hidden flex-shrink-0">
            <div className="absolute right-0 top-0 p-8 opacity-[0.03] pointer-events-none">
              <TrendingUp className="w-64 h-64 text-blue-900" />
            </div>
            <div className="relative z-10 flex items-start justify-between">
              <div className="flex items-center gap-6">
                <div className="h-14 w-14 bg-white border-2 border-blue-100 rounded-[1.5rem] flex items-center justify-center shadow-sm">
                  <GraduationCap className="h-7 w-7 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase leading-none mb-2">
                    Rendimiento de Docentes
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                      Programa: <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg ml-1 border border-blue-100">{programa}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-8 bg-slate-50/30 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-blue-500 animate-spin"></div>
                </div>
                <p className="mt-6 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">
                  Cargando docentes...
                </p>
              </div>
            ) : docentesEnriquecidos && docentesEnriquecidos.length > 0 ? (
              <div className="space-y-3 animate-in fade-in duration-300">
                {docentesEnriquecidos.map((docente, index) => (
                  <DocenteCard
                    key={`${docente.docente}-${index}`}
                    docente={{
                      ...docente,
                      estado: docente.estado as any,
                    }}
                    filters={filters}
                    programa={programa}
                    onOpenMateriasModal={handleOpenMateriasModal}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <div className="h-16 w-16 bg-white rounded-3xl border border-slate-100 flex items-center justify-center shadow-inner mb-4">
                  <GraduationCap className="w-8 h-8 opacity-20" />
                </div>
                <p className="text-lg font-black italic">Sin registros</p>
                <p className="font-medium text-sm mt-2">No se encontraron docentes evaluados en este programa</p>
              </div>
            )}
          </div>

          {/* Footer con paginación */}
          {!isLoading && docentesEnriquecidos && docentesEnriquecidos.length > 0 && (
            <div className="bg-white border-t border-slate-100 p-8 flex-shrink-0">
              <DocentesPagination
                page={pagination.page}
                total={pagination.total}
                pages={pagination.pages}
                docentes={docentesEnriquecidos}
                onPreviousPage={() =>
                  onLoadMoreDocentes(programa, tipo, pagination.page - 1)
                }
                onNextPage={() =>
                  onLoadMoreDocentes(programa, tipo, pagination.page + 1)
                }
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modales fuera del Dialog para que ocupen su tamaño completo */}
      {showMateriasModal && selectedDocente && (
        <MateriasModal
          docente={selectedDocente}
          filtros={{
            configuracionSeleccionada: filters.cfg_t,
            semestreSeleccionado: filters.semestre || '',
            periodoSeleccionado: filters.periodo || '',
            programaSeleccionado: programa,
            grupoSeleccionado: filters.grupo || '',
            sedeSeleccionada: filters.sede || '',
          }}
          onClose={handleCloseMateriasModal}
        />
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </>
  );
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Plus,
  Settings,
  Edit,
  Trash2,
  ChevronRight,
  FileText,
  Calendar,
  MessageSquare,
  Settings2,
  Trophy,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  configuracionEvaluacionService,
  type ConfiguracionTipo,
  type Aspecto,
  type Escala,
  type AspectoConEscalas,
  type CfgAItem,
  type CfgEItem,
} from "@/src/api";
import { ConfiguracionAspectoView } from "./ConfiguracionAspectoView";
import { ConfiguracionEscalaView } from "./ConfiguracionEscalaView";
import { AeView } from "./AeView";
import { ModalConfiguracionTipo } from "./ModalConfiguracionTipo";
import { type RolMixto } from "@/src/api";

interface ConfiguracionViewProps {
  aspectos: Aspecto[];
  escalas: Escala[];
  setModalConfiguracionAspecto: (value: any) => void;
  setModalConfiguracionEscala: (value: any) => void;
  setModalAe: (value: any) => void;
  handleEliminarConfiguracion: (config: ConfiguracionTipo, onSuccess?: () => void) => void;
  refreshData: () => void | Promise<void>;
  rolesDisponibles?: RolMixto[];
}

interface ConfigurationStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export function ConfiguracionView({
  aspectos,
  escalas,
  setModalConfiguracionAspecto,
  setModalConfiguracionEscala,
  setModalAe,
  handleEliminarConfiguracion,
  refreshData,
}: ConfiguracionViewProps) {
  const { toast } = useToast();
  const [modalConfiguracionTipo, setModalConfiguracionTipo] = useState({
    isOpen: false,
    configuracion: undefined as ConfiguracionTipo | undefined,
  });
  
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionTipo[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ConfiguracionTipo | null>(null);
  
  // Estados para las configuraciones de aspectos y escalas
  const [aspectosConEscalas, setAspectosConEscalas] = useState<AspectoConEscalas[]>([]);
  const [configuracionAspectos, setConfiguracionAspectos] = useState<CfgAItem[]>([]);
  const [configuracionEscalas, setConfiguracionEscalas] = useState<CfgEItem[]>([]);
  
  // Pasos del proceso
  const [steps, setSteps] = useState<ConfigurationStep[]>([
    { id: 1, title: "Base", description: "Definición inicial", completed: false },
    { id: 2, title: "Aspectos", description: "Criterios evaluación", completed: false },
    { id: 3, title: "Escalas", description: "Rangos de valor", completed: false },
    { id: 4, title: "Relación", description: "Vinculación A/E", completed: false },
  ]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedConfig) {
      loadConfigDetails(selectedConfig.id);
    }
  }, [selectedConfig]);

  const extractItems = <T,>(payload: any): T[] => {
    if (Array.isArray(payload)) return payload as T[];
    if (Array.isArray(payload?.data)) return payload.data as T[];
    if (Array.isArray(payload?.items)) return payload.items as T[];
    return [];
  };

  const formatScopeSummary = (config: ConfiguracionTipo) => {
    if (!config.scopes?.length) return "Sin scopes";
    const scope = config.scopes[0];
    
    const parts: string[] = [];
    
    if (scope.sede_nombre) {
      parts.push(scope.sede_nombre);
    }
    
    if (scope.periodo_nombre) {
      parts.push(scope.periodo_nombre);
    }
    
    if (scope.programa_nombre) {
      parts.push(scope.programa_nombre);
    }
    
    if (scope.semestre_nombre) {
      parts.push(scope.semestre_nombre);
    }
    
    if (scope.grupo_nombre) {
      parts.push(scope.grupo_nombre);
    }
    
    return parts.length > 0 ? parts.join(" · ") : "Sin datos de scope";
  };

  const loadData = async () => {
    try {
      const configResponse = await configuracionEvaluacionService.getAllByRole();
      if (configResponse.success && configResponse.data) {
        const configs = extractItems<ConfiguracionTipo>(configResponse.data);
        setConfiguraciones(configs);
        
        if (configs.length > 0) {
          if (!selectedConfig) {
            setSelectedConfig(configs[0]);
          } else {
            const selectedUpdated = configs.find((cfg) => cfg.id === selectedConfig.id) || null;
            setSelectedConfig(selectedUpdated);
          }
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const loadConfigDetails = async (configId: number) => {
    try {
      const [cfgResponse, aeResponse] = await Promise.all([
        configuracionEvaluacionService.getCfgACfgE(configId),
        configuracionEvaluacionService.getAspectosConEscalas(configId),
      ]);

      const cfgData = cfgResponse.success && cfgResponse.data && !Array.isArray(cfgResponse.data) 
        ? cfgResponse.data 
        : null;
      
      const cfgA = cfgData ? cfgData.cfg_a : [];
      const cfgE = cfgData ? cfgData.cfg_e : [];

      setConfiguracionAspectos(cfgA);
      setConfiguracionEscalas(cfgE);

      if (aeResponse.success && aeResponse.data) {
        setAspectosConEscalas(aeResponse.data.aspectos);
      } else {
        setAspectosConEscalas([]);
      }

      const hasAE = aeResponse.success && aeResponse.data
        ? aeResponse.data.aspectos.some((a: AspectoConEscalas) => a.opciones.length > 0)
        : false;

      updateSteps(
        true,
        cfgA.length > 0,
        cfgE.length > 0,
        hasAE
      );
    } catch (error) {
      console.error("Error loading config details:", error);
      setAspectosConEscalas([]);
      setConfiguracionAspectos([]);
      setConfiguracionEscalas([]);
    }
  };

  const updateSteps = (hasConfig: boolean, hasAspectos: boolean, hasEscalas: boolean, hasAE: boolean) => {
    setSteps([
      { id: 1, title: "Base", description: "Definición inicial", completed: hasConfig },
      { id: 2, title: "Aspectos", description: "Criterios evaluación", completed: hasAspectos },
      { id: 3, title: "Escalas", description: "Rangos de valor", completed: hasEscalas },
      { id: 4, title: "Relación", description: "Vinculación A/E", completed: hasAE },
    ]);
  };

  const handleConfigCreated = async (newConfig: ConfiguracionTipo) => {
    await loadData();
    setSelectedConfig(newConfig);
    await refreshData();
  };

  const handleSelectConfig = (config: ConfiguracionTipo) => {
    setSelectedConfig(config);
  };

  const handleDeleteConfig = (config: ConfiguracionTipo) => {
    handleEliminarConfiguracion(config, async () => {
      if (selectedConfig?.id === config.id) {
        setSelectedConfig(null);
      }
      await loadData();
    });
  };

  const handleToggleField = async (configId: number, field: "es_cmt_gen" | "es_cmt_gen_oblig" | "es_activo") => {
    try {
      const response = await configuracionEvaluacionService.toggleField(configId, field);
      if (response.success) {
        toast({
          title: "Actualización Exitosa",
          description: "La configuración ha sido modificada correctamente.",
        });
        await loadData();
        await refreshData();
      }
    } catch (error) {
      console.error("Error toggling field:", error);
    }
  };

  const handleAspectosConfigured = async () => {
    if (selectedConfig) {
      await loadConfigDetails(selectedConfig.id);
    }
    await refreshData();
  };

  const handleEscalasConfigured = async () => {
    if (selectedConfig) {
      await loadConfigDetails(selectedConfig.id);
    }
    await refreshData();
  };

  const configGroups = (() => {
    const grouped: ConfiguracionTipo[][] = [];
    const visited = new Set<number>();
    const byId = new Map(configuraciones.map((cfg) => [cfg.id, cfg]));
    const indexById = new Map(configuraciones.map((cfg, index) => [cfg.id, index]));
    const pairById = new Map<number, number>();

    for (const cfg of configuraciones) {
      const pairId = cfg.cfg_t_rel?.pareja_cfg_t_id;
      if (!pairId) continue;

      const pairCfg = byId.get(pairId);
      if (!pairCfg) continue;

      pairById.set(cfg.id, pairCfg.id);
      if (!pairById.has(pairCfg.id)) {
        pairById.set(pairCfg.id, cfg.id);
      }
    }

    for (const config of configuraciones) {
      if (visited.has(config.id)) continue;

      const pairId = pairById.get(config.id);
      if (pairId) {
        const pairConfig = byId.get(pairId);
        if (pairConfig && !visited.has(pairConfig.id)) {
          const pairGroup = [config, pairConfig].sort((a, b) => {
            const indexA = indexById.get(a.id) ?? 0;
            const indexB = indexById.get(b.id) ?? 0;
            return indexA - indexB;
          });

          grouped.push(pairGroup);
          visited.add(config.id);
          visited.add(pairConfig.id);
          continue;
        }
      }

      grouped.push([config]);
      visited.add(config.id);
    }

    return grouped;
  })();

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Progress Monitor */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-4">
          <Trophy className="h-4 w-4 text-amber-500" />
          <h3 className="text-xs font-semibold text-slate-400 leading-none">Workflow de Configuración</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => (
            <div key={step.id} className="relative group">
              <div className={`p-5 rounded-[2rem] border transition-all duration-500 ${
                step.completed
                  ? 'border-emerald-100 bg-emerald-50/50 shadow-sm'
                  : 'border-slate-100 bg-white'
              }`}>
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    step.completed
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200'
                      : 'bg-slate-50 text-slate-300'
                  }`}>
                    {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <span className="text-xs font-black">{step.id}</span>}
                  </div>
                  <div>
                    <h4 className={`text-xs font-semibold ${step.completed ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {step.title}
                    </h4>
                    <p className="text-xs font-medium text-slate-400 mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                   <ChevronRight className={`h-4 w-4 ${steps[index].completed && steps[index+1].completed ? 'text-emerald-500' : 'text-slate-200'}`} />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Inventory Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <Settings2 className="h-4 w-4 text-indigo-600" />
              <h3 className="text-xs font-semibold text-slate-400 leading-none">Inventario</h3>
            </div>
            <Button
              size="sm"
              onClick={() => setModalConfiguracionTipo({ isOpen: true, configuracion: undefined })}
              className="h-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 shadow-lg shadow-indigo-100"
            >
              <Plus className="h-3 w-3 mr-2" />
              Nuevo
            </Button>
          </div>

          <ScrollArea className="h-[calc(100vh-450px)] pr-4">
            <div className="space-y-4">
              {configuraciones.length === 0 ? (
                <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-[2.5rem] p-12 text-center">
                  <FileText className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-xs font-medium text-slate-400">Sin Registros</p>
                </div>
              ) : (
                configGroups.map((group) => {
                  const isPairGroup = group.length > 1;
                  return (
                    <div
                      key={isPairGroup ? `pair-${group.map((cfg) => cfg.id).join("-")}` : group[0].id}
                      className={isPairGroup ? "rounded-[2.75rem] border-2 border-indigo-200 bg-indigo-50/20 p-1 space-y-4" : "space-y-4"}
                    >
                      {group.map((config) => {
                        const isSelected = selectedConfig?.id === config.id;

                        return (
                          <div
                            key={config.id}
                            onClick={() => handleSelectConfig(config)}
                            className={`group cursor-pointer p-6 rounded-[2.5rem] border transition-all duration-500 ${
                              isSelected
                                ? 'border-indigo-200 bg-indigo-50/30 shadow-xl shadow-indigo-100/20'
                                : 'border-slate-100 bg-white hover:border-slate-200'
                            }`}
                          >
                            <div className="space-y-4">
                              <div className="rounded-2xl border border-slate-100 bg-white/80 p-4 space-y-3">
                                <div className="flex justify-between items-start gap-3">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                      {config.tipo_evaluacion?.categoria?.nombre || "Sin categoría"}
                                    </p>
                                    <h4 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
                                      {config.tipo_evaluacion?.tipo?.nombre || `Config #${config.id}`}
                                    </h4>
                                  </div>
                                  <Badge className={`rounded-lg px-2 h-5 text-[10px] font-semibold ${
                                    config.es_activo ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                                  }`}>
                                    {config.es_activo ? "Activa" : "Inactiva"}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge className="bg-white border border-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold px-2 h-5">
                                    {config.tipo_form?.nombre || "General"}
                                  </Badge>
                                  {config.cfg_t_rel?.pareja_cfg_t_id ? (
                                    <Badge className="bg-indigo-50 text-indigo-700 border-none rounded-lg text-[10px] font-semibold px-2 h-5">
                                      Pareja #{config.cfg_t_rel.pareja_cfg_t_id}
                                    </Badge>
                                  ) : null}
                                  <span className="text-[10px] font-medium text-slate-400">ID: {config.id}</span>
                                </div>

                                <div className="text-[10px] text-slate-600 leading-relaxed">
                                  <p>
                                    Rol: <span className="font-semibold text-slate-700">{config.rolesRequeridos?.[0]?.nombre || "-"}</span>
                                  </p>
                                  <p className="line-clamp-2">
                                    Scope: <span className="font-semibold text-slate-700">{formatScopeSummary(config)}</span>
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                                    <span className="text-[10px] font-medium text-slate-400">Inicia</span>
                                    <div className="flex items-center gap-1.5 text-slate-700 mt-1">
                                      <Calendar className="h-3 w-3" />
                                      <span className="text-[11px] font-semibold">{new Date(config.fecha_inicio).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-2.5">
                                    <span className="text-[10px] font-medium text-slate-400">Termina</span>
                                    <div className="flex items-center gap-1.5 text-slate-700 mt-1">
                                      <Clock className="h-3 w-3" />
                                      <span className="text-[11px] font-semibold">{new Date(config.fecha_fin).toLocaleDateString()}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 space-y-1.5">
                                  <div className="flex items-center gap-1.5">
                                    <MessageSquare className="h-3 w-3 text-slate-500" />
                                    <span className="text-[10px] font-semibold text-slate-600">Comentario general</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 text-[10px]">
                                    <span className={config.es_cmt_gen ? "text-blue-700 font-semibold" : "text-slate-500"}>
                                      {config.es_cmt_gen ? "Activo" : "Inactivo"}
                                    </span>
                                    <div className="flex items-center gap-1.5">
                                      <Button
                                        size="sm"
                                        variant={config.es_cmt_gen ? "default" : "outline"}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleField(config.id, "es_cmt_gen");
                                        }}
                                        className="h-6 rounded-md px-2 text-[9px] font-semibold"
                                      >
                                        {config.es_cmt_gen ? "Desact." : "Activar"}
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant={config.es_cmt_gen_oblig ? "default" : "outline"}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleToggleField(config.id, "es_cmt_gen_oblig");
                                        }}
                                        disabled={!config.es_cmt_gen}
                                        className="h-6 rounded-md px-2 text-[9px] font-semibold"
                                      >
                                        {config.es_cmt_gen_oblig ? "Oblig." : "Obligar"}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2 pt-2">
                                <Button
                                  size="sm"
                                  variant={config.es_activo ? "default" : "outline"}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleField(config.id, "es_activo");
                                  }}
                                  className="h-8 rounded-lg text-[10px] font-semibold"
                                >
                                  {config.es_activo ? "Activada" : "Activar"}
                                </Button>
                              </div>

                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setModalConfiguracionTipo({ isOpen: true, configuracion: config });
                                  }}
                                  className="flex-1 h-9 rounded-xl hover:bg-white hover:text-indigo-600 font-semibold text-sm shadow-sm border border-transparent hover:border-slate-100"
                                >
                                  <Edit className="h-3 w-3 mr-2" />
                                  Editar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteConfig(config);
                                  }}
                                  className="flex-1 h-9 rounded-xl hover:bg-rose-50 hover:text-rose-600 font-semibold text-sm"
                                >
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Eliminar
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Workspace Panel */}
        <div className="lg:col-span-8 space-y-6">
          {!selectedConfig ? (
            <div className="h-full flex items-center justify-center p-10 bg-slate-50/50 border border-slate-100 border-dashed rounded-[3rem]">
              <div className="text-center max-w-sm">
                 <div className="h-20 w-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-slate-100">
                    <Settings className="h-10 w-10 text-slate-100" />
                 </div>
                 <h3 className="text-xl font-bold text-slate-900 mb-2">Entorno Vacío</h3>
                 <p className="text-slate-400 font-medium text-sm">
                   Selecciona un modelo del inventario para iniciar la orquestación de componentes y reglas de negocio.
                 </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-700">
              {/* Functional Tabs */}
              <Tabs defaultValue="aspectos" className="w-full">
                <TabsList className="bg-slate-100/50 p-1.5 rounded-[2rem] border border-slate-200/50 grid grid-cols-3 h-14">
                  <TabsTrigger 
                    value="aspectos" 
                      className="rounded-[1.5rem] font-semibold text-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                  >
                    Aspectos
                  </TabsTrigger>
                  <TabsTrigger 
                    value="escalas" 
                      className="rounded-[1.5rem] font-semibold text-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                  >
                    Escalas
                  </TabsTrigger>
                  <TabsTrigger 
                    value="a-e" 
                      className="rounded-[1.5rem] font-semibold text-sm data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm"
                  >
                    Matriz A/E
                  </TabsTrigger>
                </TabsList>

                <div className="mt-8 bg-white border border-slate-100 rounded-[2.5rem] p-8 min-h-[500px] shadow-sm">
                  <TabsContent value="aspectos" className="m-0 focus-visible:ring-0">
                    <ConfiguracionAspectoView
                      configuraciones={configuracionAspectos}
                      setModalConfiguracionAspecto={() => {
                        setModalConfiguracionAspecto({
                          isOpen: true,
                          cfgTId: selectedConfig.id,
                          aspectos: aspectos,
                          onSuccess: handleAspectosConfigured,
                        });
                      }}
                      onConfigUpdated={handleAspectosConfigured}
                    />
                  </TabsContent>

                  <TabsContent value="escalas" className="m-0 focus-visible:ring-0">
                    <ConfiguracionEscalaView
                      configuraciones={configuracionEscalas}
                      setModalConfiguracionEscala={() => {
                        setModalConfiguracionEscala({
                          isOpen: true,
                          cfgTId: selectedConfig.id,
                          escalas: escalas,
                          onSuccess: handleEscalasConfigured,
                        });
                      }}
                      onConfigUpdated={handleEscalasConfigured}
                    />
                  </TabsContent>

                  <TabsContent value="a-e" className="m-0 focus-visible:ring-0">
                    <AeView
                      aspectosConEscalas={aspectosConEscalas}
                      configuracionAspectos={configuracionAspectos}
                      cfgTId={selectedConfig.id}
                      setModalAe={() => setModalAe({
                        isOpen: true,
                        cfgTId: selectedConfig.id,
                        onSuccess: handleAspectosConfigured,
                      })}
                      onConfigUpdated={handleAspectosConfigured}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </div>
      </div>

      <ModalConfiguracionTipo
        isOpen={modalConfiguracionTipo.isOpen}
        onClose={() => setModalConfiguracionTipo({ isOpen: false, configuracion: undefined })}
        onSuccess={handleConfigCreated}
        configuracion={modalConfiguracionTipo.configuracion}
      />
    </div>
  );
}

// Added ScrollArea mock if not imported
function ScrollArea({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`overflow-y-auto custom-scrollbar ${className}`}>{children}</div>;
}

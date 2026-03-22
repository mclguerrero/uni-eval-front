import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { FormModal } from "@/components/modals";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  categoriaTipoService,
  categoriaTipoMapService,
  configuracionTipoScopeService,
  cfgTRolService,
  filterService,
  tipoFormService,
  type CategoriaTipo,
  type TipoForm,
  type TipoMapItem,
} from "@/src/api";
import {
  configuracionEvaluacionService,
  type CfgTScopeItem,
  type ConfiguracionTipo,
  type CreateCfgTFullInput,
  type CreateConfiguracionTipoInput,
} from "@/src/api/services/app/cfg-t.service";
import type { FilterResponse } from "@/src/api/services/filter/filter.service";

const EMPTY_FILTERS: FilterResponse = {
  sedes: [],
  periodos: [],
  programas: [],
  semestres: [],
  grupos: [],
  roles: [],
};

const EMPTY_SCOPE = {
  sede_id: 0,
  periodo_id: 0,
  programa_id: 0,
  semestre_id: 0,
  grupo_id: 0,
};

interface ModalConfiguracionTipoProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (config: ConfiguracionTipo) => void | Promise<void>;
  configuracion?: ConfiguracionTipo;
}

export function ModalConfiguracionTipo({
  isOpen,
  onClose,
  onSuccess,
  configuracion,
}: ModalConfiguracionTipoProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Categorías y tipos
  const [categorias, setCategorias] = useState<CategoriaTipo[]>([]);
  const [selectedCategoria, setSelectedCategoria] = useState<string>("");
  const [tipos, setTipos] = useState<TipoMapItem[]>([]);
  const [tipoForms, setTipoForms] = useState<TipoForm[]>([]);
  const [filtersLocal, setFiltersLocal] = useState<FilterResponse>(EMPTY_FILTERS);

  // Scope y roles para creación completa (/cfg/t/full)
  const [scopeData, setScopeData] = useState(EMPTY_SCOPE);
  const [selectedRoles, setSelectedRoles] = useState<number[]>([]);
  const [selectedAutoevalRoles, setSelectedAutoevalRoles] = useState<number[]>([]);
  const [existingScopes, setExistingScopes] = useState<CfgTScopeItem[]>([]);
  const [existingRoleAssignments, setExistingRoleAssignments] = useState<Array<{ id: number; rol_mix_id: number }>>([]);
  const [generaAutoeval, setGeneraAutoeval] = useState(false);
  const [autoevalTipoFormId, setAutoevalTipoFormId] = useState<number>(3);
  
  // Formulario
  const [formData, setFormData] = useState<CreateConfiguracionTipoInput>({
    tipo_id: 0,
    tipo_form_id: 1,
    fecha_inicio: "",
    fecha_fin: "",
    es_cmt_gen: true,
    es_cmt_gen_oblig: true,
    es_activo: true,
  });

  useEffect(() => {
    if (!isOpen) return;
    setSelectedCategoria("");
    setScopeData(EMPTY_SCOPE);
    setSelectedRoles([]);
    setSelectedAutoevalRoles([]);
    setExistingScopes([]);
    setExistingRoleAssignments([]);
    setGeneraAutoeval(false);
    setAutoevalTipoFormId(3);
    
    // Limpiar formulario
    if (configuracion) {
      setFormData({
        tipo_id: configuracion.tipo_id ?? 0,
        tipo_form_id: configuracion.tipo_form_id ?? 1,
        fecha_inicio: configuracion.fecha_inicio?.split('T')[0] || "",
        fecha_fin: configuracion.fecha_fin?.split('T')[0] || "",
        es_cmt_gen: configuracion.es_cmt_gen ?? true,
        es_cmt_gen_oblig: configuracion.es_cmt_gen_oblig ?? true,
        es_activo: configuracion.es_activo ?? true,
      });
    } else {
      setFormData({
        tipo_id: 0,
        tipo_form_id: 1,
        fecha_inicio: "",
        fecha_fin: "",
        es_cmt_gen: true,
        es_cmt_gen_oblig: true,
        es_activo: true,
      });
      setGeneraAutoeval(true);
      setAutoevalTipoFormId(3);
    }
    
    setError(null);
    loadCategorias();
    loadTipoForms();
    loadFiltersLocal();

    if (configuracion?.id) {
      loadExistingScopeAndRoles(configuracion.id);
    }
  }, [isOpen, configuracion]);

  useEffect(() => {
    if (selectedCategoria) {
      loadTiposByCategoria(parseInt(selectedCategoria));
    } else {
      setTipos([]);
    }
  }, [selectedCategoria]);

  useEffect(() => {
    if (formData.tipo_form_id !== 1 && generaAutoeval) {
      setGeneraAutoeval(false);
    }
  }, [formData.tipo_form_id, generaAutoeval]);

  const loadCategorias = async () => {
    try {
      const response = await categoriaTipoService.getAll({ page: 1, limit: 100 });
      if (response.success && response.data) {
        const items = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        setCategorias(items);
        
        // Si estamos editando, buscar la categoría del tipo actual
        if (configuracion && configuracion.tipo_id) {
          await findAndSetCategoriaForTipo(items, configuracion.tipo_id);
        }
      }
    } catch (err) {
      console.error("Error loading categorias:", err);
    }
  };

  const loadTipoForms = async () => {
    try {
      const response = await tipoFormService.getAll({ page: 1, limit: 100 });
      if (response.success && response.data) {
        const items = Array.isArray(response.data?.data)
          ? response.data.data
          : Array.isArray(response.data)
            ? response.data
            : [];
        setTipoForms(items);
      } else {
        setTipoForms([]);
      }
    } catch (err) {
      console.error("Error loading tipo_form:", err);
      setTipoForms([]);
    }
  };

  const loadFiltersLocal = async () => {
    try {
      const data = await filterService.getAllFiltersLocal();
      setFiltersLocal({
        sedes: Array.isArray(data?.sedes) ? data.sedes : [],
        periodos: Array.isArray(data?.periodos) ? data.periodos : [],
        programas: Array.isArray(data?.programas) ? data.programas : [],
        semestres: Array.isArray(data?.semestres) ? data.semestres : [],
        grupos: Array.isArray(data?.grupos) ? data.grupos : [],
        roles: Array.isArray(data?.roles) ? data.roles : [],
      });
    } catch (err) {
      console.error("Error loading local filters:", err);
      setFiltersLocal(EMPTY_FILTERS);
    }
  };

  const toggleRoleSelection = (roleId: number, checked: boolean) => {
    setSelectedRoles((prev) => {
      if (checked) {
        return prev.includes(roleId) ? prev : [...prev, roleId];
      }
      return prev.filter((id) => id !== roleId);
    });
  };

  const toggleAutoevalRoleSelection = (roleId: number, checked: boolean) => {
    setSelectedAutoevalRoles((prev) => {
      if (checked) {
        return prev.includes(roleId) ? prev : [...prev, roleId];
      }
      return prev.filter((id) => id !== roleId);
    });
  };

  const loadExistingScopeAndRoles = async (cfgTId: number) => {
    try {
      const [scopeResponse, rolesResponse] = await Promise.all([
        configuracionEvaluacionService.getScopesByCfgT(cfgTId),
        cfgTRolService.getRolesByConfiguracion(cfgTId),
      ]);

      const scopes = Array.isArray(scopeResponse.data) ? scopeResponse.data : [];
      const firstScope = scopes[0];

      setExistingScopes(scopes);
      if (firstScope) {
        setScopeData({
          sede_id: firstScope.sede_id || 0,
          periodo_id: firstScope.periodo_id || 0,
          programa_id: firstScope.programa_id || 0,
          semestre_id: firstScope.semestre_id || 0,
          grupo_id: firstScope.grupo_id || 0,
        });
      }

      const roles = Array.isArray(rolesResponse.data) ? rolesResponse.data : [];
      setExistingRoleAssignments(
        roles.map((role) => ({ id: role.id, rol_mix_id: role.rol_mix_id }))
      );
      setSelectedRoles(roles.map((role) => role.rol_mix_id));
    } catch (err) {
      console.error("Error loading existing scope/roles:", err);
      setExistingScopes([]);
      setExistingRoleAssignments([]);
    }
  };

  const findAndSetCategoriaForTipo = async (cats: CategoriaTipo[], mapId: number) => {
    try {
      // Buscar en todas las categorías cuál contiene este map_id
      for (const cat of cats) {
        const response = await categoriaTipoMapService.listTiposByCategoria(cat.id);
        if (response.success && response.data?.items) {
          const tipoExiste = response.data.items.some((t) => t.map_id === mapId);
          if (tipoExiste) {
            setSelectedCategoria(cat.id.toString());
            // No necesitamos cargar tipos aquí, el useEffect lo hará
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error finding categoria for tipo:", err);
    }
  };

  const loadTiposByCategoria = async (categoriaId: number) => {
    try {
      const response = await categoriaTipoMapService.listTiposByCategoria(categoriaId);
      if (response.success && response.data?.items) {
        setTipos(response.data.items);
      }
    } catch (err) {
      console.error("Error loading tipos:", err);
      setTipos([]);
    }
  };

  const validate = () => {
    if (!formData.tipo_id || formData.tipo_id === 0) {
      setError("Debes seleccionar un tipo de evaluación");
      return false;
    }
    if (!formData.fecha_inicio) {
      setError("Debes ingresar una fecha de inicio");
      return false;
    }
    if (!formData.fecha_fin) {
      setError("Debes ingresar una fecha de fin");
      return false;
    }
    if (new Date(formData.fecha_fin) < new Date(formData.fecha_inicio)) {
      setError("La fecha de fin debe ser posterior a la fecha de inicio");
      return false;
    }

    // Sede es ahora opcional, solo periodo es obligatorio
    if (!scopeData.periodo_id) {
      setError("Debes seleccionar al menos un periodo para el scope");
      return false;
    }

    if (selectedRoles.length === 0) {
      setError("Debes seleccionar al menos un rol autorizado");
      return false;
    }

    if (!configuracion) {
      if (generaAutoeval && formData.tipo_form_id !== 1) {
        setError("Solo tipo de formulario 1 permite generar autoevaluación");
        return false;
      }

      if (generaAutoeval && ![3, 4].includes(autoevalTipoFormId)) {
        setError("La autoevaluación solo permite tipo de formulario 3 o 4");
        return false;
      }

      if (generaAutoeval && selectedAutoevalRoles.length === 0) {
        setError("Debes seleccionar al menos un rol para la autoevaluación");
        return false;
      }
    }

    setError(null);
    return true;
  };

  const syncScopeForEdit = async (cfgTId: number) => {
    const payload = {
      cfg_t_id: cfgTId,
      sede_id: scopeData.sede_id || null,
      periodo_id: scopeData.periodo_id,
      programa_id: scopeData.programa_id || null,
      semestre_id: scopeData.semestre_id || null,
      grupo_id: scopeData.grupo_id || null,
    };

    if (existingScopes.length > 0) {
      const primaryScope = existingScopes[0];
      await configuracionTipoScopeService.update(primaryScope.id, payload);
      return;
    }

    await configuracionTipoScopeService.create(payload);
  };

  const syncRolesForEdit = async (cfgTId: number) => {
    const currentSet = new Set(existingRoleAssignments.map((item) => item.rol_mix_id));
    const selectedSet = new Set(selectedRoles);

    const toAdd = selectedRoles.filter((roleId) => !currentSet.has(roleId));
    const toRemove = existingRoleAssignments.filter((item) => !selectedSet.has(item.rol_mix_id));

    await Promise.all([
      ...toAdd.map((rolMixId) => cfgTRolService.create({ cfg_t_id: cfgTId, rol_mix_id: rolMixId })),
      ...toRemove.map((item) => cfgTRolService.deleteByConfigAndRole(item.id)),
    ]);
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      let response;
      
      if (configuracion) {
        response = await configuracionEvaluacionService.update(configuracion.id, formData);
        if (response.success) {
          await syncScopeForEdit(configuracion.id);
          await syncRolesForEdit(configuracion.id);
        }
      } else {
        const payload: CreateCfgTFullInput = {
          ...formData,
          genera_autoeval: generaAutoeval,
          autoeval_tipo_form_id: generaAutoeval ? autoevalTipoFormId : null,
          autoeval_rol_mix_ids: generaAutoeval && selectedAutoevalRoles.length > 0 ? selectedAutoevalRoles : null,
          scopes: [
            {
              sede_id: scopeData.sede_id || null,
              periodo_id: scopeData.periodo_id,
              programa_id: scopeData.programa_id || null,
              semestre_id: scopeData.semestre_id || null,
              grupo_id: scopeData.grupo_id || null,
            },
          ],
          roles: selectedRoles.map((rolMixId) => ({ rol_mix_id: rolMixId })),
        };
        response = await configuracionEvaluacionService.createFull(payload);
      }
      
      if (response.success && response.data) {
        toast({
          title: configuracion ? "Configuración actualizada" : "Configuración creada",
          description: `La configuración fue ${configuracion ? 'actualizada' : 'creada'} correctamente`,
        });

        if (configuracion) {
          await Promise.resolve(onSuccess(response.data as ConfiguracionTipo));
        } else {
          const cfgEvalId = (response.data as any)?.cfg_eval?.id;
          if (cfgEvalId) {
            const listResponse = await configuracionEvaluacionService.getAllByRole();
            const listItems = Array.isArray(listResponse.data) ? listResponse.data : [];
            const created = listItems.find((item) => item.id === cfgEvalId);
            await Promise.resolve(onSuccess((created || ({ id: cfgEvalId } as ConfiguracionTipo))));
          } else {
            await Promise.resolve(onSuccess(({ id: 0 } as ConfiguracionTipo)));
          }
        }

        onClose();
      } else {
        throw new Error("No se pudo guardar la configuración");
      }
    } catch (err) {
      toast({
        title: "Error al guardar",
        description: "No se pudo completar la operación. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={async (e) => {
        e.preventDefault();
        await handleSubmit();
      }}
      mode={configuracion ? "edit" : "create"}
      title={`${configuracion ? "Editar" : "Nueva"} Configuración de Evaluación`}
      icon={Settings}
      size="xl"
      isLoading={isLoading}
      loadingText="Guardando..."
      submitText={configuracion ? "Actualizar" : "Crear"}
    >
      <Card className="border shadow-none bg-muted/20">
          <CardContent className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría de Tipo</Label>
              <Select
                value={selectedCategoria}
                onValueChange={(value) => {
                  setSelectedCategoria(value);
                  setFormData((prev) => ({ ...prev, tipo_id: 0 }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_id">Tipo de Evaluación/Encuesta *</Label>
              <Select
                value={formData.tipo_id ? formData.tipo_id.toString() : ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo_id: parseInt(value) })
                }
                disabled={!selectedCategoria || tipos.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipos.map((tipo) => (
                    <SelectItem key={tipo.map_id} value={tipo.map_id.toString()}>
                      {tipo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha de Inicio *</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={formData.fecha_inicio}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_inicio: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha de Fin *</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={formData.fecha_fin}
                  onChange={(e) =>
                    setFormData({ ...formData, fecha_fin: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">Tipo de formulario</h4>
              <Select
                value={formData.tipo_form_id ? formData.tipo_form_id.toString() : ""}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipo_form_id: parseInt(value) })
                }
                disabled={tipoForms.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tipoForms.map((tipoForm) => (
                    <SelectItem key={tipoForm.id} value={tipoForm.id.toString()}>
                      {tipoForm.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!configuracion && (
              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="genera_autoeval" className="cursor-pointer">
                    Generar autoevaluación
                  </Label>
                  <Switch
                    id="genera_autoeval"
                    checked={generaAutoeval}
                    disabled={formData.tipo_form_id !== 1}
                    onCheckedChange={(value) => setGeneraAutoeval(value)}
                  />
                </div>

                {generaAutoeval && (
                  <div className="space-y-2">
                    <Label htmlFor="autoeval_tipo_form_id">Tipo de formulario de autoevaluación</Label>
                    <Select
                      value={autoevalTipoFormId.toString()}
                      onValueChange={(value) => setAutoevalTipoFormId(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona tipo de autoevaluación" />
                      </SelectTrigger>
                      <SelectContent>
                        {tipoForms
                          .filter((item) => item.id === 3 || item.id === 4)
                          .map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.nombre}
                            </SelectItem>
                          ))}
                        {!tipoForms.some((item) => item.id === 3) && (
                          <SelectItem value="3">Autoevaluación (3)</SelectItem>
                        )}
                        {!tipoForms.some((item) => item.id === 4) && (
                          <SelectItem value="4">Autoencuesta (4)</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {generaAutoeval && (
                  <div className="space-y-3 pt-2 border-t">
                    <h4 className="text-sm font-medium">Roles autorizados para autoevaluación</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filtersLocal.roles.map((rol) => (
                        <div key={rol.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`autoeval-rol-${rol.id}`}
                            checked={selectedAutoevalRoles.includes(rol.id)}
                            onCheckedChange={(checked) => toggleAutoevalRoleSelection(rol.id, Boolean(checked))}
                          />
                          <Label htmlFor={`autoeval-rol-${rol.id}`} className="text-sm font-normal cursor-pointer">
                            {rol.nombre} ({rol.origen})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">Scope académico</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Periodo *</Label>
                  <Select
                    value={scopeData.periodo_id ? scopeData.periodo_id.toString() : ""}
                    onValueChange={(value) =>
                      setScopeData((prev) => ({ ...prev, periodo_id: parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      {filtersLocal.periodos.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Sede</Label>
                  <Select
                    value={scopeData.sede_id ? scopeData.sede_id.toString() : "null"}
                    onValueChange={(value) =>
                      setScopeData((prev) => ({ ...prev, sede_id: value === "null" ? 0 : parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona sede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Todos</SelectItem>
                      {filtersLocal.sedes.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Programa</Label>
                  <Select
                    value={scopeData.programa_id ? scopeData.programa_id.toString() : "null"}
                    onValueChange={(value) =>
                      setScopeData((prev) => ({ ...prev, programa_id: value === "null" ? 0 : parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona programa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Todos</SelectItem>
                      {filtersLocal.programas.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semestre</Label>
                  <Select
                    value={scopeData.semestre_id ? scopeData.semestre_id.toString() : "null"}
                    onValueChange={(value) =>
                      setScopeData((prev) => ({ ...prev, semestre_id: value === "null" ? 0 : parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">Todos</SelectItem>
                      {filtersLocal.semestres.map((item) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Grupo</Label>
                <Select
                  value={scopeData.grupo_id ? scopeData.grupo_id.toString() : "null"}
                  onValueChange={(value) =>
                    setScopeData((prev) => ({ ...prev, grupo_id: value === "null" ? 0 : parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona grupo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">Todos</SelectItem>
                    {filtersLocal.grupos.map((item) => (
                      <SelectItem key={item.id} value={item.id.toString()}>
                        {item.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">Roles autorizados</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filtersLocal.roles.map((rol) => (
                  <div key={rol.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`rol-${rol.id}`}
                      checked={selectedRoles.includes(rol.id)}
                      onCheckedChange={(checked) => toggleRoleSelection(rol.id, Boolean(checked))}
                    />
                    <Label htmlFor={`rol-${rol.id}`} className="text-sm font-normal cursor-pointer">
                      {rol.nombre} ({rol.origen})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-sm font-medium">Opciones de comentarios</h4>
              <div className="flex items-center justify-between">
                <Label htmlFor="es_cmt_gen" className="cursor-pointer">
                  Permitir comentario general
                </Label>
                <Switch
                  id="es_cmt_gen"
                  checked={formData.es_cmt_gen}
                  onCheckedChange={(value) =>
                    setFormData({
                      ...formData,
                      es_cmt_gen: value,
                      // Si desactivamos es_cmt_gen, también desactivamos es_cmt_gen_oblig
                      es_cmt_gen_oblig: value ? formData.es_cmt_gen_oblig : false,
                    })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="es_cmt_gen_oblig" className="cursor-pointer">
                  Comentario general obligatorio
                </Label>
                <Switch
                  id="es_cmt_gen_oblig"
                  checked={formData.es_cmt_gen_oblig}
                  disabled={!formData.es_cmt_gen}
                  onCheckedChange={(value) =>
                    setFormData({
                      ...formData,
                      es_cmt_gen_oblig: value,
                      // Si activamos es_cmt_gen_oblig, también activamos es_cmt_gen
                      es_cmt_gen: value ? true : formData.es_cmt_gen,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label htmlFor="es_activo" className="cursor-pointer">
                  Configuración activa
                </Label>
                <Switch
                  id="es_activo"
                  checked={formData.es_activo}
                  onCheckedChange={(value) =>
                    setFormData({ ...formData, es_activo: value })
                  }
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

    </FormModal>
  );
}

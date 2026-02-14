import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderOpen, Edit3, Plus, AlertCircle } from "lucide-react";
import { type CategoriaEscala } from "@/src/api";
import { categoriaEscalaService } from "@/src/api";
import { useToast } from "@/hooks/use-toast";
import { alphaNumericSpanish } from "@/src/api/validation/comment-rules";

interface ModalCategoriaEscalaProps {
  isOpen: boolean;
  onClose: () => void;
  categoria?: CategoriaEscala;
  onSuccess: () => void;
  onCategoriaCreated?: (categoria: CategoriaEscala) => void;
  onCategoriaUpdated?: (categoria: CategoriaEscala) => void;
}

export function ModalCategoriaEscala({
  isOpen,
  onClose,
  categoria,
  onSuccess,
  onCategoriaCreated,
  onCategoriaUpdated,
}: ModalCategoriaEscalaProps) {
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre,
        descripcion: categoria.descripcion || "",
      });
    } else {
      setFormData({ nombre: "", descripcion: "" });
    }
    setErrors({});
  }, [categoria, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    const nombreTrim = formData.nombre.trim();
    const descripcionTrim = formData.descripcion.trim();

    if (!nombreTrim) {
      newErrors.nombre = "El nombre es obligatorio";
    } else if (nombreTrim.length < 1 || nombreTrim.length > 100) {
      newErrors.nombre = "El nombre debe tener entre 1 y 100 caracteres";
    } else {
      const nameError = alphaNumericSpanish(nombreTrim);
      if (nameError) newErrors.nombre = nameError;
    }

    if (!descripcionTrim) {
      newErrors.descripcion = "La descripcion es obligatoria";
    } else if (descripcionTrim.length < 1 || descripcionTrim.length > 500) {
      newErrors.descripcion = "La descripcion debe tener entre 1 y 500 caracteres";
    } else {
      const descError = alphaNumericSpanish(descripcionTrim);
      if (descError) newErrors.descripcion = descError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (categoria) {
        await categoriaEscalaService.update(categoria.id, formData);
        toast({
          title: "¡Actualización exitosa!",
          description: "La categoría se actualizó correctamente",
        });
        onCategoriaUpdated?.({ ...categoria, ...formData } as CategoriaEscala);
      } else {
        const response = await categoriaEscalaService.create(formData);
        toast({
          title: "¡Creación exitosa!",
          description: "Nueva categoría creada",
        });
        if (response.success && response.data) {
          const nuevaCategoria = Array.isArray(response.data) ? response.data[0] : response.data;
          onCategoriaCreated?.(nuevaCategoria as CategoriaEscala);
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo completar la operación. Intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {categoria ? (
                <Edit3 className="h-5 w-5 text-primary" />
              ) : (
                <Plus className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {categoria ? "Editar Categoría" : "Nueva Categoría"}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {categoria 
                  ? "Modifica la información de la categoría"
                  : "Crea una nueva categoría para organizar escalas de valoración"
                }
              </p>
            </div>
          </div>
        </DialogHeader>

        <Card className="border-0 shadow-none bg-muted/20">
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Ejemplos sugeridos - Solo mostrar al crear nueva */}
              {!categoria && (
                <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
                    💡 Ejemplos de categorías:
                  </p>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
                    <li><strong>Cualitativa:</strong> Escalas descriptivas (Excelente, Bueno, Regular)</li>
                    <li><strong>Cuantitativa:</strong> Escalas numéricas (1-5, 1-10)</li>
                    <li><strong>Likert:</strong> Escalas de acuerdo/desacuerdo</li>
                  </ul>
                </div>
              )}

              {/* Campo Nombre */}
              <div className="space-y-3">
                <Label htmlFor="nombre" className="text-sm font-medium flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-primary" />
                  Nombre de la Categoría
                </Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange("nombre", e.target.value)}
                  placeholder="Ej. Cualitativa"
                  className={`transition-colors ${errors.nombre ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  required
                />
                {errors.nombre && (
                  <div className="flex items-center gap-2 text-destructive text-sm">
                    <AlertCircle className="h-4 w-4" />
                    <span>{errors.nombre}</span>
                  </div>
                )}
              </div>

              {/* Campo Descripción */}
              <div className="space-y-3">
                <Label htmlFor="descripcion" className="text-sm font-medium flex items-center gap-2">
                  <Edit3 className="h-4 w-4 text-primary" />
                  Descripción Detallada
                </Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  placeholder="Describe el propósito de esta categoría. Ej: Escalas de valoración cualitativa con descriptores textuales..."
                  rows={4}
                  className={`resize-none transition-colors ${errors.descripcion ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  required
                />
                <div className="flex justify-between items-center">
                  {errors.descripcion && (
                    <div className="flex items-center gap-2 text-destructive text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.descripcion}</span>
                    </div>
                  )}
                  <Badge variant="outline" className="ml-auto text-xs">
                    {formData.descripcion.length} caracteres
                  </Badge>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            className="w-full sm:w-auto"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {categoria ? "Actualizando..." : "Creando..."}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {categoria ? <Edit3 className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {categoria ? "Actualizar" : "Crear"}
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

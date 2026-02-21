import EvaluationCard from "../../../estudiante/components/EvaluationCard";
import type { EvalByUserItem } from "@/src/api";

export default function DocenteEvaluationCard({
  evaluacion,
}: {
  evaluacion: EvalByUserItem & { es_finalizada?: boolean | null };
}) {
  return (
    <EvaluationCard evaluacion={evaluacion} basePath="/docente/eval" />
  );
}

import { apiFetch } from "../../lib/apiClient";
import type { Ficha, Indicadores } from "./types";

export function obtenerFicha(beneficiarioId: string) {
  return apiFetch<Ficha>(`/beneficiarios/${beneficiarioId}/ficha`);
}

export function obtenerIndicadores() {
  // Agrega varias consultas de Firestore (una por programa, en paralelo);
  // con muchos programas puede tardar mas que el limite por defecto.
  return apiFetch<Indicadores>("/reportes/indicadores", { tiempoLimiteMs: 20000 });
}

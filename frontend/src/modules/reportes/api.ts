import { apiFetch } from "../../lib/apiClient";
import type { Ficha, Indicadores } from "./types";

export function obtenerFicha(beneficiarioId: string) {
  return apiFetch<Ficha>(`/beneficiarios/${beneficiarioId}/ficha`);
}

export function obtenerIndicadores() {
  return apiFetch<Indicadores>("/reportes/indicadores");
}

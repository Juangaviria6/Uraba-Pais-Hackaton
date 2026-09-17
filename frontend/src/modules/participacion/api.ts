import { apiFetch } from "../../lib/apiClient";
import type { EstadoParticipacion, NuevaParticipacion, Participacion, Programa } from "./types";

export function listarProgramas() {
  return apiFetch<Programa[]>("/programas");
}

export function agregarParticipacion(beneficiarioId: string, datos: NuevaParticipacion) {
  return apiFetch<Participacion>(`/beneficiarios/${beneficiarioId}/participaciones`, {
    method: "POST",
    body: datos,
  });
}

export function actualizarEstadoParticipacion(
  beneficiarioId: string,
  participacionId: string,
  estado: EstadoParticipacion
) {
  return apiFetch<Participacion>(
    `/beneficiarios/${beneficiarioId}/participaciones/${participacionId}`,
    { method: "PUT", body: { estado } }
  );
}

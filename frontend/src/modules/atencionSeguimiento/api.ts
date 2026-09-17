import { apiFetch } from "../../lib/apiClient";
import type { Atencion, NuevaAtencion, NuevoSeguimiento, Seguimiento } from "./types";

export function listarAtenciones(beneficiarioId: string) {
  return apiFetch<Atencion[]>(`/beneficiarios/${beneficiarioId}/atenciones`);
}

export function agregarAtencion(beneficiarioId: string, datos: NuevaAtencion) {
  return apiFetch<Atencion>(`/beneficiarios/${beneficiarioId}/atenciones`, {
    method: "POST",
    body: datos,
  });
}

export function listarSeguimientos(beneficiarioId: string) {
  return apiFetch<Seguimiento[]>(`/beneficiarios/${beneficiarioId}/seguimientos`);
}

export function agregarSeguimiento(beneficiarioId: string, datos: NuevoSeguimiento) {
  return apiFetch<Seguimiento>(`/beneficiarios/${beneficiarioId}/seguimientos`, {
    method: "POST",
    body: datos,
  });
}

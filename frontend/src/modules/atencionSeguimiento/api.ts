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

// Evidencia fotografica (componente complementario): se adjunta despues de
// creado el registro, subiendo el archivo tal cual a Cloudinary a traves del
// backend (nunca directo desde el navegador, asi la clave de Cloudinary
// nunca sale del servidor). Solo aplica a registros con id real (no a los
// que aun estan pendientes de sincronizar sin conexion).
export function agregarEvidenciaAtencion(beneficiarioId: string, atencionId: string, archivo: File) {
  const formData = new FormData();
  formData.append("evidencia", archivo);
  return apiFetch<Atencion>(`/beneficiarios/${beneficiarioId}/atenciones/${atencionId}/evidencia`, {
    method: "POST",
    body: formData,
    tiempoLimiteMs: 30000,
  });
}

export function agregarEvidenciaSeguimiento(beneficiarioId: string, seguimientoId: string, archivo: File) {
  const formData = new FormData();
  formData.append("evidencia", archivo);
  return apiFetch<Seguimiento>(`/beneficiarios/${beneficiarioId}/seguimientos/${seguimientoId}/evidencia`, {
    method: "POST",
    body: formData,
    tiempoLimiteMs: 30000,
  });
}

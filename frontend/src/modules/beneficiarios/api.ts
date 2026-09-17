import { apiFetch } from "../../lib/apiClient";
import type { Beneficiario, Familiar, NuevoBeneficiario, NuevoFamiliar } from "./types";

type BusquedaResultado =
  | { encontrado: true; beneficiario: Beneficiario }
  | { encontrado: false };

export function buscarBeneficiario(tipo_documento: string, numero_documento: string) {
  const params = new URLSearchParams({ tipo_documento, numero_documento });
  return apiFetch<BusquedaResultado>(`/beneficiarios/buscar?${params.toString()}`);
}

export function crearBeneficiario(datos: NuevoBeneficiario) {
  return apiFetch<Beneficiario>("/beneficiarios", { method: "POST", body: datos });
}

export function obtenerBeneficiario(id: string) {
  return apiFetch<Beneficiario>(`/beneficiarios/${id}`);
}

export function actualizarBeneficiario(id: string, datos: Partial<NuevoBeneficiario>) {
  return apiFetch<Beneficiario>(`/beneficiarios/${id}`, { method: "PUT", body: datos });
}

export function listarFamiliares(id: string) {
  return apiFetch<Familiar[]>(`/beneficiarios/${id}/familiares`);
}

export function agregarFamiliar(id: string, datos: NuevoFamiliar) {
  return apiFetch<Familiar>(`/beneficiarios/${id}/familiares`, { method: "POST", body: datos });
}

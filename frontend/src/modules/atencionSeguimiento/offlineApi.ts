import { ApiError } from "../../lib/apiClient";
import {
  agregarOperacionPendiente,
  generarIdLocal,
  listarOperacionesPendientesPorBeneficiario,
} from "../../lib/offlineStore";
import { agregarAtencion, agregarSeguimiento } from "./api";
import type { Atencion, NuevaAtencion, NuevoSeguimiento, Seguimiento } from "./types";

function esErrorDeRed(err: unknown) {
  return !(err instanceof ApiError);
}

export type AtencionPendiente = Atencion & { _pendienteSincronizacion?: boolean };
export type SeguimientoPendiente = Seguimiento & { _pendienteSincronizacion?: boolean };

export async function agregarAtencionOffline(beneficiarioId: string, datos: NuevaAtencion): Promise<AtencionPendiente> {
  // Si el beneficiario todavia no tiene id real, ni vale la pena intentar
  // contra el servidor: no existe alla todavia.
  if (!beneficiarioId.startsWith("local-")) {
    try {
      return await agregarAtencion(beneficiarioId, datos);
    } catch (err) {
      if (!esErrorDeRed(err)) throw err;
    }
  }

  await agregarOperacionPendiente({ tipo: "atencion", beneficiarioId, payload: datos });
  return { ...datos, id: generarIdLocal("atencion"), _pendienteSincronizacion: true };
}

export async function agregarSeguimientoOffline(
  beneficiarioId: string,
  datos: NuevoSeguimiento,
): Promise<SeguimientoPendiente> {
  if (!beneficiarioId.startsWith("local-")) {
    try {
      return await agregarSeguimiento(beneficiarioId, datos);
    } catch (err) {
      if (!esErrorDeRed(err)) throw err;
    }
  }

  await agregarOperacionPendiente({ tipo: "seguimiento", beneficiarioId, payload: datos });
  return { ...datos, id: generarIdLocal("seguimiento"), _pendienteSincronizacion: true };
}

export async function listarPendientesDeBeneficiario(beneficiarioId: string) {
  const operaciones = await listarOperacionesPendientesPorBeneficiario(beneficiarioId);

  const atenciones: AtencionPendiente[] = operaciones
    .filter((op) => op.tipo === "atencion")
    .map((op) => ({ ...(op.payload as NuevaAtencion), id: op.id, _pendienteSincronizacion: true }));

  const seguimientos: SeguimientoPendiente[] = operaciones
    .filter((op) => op.tipo === "seguimiento")
    .map((op) => ({ ...(op.payload as NuevoSeguimiento), id: op.id, _pendienteSincronizacion: true }));

  return { atenciones, seguimientos };
}

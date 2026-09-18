import { useEffect, useState } from "react";
import { ApiError } from "./apiClient";
import {
  actualizarOperacionPendiente,
  contarOperacionesPendientes,
  eliminarOperacionPendiente,
  listarOperacionesConError,
  listarOperacionesPendientes,
  reemplazarBeneficiarioIdEnOperaciones,
  renombrarFichaEnCache,
  type OperacionPendiente,
} from "./offlineStore";
import { crearBeneficiario } from "../modules/beneficiarios/api";
import { agregarAtencion, agregarSeguimiento } from "../modules/atencionSeguimiento/api";
import type { NuevaAtencion, NuevoSeguimiento } from "../modules/atencionSeguimiento/types";
import type { NuevoBeneficiario } from "../modules/beneficiarios/types";

export type EstadoSincronizacion = {
  enLinea: boolean;
  sincronizando: boolean;
  pendientes: number;
  conError: number;
};

const estado: EstadoSincronizacion = {
  enLinea: navigator.onLine,
  sincronizando: false,
  pendientes: 0,
  conError: 0,
};

type Escucha = (estado: EstadoSincronizacion) => void;
const escuchas = new Set<Escucha>();

function notificar() {
  for (const escucha of escuchas) escucha({ ...estado });
}

export function suscribirseSincronizacion(escucha: Escucha) {
  escuchas.add(escucha);
  escucha({ ...estado });
  return () => {
    escuchas.delete(escucha);
  };
}

export function useEstadoSincronizacion() {
  const [actual, setActual] = useState<EstadoSincronizacion>(estado);
  useEffect(() => suscribirseSincronizacion(setActual), []);
  return actual;
}

async function actualizarConteoPendientes() {
  estado.pendientes = await contarOperacionesPendientes();
  estado.conError = (await listarOperacionesConError()).length;
  notificar();
}

function esErrorDeRed(err: unknown) {
  return !(err instanceof ApiError);
}

async function manejarErrorOperacion(op: OperacionPendiente, err: unknown) {
  if (esErrorDeRed(err)) {
    // Fallo de red: se deja igual en la cola, se reintenta mas adelante.
    await actualizarOperacionPendiente(op.id, { intentos: op.intentos + 1 });
  } else {
    // El servidor respondio y rechazo el dato: reintentar solo no sirve,
    // se guarda el error para que alguien lo revise.
    const mensaje = err instanceof Error ? err.message : "Error desconocido";
    await actualizarOperacionPendiente(op.id, { intentos: op.intentos + 1, error: mensaje });
  }
}

let sincronizando = false;

export async function sincronizar() {
  if (sincronizando) return;
  sincronizando = true;
  estado.sincronizando = true;
  notificar();

  try {
    const operaciones = await listarOperacionesPendientes();

    // Las creaciones de beneficiario van primero: las demas operaciones
    // pueden depender de que el servidor ya les haya asignado un id real.
    const creaciones = operaciones.filter((op) => op.tipo === "crear_beneficiario" && !op.error);
    for (const op of creaciones) {
      try {
        const creado = await crearBeneficiario(op.payload as NuevoBeneficiario);
        await renombrarFichaEnCache(op.beneficiarioId, creado.id);
        await reemplazarBeneficiarioIdEnOperaciones(op.beneficiarioId, creado.id);
        await eliminarOperacionPendiente(op.id);
      } catch (err) {
        await manejarErrorOperacion(op, err);
      }
    }

    const restantes = (await listarOperacionesPendientes()).filter(
      (op) => op.tipo !== "crear_beneficiario" && !op.error,
    );
    for (const op of restantes) {
      // Si sigue con id local es porque la creacion del beneficiario del que
      // depende todavia no se pudo sincronizar; se intenta en la proxima vuelta.
      if (op.beneficiarioId.startsWith("local-")) continue;

      try {
        if (op.tipo === "atencion") {
          await agregarAtencion(op.beneficiarioId, op.payload as NuevaAtencion);
        } else if (op.tipo === "seguimiento") {
          await agregarSeguimiento(op.beneficiarioId, op.payload as NuevoSeguimiento);
        }
        await eliminarOperacionPendiente(op.id);
      } catch (err) {
        await manejarErrorOperacion(op, err);
      }
    }
  } finally {
    sincronizando = false;
    estado.sincronizando = false;
    await actualizarConteoPendientes();
  }
}

let iniciado = false;

export function iniciarSincronizacionAutomatica() {
  if (iniciado) return;
  iniciado = true;

  window.addEventListener("online", () => {
    estado.enLinea = true;
    notificar();
    sincronizar();
  });
  window.addEventListener("offline", () => {
    estado.enLinea = false;
    notificar();
  });

  // Reintento silencioso periodico: navigator.onLine puede decir "en linea"
  // aunque en realidad no haya internet real (solo red local), asi que no
  // basta con confiar unicamente en el evento "online".
  setInterval(() => {
    if (navigator.onLine) sincronizar();
  }, 20000);

  actualizarConteoPendientes();
  if (navigator.onLine) sincronizar();
}

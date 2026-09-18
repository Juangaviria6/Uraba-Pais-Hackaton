import { useState } from "react";
import { sincronizar, useEstadoSincronizacion } from "../lib/syncEngine";
import {
  eliminarOperacionPendiente,
  listarOperacionesConError,
  type OperacionPendiente,
} from "../lib/offlineStore";

const ETIQUETA_TIPO: Record<OperacionPendiente["tipo"], string> = {
  crear_beneficiario: "Registro de beneficiario",
  atencion: "Atencion/ayuda",
  seguimiento: "Seguimiento",
};

export function EstadoConexion() {
  const estado = useEstadoSincronizacion();
  const [errores, setErrores] = useState<OperacionPendiente[] | null>(null);

  async function alternarDetalles() {
    if (errores) {
      setErrores(null);
      return;
    }
    setErrores(await listarOperacionesConError());
  }

  async function descartar(id: string) {
    await eliminarOperacionPendiente(id);
    setErrores(await listarOperacionesConError());
  }

  if (estado.enLinea && estado.pendientes === 0) {
    return null;
  }

  return (
    <div className={`estado-conexion ${estado.enLinea ? "" : "estado-conexion--offline"}`}>
      <div className="acciones" style={{ justifyContent: "center" }}>
        <span>
          {estado.enLinea ? "En linea" : "Sin conexion"}
          {estado.pendientes > 0 &&
            ` · ${estado.pendientes} registro(s) guardado(s) localmente, pendientes de sincronizar`}
          {estado.conError > 0 && ` (${estado.conError} con error, requieren revision)`}
        </span>
        {estado.enLinea && estado.pendientes > 0 && (
          <button type="button" className="secundario" onClick={() => sincronizar()} disabled={estado.sincronizando}>
            {estado.sincronizando ? "Sincronizando..." : "Sincronizar ahora"}
          </button>
        )}
        {estado.conError > 0 && (
          <button type="button" className="secundario" onClick={alternarDetalles}>
            {errores ? "Ocultar detalles" : "Ver detalles"}
          </button>
        )}
      </div>

      {errores && errores.length > 0 && (
        <ul style={{ textAlign: "left" }}>
          {errores.map((op) => (
            <li key={op.id}>
              {ETIQUETA_TIPO[op.tipo]}: {op.error}{" "}
              <button className="enlace" onClick={() => descartar(op.id)}>
                Descartar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

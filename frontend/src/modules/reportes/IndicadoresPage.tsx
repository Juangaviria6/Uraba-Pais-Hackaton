import { useEffect, useState } from "react";
import { obtenerIndicadores } from "./api";
import type { Indicadores } from "./types";
import { Cargando, MensajeError } from "../../components/EstadoCarga";

export function IndicadoresPage() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await obtenerIndicadores();
        setIndicadores(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar los indicadores");
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  if (cargando) return <Cargando texto="Cargando indicadores..." />;
  if (error) return <MensajeError texto={error} />;
  if (!indicadores) return null;

  return (
    <div>
      <h1>Indicadores generales</h1>
      <p className="texto-secundario">
        Cifras agregadas de todos los beneficiarios. No se muestran nombres ni datos personales.
      </p>

      <div className="tarjetas-indicadores" style={{ marginTop: 16 }}>
        <div className="tarjeta-indicador">
          <div className="tarjeta-indicador__valor">{indicadores.beneficiarios_unicos}</div>
          <div className="tarjeta-indicador__etiqueta">Beneficiarios unicos</div>
        </div>
        <div className="tarjeta-indicador">
          <div className="tarjeta-indicador__valor">{indicadores.atenciones_registradas}</div>
          <div className="tarjeta-indicador__etiqueta">Atenciones/ayudas registradas</div>
        </div>
        <div className="tarjeta-indicador">
          <div className="tarjeta-indicador__valor">{indicadores.seguimientos_pendientes}</div>
          <div className="tarjeta-indicador__etiqueta">Seguimientos con accion pendiente</div>
        </div>
      </div>

      <div className="tarjeta" style={{ marginTop: 20 }}>
        <h2>Participaciones por programa</h2>
        <table className="tabla-simple">
          <thead>
            <tr>
              <th>Programa</th>
              <th>Participaciones</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(indicadores.participaciones_por_programa).map(([nombre, total]) => (
              <tr key={nombre}>
                <td>{nombre}</td>
                <td>{total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

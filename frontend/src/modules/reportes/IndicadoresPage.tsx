import { useEffect, useState } from "react";
import { obtenerIndicadores } from "./api";
import type { Indicadores } from "./types";
import { Cargando, MensajeError } from "../../components/EstadoCarga";
import { GraficaBarras } from "./GraficaBarras";
import { ORGANIZACIONES, guardarOrganizacionElegida, leerOrganizacionElegida } from "./organizaciones";
import { IconoAyuda, IconoPersonas, IconoReloj } from "./iconos";
import { useContador } from "../../lib/useContador";

export function IndicadoresPage() {
  const [indicadores, setIndicadores] = useState<Indicadores | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [organizacion, setOrganizacion] = useState(leerOrganizacionElegida);
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [errorExportacion, setErrorExportacion] = useState<string | null>(null);

  const beneficiariosAnimado = useContador(indicadores?.beneficiarios_unicos ?? 0);
  const atencionesAnimado = useContador(indicadores?.atenciones_registradas ?? 0);
  const seguimientosAnimado = useContador(indicadores?.seguimientos_pendientes ?? 0);

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

  function cambiarOrganizacion(id: string) {
    const elegida = ORGANIZACIONES.find((o) => o.id === id) ?? ORGANIZACIONES[0];
    setOrganizacion(elegida);
    guardarOrganizacionElegida(elegida.id);
  }

  async function manejarDescargarPdf() {
    if (!indicadores) return;
    setErrorExportacion(null);
    setExportando(true);
    try {
      // jsPDF/svg2pdf.js pesan bastante: se cargan solo al pedir el PDF,
      // para no engordar el bundle inicial de todos los que no lo usan.
      const { exportarIndicadoresPdf } = await import("./exportarPdf");
      await exportarIndicadoresPdf(indicadores, organizacion);
    } catch (err) {
      setErrorExportacion(err instanceof Error ? err.message : "No se pudo generar el PDF");
    } finally {
      setExportando(false);
    }
  }

  if (cargando) return <Cargando texto="Cargando indicadores..." />;
  if (error) return <MensajeError texto={error} />;
  if (!indicadores) return null;

  const datosPrograma = Object.entries(indicadores.participaciones_por_programa).map(([nombre, total]) => ({
    etiqueta: nombre,
    valor: total,
  }));

  const fechaCorte = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="pagina-encabezado">
        <div>
          <h1>Indicadores</h1>
          <p className="texto-secundario" style={{ margin: 0 }}>
            Consulta el avance y desempeño de los programas y proyectos de Urabá País.
          </p>
        </div>
      </div>

      <div className="tablero-encabezado">
        <div>
          <h1 className="marca-uraba-pais tablero-encabezado__titulo">Tablero de indicadores</h1>
          <p className="tablero-encabezado__subtitulo">Urabá País · corte al {fechaCorte}</p>
        </div>
        <div className="tablero-encabezado__logo">
          <img src={organizacion.logo} alt={organizacion.nombre} />
        </div>
      </div>

      <div className="tablero-barra">
        <label className="tablero-barra__selector">
          Organización
          <select value={organizacion.id} onChange={(e) => cambiarOrganizacion(e.target.value)}>
            {ORGANIZACIONES.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </label>
        <button onClick={manejarDescargarPdf} disabled={exportando}>
          {exportando ? "Generando PDF..." : "Descargar PDF"}
        </button>
      </div>
      {errorExportacion && <MensajeError texto={errorExportacion} />}

      <div className="tarjetas-indicadores" style={{ marginTop: 20 }}>
        <div className="tarjeta-indicador tarjeta-indicador--verde">
          <div className="tarjeta-indicador__icono">
            <IconoPersonas />
          </div>
          <div>
            <div className="tarjeta-indicador__valor">{beneficiariosAnimado}</div>
            <div className="tarjeta-indicador__etiqueta">Beneficiarios únicos</div>
          </div>
        </div>
        <div className="tarjeta-indicador tarjeta-indicador--azul">
          <div className="tarjeta-indicador__icono">
            <IconoAyuda />
          </div>
          <div>
            <div className="tarjeta-indicador__valor">{atencionesAnimado}</div>
            <div className="tarjeta-indicador__etiqueta">Atenciones/ayudas registradas</div>
          </div>
        </div>
        <div className="tarjeta-indicador tarjeta-indicador--ambar">
          <div className="tarjeta-indicador__icono">
            <IconoReloj />
          </div>
          <div>
            <div className="tarjeta-indicador__valor">{seguimientosAnimado}</div>
            <div className="tarjeta-indicador__etiqueta">Seguimientos con acción pendiente</div>
          </div>
        </div>
      </div>

      <div className="tarjeta tarjeta--reporte" style={{ marginTop: 20 }}>
        <div className="acciones" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Participaciones por programa</h2>
          <button className="secundario" onClick={() => setMostrarTabla(!mostrarTabla)}>
            {mostrarTabla ? "Ver gráfica" : "Ver como tabla"}
          </button>
        </div>

        {datosPrograma.length === 0 ? (
          <p className="texto-secundario" style={{ marginTop: 12 }}>
            Sin participaciones registradas todavia.
          </p>
        ) : mostrarTabla ? (
          <table className="tabla-simple" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Programa</th>
                <th>Participaciones</th>
              </tr>
            </thead>
            <tbody>
              {[...datosPrograma]
                .sort((a, b) => b.valor - a.valor)
                .map((d) => (
                  <tr key={d.etiqueta}>
                    <td>{d.etiqueta}</td>
                    <td>{d.valor}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        ) : (
          <div style={{ marginTop: 16 }}>
            <GraficaBarras datos={datosPrograma} titulo="Participaciones por programa" />
          </div>
        )}
      </div>

      <p className="tablero-pie">
        Indicadores generados automáticamente a partir de la información registrada en el sistema · datos
        agregados, sin información personal identificable.
      </p>
    </div>
  );
}

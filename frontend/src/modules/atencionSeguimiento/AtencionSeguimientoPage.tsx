import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { agregarAtencionOffline, agregarSeguimientoOffline, listarPendientesDeBeneficiario } from "./offlineApi";
import type { Atencion, NuevaAtencion, NuevoSeguimiento, Seguimiento } from "./types";
import { obtenerFichaOffline } from "../reportes/offlineApi";
import type { Beneficiario } from "../beneficiarios/types";
import { Cargando, MensajeError, MensajeExito } from "../../components/EstadoCarga";

const ATENCION_INICIAL: NuevaAtencion = {
  tipo: "Ayuda",
  fecha: "",
  descripcion: "",
  responsable: "",
  resultado: "",
};

const SEGUIMIENTO_INICIAL: NuevoSeguimiento = {
  fecha: "",
  avance_novedad: "",
  observacion: "",
  accion_pendiente: "",
  proximo_contacto: "",
};

type EventoLinea =
  | { clase: "atencion"; fecha: string; texto: string }
  | { clase: "seguimiento"; fecha: string; texto: string };

export function AtencionSeguimientoPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [beneficiario, setBeneficiario] = useState<Beneficiario | null>(null);
  const [atenciones, setAtenciones] = useState<Atencion[]>([]);
  const [seguimientos, setSeguimientos] = useState<Seguimiento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [datosAtencion, setDatosAtencion] = useState<NuevaAtencion>(ATENCION_INICIAL);
  const [guardandoAtencion, setGuardandoAtencion] = useState(false);
  const [mensajeAtencion, setMensajeAtencion] = useState<string | null>(null);

  const [datosSeguimiento, setDatosSeguimiento] = useState<NuevoSeguimiento>(SEGUIMIENTO_INICIAL);
  const [guardandoSeguimiento, setGuardandoSeguimiento] = useState(false);
  const [mensajeSeguimiento, setMensajeSeguimiento] = useState<string | null>(null);

  async function cargar() {
    if (!id) return;
    setCargando(true);
    setError(null);
    try {
      const [ficha, pendientes] = await Promise.all([
        obtenerFichaOffline(id),
        listarPendientesDeBeneficiario(id),
      ]);
      setBeneficiario(ficha);
      setAtenciones([...ficha.atenciones, ...pendientes.atenciones]);
      setSeguimientos([...ficha.seguimientos, ...pendientes.seguimientos]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la informacion");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function manejarAtencion(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setGuardandoAtencion(true);
    setMensajeAtencion(null);
    try {
      const creada = await agregarAtencionOffline(id, datosAtencion);
      setMensajeAtencion(
        creada._pendienteSincronizacion
          ? "Atencion/ayuda guardada en este dispositivo. Se sincronizara cuando haya conexion."
          : "Atencion/ayuda registrada.",
      );
      setDatosAtencion(ATENCION_INICIAL);
      await cargar();
    } catch (err) {
      setMensajeAtencion(err instanceof Error ? err.message : "No se pudo registrar la atencion");
    } finally {
      setGuardandoAtencion(false);
    }
  }

  async function manejarSeguimiento(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setGuardandoSeguimiento(true);
    setMensajeSeguimiento(null);
    try {
      const creado = await agregarSeguimientoOffline(id, datosSeguimiento);
      setMensajeSeguimiento(
        creado._pendienteSincronizacion
          ? "Seguimiento guardado en este dispositivo. Se sincronizara cuando haya conexion."
          : "Seguimiento registrado.",
      );
      setDatosSeguimiento(SEGUIMIENTO_INICIAL);
      await cargar();
    } catch (err) {
      setMensajeSeguimiento(err instanceof Error ? err.message : "No se pudo registrar el seguimiento");
    } finally {
      setGuardandoSeguimiento(false);
    }
  }

  if (cargando) return <Cargando texto="Cargando historial..." />;
  if (error && !beneficiario) return <MensajeError texto={error} />;
  if (!beneficiario) return null;

  function marcaPendiente(item: Atencion | Seguimiento) {
    return (item as { _pendienteSincronizacion?: boolean })._pendienteSincronizacion
      ? " (pendiente de sincronizar)"
      : "";
  }

  const linea: EventoLinea[] = [
    ...atenciones.map((a) => ({
      clase: "atencion" as const,
      fecha: a.fecha,
      texto: `${a.tipo}: ${a.descripcion}${a.resultado ? ` — resultado: ${a.resultado}` : ""}${marcaPendiente(a)}`,
    })),
    ...seguimientos.map((s) => ({
      clase: "seguimiento" as const,
      fecha: s.fecha,
      texto: `${s.avance_novedad}${s.accion_pendiente ? ` — pendiente: ${s.accion_pendiente}` : ""}${marcaPendiente(s)}`,
    })),
  ].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));

  return (
    <div>
      <button className="enlace" onClick={() => navigate(`/beneficiarios/${id}`)}>
        &larr; Volver a la ficha de {beneficiario.nombres}
      </button>

      <h1>Atencion y seguimiento</h1>
      <p className="texto-secundario">{beneficiario.nombres}</p>

      <div className="tarjeta">
        <h2>Registrar atencion o ayuda entregada</h2>
        <p className="texto-secundario">Usa este formulario para algo que YA se entrego o realizo.</p>
        <form className="formulario" onSubmit={manejarAtencion}>
          <div className="fila-campos">
            <label>
              Tipo
              <select
                value={datosAtencion.tipo}
                onChange={(e) => setDatosAtencion({ ...datosAtencion, tipo: e.target.value as NuevaAtencion["tipo"] })}
              >
                <option value="Ayuda">Ayuda</option>
                <option value="Atención">Atencion</option>
              </select>
            </label>
            <label>
              Fecha
              <input
                type="date"
                value={datosAtencion.fecha}
                onChange={(e) => setDatosAtencion({ ...datosAtencion, fecha: e.target.value })}
                required
              />
            </label>
            <label>
              Responsable / entidad
              <input
                value={datosAtencion.responsable ?? ""}
                onChange={(e) => setDatosAtencion({ ...datosAtencion, responsable: e.target.value })}
              />
            </label>
          </div>
          <label>
            Descripcion
            <input
              value={datosAtencion.descripcion}
              onChange={(e) => setDatosAtencion({ ...datosAtencion, descripcion: e.target.value })}
              required
            />
          </label>
          <label>
            Resultado
            <input
              value={datosAtencion.resultado ?? ""}
              onChange={(e) => setDatosAtencion({ ...datosAtencion, resultado: e.target.value })}
            />
          </label>

          {mensajeAtencion && (
            mensajeAtencion.startsWith("Atencion/ayuda") ? (
              <MensajeExito texto={mensajeAtencion} />
            ) : (
              <MensajeError texto={mensajeAtencion} />
            )
          )}

          <div className="acciones">
            <button type="submit" disabled={guardandoAtencion}>
              {guardandoAtencion ? "Guardando..." : "Registrar atencion/ayuda"}
            </button>
          </div>
        </form>
      </div>

      <div className="tarjeta">
        <h2>Registrar seguimiento del caso</h2>
        <p className="texto-secundario">Usa este formulario para contar como va el caso y que falta por hacer.</p>
        <form className="formulario" onSubmit={manejarSeguimiento}>
          <div className="fila-campos">
            <label>
              Fecha
              <input
                type="date"
                value={datosSeguimiento.fecha}
                onChange={(e) => setDatosSeguimiento({ ...datosSeguimiento, fecha: e.target.value })}
                required
              />
            </label>
            <label>
              Proximo contacto
              <input
                type="date"
                value={datosSeguimiento.proximo_contacto ?? ""}
                onChange={(e) => setDatosSeguimiento({ ...datosSeguimiento, proximo_contacto: e.target.value })}
              />
            </label>
          </div>
          <label>
            Avance o novedad
            <input
              value={datosSeguimiento.avance_novedad}
              onChange={(e) => setDatosSeguimiento({ ...datosSeguimiento, avance_novedad: e.target.value })}
              required
            />
          </label>
          <label>
            Observacion
            <input
              value={datosSeguimiento.observacion ?? ""}
              onChange={(e) => setDatosSeguimiento({ ...datosSeguimiento, observacion: e.target.value })}
            />
          </label>
          <label>
            Accion pendiente
            <input
              value={datosSeguimiento.accion_pendiente ?? ""}
              onChange={(e) => setDatosSeguimiento({ ...datosSeguimiento, accion_pendiente: e.target.value })}
            />
          </label>

          {mensajeSeguimiento && (
            mensajeSeguimiento.startsWith("Seguimiento") ? (
              <MensajeExito texto={mensajeSeguimiento} />
            ) : (
              <MensajeError texto={mensajeSeguimiento} />
            )
          )}

          <div className="acciones">
            <button type="submit" disabled={guardandoSeguimiento}>
              {guardandoSeguimiento ? "Guardando..." : "Registrar seguimiento"}
            </button>
          </div>
        </form>
      </div>

      <div className="tarjeta">
        <h2>Historial cronologico</h2>
        {linea.length === 0 && <p className="texto-secundario">Aun no hay atenciones ni seguimientos.</p>}
        <div className="linea-tiempo">
          {linea.map((evento, i) => (
            <div key={i} className={`linea-tiempo__item ${evento.clase}`}>
              <strong>{evento.fecha}</strong> — {evento.texto}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

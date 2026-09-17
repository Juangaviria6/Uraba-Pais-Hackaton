import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { agregarParticipacion, actualizarEstadoParticipacion, listarProgramas } from "./api";
import { ESTADOS_PARTICIPACION } from "./types";
import type { EstadoParticipacion, NuevaParticipacion, Programa } from "./types";
import { obtenerFicha } from "../reportes/api";
import type { Ficha } from "../reportes/types";
import { Cargando, MensajeError, MensajeExito } from "../../components/EstadoCarga";

const INICIAL: NuevaParticipacion = {
  programa_id: "",
  organizacion: "",
  fecha_vinculacion: "",
  estado: "inscrito",
};

export function ParticipacionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [datos, setDatos] = useState<NuevaParticipacion>(INICIAL);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  async function cargar() {
    if (!id) return;
    setCargando(true);
    setError(null);
    try {
      const [fichaData, programasData] = await Promise.all([obtenerFicha(id), listarProgramas()]);
      setFicha(fichaData);
      setProgramas(programasData);
      if (programasData.length > 0 && !datos.programa_id) {
        setDatos((d) => ({ ...d, programa_id: programasData[0].id }));
      }
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

  function nombrePrograma(programaId: string) {
    return programas.find((p) => p.id === programaId)?.nombre ?? programaId;
  }

  async function manejarAgregar(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setGuardando(true);
    setMensaje(null);
    try {
      await agregarParticipacion(id, datos);
      setMensaje("Participacion registrada.");
      setDatos({ ...INICIAL, programa_id: programas[0]?.id ?? "" });
      await cargar();
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : "No se pudo registrar la participacion");
    } finally {
      setGuardando(false);
    }
  }

  async function cambiarEstado(participacionId: string, estado: EstadoParticipacion) {
    if (!id) return;
    try {
      await actualizarEstadoParticipacion(id, participacionId, estado);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar el estado");
    }
  }

  if (cargando) return <Cargando texto="Cargando participacion..." />;
  if (error && !ficha) return <MensajeError texto={error} />;
  if (!ficha) return null;

  return (
    <div>
      <button className="enlace" onClick={() => navigate(`/beneficiarios/${id}`)}>
        &larr; Volver a la ficha de {ficha.nombres}
      </button>

      <h1>Participacion en programas</h1>
      <p className="texto-secundario">{ficha.nombres}</p>

      <div className="tarjeta">
        <h2>Vinculaciones actuales</h2>
        {ficha.participaciones.length === 0 && (
          <p className="texto-secundario">Aun no tiene vinculaciones registradas.</p>
        )}
        <ul>
          {ficha.participaciones.map((p) => (
            <li key={p.id} style={{ marginBottom: 8 }}>
              <strong>{nombrePrograma(p.programa_id)}</strong> · {p.organizacion || "sin organizacion"}
              {" "}
              <select
                value={p.estado}
                onChange={(e) => cambiarEstado(p.id, e.target.value as EstadoParticipacion)}
                style={{ width: "auto", display: "inline-block", marginLeft: 8 }}
              >
                {ESTADOS_PARTICIPACION.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      </div>

      <div className="tarjeta">
        <h2>Vincular a un nuevo programa</h2>
        <form className="formulario" onSubmit={manejarAgregar}>
          <div className="fila-campos">
            <label>
              Programa
              <select
                value={datos.programa_id}
                onChange={(e) => setDatos({ ...datos, programa_id: e.target.value })}
                required
              >
                {programas.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Organizacion
              <input
                value={datos.organizacion}
                onChange={(e) => setDatos({ ...datos, organizacion: e.target.value })}
              />
            </label>
            <label>
              Fecha de vinculacion
              <input
                type="date"
                value={datos.fecha_vinculacion}
                onChange={(e) => setDatos({ ...datos, fecha_vinculacion: e.target.value })}
              />
            </label>
            <label>
              Estado inicial
              <select
                value={datos.estado}
                onChange={(e) => setDatos({ ...datos, estado: e.target.value as EstadoParticipacion })}
              >
                {ESTADOS_PARTICIPACION.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {mensaje && (
            mensaje.startsWith("Participacion registrada") ? (
              <MensajeExito texto={mensaje} />
            ) : (
              <MensajeError texto={mensaje} />
            )
          )}

          <div className="acciones">
            <button type="submit" disabled={guardando || programas.length === 0}>
              {guardando ? "Guardando..." : "Vincular"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

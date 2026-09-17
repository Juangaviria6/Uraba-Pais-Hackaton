import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { obtenerFicha } from "./api";
import type { Ficha } from "./types";
import { actualizarBeneficiario, agregarFamiliar } from "../beneficiarios/api";
import type { NuevoFamiliar } from "../beneficiarios/types";
import { listarProgramas } from "../participacion/api";
import type { Programa } from "../participacion/types";
import { Cargando, MensajeError, MensajeExito } from "../../components/EstadoCarga";

const FAMILIAR_INICIAL: NuevoFamiliar = { nombres: "", parentesco: "", fecha_nacimiento: "" };

export function FichaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editando, setEditando] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<Partial<Ficha>>({});
  const [guardando, setGuardando] = useState(false);

  const [nuevoFamiliar, setNuevoFamiliar] = useState<NuevoFamiliar>(FAMILIAR_INICIAL);
  const [guardandoFamiliar, setGuardandoFamiliar] = useState(false);
  const [mensajeFamiliar, setMensajeFamiliar] = useState<string | null>(null);

  async function cargar() {
    if (!id) return;
    setCargando(true);
    setError(null);
    try {
      const [data, programasData] = await Promise.all([obtenerFicha(id), listarProgramas()]);
      setFicha(data);
      setDatosEdicion(data);
      setProgramas(programasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar la ficha");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function guardarEdicion(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setGuardando(true);
    setError(null);
    try {
      await actualizarBeneficiario(id, {
        nombres: datosEdicion.nombres,
        sexo: datosEdicion.sexo,
        edad: datosEdicion.edad,
        municipio: datosEdicion.municipio,
        zona: datosEdicion.zona,
        nacionalidad: datosEdicion.nacionalidad,
        tipo_poblacion: datosEdicion.tipo_poblacion,
        autorizacion_datos: datosEdicion.autorizacion_datos,
      });
      setEditando(false);
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar la edicion");
    } finally {
      setGuardando(false);
    }
  }

  async function guardarFamiliar(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setGuardandoFamiliar(true);
    setMensajeFamiliar(null);
    try {
      await agregarFamiliar(id, nuevoFamiliar);
      setNuevoFamiliar(FAMILIAR_INICIAL);
      setMensajeFamiliar("Familiar agregado.");
      await cargar();
    } catch (err) {
      setMensajeFamiliar(err instanceof Error ? err.message : "No se pudo agregar el familiar");
    } finally {
      setGuardandoFamiliar(false);
    }
  }

  if (cargando) return <Cargando texto="Cargando ficha del beneficiario..." />;
  if (error && !ficha) return <MensajeError texto={error} />;
  if (!ficha) return null;

  return (
    <div>
      <button className="enlace" onClick={() => navigate("/beneficiarios")}>
        &larr; Volver a busqueda
      </button>

      <h1>{ficha.nombres}</h1>
      <p className="texto-secundario">
        {ficha.tipo_documento} {ficha.numero_documento}
        {ficha.codigo_interno && <> · codigo interno {ficha.codigo_interno}</>}
      </p>

      <div className="tarjeta">
        <div className="acciones" style={{ justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>Datos basicos</h2>
          <button className="secundario" onClick={() => setEditando(!editando)}>
            {editando ? "Cancelar" : "Editar"}
          </button>
        </div>

        {!editando ? (
          <div className="fila-campos" style={{ marginTop: 12 }}>
            <p><strong>Sexo:</strong> {ficha.sexo || "-"}</p>
            <p><strong>Edad:</strong> {ficha.edad ?? "-"}</p>
            <p><strong>Municipio:</strong> {ficha.municipio || "-"}</p>
            <p><strong>Zona:</strong> {ficha.zona || "-"}</p>
            <p><strong>Nacionalidad:</strong> {ficha.nacionalidad || "-"}</p>
            <p><strong>Poblacion:</strong> {ficha.tipo_poblacion || "-"}</p>
            <p><strong>Autorizacion de datos:</strong> {ficha.autorizacion_datos ? "Si" : "No"}</p>
          </div>
        ) : (
          <form className="formulario" onSubmit={guardarEdicion} style={{ marginTop: 12 }}>
            <label>
              Nombres
              <input
                value={datosEdicion.nombres ?? ""}
                onChange={(e) => setDatosEdicion({ ...datosEdicion, nombres: e.target.value })}
              />
            </label>
            <div className="fila-campos">
              <label>
                Sexo
                <input
                  value={datosEdicion.sexo ?? ""}
                  onChange={(e) => setDatosEdicion({ ...datosEdicion, sexo: e.target.value })}
                />
              </label>
              <label>
                Edad
                <input
                  type="number"
                  value={datosEdicion.edad ?? ""}
                  onChange={(e) =>
                    setDatosEdicion({ ...datosEdicion, edad: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </label>
              <label>
                Municipio
                <input
                  value={datosEdicion.municipio ?? ""}
                  onChange={(e) => setDatosEdicion({ ...datosEdicion, municipio: e.target.value })}
                />
              </label>
              <label>
                Zona
                <input
                  value={datosEdicion.zona ?? ""}
                  onChange={(e) => setDatosEdicion({ ...datosEdicion, zona: e.target.value })}
                />
              </label>
            </div>
            {error && <MensajeError texto={error} />}
            <div className="acciones">
              <button type="submit" disabled={guardando}>
                {guardando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="tarjeta">
        <h2>Nucleo familiar</h2>
        {ficha.familiares.length === 0 && <p className="texto-secundario">Sin familiares registrados.</p>}
        <ul>
          {ficha.familiares.map((f) => (
            <li key={f.id}>
              {f.nombres} — {f.parentesco}
              {f.fecha_nacimiento && ` (nace ${f.fecha_nacimiento})`}
            </li>
          ))}
        </ul>

        <form className="formulario" onSubmit={guardarFamiliar}>
          <div className="fila-campos">
            <label>
              Nombres
              <input
                value={nuevoFamiliar.nombres}
                onChange={(e) => setNuevoFamiliar({ ...nuevoFamiliar, nombres: e.target.value })}
                required
              />
            </label>
            <label>
              Parentesco
              <input
                value={nuevoFamiliar.parentesco}
                onChange={(e) => setNuevoFamiliar({ ...nuevoFamiliar, parentesco: e.target.value })}
                required
              />
            </label>
            <label>
              Fecha de nacimiento
              <input
                type="date"
                value={nuevoFamiliar.fecha_nacimiento ?? ""}
                onChange={(e) => setNuevoFamiliar({ ...nuevoFamiliar, fecha_nacimiento: e.target.value })}
              />
            </label>
          </div>
          {mensajeFamiliar && (
            mensajeFamiliar.startsWith("Familiar agregado") ? (
              <MensajeExito texto={mensajeFamiliar} />
            ) : (
              <MensajeError texto={mensajeFamiliar} />
            )
          )}
          <div className="acciones">
            <button type="submit" disabled={guardandoFamiliar}>
              {guardandoFamiliar ? "Guardando..." : "Agregar familiar"}
            </button>
          </div>
        </form>
      </div>

      <div className="tarjeta">
        <h2>Programas</h2>
        {ficha.participaciones.length === 0 && (
          <p className="texto-secundario">Sin vinculaciones a programas todavia.</p>
        )}
        <ul>
          {ficha.participaciones.map((p) => (
            <li key={p.id}>
              {programas.find((prog) => prog.id === p.programa_id)?.nombre ?? p.programa_id}
              {" · "}
              {p.organizacion || "sin organizacion"} · estado: {p.estado}
            </li>
          ))}
        </ul>
        <Link to={`/beneficiarios/${id}/participacion`}>
          <button>Vincular a un programa / actualizar estado</button>
        </Link>
      </div>

      <div className="tarjeta">
        <h2>Atenciones y seguimientos</h2>
        <p className="texto-secundario">
          {ficha.atenciones.length} atencion(es)/ayuda(s) registradas · {ficha.seguimientos.length} seguimiento(s)
        </p>
        <Link to={`/beneficiarios/${id}/seguimiento`}>
          <button>Registrar atencion o seguimiento</button>
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { obtenerFichaOffline } from "./offlineApi";
import type { Ficha } from "./types";
import { actualizarBeneficiario, agregarFamiliar } from "../beneficiarios/api";
import type { NuevoFamiliar } from "../beneficiarios/types";
import { listarProgramas } from "../participacion/api";
import type { Programa } from "../participacion/types";
import { Cargando, MensajeError, MensajeExito } from "../../components/EstadoCarga";

const FAMILIAR_INICIAL: NuevoFamiliar = { nombres: "", parentesco: "", fecha_nacimiento: "" };

type Pestana = "datos" | "familia" | "programas" | "historial";

const PESTANAS: { id: Pestana; etiqueta: string }[] = [
  { id: "datos", etiqueta: "Datos generales" },
  { id: "familia", etiqueta: "Núcleo familiar" },
  { id: "programas", etiqueta: "Programas" },
  { id: "historial", etiqueta: "Historial" },
];

export function FichaPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ficha, setFicha] = useState<Ficha | null>(null);
  const [sinConexion, setSinConexion] = useState(false);
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pestana, setPestana] = useState<Pestana>("datos");

  const [editando, setEditando] = useState(false);
  const [datosEdicion, setDatosEdicion] = useState<Partial<Ficha>>({});
  const [guardando, setGuardando] = useState(false);

  const [nuevoFamiliar, setNuevoFamiliar] = useState<NuevoFamiliar>(FAMILIAR_INICIAL);
  const [guardandoFamiliar, setGuardandoFamiliar] = useState(false);
  const [mensajeFamiliar, setMensajeFamiliar] = useState<string | null>(null);

  const aunSinSincronizar = id?.startsWith("local-") ?? false;

  async function cargar() {
    if (!id) return;
    setCargando(true);
    setError(null);
    try {
      // La lista de programas solo es cosmetica aqui (nombre en vez de id);
      // si falla por falta de conexion no debe impedir ver la ficha.
      const [data, programasData] = await Promise.all([
        obtenerFichaOffline(id),
        listarProgramas().catch(() => [] as Programa[]),
      ]);
      setFicha(data);
      setSinConexion(Boolean(data._sinConexion));
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
        contacto: datosEdicion.contacto,
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

  const inicial = (ficha.nombres || "?").trim().charAt(0).toUpperCase();

  return (
    <div>
      <button className="enlace" onClick={() => navigate("/beneficiarios")}>
        &larr; Volver a busqueda
      </button>

      <div className="ficha-encabezado">
        <span className="ficha-encabezado__avatar">{inicial}</span>
        <div>
          <h1 style={{ marginBottom: 4 }}>{ficha.nombres}</h1>
          <div className="ficha-badges">
            <span className="ficha-badge">
              {ficha.tipo_documento} {ficha.numero_documento}
            </span>
            {ficha.codigo_interno && <span className="ficha-badge">código {ficha.codigo_interno}</span>}
            {ficha.edad != null && <span className="ficha-badge">{ficha.edad} años</span>}
            {(ficha.municipio || ficha.zona) && (
              <span className="ficha-badge">
                {[ficha.municipio, ficha.zona].filter(Boolean).join(", ")}
              </span>
            )}
            {ficha.nacionalidad && <span className="ficha-badge">{ficha.nacionalidad}</span>}
            {ficha.tipo_poblacion && <span className="ficha-badge">{ficha.tipo_poblacion}</span>}
            <span className={`ficha-badge ${ficha.autorizacion_datos ? "ficha-badge--ok" : "ficha-badge--alerta"}`}>
              Autorización de datos: {ficha.autorizacion_datos ? "Sí" : "No"}
            </span>
          </div>
        </div>
      </div>

      {aunSinSincronizar && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>
          Este beneficiario se registro sin conexion y todavia no se ha sincronizado con el servidor. Se subira
          automaticamente cuando haya internet. Mientras tanto no se puede editar, agregar familiares ni vincular
          a programas, pero si se pueden registrar atenciones y seguimientos.
        </div>
      )}
      {!aunSinSincronizar && sinConexion && (
        <div className="mensaje-error" style={{ marginBottom: 16 }}>
          Sin conexion: mostrando la ultima version guardada localmente de esta ficha. Los cambios que hagas ahora
          se guardaran cuando vuelva la conexion.
        </div>
      )}

      <div className="ficha-pestanas">
        {PESTANAS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`ficha-pestanas__boton ${pestana === p.id ? "activo" : ""}`}
            onClick={() => setPestana(p.id)}
          >
            {p.etiqueta}
          </button>
        ))}
      </div>

      <div className="ficha-cuerpo">
        <div className="ficha-cuerpo__principal">
          {pestana === "datos" && (
            <div className="tarjeta">
              <div className="acciones" style={{ justifyContent: "space-between" }}>
                <h2 style={{ margin: 0 }}>Datos básicos</h2>
                <button className="secundario" onClick={() => setEditando(!editando)} disabled={aunSinSincronizar}>
                  {editando ? "Cancelar" : "Editar"}
                </button>
              </div>

              {!editando ? (
                <div className="fila-campos" style={{ marginTop: 12 }}>
                  <p><strong>Sexo:</strong> {ficha.sexo || "-"}</p>
                  <p><strong>Edad:</strong> {ficha.edad ?? "-"}</p>
                  <p><strong>Municipio:</strong> {ficha.municipio || "-"}</p>
                  <p><strong>Zona:</strong> {ficha.zona || "-"}</p>
                  <p><strong>Contacto:</strong> {ficha.contacto || "-"}</p>
                  <p><strong>Nacionalidad:</strong> {ficha.nacionalidad || "-"}</p>
                  <p><strong>Población:</strong> {ficha.tipo_poblacion || "-"}</p>
                  <p><strong>Autorización de datos:</strong> {ficha.autorizacion_datos ? "Sí" : "No"}</p>
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
                    <label>
                      Contacto (telefono)
                      <input
                        value={datosEdicion.contacto ?? ""}
                        onChange={(e) => setDatosEdicion({ ...datosEdicion, contacto: e.target.value })}
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
          )}

          {pestana === "familia" && (
            <div className="tarjeta">
              <h2>Núcleo familiar</h2>
              {ficha.familiares.length === 0 && <p className="texto-secundario">Sin familiares registrados.</p>}
              <ul>
                {ficha.familiares.map((f) => (
                  <li key={f.id}>
                    {f.nombres} — {f.parentesco}
                    {f.fecha_nacimiento && ` (nace ${f.fecha_nacimiento})`}
                  </li>
                ))}
              </ul>

              {aunSinSincronizar ? (
                <p className="texto-secundario">Podras agregar familiares cuando este beneficiario se sincronice.</p>
              ) : (
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
              )}
            </div>
          )}

          {pestana === "programas" && (
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
              {aunSinSincronizar ? (
                <p className="texto-secundario">Podras vincularlo a programas cuando se sincronice.</p>
              ) : (
                <Link to={`/beneficiarios/${id}/participacion`}>
                  <button>Vincular a un programa / actualizar estado</button>
                </Link>
              )}
            </div>
          )}

          {pestana === "historial" && (
            <div className="tarjeta">
              <h2>Atenciones y seguimientos</h2>
              <p className="texto-secundario">
                {ficha.atenciones.length} atencion(es)/ayuda(s) registradas · {ficha.seguimientos.length} seguimiento(s)
              </p>
              <Link to={`/beneficiarios/${id}/seguimiento`}>
                <button>Registrar atencion o seguimiento</button>
              </Link>
            </div>
          )}
        </div>

        <aside className="ficha-cuerpo__lateral">
          <div className="tarjeta tarjeta-info-lateral">
            <h2>Información del beneficiario</h2>
            <p className="texto-secundario" style={{ margin: 0 }}>
              Gestiona y actualiza la información personal, familiar y de participación en programas de{" "}
              {ficha.nombres}.
            </p>
          </div>

          <div className="tarjeta">
            <h2>Acciones rápidas</h2>
            <div className="acciones-rapidas">
              <button className="enlace acciones-rapidas__item" onClick={() => setPestana("historial")}>
                Ver historial de atenciones y seguimientos
              </button>
              {!aunSinSincronizar && (
                <Link to={`/beneficiarios/${id}/participacion`} className="acciones-rapidas__item">
                  Vincular a un programa
                </Link>
              )}
              <Link to={`/beneficiarios/${id}/seguimiento`} className="acciones-rapidas__item">
                Registrar atención o seguimiento
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

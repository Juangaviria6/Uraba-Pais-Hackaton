import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../lib/apiClient";
import { listarBeneficiariosSinDocumento, listarTiposDocumento } from "./api";
import {
  buscarBeneficiarioOffline,
  crearBeneficiarioOffline,
  listarBeneficiariosSinDocumentoOffline,
} from "./offlineApi";
import type { Beneficiario, BeneficiarioSinDocumento, NuevoBeneficiario } from "./types";
import { MensajeError } from "../../components/EstadoCarga";

const CAMPOS_INICIALES: NuevoBeneficiario = {
  tipo_documento: "CC",
  numero_documento: "",
  nombres: "",
  sexo: "",
  edad: null,
  municipio: "",
  zona: "",
  contacto: "",
  nacionalidad: "",
  tipo_poblacion: "",
  autorizacion_datos: false,
  fecha_autorizacion: "",
};

// Lista de respaldo si aun no hay beneficiarios registrados (coleccion vacia)
// o si la carga de valores existentes falla.
const TIPOS_DOCUMENTO_RESPALDO = ["CC", "CE", "TI", "PASAPORTE", "PPT", "SIN_DOCUMENTO"];

export function BeneficiariosSearchPage() {
  const navigate = useNavigate();
  const [tiposDocumento, setTiposDocumento] = useState<string[]>(TIPOS_DOCUMENTO_RESPALDO);
  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [noEncontradoSinConexion, setNoEncontradoSinConexion] = useState(false);
  const [encontrado, setEncontrado] = useState<Beneficiario | null>(null);
  const [encontradoSinConexion, setEncontradoSinConexion] = useState(false);

  const [datosNuevo, setDatosNuevo] = useState<NuevoBeneficiario>(CAMPOS_INICIALES);
  const [creando, setCreando] = useState(false);
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null);
  const [modoSinDocumento, setModoSinDocumento] = useState(false);

  const [listaSinDocumento, setListaSinDocumento] = useState<BeneficiarioSinDocumento[] | null>(null);
  const [listaSinDocumentoSinConexion, setListaSinDocumentoSinConexion] = useState(false);
  const [cargandoSinDocumento, setCargandoSinDocumento] = useState(false);
  const [errorSinDocumento, setErrorSinDocumento] = useState<string | null>(null);

  useEffect(() => {
    listarTiposDocumento()
      .then((valores) => {
        if (valores.length > 0) {
          setTiposDocumento(valores);
          setTipoDocumento((actual) => (valores.includes(actual) ? actual : valores[0]));
        }
      })
      .catch(() => {
        // Se conserva la lista de respaldo si la peticion falla.
      });
  }, []);

  async function manejarBusqueda(e: FormEvent) {
    e.preventDefault();
    setErrorBusqueda(null);
    setNoEncontrado(false);
    setNoEncontradoSinConexion(false);
    setEncontrado(null);
    setEncontradoSinConexion(false);
    setModoSinDocumento(false);
    setBuscando(true);
    try {
      const resultado = await buscarBeneficiarioOffline(tipoDocumento, numeroDocumento);
      if (resultado.encontrado) {
        setEncontrado(resultado.beneficiario);
        setEncontradoSinConexion(Boolean(resultado._sinConexion));
      } else {
        setNoEncontrado(true);
        setNoEncontradoSinConexion(Boolean(resultado._sinConexion));
        setDatosNuevo({ ...CAMPOS_INICIALES, tipo_documento: tipoDocumento, numero_documento: numeroDocumento });
      }
    } catch (err) {
      setErrorBusqueda(err instanceof Error ? err.message : "No se pudo buscar el beneficiario");
    } finally {
      setBuscando(false);
    }
  }

  async function manejarCreacion(e: FormEvent) {
    e.preventDefault();
    setErrorCreacion(null);
    setCreando(true);
    try {
      const creado = await crearBeneficiarioOffline(datosNuevo);
      navigate(`/beneficiarios/${creado.id}`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        const existente = (err.body as { beneficiario?: Beneficiario }).beneficiario;
        if (existente) {
          setEncontrado(existente);
          setNoEncontrado(false);
          setErrorCreacion(null);
          return;
        }
      }
      setErrorCreacion(err instanceof Error ? err.message : "No se pudo registrar el beneficiario");
    } finally {
      setCreando(false);
    }
  }

  function iniciarRegistroSinDocumento() {
    setEncontrado(null);
    setNoEncontrado(false);
    setErrorBusqueda(null);
    setErrorCreacion(null);
    setDatosNuevo({ ...CAMPOS_INICIALES, tipo_documento: "SIN_DOCUMENTO", numero_documento: "" });
    setModoSinDocumento(true);
  }

  async function manejarBuscarSinDocumento() {
    setErrorSinDocumento(null);
    setCargandoSinDocumento(true);
    try {
      const resultado = await listarBeneficiariosSinDocumentoOffline(listarBeneficiariosSinDocumento);
      setListaSinDocumento(resultado.lista);
      setListaSinDocumentoSinConexion(Boolean(resultado._sinConexion));
    } catch (err) {
      setErrorSinDocumento(err instanceof Error ? err.message : "No se pudo cargar el listado");
    } finally {
      setCargandoSinDocumento(false);
    }
  }

  return (
    <div>
      <h1>Beneficiarios</h1>

      <div className="tarjeta">
        <h2>Buscar por documento</h2>
        <p className="texto-secundario">
          Siempre busca antes de registrar, para no crear una persona duplicada.
        </p>
        <form className="formulario" onSubmit={manejarBusqueda}>
          <div className="fila-campos">
            <label>
              Tipo de documento
              <select value={tipoDocumento} onChange={(e) => setTipoDocumento(e.target.value)}>
                {tiposDocumento.map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Numero de documento
              <input
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                required
              />
            </label>
          </div>
          {errorBusqueda && <MensajeError texto={errorBusqueda} />}
          <div className="acciones">
            <button type="submit" disabled={buscando}>
              {buscando ? "Buscando..." : "Buscar"}
            </button>
          </div>
        </form>
      </div>

      <div className="tarjeta">
        <h2>Beneficiarios sin documento</h2>
        <p className="texto-secundario">
          Para personas que no tienen ningun documento de identidad con que buscarlas.
        </p>
        <div className="acciones">
          <button type="button" className="secundario" onClick={iniciarRegistroSinDocumento}>
            Registrar usuario sin documento
          </button>
          <button
            type="button"
            className="secundario"
            onClick={manejarBuscarSinDocumento}
            disabled={cargandoSinDocumento}
          >
            {cargandoSinDocumento ? "Buscando..." : "Buscar beneficiarios sin documento"}
          </button>
        </div>

        {errorSinDocumento && <MensajeError texto={errorSinDocumento} />}
        {listaSinDocumentoSinConexion && (
          <p className="texto-secundario">
            Sin conexion: mostrando los ultimos beneficiarios sin documento guardados en este dispositivo.
          </p>
        )}

        {listaSinDocumento && (
          listaSinDocumento.length === 0 ? (
            <p className="texto-secundario">No hay beneficiarios registrados sin documento.</p>
          ) : (
            <ul>
              {listaSinDocumento.map((b) => (
                <li key={b.id}>
                  <button className="enlace" onClick={() => navigate(`/beneficiarios/${b.id}`)}>
                    {b.nombres}
                  </button>
                  {" — "}
                  {b.municipio || "municipio no registrado"}
                </li>
              ))}
            </ul>
          )
        )}
      </div>

      {encontrado && (
        <div className="tarjeta">
          <h2>Ya existe un registro</h2>
          <p>
            <strong>{encontrado.nombres}</strong>
            {encontrado.codigo_interno && <> · codigo {encontrado.codigo_interno}</>}
          </p>
          <p className="texto-secundario">
            {encontrado.tipo_documento} {encontrado.numero_documento}
          </p>
          {encontradoSinConexion && (
            <p className="texto-secundario">
              Sin conexion: mostrando la ultima version guardada localmente de este beneficiario.
            </p>
          )}
          <div className="acciones">
            <button onClick={() => navigate(`/beneficiarios/${encontrado.id}`)}>Ver ficha completa</button>
          </div>
        </div>
      )}

      {(noEncontrado || modoSinDocumento) && (
        <div className="tarjeta">
          <h2>
            {modoSinDocumento
              ? "Registrar usuario sin documento"
              : "No existe todavia. Registrar nuevo beneficiario"}
          </h2>
          {!modoSinDocumento && noEncontradoSinConexion && (
            <p className="texto-secundario">
              Sin conexion: no se pudo confirmar contra el servidor si este documento ya estaba registrado
              (solo se busco en lo guardado en este dispositivo). Si en realidad ya existia, al sincronizar
              quedara marcado como pendiente de revision en vez de duplicarse.
            </p>
          )}
          <form className="formulario" onSubmit={manejarCreacion}>
            <label>
              Nombres completos
              <input
                value={datosNuevo.nombres}
                onChange={(e) => setDatosNuevo({ ...datosNuevo, nombres: e.target.value })}
                required
              />
            </label>

            <div className="fila-campos">
              <label>
                Sexo
                <input
                  value={datosNuevo.sexo ?? ""}
                  onChange={(e) => setDatosNuevo({ ...datosNuevo, sexo: e.target.value })}
                />
              </label>
              <label>
                Edad
                <input
                  type="number"
                  value={datosNuevo.edad ?? ""}
                  onChange={(e) =>
                    setDatosNuevo({ ...datosNuevo, edad: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </label>
              <label>
                Municipio
                <input
                  value={datosNuevo.municipio ?? ""}
                  onChange={(e) => setDatosNuevo({ ...datosNuevo, municipio: e.target.value })}
                />
              </label>
              <label>
                Zona
                <input
                  value={datosNuevo.zona ?? ""}
                  onChange={(e) => setDatosNuevo({ ...datosNuevo, zona: e.target.value })}
                />
              </label>
              <label>
                Contacto (telefono)
                <input
                  value={datosNuevo.contacto ?? ""}
                  onChange={(e) => setDatosNuevo({ ...datosNuevo, contacto: e.target.value })}
                />
              </label>
              <label>
                Nacionalidad
                <input
                  value={datosNuevo.nacionalidad ?? ""}
                  onChange={(e) => setDatosNuevo({ ...datosNuevo, nacionalidad: e.target.value })}
                />
              </label>
              <label>
                Poblacion
                <input
                  value={datosNuevo.tipo_poblacion ?? ""}
                  onChange={(e) => setDatosNuevo({ ...datosNuevo, tipo_poblacion: e.target.value })}
                />
              </label>
            </div>

            <label style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                style={{ width: "auto" }}
                checked={datosNuevo.autorizacion_datos}
                onChange={(e) => setDatosNuevo({ ...datosNuevo, autorizacion_datos: e.target.checked })}
              />
              La persona autoriza el tratamiento de sus datos
            </label>

            {errorCreacion && <MensajeError texto={errorCreacion} />}

            <div className="acciones">
              <button type="submit" disabled={creando}>
                {creando ? "Registrando..." : "Registrar beneficiario"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

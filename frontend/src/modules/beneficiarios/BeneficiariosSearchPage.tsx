import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../lib/apiClient";
import { buscarBeneficiario, crearBeneficiario } from "./api";
import type { Beneficiario, NuevoBeneficiario } from "./types";
import { MensajeError } from "../../components/EstadoCarga";

const CAMPOS_INICIALES: NuevoBeneficiario = {
  tipo_documento: "CC",
  numero_documento: "",
  nombres: "",
  sexo: "",
  edad: null,
  municipio: "",
  zona: "",
  nacionalidad: "",
  tipo_poblacion: "",
  autorizacion_datos: false,
  fecha_autorizacion: "",
};

export function BeneficiariosSearchPage() {
  const navigate = useNavigate();
  const [tipoDocumento, setTipoDocumento] = useState("CC");
  const [numeroDocumento, setNumeroDocumento] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);
  const [noEncontrado, setNoEncontrado] = useState(false);
  const [encontrado, setEncontrado] = useState<Beneficiario | null>(null);

  const [datosNuevo, setDatosNuevo] = useState<NuevoBeneficiario>(CAMPOS_INICIALES);
  const [creando, setCreando] = useState(false);
  const [errorCreacion, setErrorCreacion] = useState<string | null>(null);

  async function manejarBusqueda(e: FormEvent) {
    e.preventDefault();
    setErrorBusqueda(null);
    setNoEncontrado(false);
    setEncontrado(null);
    setBuscando(true);
    try {
      const resultado = await buscarBeneficiario(tipoDocumento, numeroDocumento);
      if (resultado.encontrado) {
        setEncontrado(resultado.beneficiario);
      } else {
        setNoEncontrado(true);
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
      const creado = await crearBeneficiario(datosNuevo);
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
                <option value="CC">Cedula de ciudadania</option>
                <option value="CE">Cedula de extranjeria</option>
                <option value="TI">Tarjeta de identidad</option>
                <option value="PASAPORTE">Pasaporte</option>
                <option value="PPT">Permiso por Proteccion Temporal</option>
                <option value="SIN_DOCUMENTO">Sin documento</option>
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
          <div className="acciones">
            <button onClick={() => navigate(`/beneficiarios/${encontrado.id}`)}>Ver ficha completa</button>
          </div>
        </div>
      )}

      {noEncontrado && (
        <div className="tarjeta">
          <h2>No existe todavia. Registrar nuevo beneficiario</h2>
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

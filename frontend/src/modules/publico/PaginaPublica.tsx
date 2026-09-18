import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listarProgramas } from "../participacion/api";
import type { Programa } from "../participacion/types";
import { formatearMiles, useContador } from "../../lib/useContador";
import {
  CONTACTO_EJEMPLO,
  IMPACTO_ESPERADO,
  LINEAS_TRABAJO,
  RESUMEN_PROYECTO,
  RUTA_ORIENTACION,
} from "./contenidoProyecto";

export function PaginaPublica() {
  const [programas, setProgramas] = useState<Programa[]>([]);
  const metaPersonasAnimada = useContador(RESUMEN_PROYECTO.meta_personas, 1400);

  useEffect(() => {
    listarProgramas()
      .then(setProgramas)
      .catch(() => {
        // La seccion publica no depende de esto: si falla, simplemente no
        // se listan programas por linea de trabajo.
      });
  }, []);

  function programasDeLinea(nombreLinea: string) {
    return programas.filter((p) => p.linea_trabajo === nombreLinea);
  }

  return (
    <div>
      <div className="publico-hero">
        <span className="marca-uraba-pais publico-hero__marca">Urabá País</span>
        <p className="publico-hero__tagline">
          Asistencia humanitaria, salud y oportunidades para las comunidades de Urabá.
        </p>

        <div className="publico-hero__datos">
          <div>
            <strong>{formatearMiles(metaPersonasAnimada)}</strong>
            <span>personas como meta del proyecto</span>
          </div>
          <div>
            <strong>{LINEAS_TRABAJO.length}</strong>
            <span>líneas de trabajo</span>
          </div>
          <div>
            <strong>{RESUMEN_PROYECTO.duracion}</strong>
            <span>de duración</span>
          </div>
          <div>
            <strong>{RESUMEN_PROYECTO.municipios.length}</strong>
            <span>municipios: {RESUMEN_PROYECTO.municipios.join(", ")}</span>
          </div>
        </div>

        <Link to="/login">
          <button className="publico-hero__boton">Portal del equipo · Iniciar sesión</button>
        </Link>
      </div>

      <div className="tarjeta" style={{ marginTop: 20 }}>
        <h2>Sobre el proyecto</h2>
        <p>{RESUMEN_PROYECTO.mision}</p>
        <p className="texto-secundario">
          URABÁ-PAÍS es liderado por <strong>{RESUMEN_PROYECTO.lider}</strong>, en alianza con{" "}
          {RESUMEN_PROYECTO.aliados.join(", ")}.
        </p>
        <h3 style={{ marginTop: 16 }}>Objetivo</h3>
        <p style={{ margin: 0 }}>{RESUMEN_PROYECTO.objetivo}</p>
      </div>

      <div className="tarjeta tarjeta--reporte" style={{ marginTop: 20 }}>
        <h2>Líneas de trabajo y programas</h2>
        <div className="publico-lineas">
          {LINEAS_TRABAJO.map((linea) => (
            <div key={linea.id} className="publico-linea">
              <h3 style={{ marginBottom: 4 }}>{linea.nombre}</h3>
              <p className="texto-secundario" style={{ margin: "0 0 8px" }}>
                {linea.alcance} · {linea.ejemplos}
              </p>
              {programasDeLinea(linea.nombre).length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {programasDeLinea(linea.nombre).map((p) => (
                    <li key={p.id}>{p.nombre}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="tarjeta" style={{ marginTop: 20 }}>
        <h2>Impacto esperado</h2>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {IMPACTO_ESPERADO.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="tarjeta" style={{ marginTop: 20 }}>
        <h2>Cómo acceder a un programa</h2>
        <div className="publico-ruta">
          {RUTA_ORIENTACION.map((paso) => (
            <div key={paso.paso} className="publico-ruta__paso">
              <strong>{paso.paso}</strong>
              <p className="texto-secundario" style={{ margin: "4px 0 0" }}>
                {paso.detalle}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="tarjeta" style={{ marginTop: 20 }}>
        <h2>Canales de contacto</h2>
        <p>
          Correo: <a href={`mailto:${CONTACTO_EJEMPLO.correo}`}>{CONTACTO_EJEMPLO.correo}</a>
        </p>
        <p className="texto-secundario" style={{ margin: 0 }}>
          {CONTACTO_EJEMPLO.nota}
        </p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
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
import { IconoBrujula, IconoCalendario, IconoCorazon, IconoCorreo, IconoEscudo, IconoManos, IconoMapaPin, IconoUsuarios } from "./iconosPublico";

const ICONOS_LINEA = [IconoEscudo, IconoCorazon, IconoManos];

// Primera oracion de la mision, para mostrarla como resumen antes de
// expandir el texto completo con "Leer mas".
const MISION_RESUMEN = RESUMEN_PROYECTO.mision.split(". ")[0] + ".";

export function PaginaPublica() {
  const { usuario, cargando } = useAuth();
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [mostrarMasSobre, setMostrarMasSobre] = useState(false);
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

  // Esta pagina es el landing publico, solo para visitantes sin sesion. Con
  // sesion iniciada el punto de entrada es directamente Beneficiarios.
  if (!cargando && usuario) {
    return <Navigate to="/beneficiarios" replace />;
  }

  return (
    <div className="pub">
      {/* ---------- Hero ---------- */}
      <section className="pub-hero" id="inicio">
        <div className="pub-hero__fondo" aria-hidden="true">
          <svg className="pub-hero__olas" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,64 C220,110 420,10 700,48 C900,74 1040,30 1200,56 L1200,120 L0,120 Z" />
          </svg>
        </div>
        <div className="pub-hero__contenido">
          <h1 className="marca-uraba-pais pub-hero__marca">Urabá País</h1>
          <p className="pub-hero__tagline">
            Asistencia humanitaria, salud y oportunidades para las comunidades de Urabá.
          </p>
        </div>
      </section>

      {/* ---------- Tarjetas resumen de lineas ---------- */}
      <section className="pub-resumen">
        {LINEAS_TRABAJO.map((linea, i) => {
          const Icono = ICONOS_LINEA[i % ICONOS_LINEA.length];
          return (
            <a href="#lineas" key={linea.id} className="pub-resumen__tarjeta">
              <span className="pub-resumen__icono">
                <Icono />
              </span>
              <h3>{linea.nombre}</h3>
              <p className="texto-secundario">{linea.ejemplos}</p>
              <span className="pub-resumen__enlace">Ver más →</span>
            </a>
          );
        })}
      </section>

      <div className="pub-cuerpo">
        {/* ---------- Barra lateral ---------- */}
        <aside className="pub-sidebar">
          <nav className="pub-sidebar__nav" aria-label="Navegación en esta página">
            <span className="pub-sidebar__titulo">En esta página</span>
            <a href="#sobre">Quiénes somos</a>
            <a href="#acceso">Qué hacemos</a>
            <a href="#lineas">Líneas de trabajo</a>
            <a href="#impacto">Impacto</a>
            <a href="#contacto">Contacto</a>
          </nav>
          <div className="pub-sidebar__datos">
            <div className="pub-sidebar__dato">
              <strong>{formatearMiles(metaPersonasAnimada)}</strong>
              <span>personas como meta</span>
            </div>
            <div className="pub-sidebar__dato">
              <strong>{RESUMEN_PROYECTO.duracion}</strong>
              <span>de duración</span>
            </div>
            <div className="pub-sidebar__dato">
              <strong>{RESUMEN_PROYECTO.municipios.join(" · ")}</strong>
              <span>municipios de Urabá</span>
            </div>
          </div>
        </aside>

        <div className="pub-cuerpo__secciones">
          {/* ---------- Sobre el proyecto ---------- */}
          <section className="tarjeta pub-seccion" id="sobre">
            <span className="pub-etiqueta">Quiénes somos</span>
            <h2>Sobre el proyecto</h2>
            <p>{mostrarMasSobre ? RESUMEN_PROYECTO.mision : MISION_RESUMEN}</p>
            {mostrarMasSobre && (
              <p className="texto-secundario" style={{ marginBottom: 12 }}>
                {RESUMEN_PROYECTO.objetivo}
              </p>
            )}
            <button className="pub-leer-mas" onClick={() => setMostrarMasSobre((v) => !v)}>
              {mostrarMasSobre ? "Leer menos" : "Leer más"}
            </button>
            <p className="texto-secundario" style={{ marginTop: 14 }}>
              Liderado por <strong>{RESUMEN_PROYECTO.lider}</strong>, en alianza con{" "}
              {RESUMEN_PROYECTO.aliados.join(", ")}.
            </p>
          </section>

          {/* ---------- Como acceder ---------- */}
          <section className="tarjeta pub-seccion" id="acceso">
            <span className="pub-etiqueta">Qué hacemos</span>
            <h2>Cómo acceder a un programa</h2>
            <div className="pub-pasos">
              {RUTA_ORIENTACION.map((paso, i) => {
                const [numero, ...resto] = paso.paso.split(". ");
                return (
                  <div key={paso.paso} className="pub-pasos__item">
                    <div className="pub-pasos__marcador">
                      <span className="pub-pasos__numero">{numero}</span>
                      {i < RUTA_ORIENTACION.length - 1 && (
                        <span className="pub-pasos__linea" aria-hidden="true" />
                      )}
                    </div>
                    <div>
                      <strong>{resto.join(". ")}</strong>
                      <p className="texto-secundario" style={{ margin: "4px 0 0" }}>
                        {paso.detalle}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- Lineas de trabajo y programas ---------- */}
          <section className="tarjeta tarjeta--reporte pub-seccion" id="lineas">
            <span className="pub-etiqueta">Líneas de trabajo</span>
            <h2>Líneas de trabajo y programas</h2>
            <div className="pub-lineas">
              {LINEAS_TRABAJO.map((linea, i) => {
                const Icono = ICONOS_LINEA[i % ICONOS_LINEA.length];
                return (
                  <div key={linea.id} className="pub-linea">
                    <span className="pub-linea__icono">
                      <Icono />
                    </span>
                    <h3>{linea.nombre}</h3>
                    <p className="texto-secundario" style={{ margin: "0 0 10px" }}>
                      {linea.alcance}
                    </p>
                    {programasDeLinea(linea.nombre).length > 0 && (
                      <ul className="pub-linea__lista">
                        {programasDeLinea(linea.nombre).map((p) => (
                          <li key={p.id}>{p.nombre}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ---------- Contacto ---------- */}
          <section className="tarjeta pub-seccion" id="contacto">
            <span className="pub-etiqueta">Contacto</span>
            <h2>Canales de contacto</h2>
            <div className="pub-contacto">
              <a href={`mailto:${CONTACTO_EJEMPLO.correo}`} className="pub-contacto__tarjeta">
                <IconoCorreo />
                <div>
                  <strong>Correo electrónico</strong>
                  <p style={{ margin: "2px 0 0" }}>{CONTACTO_EJEMPLO.correo}</p>
                </div>
              </a>
              <div className="pub-contacto__aviso">
                <p style={{ margin: 0 }}>{CONTACTO_EJEMPLO.nota}</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* ---------- Impacto ---------- */}
      <section className="pub-impacto" id="impacto">
        <span className="pub-etiqueta pub-etiqueta--claro">Impacto</span>
        <h2 className="pub-impacto__titulo">Nuestro impacto</h2>
        <div className="pub-impacto__datos">
          <div className="pub-impacto__dato">
            <IconoUsuarios />
            <strong>{formatearMiles(metaPersonasAnimada)}</strong>
            <span>personas como meta del proyecto</span>
          </div>
          <div className="pub-impacto__dato">
            <IconoBrujula />
            <strong>{LINEAS_TRABAJO.length}</strong>
            <span>líneas de trabajo</span>
          </div>
          <div className="pub-impacto__dato">
            <IconoCalendario />
            <strong>{RESUMEN_PROYECTO.duracion}</strong>
            <span>de duración</span>
          </div>
          <div className="pub-impacto__dato">
            <IconoMapaPin />
            <strong>{RESUMEN_PROYECTO.municipios.length}</strong>
            <span>municipios: {RESUMEN_PROYECTO.municipios.join(", ")}</span>
          </div>
        </div>
        <ul className="pub-impacto__lista">
          {IMPACTO_ESPERADO.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

import { useState, type ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PieInstitucional } from "./PieInstitucional";
import { EstadoConexion } from "./EstadoConexion";
import { IconoBeneficiarios, IconoIndicadores } from "./iconosApp";
import { AsistenteChat } from "../modules/asistente/AsistenteChat";

function inicialDe(email: string | null) {
  return (email || "?").trim().charAt(0).toUpperCase();
}

function rutaActual(pathname: string) {
  if (pathname.startsWith("/beneficiarios")) return "Beneficiarios";
  if (pathname.startsWith("/indicadores")) return "Indicadores";
  return "Urabá País";
}

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, rol, cargando, cerrarSesion } = useAuth();
  const location = useLocation();
  const esPaginaPublica = location.pathname === "/" && !usuario;
  const areaAutenticada = Boolean(usuario) && !esPaginaPublica;

  const [menuAbierto, setMenuAbierto] = useState(false);

  if (areaAutenticada) {
    return (
      <div className="app-shell">
        <aside className="app-sidebar">
          <span className="app-sidebar__marca marca-uraba-pais">Urabá País</span>

          <nav className="app-sidebar__nav">
            <NavLink to="/beneficiarios" className={({ isActive }) => (isActive ? "activo" : "")}>
              <IconoBeneficiarios /> Beneficiarios
            </NavLink>
            {rol === "administrador" && (
              <NavLink to="/indicadores" className={({ isActive }) => (isActive ? "activo" : "")}>
                <IconoIndicadores /> Indicadores
              </NavLink>
            )}
          </nav>

          <div className="app-sidebar__pie">
            <p className="app-sidebar__lema marca-uraba-pais">Juntos por comunidades más fuertes</p>
          </div>
        </aside>

        <div className="app-content">
          <header className="app-topbar">
            <span className="texto-secundario app-topbar__ruta">{rutaActual(location.pathname)}</span>

            <div className="app-topbar__usuario">
              <button className="app-usuario" onClick={() => setMenuAbierto((v) => !v)}>
                <span className="app-avatar">{inicialDe(usuario!.email)}</span>
                <span className="app-usuario__texto">
                  <strong>{usuario!.email}</strong>
                  <span>{!cargando && (rol === "administrador" ? "Administrador" : "Encuestador")}</span>
                </span>
              </button>
              {menuAbierto && (
                <div className="app-usuario__menu">
                  <button
                    className="secundario"
                    onClick={() => {
                      setMenuAbierto(false);
                      cerrarSesion();
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </header>

          <EstadoConexion />

          <main className="app-main">{children}</main>

          <PieInstitucional />
        </div>

        <AsistenteChat />
      </div>
    );
  }

  return (
    <>
      <div className="fondo-animado" aria-hidden="true">
        <div className="fondo-animado__forma fondo-animado__forma--1" />
        <div className="fondo-animado__forma fondo-animado__forma--2" />
        <div className="fondo-animado__forma fondo-animado__forma--3" />
      </div>

      <header className="encabezado-app">
        <div className="encabezado-app__contenido">
          <span className="encabezado-app__titulo marca-uraba-pais">
            {esPaginaPublica ? (
              <a href="#inicio" className="encabezado-app__titulo-enlace">
                Urabá País
              </a>
            ) : (
              <Link to="/" className="encabezado-app__titulo-enlace">
                Urabá País
              </Link>
            )}
          </span>

          {esPaginaPublica && (
            <nav className="encabezado-app__nav-publico">
              <a href="#inicio">Inicio</a>
              <a href="#sobre">Quiénes somos</a>
              <a href="#acceso">Qué hacemos</a>
              <a href="#lineas">Líneas de trabajo</a>
              <a href="#impacto">Impacto</a>
              <a href="#contacto">Contacto</a>
            </nav>
          )}

          {!cargando && location.pathname !== "/login" && (
            <Link to="/login">
              <button className={esPaginaPublica ? "encabezado-app__cta" : "secundario"}>
                {esPaginaPublica ? "Iniciar sesión" : "Iniciar sesion"}
              </button>
            </Link>
          )}
        </div>
      </header>

      <EstadoConexion />

      <main className={esPaginaPublica ? "pagina-publica" : "pagina"}>{children}</main>

      <PieInstitucional />
    </>
  );
}

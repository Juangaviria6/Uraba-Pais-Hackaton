import type { ReactNode } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PieInstitucional } from "./PieInstitucional";
import { EstadoConexion } from "./EstadoConexion";

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, rol, cargando, cerrarSesion } = useAuth();
  const location = useLocation();

  return (
    <>
      <div className="fondo-animado" aria-hidden="true">
        <div className="fondo-animado__forma fondo-animado__forma--1" />
        <div className="fondo-animado__forma fondo-animado__forma--2" />
        <div className="fondo-animado__forma fondo-animado__forma--3" />
      </div>

      <header className="encabezado-app">
        <div className="encabezado-app__contenido">
          <span className="encabezado-app__titulo marca-uraba-pais">Urabá País</span>
          {usuario ? (
            <div className="encabezado-app__sesion">
              <span>
                {usuario.email}
                {!cargando && <> · {rol === "administrador" ? "Administrador" : "Encuestador"}</>}
              </span>
              <button className="secundario" onClick={() => cerrarSesion()}>
                Cerrar sesion
              </button>
            </div>
          ) : (
            !cargando &&
            location.pathname !== "/login" && (
              <Link to="/login">
                <button className="secundario">Iniciar sesion</button>
              </Link>
            )
          )}
        </div>
      </header>

      <EstadoConexion />

      {usuario && (
        <nav className="nav-app">
          <div className="nav-app__contenido">
            <NavLink to="/beneficiarios" className={({ isActive }) => (isActive ? "activo" : "")}>
              Beneficiarios
            </NavLink>
            {rol === "administrador" && (
              <NavLink to="/indicadores" className={({ isActive }) => (isActive ? "activo" : "")}>
                Indicadores
              </NavLink>
            )}
          </div>
        </nav>
      )}

      <main className="pagina">{children}</main>

      <PieInstitucional />
    </>
  );
}

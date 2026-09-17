import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { PieInstitucional } from "./PieInstitucional";

export function Layout({ children }: { children: ReactNode }) {
  const { usuario, rol, cargando, cerrarSesion } = useAuth();

  return (
    <>
      <header className="encabezado-app">
        <div className="encabezado-app__contenido">
          <span className="encabezado-app__titulo marca-uraba-pais">Urabá País</span>
          {usuario && (
            <div className="encabezado-app__sesion">
              <span>
                {usuario.email}
                {!cargando && <> · {rol === "administrador" ? "Administrador" : "Encuestador"}</>}
              </span>
              <button className="secundario" onClick={() => cerrarSesion()}>
                Cerrar sesion
              </button>
            </div>
          )}
        </div>
      </header>

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

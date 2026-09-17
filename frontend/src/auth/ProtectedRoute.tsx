import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <div className="pagina">Cargando sesion...</div>;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export function AdminRoute({ children }: { children: ReactNode }) {
  const { rol, cargando } = useAuth();

  if (cargando) {
    return <div className="pagina">Cargando sesion...</div>;
  }

  if (rol !== "administrador") {
    return <Navigate to="/beneficiarios" replace />;
  }

  return <>{children}</>;
}

import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { iniciarSincronizacionAutomatica } from "./lib/syncEngine";
import { LoginPage } from "./auth/LoginPage";
import { ProtectedRoute, AdminRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { BeneficiariosSearchPage } from "./modules/beneficiarios/BeneficiariosSearchPage";
import { FichaPage } from "./modules/reportes/FichaPage";
import { ParticipacionPage } from "./modules/participacion/ParticipacionPage";
import { AtencionSeguimientoPage } from "./modules/atencionSeguimiento/AtencionSeguimientoPage";
import { IndicadoresPage } from "./modules/reportes/IndicadoresPage";

export default function App() {
  useEffect(() => {
    iniciarSincronizacionAutomatica();
  }, []);

  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<Navigate to="/beneficiarios" replace />} />

          <Route
            path="/beneficiarios"
            element={
              <ProtectedRoute>
                <BeneficiariosSearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beneficiarios/:id"
            element={
              <ProtectedRoute>
                <FichaPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beneficiarios/:id/participacion"
            element={
              <ProtectedRoute>
                <ParticipacionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/beneficiarios/:id/seguimiento"
            element={
              <ProtectedRoute>
                <AtencionSeguimientoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/indicadores"
            element={
              <ProtectedRoute>
                <AdminRoute>
                  <IndicadoresPage />
                </AdminRoute>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/beneficiarios" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

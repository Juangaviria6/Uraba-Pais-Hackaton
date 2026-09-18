import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export function LoginPage() {
  const { usuario, cargando, iniciarSesion, registrarse } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  if (!cargando && usuario) {
    return <Navigate to="/beneficiarios" replace />;
  }

  async function manejarEnvio(e: FormEvent, accion: "login" | "registro") {
    e.preventDefault();
    setError(null);
    setEnviando(true);
    try {
      if (accion === "login") {
        await iniciarSesion(email, password);
      } else {
        await registrarse(email, password);
      }
    } catch (err) {
      if ((err as { code?: string }).code === "auth/network-request-failed") {
        setError(
          "No hay conexion. La primera vez que inicias sesion en un dispositivo/navegador necesitas internet; " +
            "despues de eso podras entrar sin conexion.",
        );
      } else {
        setError(err instanceof Error ? err.message : "No se pudo iniciar sesion");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="pagina" style={{ maxWidth: 420, marginTop: 60 }}>
      <div className="tarjeta">
        <div style={{ textAlign: "center" }}>
          <h1 className="marca-uraba-pais" style={{ fontSize: "2rem", color: "var(--color-azul)", margin: "0 0 16px" }}>
            Urabá País
          </h1>
        </div>
        <p className="texto-secundario" style={{ marginBottom: 20 }}>
          Ingresa con tu correo y contrasena para registrar y consultar beneficiarios.
        </p>

        <form className="formulario" onSubmit={(e) => manejarEnvio(e, "login")}>
          <label>
            Correo
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label>
            Contrasena
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error && <div className="mensaje-error">{error}</div>}

          <div className="acciones">
            <button type="submit" disabled={enviando}>
              {enviando ? "Ingresando..." : "Iniciar sesion"}
            </button>
            <button
              type="button"
              className="secundario"
              disabled={enviando}
              onClick={(e) => manejarEnvio(e, "registro")}
            >
              Crear cuenta nueva
            </button>
          </div>
        </form>

        <p className="texto-secundario" style={{ marginTop: 16 }}>
          Las cuentas nuevas inician con rol de encuestador. El acceso de administrador
          se otorga por separado.
        </p>
      </div>
    </div>
  );
}

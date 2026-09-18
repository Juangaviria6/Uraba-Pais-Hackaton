import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { apiFetch } from "../lib/apiClient";

export type Rol = "administrador" | "encuestador" | null;

type AuthContextValue = {
  usuario: User | null;
  rol: Rol;
  cargando: boolean;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  registrarse: (email: string, password: string) => Promise<void>;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type MeResponse = { uid: string; email: string | null; rol: Rol };

// El rol se guarda localmente para que, al abrir la app sin conexion con una
// sesion de Firebase Auth ya persistida (Firebase si funciona sin red), no
// se pierda el rol solo porque /usuarios/me no se pudo consultar.
function claveRol(uid: string) {
  return `uraba-pais:rol:${uid}`;
}

function leerRolCacheado(uid: string): Rol {
  const valor = localStorage.getItem(claveRol(uid));
  return valor === "administrador" || valor === "encuestador" ? valor : null;
}

function guardarRolCacheado(uid: string, rol: Rol) {
  if (rol) localStorage.setItem(claveRol(uid), rol);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [rol, setRol] = useState<Rol>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Firebase restaura la sesion guardada localmente sin necesitar red,
      // asi que en cuanto Firebase responde ya se puede dejar pasar al
      // usuario: no hay que esperar a /usuarios/me para saber si hay sesion.
      setUsuario(user);
      setCargando(false);

      if (!user) {
        setRol(null);
        return;
      }

      // Rol optimista: el ultimo conocido en este dispositivo, mientras se
      // confirma (o no) contra el servidor en segundo plano.
      setRol(leerRolCacheado(user.uid));

      (async () => {
        try {
          // Auto-provisiona el rol la primera vez (siempre "encuestador").
          await apiFetch("/usuarios/registrar", { method: "POST" });
          const info = await apiFetch<MeResponse>("/usuarios/me");
          setRol(info.rol);
          guardarRolCacheado(user.uid, info.rol);
        } catch {
          // Sin conexion o con senal debil: se queda con el rol cacheado de
          // arriba en vez de bloquear nada.
        }
      })();
    });

    return unsubscribe;
  }, []);

  async function iniciarSesion(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function registrarse(email: string, password: string) {
    await createUserWithEmailAndPassword(auth, email, password);
  }

  async function cerrarSesion() {
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ usuario, rol, cargando, iniciarSesion, registrarse, cerrarSesion }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

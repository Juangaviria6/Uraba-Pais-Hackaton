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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [rol, setRol] = useState<Rol>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUsuario(user);

      if (user) {
        try {
          // Auto-provisiona el rol la primera vez (siempre "encuestador").
          await apiFetch("/usuarios/registrar", { method: "POST" });
          const info = await apiFetch<MeResponse>("/usuarios/me");
          setRol(info.rol);
        } catch {
          setRol(null);
        }
      } else {
        setRol(null);
      }

      setCargando(false);
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

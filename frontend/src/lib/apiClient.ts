import { auth } from "./firebase";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

type Opciones = {
  method?: "GET" | "POST" | "PUT";
  body?: unknown;
};

// Cliente API compartido por los 4 modulos. Adjunta el ID token del usuario
// autenticado en cada llamada (el SDK de Firebase lo renueva solo, nunca se
// maneja ni se guarda a mano).
export async function apiFetch<T>(path: string, opciones: Opciones = {}): Promise<T> {
  const headers: Record<string, string> = {};

  const usuario = auth.currentUser;
  if (usuario) {
    headers["Authorization"] = `Bearer ${await usuario.getIdToken()}`;
  }

  if (opciones.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method: opciones.method || "GET",
    headers,
    body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const mensaje = (data && (data as { error?: string }).error) || "Ocurrio un error inesperado";
    throw new ApiError(res.status, mensaje, data);
  }

  return data as T;
}

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

// En senal debil (no necesariamente cero senal) un fetch puede quedarse
// colgado mucho tiempo antes de fallar por si solo. Sin un limite, eso se ve
// igual que "la app no deja entrar", aunque el modo sin conexion si vaya a
// activarse — solo tarda demasiado en notar que no hay red.
const TIEMPO_LIMITE_MS = 8000;

function conLimiteDeTiempo<T>(promesa: Promise<T>, alAgotarse?: () => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const temporizador = setTimeout(() => {
      alAgotarse?.();
      reject(new Error("Se agoto el tiempo de espera (posiblemente sin conexion)"));
    }, TIEMPO_LIMITE_MS);

    promesa.then(
      (valor) => {
        clearTimeout(temporizador);
        resolve(valor);
      },
      (err) => {
        clearTimeout(temporizador);
        reject(err);
      },
    );
  });
}

// Cliente API compartido por los 4 modulos. Adjunta el ID token del usuario
// autenticado en cada llamada (el SDK de Firebase lo renueva solo, nunca se
// maneja ni se guarda a mano).
export async function apiFetch<T>(path: string, opciones: Opciones = {}): Promise<T> {
  const headers: Record<string, string> = {};

  const usuario = auth.currentUser;
  if (usuario) {
    headers["Authorization"] = `Bearer ${await conLimiteDeTiempo(usuario.getIdToken())}`;
  }

  if (opciones.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const controlador = new AbortController();
  const res = await conLimiteDeTiempo(
    fetch(`${BASE_URL}${path}`, {
      method: opciones.method || "GET",
      headers,
      body: opciones.body !== undefined ? JSON.stringify(opciones.body) : undefined,
      signal: controlador.signal,
    }),
    () => controlador.abort(),
  );

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const mensaje = (data && (data as { error?: string }).error) || "Ocurrio un error inesperado";
    throw new ApiError(res.status, mensaje, data);
  }

  return data as T;
}

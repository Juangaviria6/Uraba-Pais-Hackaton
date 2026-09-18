import { apiFetch } from "../../lib/apiClient";
import type { MensajeChat } from "./types";

// El agente encadena varias llamadas a OpenAI (razonar, llamar una
// herramienta, leer el resultado, responder) antes de devolver algo, asi que
// facilmente supera el limite de tiempo por defecto (8s) que usa el resto de
// la app para llamadas simples. Se le da un margen mas amplio.
const TIEMPO_LIMITE_CHAT_MS = 45000;

// El backend (controllers/chatController.js) espera el mensaje nuevo aparte
// del historial previo, y siempre reenvia el token del usuario autenticado
// (lo agrega apiFetch) para que el asistente solo pueda leer lo que ese
// mismo usuario ya podria consultar a mano.
export function enviarMensajeChat(mensaje: string, historial: MensajeChat[]) {
  return apiFetch<{ output: string }>("/chat", {
    method: "POST",
    body: { mensaje, historial },
    tiempoLimiteMs: TIEMPO_LIMITE_CHAT_MS,
  });
}

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useAuth } from "../../auth/AuthContext";
import { enviarMensajeChat } from "./api";
import type { MensajeChat } from "./types";
import { IconoCerrar, IconoChat, IconoEnviar } from "./iconosAsistente";

const MENSAJE_BIENVENIDA: MensajeChat = {
  role: "assistant",
  content:
    "Hola, soy el asistente de Urabá País. Puedo ayudarte a resumir el historial de un beneficiario, " +
    "buscar un caso por documento o repasar los indicadores. Mis respuestas son apoyo informativo, no " +
    "reemplazan una decisión institucional.",
};

export function AsistenteChat() {
  const { rol } = useAuth();
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([MENSAJE_BIENVENIDA]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (abierto) {
      finRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [mensajes, abierto, enviando]);

  // Solo administradores tienen esta herramienta: el backend tambien lo
  // exige (requireAdmin en routes/chat.js), esto es solo para no mostrar
  // un boton que igual seria rechazado por el servidor.
  if (rol !== "administrador") return null;

  async function manejarEnvio(e: FormEvent) {
    e.preventDefault();
    const mensaje = texto.trim();
    if (!mensaje || enviando) return;

    const historialPrevio = mensajes;
    setMensajes((actual) => [...actual, { role: "user", content: mensaje }]);
    setTexto("");
    setError(null);
    setEnviando(true);

    try {
      const respuesta = await enviarMensajeChat(mensaje, historialPrevio);
      setMensajes((actual) => [...actual, { role: "assistant", content: respuesta.output }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo contactar al asistente");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="asistente-flotante">
      {abierto && (
        <div className="asistente-panel" role="dialog" aria-label="Asistente virtual">
          <div className="asistente-panel__cabecera">
            <span>Asistente Urabá País</span>
            <button
              type="button"
              className="asistente-panel__cerrar"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar asistente"
            >
              <IconoCerrar />
            </button>
          </div>

          <div className="asistente-panel__mensajes">
            {mensajes.map((m, i) => (
              <div key={i} className={`asistente-mensaje asistente-mensaje--${m.role}`}>
                {m.content}
              </div>
            ))}
            {enviando && (
              <div className="asistente-mensaje asistente-mensaje--assistant asistente-mensaje--cargando">
                Escribiendo...
              </div>
            )}
            {error && <div className="mensaje-error">{error}</div>}
            <div ref={finRef} />
          </div>

          <form className="asistente-panel__form" onSubmit={manejarEnvio}>
            <input
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={enviando}
              aria-label="Mensaje para el asistente"
            />
            <button type="submit" disabled={enviando || !texto.trim()} aria-label="Enviar">
              <IconoEnviar />
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        className="asistente-boton"
        onClick={() => setAbierto((v) => !v)}
        aria-label={abierto ? "Cerrar asistente" : "Abrir asistente virtual"}
      >
        {abierto ? <IconoCerrar /> : <IconoChat />}
      </button>
    </div>
  );
}

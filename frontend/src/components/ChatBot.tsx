import { useEffect, useRef, useState } from "react";
import { getAuth } from "firebase/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string; 

interface Mensaje {
  role: "user" | "assistant";
  content: string;
}

export default function ChatBot() {
  const [historial, setHistorial] = useState<Mensaje[]>([]);
  const [pregunta, setPregunta] = useState("");
  const [cargando, setCargando] = useState(false);
  const finRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [historial, cargando]);

  async function enviarPregunta() {
    const texto = pregunta.trim();
    if (!texto || cargando) return;

    const usuario = getAuth().currentUser;
    if (!usuario) {
      setHistorial((prev) => [
        ...prev,
        { role: "assistant", content: "Debes iniciar sesión para usar el asistente." },
      ]);
      return;
    }

    const idToken = await usuario.getIdToken();
    const historialPrevio = historial;
    setHistorial([...historialPrevio, { role: "user", content: texto }]);
    setPregunta("");
    setCargando(true);

    try {
      const resp = await fetch(`${API_BASE_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ mensaje: texto, historial: historialPrevio }),
      });

      if (!resp.ok) throw new Error(`Error ${resp.status}`);
      const data: { output: string } = await resp.json();
      setHistorial((prev) => [...prev, { role: "assistant", content: data.output }]);
    } catch {
      setHistorial((prev) => [
        ...prev,
        { role: "assistant", content: "Ocurrió un error al responder. Intenta de nuevo." },
      ]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="chatbot-container">
      <p className="chatbot-disclaimer">
        Este asistente brinda apoyo informativo. No reemplaza decisiones institucionales,
        diagnósticos profesionales, ni determina el acceso a ayudas.
      </p>

      <div className="chatbot-messages">
        {historial.map((m, i) => (
          <div key={i} className={`chatbot-message chatbot-message--${m.role}`}>
            {m.content}
          </div>
        ))}
        {cargando && (
          <div className="chatbot-message chatbot-message--assistant">Escribiendo…</div>
        )}
        <div ref={finRef} />
      </div>

      <div className="chatbot-input">
        <input
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarPregunta()}
          placeholder="Escribe tu pregunta..."
          disabled={cargando}
        />
        <button onClick={enviarPregunta} disabled={cargando}>
          Enviar
        </button>
      </div>
    </div>
  );
}
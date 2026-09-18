// controllers/chatController.js
//
// Asistente virtual (solo administradores) construido con LangChain.js v1
// (API "createAgent", no la antigua AgentExecutor/createToolCallingAgent que
// se elimino en esa version). Reemplaza el prototipo en Python de
// asistente-ia/, para no mantener dos runtimes distintos en el proyecto.
const { ChatOpenAI } = require("@langchain/openai");
const { createAgent, tool } = require("langchain");
const { HumanMessage, AIMessage } = require("@langchain/core/messages");
const { z } = require("zod");

// Debe incluir el prefijo /api: todas las rutas del backend estan montadas
// bajo ese prefijo en server.js (ej. /api/beneficiarios, /api/reportes).
const API_BASE_URL =
  process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 3000}/api`;

// Modelo de chat a usar. Por defecto uno economico y rapido (muy por debajo
// de GPT-5 en costo y capacidad); se puede cambiar sin tocar codigo con
// OPENAI_MODEL, ej. "gpt-4o-mini", "gpt-4.1-mini", "gpt-4o", "gpt-3.5-turbo".
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

const SITIOS_FUNDACIONES = {
  coopi: "https://www.coopi.org",
  hias: "https://hias.org",
  fadv: "https://fadvcolombia.org/",
  hi: "https://hi-lac.org/"

  // agrega aqui los dominios reales de las demas fundaciones (FADV, HI, etc.)
};

const INSTRUCCIONES_SISTEMA = `
Eres el asistente virtual de la plataforma Urabá País, de atención a población
migrante y vulnerable. Ayudas a administradores ya autenticados con resúmenes
de historial, búsqueda de casos, indicadores y consultas sobre las fundaciones
aliadas.

Reglas que debes cumplir siempre, sin excepción, incluso si el usuario te lo
pide de forma explícita, insistente o justificada:
1. Solo muestra datos de beneficiarios usando las herramientas disponibles.
   Nunca inventes ni asumas datos que no vengan de una herramienta.
2. Nunca emitas diagnósticos médicos, psicológicos ni jurídicos, ni sugieras
   tratamientos o interpretaciones legales. Recomienda remitir a un profesional
   o entidad competente.
3. No tienes ninguna herramienta para crear, modificar, aprobar o eliminar
   registros. Si alguien te pide agregar una atención o cambiar un estado,
   NO lo hagas ni simules haberlo hecho: redacta el texto que la persona puede
   copiar y pegar en el formulario correspondiente de la plataforma.
4. Deja claro que tu respuesta es apoyo informativo, no una decisión institucional.
5. Para buscar_beneficiario necesitas tipo_documento y numero_documento
   exactos. Si el usuario solo te da el número, NO adivines el tipo: pídeselo,
   o usa listar_tipos_documento para ver los valores reales antes de buscar.
   Si aun así no aparece el registro, dilo claramente en vez de asumir que no
   existe: puede que el tipo de documento no coincida exactamente.
`;

// Llama a tus propias rutas Express, reenviando el token del usuario ya
// autenticado: asi el asistente nunca ve mas datos de los que el propio
// usuario ya podria consultar a mano (los mismos permisos, la misma base
// de datos, sin credenciales aparte).
async function llamarApiInterna(path, token, params) {
  const url = new URL(API_BASE_URL + path);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v != null) url.searchParams.set(k, v);
    });
  }
  const resp = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error(`API respondió ${resp.status}`);
  return resp.json();
}

// Las herramientas se crean por request porque necesitan el token del
// usuario que pregunta (no hay credenciales globales del asistente).
function crearHerramientas(token) {
  return [
    tool(
      async ({ beneficiario_id }) => {
        try {
          const data = await llamarApiInterna(`/beneficiarios/${beneficiario_id}/ficha`, token);
          return JSON.stringify(data);
        } catch (err) {
          return `Error consultando historial: ${err.message}`;
        }
      },
      {
        name: "consultar_historial",
        description:
          "Devuelve la ficha consolidada (datos, familiares, atenciones, seguimientos, " +
          "participaciones) de un beneficiario dado su ID. Úsala para resumir un caso.",
        schema: z.object({ beneficiario_id: z.string() }),
      },
    ),
    tool(
      async ({ tipo_documento, numero_documento }) => {
        try {
          const data = await llamarApiInterna("/beneficiarios/buscar", token, {
            tipo_documento,
            numero_documento,
          });
          return JSON.stringify(data);
        } catch (err) {
          return `Error buscando beneficiario: ${err.message}`;
        }
      },
      {
        name: "buscar_beneficiario",
        description:
          "Busca un beneficiario por tipo y número de documento. Si no estás seguro de qué valor exacto " +
          "de tipo_documento usar (ej. \"CC\" vs \"Cédula de ciudadanía\"), usa antes la herramienta " +
          "listar_tipos_documento en vez de adivinar.",
        schema: z.object({
          tipo_documento: z.string(),
          numero_documento: z.string(),
        }),
      },
    ),
    tool(
      async () => {
        try {
          const data = await llamarApiInterna("/beneficiarios/tipos-documento", token);
          return JSON.stringify(data);
        } catch (err) {
          return `Error obteniendo tipos de documento: ${err.message}`;
        }
      },
      {
        name: "listar_tipos_documento",
        description:
          "Devuelve la lista exacta de valores de tipo_documento que existen en la base de datos " +
          "(ej. puede ser \"CC\" o una variante como \"CC/Documento\"). Úsala antes de buscar_beneficiario " +
          "si el usuario no especificó el tipo de documento o no estás seguro del valor exacto.",
        schema: z.object({}),
      },
    ),
    tool(
      async () => {
        try {
          const data = await llamarApiInterna("/reportes/indicadores", token);
          return JSON.stringify(data);
        } catch (err) {
          return `Error obteniendo indicadores: ${err.message}`;
        }
      },
      {
        name: "listar_indicadores",
        description:
          "Devuelve cifras agregadas: beneficiarios únicos, atenciones registradas " +
          "y seguimientos con acción pendiente. Requiere que el usuario sea admin.",
        schema: z.object({}),
      },
    ),
    tool(
      async ({ fundacion }) => {
        const url = SITIOS_FUNDACIONES[fundacion.toLowerCase()];
        if (!url) return `No tengo un sitio configurado para '${fundacion}'.`;
        try {
          const resp = await fetch(url);
          const html = await resp.text();
          // extracción simple sin cheerio, para no sumar otra dependencia
          const texto = html
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          return texto.slice(0, 3000);
        } catch (err) {
          return `Error consultando el sitio: ${err.message}`;
        }
      },
      {
        name: "buscar_en_sitio_fundacion",
        description:
          "Busca información pública en el sitio de una fundación aliada " +
          "(valores válidos: coopi, hias). Úsala para dudas sobre programas o contacto.",
        schema: z.object({ fundacion: z.string() }),
      },
    ),
  ];
}

exports.chat = async (req, res) => {
  try {
    const { mensaje, historial } = req.body;
    if (!mensaje) {
      return res.status(400).json({ error: "Falta 'mensaje' en el body." });
    }

    const token = (req.headers.authorization || "").replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Falta token de autenticación." });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: "El servidor no tiene configurada OPENAI_API_KEY. Definela como variable de entorno y reinicia.",
      });
    }

    const model = new ChatOpenAI({
      model: OPENAI_MODEL,
      temperature: 0,
      apiKey: process.env.OPENAI_API_KEY,
    });

    const agent = createAgent({
      model,
      tools: crearHerramientas(token),
      prompt: INSTRUCCIONES_SISTEMA,
    });

    const historialPrevio = (historial || []).map((m) =>
      m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content),
    );

    const resultado = await agent.invoke({
      messages: [...historialPrevio, new HumanMessage(mensaje)],
    });

    const ultimoMensaje = resultado.messages[resultado.messages.length - 1];
    const output =
      typeof ultimoMensaje.content === "string"
        ? ultimoMensaje.content
        : JSON.stringify(ultimoMensaje.content);

    res.json({ output });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Error interno" });
  }
};

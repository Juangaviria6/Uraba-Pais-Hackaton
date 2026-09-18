// Contenido fijo de la seccion publica, tomado de la Narrativa del proyecto
// y la Guia para participantes (documentos oficiales del reto URABA-PAIS).
// No son datos que vengan de Firestore: son el contexto institucional del
// proyecto, distinto de los indicadores en vivo del tablero interno.

export const RESUMEN_PROYECTO = {
  meta_personas: 11447,
  duracion: "20 meses",
  municipios: ["Apartadó", "Turbo", "Necoclí"],
  lider: "COOPI Cooperación Internacional",
  aliados: ["Fondazione L'Albero della Vita (FADV)", "Fundación HIAS Colombia", "Humanity and Inclusion (HI)"],
  mision:
    "Urabá es un territorio de oportunidades, diversidad y fuerza comunitaria, que también enfrenta desafíos " +
    "asociados con el conflicto armado, el desplazamiento forzado, la migración, la desigualdad, el desempleo y " +
    "las barreras de acceso a servicios. En Apartadó, Turbo y Necoclí conviven comunidades locales, personas " +
    "migrantes, refugiadas, desplazadas y víctimas del conflicto que requieren respuestas coordinadas y " +
    "respetuosas de sus derechos.",
  objetivo:
    "Garantizar asistencia humanitaria, mejorar el acceso a servicios de salud y acompañar iniciativas de " +
    "integración socioeconómica y cohesión social entre población refugiada, migrante, víctima del conflicto " +
    "armado, desplazada y comunidades locales de acogida en el Urabá antioqueño, con especial atención a " +
    "mujeres, jóvenes, niñas, niños y personas con discapacidad.",
};

export type LineaTrabajo = {
  id: string;
  nombre: string;
  alcance: string;
  ejemplos: string;
};

// El nombre debe calzar exactamente con el campo linea_trabajo que ya
// guardan los programas reales en Firestore, para poder agrupar los
// programas en vivo bajo cada linea.
export const LINEAS_TRABAJO: LineaTrabajo[] = [
  {
    id: "humanitaria",
    nombre: "Asistencia humanitaria y protección",
    alcance: "Aproximadamente 6.700 personas",
    ejemplos: "Ayudas, atención y orientación frente a necesidades urgentes.",
  },
  {
    id: "salud",
    nombre: "Salud y bienestar",
    alcance: "Aproximadamente 2.911 personas",
    ejemplos: "Salud, salud mental, apoyo psicosocial y salud sexual y reproductiva.",
  },
  {
    id: "socioeconomica",
    nombre: "Integración socioeconómica y cohesión social",
    alcance: "Aproximadamente 1.836 personas",
    ejemplos: "Formación, empleabilidad, emprendimiento, inclusión y fortalecimiento comunitario.",
  },
];

export const IMPACTO_ESPERADO = [
  "Necesidades humanitarias atendidas con dignidad, seguridad y pertinencia.",
  "Mayor acceso a salud, apoyo psicosocial y rutas de protección.",
  "Más capacidades para el empleo, el emprendimiento y la generación de ingresos.",
  "Mayor cohesión social entre población migrante, refugiada, desplazada y comunidades de acogida.",
  "Información consolidada para el seguimiento y la toma de decisiones.",
];

export const RUTA_ORIENTACION = [
  {
    paso: "1. Acércate a un punto de atención",
    detalle:
      "En Apartadó, Turbo o Necoclí, acércate al equipo de URABÁ-PAÍS más cercano para contar tu situación y " +
      "lo que necesitas.",
  },
  {
    paso: "2. Recibe orientación",
    detalle:
      "Un profesional te escucha y te orienta hacia la línea de trabajo que mejor responde a tu necesidad: " +
      "asistencia humanitaria, salud y bienestar, o integración socioeconómica.",
  },
  {
    paso: "3. Vinculación a un programa",
    detalle:
      "Si tu caso aplica, quedas registrado con un código interno único y vinculado al programa " +
      "correspondiente, sin duplicar tu información si ya habías sido atendido antes.",
  },
  {
    paso: "4. Seguimiento",
    detalle:
      "El equipo da seguimiento a tu caso, registra avances y próximos contactos, para que el acompañamiento " +
      "no se pierda entre una atención y otra.",
  },
];

// Canal de ejemplo: los documentos del reto piden usar unicamente
// informacion ficticia o anonimizada, asi que este dato es ilustrativo para
// la demostracion y debe reemplazarse por un canal real antes de cualquier
// uso en producción.
export const CONTACTO_EJEMPLO = {
  correo: "contacto@urabapais.ejemplo.co",
  nota: "Canal de contacto de ejemplo para esta demostración (dato ficticio, no operativo).",
};

export type Organizacion = {
  id: string;
  nombre: string;
  logo: string;
};

// Mismas organizaciones financiadoras/ejecutoras que ya aparecen en el pie
// institucional (PieInstitucional.tsx) -- Urabá País es el proyecto en si,
// no una de ellas, asi que no aparece en esta lista.
export const ORGANIZACIONES: Organizacion[] = [
  { id: "aics", nombre: "AICS - Agenzia Italiana per la Cooperazione allo Sviluppo", logo: "/logos/aics.png" },
  { id: "ambasciata", nombre: "Ambasciata d'Italia", logo: "/logos/ambasciata.jpg" },
  { id: "coopi", nombre: "COOPI - Cooperazione Internazionale", logo: "/logos/coopi.png" },
  { id: "albero-della-vita", nombre: "l'Albero della Vita", logo: "/logos/albero-della-vita.png" },
  { id: "hias", nombre: "HIAS Colombia", logo: "/logos/hias.png" },
  { id: "humanity-inclusion", nombre: "Humanity & Inclusion", logo: "/logos/humanity-inclusion.png" },
];

const CLAVE_ORGANIZACION_ELEGIDA = "uraba-pais:organizacion-reporte";

export function leerOrganizacionElegida(): Organizacion {
  const id = localStorage.getItem(CLAVE_ORGANIZACION_ELEGIDA);
  return ORGANIZACIONES.find((o) => o.id === id) ?? ORGANIZACIONES[0];
}

export function guardarOrganizacionElegida(id: string) {
  localStorage.setItem(CLAVE_ORGANIZACION_ELEGIDA, id);
}

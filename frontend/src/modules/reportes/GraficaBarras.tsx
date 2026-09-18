export type DatoBarra = { etiqueta: string; valor: number };

// Paleta validada (dataviz): un solo hue categorico (slot 1, azul) porque
// esto es una unica serie nominal -- cada barra es un programa distinto,
// no una progresion, asi que todas comparten el mismo color de identidad.
const COLOR_BARRA = "#2a78d6";
const TINTA_SECUNDARIA = "#52514e";
const TINTA_MUTED = "#898781";

const ALTO_ETIQUETA = 18;
const ALTO_BARRA = 20;
const ESPACIO_FILA = 16;
const ALTO_FILA = ALTO_ETIQUETA + ALTO_BARRA + ESPACIO_FILA;
const ANCHO_LIENZO = 640;
const MARGEN_VALOR = 40;

// Redondea solo el extremo del dato (derecha); la base (el cero) queda
// cuadrada, como pide la especificacion de marcas del skill de dataviz.
function trazarBarra(x: number, y: number, ancho: number, alto: number, radio: number) {
  if (ancho <= 0) return "";
  const r = Math.max(0, Math.min(radio, ancho / 2, alto / 2));
  return `M${x},${y} H${x + ancho - r} Q${x + ancho},${y} ${x + ancho},${y + r} V${y + alto - r} Q${x + ancho},${y + alto} ${x + ancho - r},${y + alto} H${x} Z`;
}

export function construirSvgBarras(datos: DatoBarra[], titulo: string): SVGSVGElement {
  const contenedor = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  const ordenados = [...datos].sort((a, b) => b.valor - a.valor);
  const maximo = Math.max(1, ...ordenados.map((d) => d.valor));
  const anchoUtil = ANCHO_LIENZO - MARGEN_VALOR;
  const alto = Math.max(1, ordenados.length * ALTO_FILA - ESPACIO_FILA);

  contenedor.setAttribute("viewBox", `0 0 ${ANCHO_LIENZO} ${alto}`);
  contenedor.setAttribute("width", String(ANCHO_LIENZO));
  contenedor.setAttribute("height", String(alto));
  contenedor.setAttribute("role", "img");
  contenedor.setAttribute("aria-label", titulo);
  contenedor.style.fontFamily = 'system-ui, -apple-system, "Segoe UI", sans-serif';

  ordenados.forEach((d, i) => {
    const y = i * ALTO_FILA;
    const anchoBarra = maximo > 0 ? (d.valor / maximo) * anchoUtil : 0;

    const grupo = document.createElementNS("http://www.w3.org/2000/svg", "g");
    grupo.setAttribute("tabindex", "0");
    grupo.setAttribute("aria-label", `${d.etiqueta}: ${d.valor}`);
    grupo.setAttribute("class", "grafica-barras__fila");

    const titulo_ = document.createElementNS("http://www.w3.org/2000/svg", "title");
    titulo_.textContent = `${d.etiqueta}: ${d.valor}`;
    grupo.appendChild(titulo_);

    const etiqueta = document.createElementNS("http://www.w3.org/2000/svg", "text");
    etiqueta.setAttribute("x", "0");
    etiqueta.setAttribute("y", String(y + 12));
    etiqueta.setAttribute("font-size", "12");
    etiqueta.setAttribute("fill", TINTA_SECUNDARIA);
    etiqueta.textContent = d.etiqueta;
    grupo.appendChild(etiqueta);

    const barra = document.createElementNS("http://www.w3.org/2000/svg", "path");
    barra.setAttribute("d", trazarBarra(0, y + ALTO_ETIQUETA, Math.max(anchoBarra, 2), ALTO_BARRA, 4));
    barra.setAttribute("fill", COLOR_BARRA);
    barra.setAttribute("class", "grafica-barras__barra");
    grupo.appendChild(barra);

    const valor = document.createElementNS("http://www.w3.org/2000/svg", "text");
    valor.setAttribute("x", String(Math.max(anchoBarra, 2) + 8));
    valor.setAttribute("y", String(y + ALTO_ETIQUETA + ALTO_BARRA / 2 + 4));
    valor.setAttribute("font-size", "12");
    valor.setAttribute("fill", TINTA_MUTED);
    valor.textContent = String(d.valor);
    grupo.appendChild(valor);

    contenedor.appendChild(grupo);
  });

  return contenedor;
}

// Componente React: monta el mismo SVG que se reutiliza para el PDF, para
// que lo que se ve en pantalla y lo que se exporta sean identicos.
export function GraficaBarras({ datos, titulo }: { datos: DatoBarra[]; titulo: string }) {
  return (
    <div
      style={{ maxWidth: ANCHO_LIENZO, width: "100%" }}
      ref={(contenedorDiv) => {
        if (!contenedorDiv) return;
        contenedorDiv.innerHTML = "";
        const svg = construirSvgBarras(datos, titulo);
        svg.style.width = "100%";
        svg.style.height = "auto";
        svg.style.display = "block";
        contenedorDiv.appendChild(svg);
      }}
    />
  );
}

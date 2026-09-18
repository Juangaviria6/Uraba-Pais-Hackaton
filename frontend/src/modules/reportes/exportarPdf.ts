import { jsPDF } from "jspdf";
import "svg2pdf.js";
import type { Indicadores } from "./types";
import type { Organizacion } from "./organizaciones";
import { construirSvgBarras } from "./GraficaBarras";

function cargarImagen(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar el logo: ${src}`));
    img.src = src;
  });
}

function formatoImagen(src: string): "PNG" | "JPEG" {
  return /\.jpe?g$/i.test(src) ? "JPEG" : "PNG";
}

const MARGEN = 40;
const COLOR_AZUL = "#1d4e89";
const COLOR_AZUL_OSCURO = "#163c68";
const COLOR_VERDE = "#236940";
const COLOR_AMBAR = "#9a6a00";
const COLOR_TINTA = "#0b0b0b";
const COLOR_TINTA_SECUNDARIA = "#52514e";
const COLOR_BORDE = "#dbe3df";
const COLOR_BLANCO = "#ffffff";

type Tile = { valor: number; etiqueta: string; color: string };

function dibujarBandaEncabezado(doc: jsPDF, anchoPagina: number, organizacion: Organizacion, logo: HTMLImageElement | null) {
  const altoBanda = 92;
  doc.setFillColor(COLOR_AZUL_OSCURO);
  doc.rect(0, 0, anchoPagina, altoBanda, "F");
  doc.setFillColor(COLOR_AZUL);
  doc.rect(0, 0, anchoPagina, altoBanda - 6, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(COLOR_BLANCO);
  doc.text("Tablero de indicadores", MARGEN, 42);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(230, 236, 244);
  const fecha = new Date().toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });
  doc.text(`Urabá País · corte al ${fecha}`, MARGEN, 60);

  if (logo) {
    const altoCaja = 48;
    const anchoCajaMax = 150;
    const [anchoImg, altoImg] = ajustarContenida(anchoCajaMax - 20, altoCaja - 16, logo.naturalWidth / logo.naturalHeight);
    const anchoCaja = anchoImg + 20;

    const xCaja = anchoPagina - MARGEN - anchoCaja;
    const yCaja = (altoBanda - 6 - altoCaja) / 2;

    doc.setFillColor(COLOR_BLANCO);
    doc.roundedRect(xCaja, yCaja, anchoCaja, altoCaja, 6, 6, "F");
    doc.addImage(
      logo,
      formatoImagen(organizacion.logo),
      xCaja + (anchoCaja - anchoImg) / 2,
      yCaja + (altoCaja - altoImg) / 2,
      anchoImg,
      altoImg,
    );
  }

  return altoBanda;
}

// Ajusta un rectangulo (manteniendo su proporcion) para que quepa dentro del
// espacio disponible sin deformarse, sea el logo ancho (banner) o cuadrado.
function ajustarContenida(anchoDisponible: number, altoDisponible: number, proporcion: number): [number, number] {
  let ancho = anchoDisponible;
  let alto = ancho / proporcion;
  if (alto > altoDisponible) {
    alto = altoDisponible;
    ancho = alto * proporcion;
  }
  return [ancho, alto];
}

function dibujarTiles(doc: jsPDF, y: number, anchoUtil: number, tiles: Tile[]) {
  const espacio = 16;
  const anchoTile = (anchoUtil - espacio * (tiles.length - 1)) / tiles.length;
  const altoTile = 62;

  tiles.forEach((tile, i) => {
    const x = MARGEN + i * (anchoTile + espacio);

    doc.setFillColor(COLOR_BLANCO);
    doc.setDrawColor(COLOR_BORDE);
    doc.roundedRect(x, y, anchoTile, altoTile, 6, 6, "FD");

    // Acento de color a la izquierda de cada tile, igual que en pantalla.
    doc.setFillColor(tile.color);
    doc.rect(x + 1, y + 1, 4, altoTile - 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(COLOR_TINTA);
    doc.text(String(tile.valor), x + 18, y + 30);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(COLOR_TINTA_SECUNDARIA);
    doc.text(tile.etiqueta, x + 18, y + 46, { maxWidth: anchoTile - 30 });
  });

  return y + altoTile;
}

export async function exportarIndicadoresPdf(indicadores: Indicadores, organizacion: Organizacion) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const anchoUtil = anchoPagina - MARGEN * 2;

  let logo: HTMLImageElement | null = null;
  try {
    logo = await cargarImagen(organizacion.logo);
  } catch {
    // Sin el logo se sigue igual: el reporte no depende de que cargue.
  }

  const altoBanda = dibujarBandaEncabezado(doc, anchoPagina, organizacion, logo);
  let y = altoBanda + 32;

  const tiles: Tile[] = [
    { valor: indicadores.beneficiarios_unicos, etiqueta: "Beneficiarios únicos", color: COLOR_VERDE },
    { valor: indicadores.atenciones_registradas, etiqueta: "Atenciones/ayudas registradas", color: COLOR_AZUL },
    { valor: indicadores.seguimientos_pendientes, etiqueta: "Seguimientos con acción pendiente", color: COLOR_AMBAR },
  ];
  y = dibujarTiles(doc, y, anchoUtil, tiles) + 34;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(COLOR_TINTA);
  doc.text("Participaciones por programa", MARGEN, y);
  doc.setDrawColor(COLOR_AZUL);
  doc.setLineWidth(2);
  doc.line(MARGEN, y + 6, MARGEN + 46, y + 6);
  y += 26;

  const datosPrograma = Object.entries(indicadores.participaciones_por_programa).map(([nombre, total]) => ({
    etiqueta: nombre,
    valor: total,
  }));

  if (datosPrograma.length > 0) {
    // svg2pdf necesita medir el texto, y eso solo funciona de forma
    // confiable si el nodo esta realmente en el documento (no uno
    // desconectado). Se monta fuera de pantalla y se retira al terminar.
    const svg = construirSvgBarras(datosPrograma, "Participaciones por programa");
    const anchoSvg = Number(svg.getAttribute("width"));
    const altoSvg = Number(svg.getAttribute("height"));

    const contenedorTemporal = document.createElement("div");
    contenedorTemporal.style.position = "fixed";
    contenedorTemporal.style.left = "-9999px";
    contenedorTemporal.style.top = "0";
    contenedorTemporal.appendChild(svg);
    document.body.appendChild(contenedorTemporal);

    try {
      const anchoDestino = anchoUtil;
      const altoDestino = (altoSvg / anchoSvg) * anchoDestino;
      await doc.svg(svg, { x: MARGEN, y, width: anchoDestino, height: altoDestino });
    } finally {
      document.body.removeChild(contenedorTemporal);
    }
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(COLOR_TINTA_SECUNDARIA);
    doc.text("Sin participaciones registradas todavia.", MARGEN, y + 10);
  }

  doc.setDrawColor(COLOR_BORDE);
  doc.setLineWidth(1);
  doc.line(MARGEN, altoPagina - 48, anchoPagina - MARGEN, altoPagina - 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(COLOR_TINTA_SECUNDARIA);
  doc.text(
    "Indicadores generados automáticamente a partir de la información registrada en el sistema · datos agregados, sin información personal identificable.",
    anchoPagina / 2,
    altoPagina - 32,
    { align: "center", maxWidth: anchoUtil },
  );
  doc.text(organizacion.nombre, anchoPagina / 2, altoPagina - 20, { align: "center" });

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  doc.save(`indicadores-uraba-pais-${fechaArchivo}.pdf`);
}

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Ficha } from "../modules/reportes/types";
import type { Beneficiario } from "../modules/beneficiarios/types";

// Todo lo que necesita el modo sin conexion: la ultima version conocida de
// cada ficha (para poder buscar/ver beneficiarios sin internet) y una cola de
// operaciones que quedaron pendientes de enviar al servidor.

export type TipoOperacionPendiente = "crear_beneficiario" | "atencion" | "seguimiento";

export type OperacionPendiente = {
  id: string;
  tipo: TipoOperacionPendiente;
  // id real del beneficiario, o "local-..." si depende de una creacion de
  // beneficiario que todavia no se ha sincronizado.
  beneficiarioId: string;
  payload: unknown;
  creadoEn: number;
  intentos: number;
  error?: string;
};

type FichaEnCache = Ficha & { _sincronizado: boolean; _claveDocumento: string };

interface OfflineSchema extends DBSchema {
  fichas: {
    key: string;
    value: FichaEnCache;
    indexes: { "por-documento": string };
  };
  cola: {
    key: string;
    value: OperacionPendiente;
  };
}

let dbPromise: Promise<IDBPDatabase<OfflineSchema>> | null = null;

function getDb() {
  if (!dbPromise) {
    dbPromise = openDB<OfflineSchema>("uraba-pais-offline", 1, {
      upgrade(db) {
        const fichas = db.createObjectStore("fichas", { keyPath: "id" });
        fichas.createIndex("por-documento", "_claveDocumento");
        db.createObjectStore("cola", { keyPath: "id" });
      },
    });
  }
  return dbPromise;
}

function claveDocumento(tipo_documento: string, numero_documento: string | null) {
  return `${tipo_documento}::${numero_documento ?? ""}`;
}

export function generarIdLocal(prefijo = "local") {
  return `${prefijo}-${crypto.randomUUID()}`;
}

function quitarCamposInternos(ficha: FichaEnCache): Ficha {
  const { _sincronizado, _claveDocumento, ...resto } = ficha;
  return resto;
}

// Guarda solo los campos "base" del beneficiario (los que trae una busqueda o
// una creacion), sin pisar familiares/participaciones/atenciones/seguimientos
// que ya estuvieran cacheados por una consulta de ficha completa anterior.
export async function guardarBeneficiarioBaseEnCache(beneficiario: Beneficiario) {
  const db = await getDb();
  const existente = await db.get("fichas", beneficiario.id);
  const listas = existente
    ? {
        familiares: existente.familiares,
        participaciones: existente.participaciones,
        atenciones: existente.atenciones,
        seguimientos: existente.seguimientos,
      }
    : { familiares: [], participaciones: [], atenciones: [], seguimientos: [] };

  await db.put("fichas", {
    ...listas,
    ...beneficiario,
    _sincronizado: true,
    _claveDocumento: claveDocumento(beneficiario.tipo_documento, beneficiario.numero_documento),
  });
}

// Guarda la ficha completa (como llega del endpoint /ficha), reemplazando
// cualquier version anterior en cache.
export async function guardarFichaCompletaEnCache(ficha: Ficha) {
  const db = await getDb();
  await db.put("fichas", {
    ...ficha,
    _sincronizado: true,
    _claveDocumento: claveDocumento(ficha.tipo_documento, ficha.numero_documento),
  });
}

export async function obtenerFichaDeCache(id: string): Promise<Ficha | undefined> {
  const db = await getDb();
  const encontrada = await db.get("fichas", id);
  return encontrada ? quitarCamposInternos(encontrada) : undefined;
}

export async function buscarFichaPorDocumentoEnCache(
  tipo_documento: string,
  numero_documento: string,
): Promise<Ficha | undefined> {
  const db = await getDb();
  const encontrada = await db.getFromIndex("fichas", "por-documento", claveDocumento(tipo_documento, numero_documento));
  return encontrada ? quitarCamposInternos(encontrada) : undefined;
}

export async function listarFichasSinDocumentoEnCache(): Promise<Ficha[]> {
  const db = await getDb();
  const todas = await db.getAll("fichas");
  return todas.filter((f) => f.tipo_documento === "SIN_DOCUMENTO").map(quitarCamposInternos);
}

// Mueve una ficha cacheada bajo un id local a su id real definitivo, una vez
// el servidor confirmo la creacion del beneficiario.
export async function renombrarFichaEnCache(idViejo: string, idNuevo: string) {
  const db = await getDb();
  const ficha = await db.get("fichas", idViejo);
  if (!ficha) return;
  await db.put("fichas", { ...ficha, id: idNuevo, _sincronizado: true });
  await db.delete("fichas", idViejo);
}

export async function agregarOperacionPendiente(
  datos: Pick<OperacionPendiente, "tipo" | "beneficiarioId" | "payload">,
): Promise<OperacionPendiente> {
  const db = await getDb();
  const operacion: OperacionPendiente = {
    id: generarIdLocal("op"),
    creadoEn: Date.now(),
    intentos: 0,
    ...datos,
  };
  await db.put("cola", operacion);
  return operacion;
}

export async function listarOperacionesPendientes(): Promise<OperacionPendiente[]> {
  const db = await getDb();
  const todas = await db.getAll("cola");
  return todas.sort((a, b) => a.creadoEn - b.creadoEn);
}

export async function listarOperacionesPendientesPorBeneficiario(beneficiarioId: string) {
  const todas = await listarOperacionesPendientes();
  return todas.filter((op) => op.beneficiarioId === beneficiarioId);
}

export async function actualizarOperacionPendiente(id: string, cambios: Partial<OperacionPendiente>) {
  const db = await getDb();
  const existente = await db.get("cola", id);
  if (!existente) return;
  await db.put("cola", { ...existente, ...cambios });
}

export async function eliminarOperacionPendiente(id: string) {
  const db = await getDb();
  await db.delete("cola", id);
}

// Al sincronizar la creacion de un beneficiario que estaba con id local, las
// demas operaciones en cola que dependian de ese id (atenciones,
// seguimientos) deben apuntar ya al id real.
export async function reemplazarBeneficiarioIdEnOperaciones(idViejo: string, idNuevo: string) {
  const db = await getDb();
  const todas = await db.getAll("cola");
  for (const op of todas) {
    if (op.beneficiarioId === idViejo) {
      await db.put("cola", { ...op, beneficiarioId: idNuevo });
    }
  }
}

export async function contarOperacionesPendientes(): Promise<number> {
  const db = await getDb();
  return db.count("cola");
}

// Operaciones que el servidor ya rechazo (error de validacion, no de red):
// reintentar solas no las va a arreglar, alguien tiene que revisarlas.
export async function listarOperacionesConError(): Promise<OperacionPendiente[]> {
  const todas = await listarOperacionesPendientes();
  return todas.filter((op) => Boolean(op.error));
}

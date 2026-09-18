import { ApiError } from "../../lib/apiClient";
import {
  agregarOperacionPendiente,
  buscarFichaPorDocumentoEnCache,
  generarIdLocal,
  guardarBeneficiarioBaseEnCache,
  listarFichasSinDocumentoEnCache,
} from "../../lib/offlineStore";
import { buscarBeneficiario, crearBeneficiario } from "./api";
import type { Beneficiario, BeneficiarioSinDocumento, NuevoBeneficiario } from "./types";

function esErrorDeRed(err: unknown) {
  return !(err instanceof ApiError);
}

export type ResultadoBusquedaOffline =
  | { encontrado: true; beneficiario: Beneficiario; _sinConexion?: boolean }
  | { encontrado: false; _sinConexion?: boolean };

export async function buscarBeneficiarioOffline(
  tipo_documento: string,
  numero_documento: string,
): Promise<ResultadoBusquedaOffline> {
  try {
    const resultado = await buscarBeneficiario(tipo_documento, numero_documento);
    if (resultado.encontrado) {
      await guardarBeneficiarioBaseEnCache(resultado.beneficiario);
    }
    return resultado;
  } catch (err) {
    if (!esErrorDeRed(err)) throw err;

    const enCache = await buscarFichaPorDocumentoEnCache(tipo_documento, numero_documento);
    if (enCache) {
      return { encontrado: true, beneficiario: enCache, _sinConexion: true };
    }

    // Sin conexion y sin nada cacheado para este documento: no hay forma de
    // saber si ya existe en el servidor. Se deja seguir el flujo normal de
    // "no existe, registrar nuevo" en vez de bloquear con un error — si en
    // realidad si existia, el servidor lo detecta como duplicado al
    // sincronizar y queda visible para revisar (ver EstadoConexion).
    return { encontrado: false, _sinConexion: true };
  }
}

export type BeneficiarioCreado = Beneficiario & { _pendienteSincronizacion?: boolean };

export async function crearBeneficiarioOffline(datos: NuevoBeneficiario): Promise<BeneficiarioCreado> {
  try {
    const creado = await crearBeneficiario(datos);
    await guardarBeneficiarioBaseEnCache(creado);
    return creado;
  } catch (err) {
    if (!esErrorDeRed(err)) throw err;

    const idLocal = generarIdLocal();
    const beneficiarioLocal: Beneficiario = { ...datos, id: idLocal };
    await guardarBeneficiarioBaseEnCache(beneficiarioLocal);
    await agregarOperacionPendiente({ tipo: "crear_beneficiario", beneficiarioId: idLocal, payload: datos });

    return { ...beneficiarioLocal, _pendienteSincronizacion: true };
  }
}

// No hay endpoint de servidor para esto sin conexion (requeriria red): se
// intenta siempre online y, si falla por red, se ofrece lo que ya se tenga
// cacheado localmente de sesiones anteriores.
export async function listarBeneficiariosSinDocumentoOffline(
  listarEnLinea: () => Promise<BeneficiarioSinDocumento[]>,
): Promise<{ lista: BeneficiarioSinDocumento[]; _sinConexion?: boolean }> {
  try {
    const lista = await listarEnLinea();
    return { lista };
  } catch (err) {
    if (!esErrorDeRed(err)) throw err;

    const fichas = await listarFichasSinDocumentoEnCache();
    return {
      lista: fichas.map((f) => ({ id: f.id, nombres: f.nombres, municipio: f.municipio })),
      _sinConexion: true,
    };
  }
}

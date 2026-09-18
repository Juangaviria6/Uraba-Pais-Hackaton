import { ApiError } from "../../lib/apiClient";
import { guardarFichaCompletaEnCache, obtenerFichaDeCache } from "../../lib/offlineStore";
import { obtenerFicha } from "./api";
import type { Ficha } from "./types";

function esErrorDeRed(err: unknown) {
  return !(err instanceof ApiError);
}

export type FichaOffline = Ficha & { _sinConexion?: boolean };

export async function obtenerFichaOffline(id: string): Promise<FichaOffline> {
  // Un beneficiario creado sin conexion (id "local-...") nunca ha existido
  // en el servidor, asi que su unica fuente de datos es la cache local.
  if (id.startsWith("local-")) {
    const enCache = await obtenerFichaDeCache(id);
    if (!enCache) {
      throw new Error("Este beneficiario todavia no se ha sincronizado y no hay datos guardados localmente");
    }
    return { ...enCache, _sinConexion: true };
  }

  try {
    const ficha = await obtenerFicha(id);
    await guardarFichaCompletaEnCache(ficha);
    return ficha;
  } catch (err) {
    if (!esErrorDeRed(err)) throw err;

    const enCache = await obtenerFichaDeCache(id);
    if (enCache) {
      return { ...enCache, _sinConexion: true };
    }
    throw err;
  }
}

import type { Beneficiario, Familiar } from "../beneficiarios/types";
import type { Participacion } from "../participacion/types";
import type { Atencion, Seguimiento } from "../atencionSeguimiento/types";

export type Ficha = Beneficiario & {
  familiares: Familiar[];
  participaciones: Participacion[];
  atenciones: Atencion[];
  seguimientos: Seguimiento[];
};

export type Indicadores = {
  beneficiarios_unicos: number;
  participaciones_por_programa: Record<string, number>;
  atenciones_registradas: number;
  seguimientos_pendientes: number;
};

export type EstadoParticipacion = "inscrito" | "en_proceso" | "finalizado" | "retirado";

export type Programa = {
  id: string;
  nombre: string;
  linea_trabajo: string | null;
};

export type Participacion = {
  id: string;
  programa_id: string;
  organizacion: string | null;
  fecha_vinculacion: string | null;
  estado: EstadoParticipacion;
};

export type NuevaParticipacion = {
  programa_id: string;
  organizacion: string;
  fecha_vinculacion: string;
  estado: EstadoParticipacion;
};

export const ESTADOS_PARTICIPACION: EstadoParticipacion[] = [
  "inscrito",
  "en_proceso",
  "finalizado",
  "retirado",
];

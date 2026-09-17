export type TipoAtencion = "Ayuda" | "Atención";

export type Atencion = {
  id: string;
  tipo: TipoAtencion;
  fecha: string;
  descripcion: string;
  responsable: string | null;
  resultado: string | null;
};

export type NuevaAtencion = Omit<Atencion, "id">;

export type Seguimiento = {
  id: string;
  fecha: string;
  avance_novedad: string;
  observacion: string | null;
  accion_pendiente: string | null;
  proximo_contacto: string | null;
};

export type NuevoSeguimiento = Omit<Seguimiento, "id">;

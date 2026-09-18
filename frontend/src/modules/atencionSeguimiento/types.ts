export type TipoAtencion = "Ayuda" | "Atención";

export type Atencion = {
  id: string;
  tipo: TipoAtencion;
  fecha: string;
  descripcion: string;
  responsable: string | null;
  resultado: string | null;
  // URLs de Cloudinary. Ausente/vacio hasta que se adjunte la primera foto.
  evidencias?: string[];
};

export type NuevaAtencion = Omit<Atencion, "id" | "evidencias">;

export type Seguimiento = {
  id: string;
  fecha: string;
  avance_novedad: string;
  observacion: string | null;
  accion_pendiente: string | null;
  proximo_contacto: string | null;
  evidencias?: string[];
};

export type NuevoSeguimiento = Omit<Seguimiento, "id" | "evidencias">;

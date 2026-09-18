export type Beneficiario = {
  id: string;
  codigo_interno?: string;
  tipo_documento: string;
  numero_documento: string;
  nombres: string;
  sexo: string | null;
  edad: number | null;
  municipio: string | null;
  zona: string | null;
  contacto: string | null;
  nacionalidad: string | null;
  tipo_poblacion: string | null;
  autorizacion_datos: boolean;
  fecha_autorizacion: string | null;
  lat: number | null;
  lng: number | null;
};

export type Familiar = {
  id: string;
  nombres: string;
  parentesco: string;
  fecha_nacimiento: string | null;
};

export type NuevoBeneficiario = Omit<Beneficiario, "id" | "codigo_interno">;
export type NuevoFamiliar = Omit<Familiar, "id">;

export type BeneficiarioSinDocumento = {
  id: string;
  nombres: string;
  municipio: string | null;
};

export function Cargando({ texto = "Cargando..." }: { texto?: string }) {
  return <p className="texto-secundario">{texto}</p>;
}

export function MensajeError({ texto }: { texto: string }) {
  return <div className="mensaje-error">{texto}</div>;
}

export function MensajeExito({ texto }: { texto: string }) {
  return <div className="mensaje-exito">{texto}</div>;
}

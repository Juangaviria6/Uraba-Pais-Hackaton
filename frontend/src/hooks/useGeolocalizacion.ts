import { useState } from "react";

type Coordenadas = { lat: number; lng: number };

export function useGeolocalizacion() {
  const [coordenadas, setCoordenadas] = useState<Coordenadas | null>(null);
  const [obteniendo, setObteniendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function obtenerUbicacion() {
    if (!navigator.geolocation) {
      setError("Este navegador no soporta geolocalizacion");
      return;
    }
    setObteniendo(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordenadas({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setObteniendo(false);
      },
      (err) => {
        setError(err.message || "No se pudo obtener la ubicacion");
        setObteniendo(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return { coordenadas, obteniendo, error, obtenerUbicacion };
}
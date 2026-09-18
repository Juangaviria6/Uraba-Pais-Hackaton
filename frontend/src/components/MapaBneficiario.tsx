import { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

setOptions({
  key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  v: "weekly",
});

export function MapaBeneficiario({ lat, lng }: { lat: number; lng: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelado = false;

    (async () => {
      const { Map } = (await importLibrary("maps")) as google.maps.MapsLibrary;
      const { Marker } = (await importLibrary("marker")) as google.maps.MarkerLibrary;

      if (cancelado || !ref.current) return;

      const mapa = new Map(ref.current, { center: { lat, lng }, zoom: 14 });
      new Marker({ position: { lat, lng }, map: mapa });
    })();

    return () => {
      cancelado = true;
    };
  }, [lat, lng]);

  return <div ref={ref} style={{ height: 300, borderRadius: 8 }} />;
}
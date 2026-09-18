import { useEffect, useState } from "react";

// Anima un numero de 0 hasta su valor final (ease-out), para que las cifras
// del tablero y la pagina publica se sientan vivas en vez de aparecer
// planas de golpe. Respeta prefers-reduced-motion.
export function useContador(valorFinal: number, duracionMs = 900) {
  const [valor, setValor] = useState(0);

  useEffect(() => {
    const prefiereMenosMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefiereMenosMovimiento) {
      setValor(valorFinal);
      return;
    }

    let idAnimacion: number;
    const inicio = performance.now();

    function animar(ahora: number) {
      const progreso = Math.min(1, (ahora - inicio) / duracionMs);
      const facilitado = 1 - Math.pow(1 - progreso, 3);
      setValor(Math.round(valorFinal * facilitado));
      if (progreso < 1) {
        idAnimacion = requestAnimationFrame(animar);
      }
    }

    idAnimacion = requestAnimationFrame(animar);
    return () => cancelAnimationFrame(idAnimacion);
  }, [valorFinal, duracionMs]);

  return valor;
}

export function formatearMiles(n: number) {
  return n.toLocaleString("es-CO");
}

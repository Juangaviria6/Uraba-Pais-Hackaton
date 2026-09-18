import type { SVGProps } from "react";

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconoEscudo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3.2 5 5.6v5.1c0 4.6 3 8.1 7 9.9 4-1.8 7-5.3 7-9.9V5.6z" />
      <path d="M9 12.1 11.2 14.3 15.3 9.9" />
    </svg>
  );
}

export function IconoCorazon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 20.2s-7-4.3-9.1-8.7C1.2 8.4 3 5.3 6 5c1.9-.2 3.5.8 4.6 2.1 1.1-1.3 2.7-2.3 4.6-2.1 3 .3 4.8 3.4 3.1 6.7-2.1 4.4-6.1 8.6-6.1 8.6z" />
    </svg>
  );
}

export function IconoManos(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="8.5" cy="7.2" r="2.9" />
      <path d="M2.8 19.4c0-3.1 2.5-5.6 5.7-5.6s5.7 2.5 5.7 5.6" />
      <path d="M15 4.3c1.5.4 2.6 1.8 2.6 3.4 0 1.7-1.2 3.1-2.8 3.4" />
      <path d="M14.6 13.9c2.5.4 4.4 2.6 4.4 5.5" />
    </svg>
  );
}

export function IconoBrujula(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="8.6" />
      <path d="m14.6 9.4-1.5 4.2-4.2 1.5 1.5-4.2z" />
    </svg>
  );
}

export function IconoCorreo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3" y="5.3" width="18" height="13.4" rx="2.2" />
      <path d="m3.6 6.3 8.4 6.3 8.4-6.3" />
    </svg>
  );
}

export function IconoMapaPin(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 21s6.5-6.1 6.5-11.2a6.5 6.5 0 1 0-13 0C5.5 14.9 12 21 12 21z" />
      <circle cx="12" cy="9.7" r="2.3" />
    </svg>
  );
}

export function IconoCalendario(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3.3" y="4.8" width="17.4" height="15.4" rx="2.2" />
      <path d="M3.3 9.6h17.4M8 3v3.4M16 3v3.4" />
    </svg>
  );
}

export function IconoUsuarios(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.5 14.6c2.4.4 4 2.4 4 5.4" />
    </svg>
  );
}

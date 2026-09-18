import type { SVGProps } from "react";

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconoInicio(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </svg>
  );
}

export function IconoBeneficiarios(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.5 14.6c2.4.4 4 2.4 4 5.4" />
    </svg>
  );
}

export function IconoIndicadores(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
    </svg>
  );
}

export function IconoDocumento(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 3.5h8l4 4V20a.7.7 0 0 1-.7.7H6.7a.7.7 0 0 1-.7-.7V4.2a.7.7 0 0 1 .7-.7Z" />
      <path d="M14 3.5V8h4" />
      <path d="M8.5 12h7M8.5 15.4h7M8.5 8.6h2" />
    </svg>
  );
}

export function IconoUsuarioSinDoc(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="10" cy="8" r="3.4" />
      <path d="M4 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
      <path d="M18 5.5v5M15.5 8h5" />
    </svg>
  );
}

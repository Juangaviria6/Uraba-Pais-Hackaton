import type { SVGProps } from "react";

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconoChat(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 5.5h16v10.2H9.8L5.6 19V15.7H4z" />
      <path d="M8 9.4h8M8 12.2h5" />
    </svg>
  );
}

export function IconoCerrar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconoEnviar(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4.5 12 19.5 5l-5.8 15-2.9-6.8z" />
      <path d="M19.5 5 10.8 13.3" />
    </svg>
  );
}

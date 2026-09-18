import type { SVGProps } from "react";

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconoPersonas(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.5 14.6c2.4.4 4 2.4 4 5.4" />
    </svg>
  );
}

export function IconoAyuda(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 20.5s-7-4.2-9-8.6C1.3 8.6 3 5.5 6 5.2c1.9-.2 3.4.8 4.5 2.1 1.1-1.3 2.6-2.3 4.5-2.1 3 .3 4.7 3.4 3 6.7-2 4.4-6 8.6-6 8.6z" />
    </svg>
  );
}

export function IconoReloj(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12.5" r="8" />
      <path d="M12 8.2v4.6l3.2 2" />
      <path d="M9.5 2.6h5" />
    </svg>
  );
}

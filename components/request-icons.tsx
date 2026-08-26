import type { SVGProps } from "react";

export type RequestIconName =
  | "refill"
  | "sauce"
  | "napkins"
  | "plates"
  | "check";

export function RequestIcon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: RequestIconName }) {
  const sharedProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };

  if (name === "refill") {
    return (
      <svg {...sharedProps}>
        <path d="M7 4h9l-1 16H8L7 4Z" />
        <path d="M6 8h11M10 4V2h6M12 11v5m-2.5-2.5h5" />
      </svg>
    );
  }

  if (name === "sauce") {
    return (
      <svg {...sharedProps}>
        <path d="M9 3h6v3l2 3v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V9l2-3V3Z" />
        <path d="M9 6h6M9.5 12h5v5h-5z" />
      </svg>
    );
  }

  if (name === "napkins") {
    return (
      <svg {...sharedProps}>
        <path d="M5 4h12a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2V4Z" />
        <path d="M7 20V8h12M9 12h6M9 15h4" />
      </svg>
    );
  }

  if (name === "plates") {
    return (
      <svg {...sharedProps}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
      </svg>
    );
  }

  return (
    <svg {...sharedProps}>
      <path d="M7 3h10v18l-2-1.5L13 21l-2-1.5L9 21l-2-1.5V3Z" />
      <path d="M10 8h4M10 12h4M10 16h2" />
    </svg>
  );
}

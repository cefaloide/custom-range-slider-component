import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

const VARIANTS = {
  primary: "bg-black text-white hover:bg-neutral-800 shadow-xs",
  secondary:
    "bg-white text-black border border-neutral-300 hover:bg-neutral-100 hover:border-black",
};

interface ButtonLinkProps {
  href: string;
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
}

export function ButtonLink({ href, variant = "primary", children }: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 px-5 py-3 font-medium text-sm rounded-xs transition-all ${VARIANTS[variant]}`}
    >
      <span>{children}</span>
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}

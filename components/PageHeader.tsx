import type { ReactNode } from "react";

interface PageHeaderProps {
  breadcrumb: string;
  title: string;
  children: ReactNode;
}

export function PageHeader({ breadcrumb, title, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2">
        <span>Range Slider</span>
        <span>/</span>
        <span className="text-black font-semibold">{breadcrumb}</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-black font-serif">
        {title}
      </h1>
      <p className="mt-2 text-neutral-600 text-sm sm:text-base leading-relaxed">
        {children}
      </p>
    </div>
  );
}

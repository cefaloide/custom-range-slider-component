"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/routes";

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 h-16 flex">
        <nav className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm font-medium grow">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 sm:px-3 py-1.5 rounded-sm transition-colors whitespace-nowrap ${
                  isActive
                    ? "bg-black text-white font-semibold"
                    : "text-neutral-600 hover:text-black hover:bg-neutral-100"
                }`}
              >
                {link.navLabel}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

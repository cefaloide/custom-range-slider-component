import Link from "next/link";

interface RouteRowProps {
  kind: "page" | "api";
  href: string;
  description: string;
}

export function RouteRow({ kind, href, description }: RouteRowProps) {
  const isApi = kind === "api";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 border-b border-neutral-800 gap-2">
      <div>
        <span
          className={`font-bold ${isApi ? "text-blue-400" : "text-emerald-400"}`}
        >
          {isApi ? "API" : "GET"}
        </span>{" "}
        {href}
        <span className="text-neutral-400 ml-2 font-sans text-xs">
          {description}
        </span>
      </div>
      {isApi ? (
        <a href={href} className="text-neutral-300 underline hover:text-white">
          View JSON
        </a>
      ) : (
        <Link
          href={href}
          className="text-white underline hover:text-neutral-300"
        >
          Open Route
        </Link>
      )}
    </div>
  );
}

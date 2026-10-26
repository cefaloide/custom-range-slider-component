import { ButtonLink } from "@/components/ButtonLink";
import { Container } from "@/components/Container";
import { RouteRow } from "@/components/RouteRow";
import { FIXED_RANGE_DATA, NORMAL_RANGE_DATA } from "@/lib/mock-data";
import { ROUTES } from "@/lib/routes";
import { Terminal } from "lucide-react";

const ROUTE_INDEX = [
  {
    kind: "page",
    href: ROUTES.exercise1.href,
    description: `Exercise 1: ${ROUTES.exercise1.name}`,
  },
  {
    kind: "page",
    href: ROUTES.exercise2.href,
    description: `Exercise 2: ${ROUTES.exercise2.name}`,
  },
  {
    kind: "api",
    href: "/api/normal",
    description: `Mocked HTTP service: returns { min: ${NORMAL_RANGE_DATA.min}, max: ${NORMAL_RANGE_DATA.max} }`,
  },
  {
    kind: "api",
    href: "/api/fixed",
    description: `Mocked HTTP service: returns { rangeValues: [${FIXED_RANGE_DATA.rangeValues[0]}, ...] }`,
  },
] as const;

export default function Home() {
  return (
    <Container>
      <div className="border-b border-neutral-200 pb-12 mb-12">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-black text-white text-xs font-mono uppercase tracking-widest rounded-xs mb-6">
          Component • React
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-black leading-tight max-w-3xl">
          Custom Dual-Handle Range Component
        </h1>
        <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-2xl leading-relaxed font-sans font-light">
          An accessible, non-HTML5 range slider. Featuring continuous numeric
          ranges with inline-editable labels and discrete fixed-values options.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href={ROUTES.exercise1.href}>
            View Normal Range Example
          </ButtonLink>
          <ButtonLink href={ROUTES.exercise2.href} variant="secondary">
            View Fixed Values Example
          </ButtonLink>
        </div>
      </div>
      <section className="bg-neutral-900 text-white p-6 sm:p-10 rounded-sm">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-4 h-4 text-neutral-400" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400">
            Technical Test Route Index
          </h3>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {ROUTE_INDEX.map((route) => (
            <RouteRow key={route.href} {...route} />
          ))}
        </div>
      </section>
    </Container>
  );
}

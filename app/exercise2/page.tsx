"use client";

import { Range } from "@/components/Range";
import { Container } from "@/components/Container";
import { DemoCard } from "@/components/DemoCard";
import { PageHeader } from "@/components/PageHeader";
import { useApiData } from "@/hooks/useApiData";
import { ROUTES } from "@/lib/routes";
import { useState } from "react";
import type { FixedApiResponse } from "@/types/api";

export default function Exercise2() {
  const { data, error, isLoading, retry } =
    useApiData<FixedApiResponse>("/api/fixed");

  const [rangeValue, setRangeValue] = useState<[number, number]>([5.99, 70.99]);

  return (
    <Container>
      <PageHeader
        breadcrumb={ROUTES.exercise2.name}
        title={`${ROUTES.exercise2.name} Component`}
      >
        Discrete range component restricted to exact predefined price points
        {data && (
          <>
            :{" "}
            <span className="font-mono text-black font-medium">
              [{data.rangeValues.join(", ")}]
            </span>
          </>
        )}
        . Labels are fixed read-only indicators (non-editable), with snapping
        handles that cannot cross.
      </PageHeader>
      <DemoCard isLoading={isLoading} error={error} onRetry={retry}>
        {data && (
          <Range
            mode="fixed"
            rangeValues={data.rangeValues}
            value={rangeValue}
            onChange={setRangeValue}
            currency={"€"}
            showBounds={true}
            ariaLabelMin="Fixed range minimum price"
            ariaLabelMax="Fixed range maximum price"
          />
        )}
      </DemoCard>
    </Container>
  );
}

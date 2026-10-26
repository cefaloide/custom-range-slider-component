"use client";

import { Range } from "@/components/Range";
import { Container } from "@/components/Container";
import { DemoCard } from "@/components/DemoCard";
import { PageHeader } from "@/components/PageHeader";
import { useApiData } from "@/hooks/useApiData";
import { ROUTES } from "@/lib/routes";
import { useState } from "react";
import type { NormalApiResponse } from "@/types/api";

export default function Exercise1() {
  const { data, error, isLoading, retry } =
    useApiData<NormalApiResponse>("/api/normal");

  const [rangeValue, setRangeValue] = useState<[number, number]>([1, 100]);

  return (
    <Container>
      <PageHeader
        breadcrumb={ROUTES.exercise1.name}
        title={`${ROUTES.exercise1.name} Component`}
      >
        Continuous range component from minimum to maximum number with dual
        handles, non-crossing constraints, inline editable labels, and data
        powered by a mocked HTTP service.
      </PageHeader>
      <DemoCard isLoading={isLoading} error={error} onRetry={retry}>
        {data && (
          <Range
            mode="normal"
            min={data.min}
            max={data.max}
            step={0.01}
            value={rangeValue}
            onChange={setRangeValue}
            allowLabelEdit={true}
            ariaLabelMin="Normal range minimum price"
            ariaLabelMax="Normal range maximum price"
          />
        )}
      </DemoCard>
    </Container>
  );
}

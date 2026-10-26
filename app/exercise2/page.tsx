"use client";

import { Range } from "@/components/Range";
import { Spinner } from "@/components/Spinner";
import { useApiData } from "@/hooks/useApiData";
import { useState } from "react";
import type { FixedApiResponse } from "@/types/api";

export default function Exercice2() {
  const { data, error, isLoading, retry } =
    useApiData<FixedApiResponse>("/api/fixed");

  const [rangeValue, setRangeValue] = useState<[number, number]>([5.99, 70.99]);

  if (error) {
    return (
      <>
        <p role="alert">{error}</p>
        <button type="button" onClick={retry}>
          Retry
        </button>
      </>
    );
  }

  return (
    <>
      <h1>Exercice 2 Page</h1>
      {isLoading || !data ? (
        <Spinner />
      ) : (
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
    </>
  );
}

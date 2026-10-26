"use client";

import { Range } from "@/components/Range";
import { Spinner } from "@/components/Spinner";
import { useApiData } from "@/hooks/useApiData";
import { useState } from "react";
import type { NormalApiResponse } from "@/types/api";

export default function Exercise1() {
  const { data, error, isLoading, retry } =
    useApiData<NormalApiResponse>("/api/normal");

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
      <h1>Exercise 1 Page</h1>
      {isLoading || !data ? (
        <Spinner />
      ) : (
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
    </>
  );
}

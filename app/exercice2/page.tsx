"use client";

import { Range } from "@/components/Range";
import { useEffect, useState } from "react";
import { FixedApiResponse } from "../api/fixed/route";

export default function Exercice2() {
  const [data, setData] = useState<FixedApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [rangeValue, setRangeValue] = useState<[number, number]>([5.99, 70.99]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const res = await fetch("/api/fixed", { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: FixedApiResponse = await res.json();
        setData(json);
      } catch (err: unknown) {
        console.error("Error fetching data:", err);
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  if (error) {
    return <p role="alert">{error}</p>;
  }

  return (
    <>
      <h1>Exercice 2 Page</h1>
      {isLoading || !data ? (
        <div className={`max-w-xl mx-auto flex justify-center`}>
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
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

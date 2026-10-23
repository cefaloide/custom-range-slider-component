"use client";

import { Range } from "@/components/Range";
import { useEffect, useState } from "react";
import { NormalApiResponse } from "../api/normal/route";

export default function Exercice1() {
  const [data, setData] = useState<NormalApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [rangeValue, setRangeValue] = useState<[number, number]>([5.99, 70.99]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const res = await fetch("/api/normal", { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: NormalApiResponse = await res.json();
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
      <h1>Exercice 1 Page</h1>
      {isLoading || !data ? (
        <div className={`max-w-xl mx-auto flex justify-center`}>
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <Range
          mode="normal"
          min={data?.min}
          max={data?.max}
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

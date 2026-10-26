import { useCallback, useEffect, useState } from "react";

export function useApiData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadData() {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: T = await res.json();
        setData(json);
      } catch (err: unknown) {
        if (controller.signal.aborted) return;
        console.error("Error fetching data:", err);
        setError("Error fetching data");
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    loadData();

    return () => controller.abort();
  }, [url, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setAttempt((current) => current + 1);
  }, []);

  return { data, error, isLoading, retry };
}

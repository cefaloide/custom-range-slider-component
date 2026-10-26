import type { ReactNode } from "react";
import { Spinner } from "@/components/Spinner";

interface DemoCardProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  children: ReactNode;
}

export function DemoCard({ isLoading, error, onRetry, children }: DemoCardProps) {
  return (
    <div className="bg-white border border-neutral-200 rounded-sm p-6 sm:p-10 shadow-xs mb-8">
      {error ? (
        <div className="flex flex-col items-center gap-4 text-sm">
          <p role="alert" className="text-red-600">
            {error}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 bg-black text-white font-medium rounded-xs hover:bg-neutral-800 transition-all"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <Spinner />
      ) : (
        children
      )}
    </div>
  );
}

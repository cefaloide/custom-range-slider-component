import React, { useState, useRef, useEffect } from "react";
import { formatCurrency, validateLabelInput } from "@/lib/range-utils";
import { Check, Edit2, AlertCircle } from "lucide-react";
import { DEFAULT_CURRENCY } from "./constants";

interface RangeLabelProps {
  value: number;
  currency?: string;
  isEditable?: boolean;
  isMinHandle: boolean;
  minLimit: number;
  maxLimit: number;
  otherHandleValue: number;
  onValueCommit?: (newValue: number) => void;
  testId?: string;
}

export function RangeLabel({
  value,
  currency = DEFAULT_CURRENCY,
  isEditable = false,
  isMinHandle,
  minLimit,
  maxLimit,
  otherHandleValue,
  onValueCommit,
  testId,
}: RangeLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      // Focus and select input on entering edit mode
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    if (!isEditable) return;
    setInputValue(value.toString());
    setErrorMessage(null);
    setIsEditing(true);
  };

  const handleCommit = () => {
    if (!isEditing) return;

    const result = validateLabelInput(
      inputValue,
      minLimit,
      maxLimit,
      otherHandleValue,
      isMinHandle,
      currency,
    );

    if (result.isValid) {
      setErrorMessage(null);
      setIsEditing(false);
      onValueCommit?.(result.value);
    } else {
      // Keep the input open until the user fixes the value or cancels
      setErrorMessage(result.error || "Invalid value");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      setIsEditing(false);
      setErrorMessage(null);
    }
  };

  if (isEditing) {
    return (
      <div className="relative inline-flex items-center">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            data-testid={testId && `${testId}-input`}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setErrorMessage(null);
            }}
            onBlur={handleCommit}
            onKeyDown={handleKeyDown}
            aria-label={
              isMinHandle ? "Edit minimum value" : "Edit maximum value"
            }
            className="w-15 px-1.5 py-0.5 text-sm font-mono font-medium text-black bg-white border border-black focus:outline-none focus:ring-1 focus:ring-black text-center rounded-none shadow-xs"
          />
          <span className="ml-1 text-xs font-semibold text-neutral-600">
            {currency}
          </span>
          <button
            type="button"
            onClick={handleCommit}
            className="ml-1 text-black hover:text-neutral-600 p-0.5 cursor-pointer border rounded shadow"
            aria-label="Confirm value"
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-black text-white text-[11px] font-sans px-2 py-0.5 rounded shadow-lg flex items-center gap-1"
          >
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleStartEdit}
      disabled={!isEditable}
      data-testid={testId}
      aria-label={
        isEditable
          ? `${isMinHandle ? "Minimum value" : "Maximum value"} ${formatCurrency(value, currency)}. Click to edit.`
          : `${isMinHandle ? "Minimum value" : "Maximum value"} ${formatCurrency(value, currency)}`
      }
      className={`group inline-flex items-center gap-1 font-mono text-sm tracking-tight text-neutral-900 transition-all select-none ${
        isEditable
          ? "cursor-pointer hover:text-black hover:underline decoration-neutral-400 underline-offset-4 focus:outline-none focus:ring-1 focus:ring-black px-1.5 py-0.5 rounded-sm bg-neutral-100/70 hover:bg-neutral-200/80 border border-transparent hover:border-neutral-300"
          : "cursor-default"
      }`}
    >
      <span className="font-semibold">
        {formatCurrency(value, currency, { showDecimalsIfZero: true })}
      </span>
      {isEditable && (
        <Edit2 className="w-3 h-3 text-neutral-400 group-hover:text-black opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
}

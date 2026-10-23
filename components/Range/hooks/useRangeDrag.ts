import React, { useRef, useState, useCallback, useEffect } from "react";
import { clamp } from "@/lib/range-utils";
import type { HandleIndex } from "../types";

interface UseRangeDragOptions {
  minPercent: number;
  maxPercent: number;
  moveHandleToPercent: (handle: HandleIndex, percent: number) => void;
}

export function useRangeDrag({
  minPercent,
  maxPercent,
  moveHandleToPercent,
}: UseRangeDragOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [draggingHandle, setDraggingHandle] = useState<HandleIndex | null>(
    null,
  );

  const getPercentFromClientX = useCallback((clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  }, []);

  // Global pointer listeners while a handle is being dragged
  useEffect(() => {
    if (draggingHandle === null) return;

    const handlePointerMove = (e: PointerEvent) => {
      moveHandleToPercent(draggingHandle, getPercentFromClientX(e.clientX));
    };
    const stopDragging = () => setDraggingHandle(null);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    // Apply cursor grabbing style globally during drag so cursor doesn't flicker
    document.body.style.cursor = "grabbing";
    document.body.style.userSelect = "none";

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [draggingHandle, getPercentFromClientX, moveHandleToPercent]);

  const handlePointerDown =
    (handle: HandleIndex) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDraggingHandle(handle);
    };

  // Track click: move the closest handle to the clicked position
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (draggingHandle !== null) return;
    e.preventDefault();
    const clickPercent = getPercentFromClientX(e.clientX);
    const closerHandle: HandleIndex =
      Math.abs(clickPercent - minPercent) <= Math.abs(clickPercent - maxPercent)
        ? 0
        : 1;
    moveHandleToPercent(closerHandle, clickPercent);
    setDraggingHandle(closerHandle);
  };

  return {
    trackRef,
    draggingHandle,
    handlePointerDown,
    handleTrackPointerDown,
  };
}

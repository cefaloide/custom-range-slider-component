import React, { useRef, useState, useCallback, useEffect } from "react";
import { clamp } from "@/lib/range-utils";
import { HANDLE } from "../constants";
import type { HandleIndex } from "../types";

interface UseRangeDragOptions {
  minPercent: number;
  maxPercent: number;
  moveHandleToPercent: (handle: HandleIndex, percent: number) => void;
}

// "undecided": both handles overlap, the first move's direction picks one
type DragTarget = HandleIndex | "undecided";

export function useRangeDrag({
  minPercent,
  maxPercent,
  moveHandleToPercent,
}: UseRangeDragOptions) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragTarget, setDragTarget] = useState<DragTarget | null>(null);

  const getPercentFromClientX = useCallback((clientX: number): number => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width <= 0) return 0;
    return clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  }, []);

  // Global pointer listeners while a handle is being dragged
  useEffect(() => {
    if (dragTarget === null) return;

    const handlePointerMove = (e: PointerEvent) => {
      const percent = getPercentFromClientX(e.clientX);
      if (dragTarget !== "undecided") {
        moveHandleToPercent(dragTarget, percent);
        return;
      }
      // Overlapping handles: moving left drags the min, moving right the max
      if (percent === minPercent) return;
      const handle: HandleIndex =
        percent < minPercent ? HANDLE.MIN : HANDLE.MAX;
      setDragTarget(handle);
      moveHandleToPercent(handle, percent);
    };
    const stopDragging = () => setDragTarget(null);

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
  }, [dragTarget, minPercent, getPercentFromClientX, moveHandleToPercent]);

  const handlePointerDown =
    (handle: HandleIndex) => (e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragTarget(minPercent === maxPercent ? "undecided" : handle);
    };

  // Track click: move the closest handle to the clicked position
  const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragTarget !== null) return;
    e.preventDefault();
    const clickPercent = getPercentFromClientX(e.clientX);
    // Overlapping handles are equally close: pick the one on the clicked side
    const handlesOverlap = minPercent === maxPercent;
    const isMinCloser = handlesOverlap
      ? clickPercent < minPercent
      : Math.abs(clickPercent - minPercent) <=
        Math.abs(clickPercent - maxPercent);
    const closerHandle: HandleIndex = isMinCloser ? HANDLE.MIN : HANDLE.MAX;
    moveHandleToPercent(closerHandle, clickPercent);
    setDragTarget(closerHandle);
  };

  return {
    trackRef,
    draggingHandle: dragTarget === "undecided" ? null : dragTarget,
    handlePointerDown,
    handleTrackPointerDown,
  };
}

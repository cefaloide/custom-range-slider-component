import { NextResponse } from "next/server";
import type { NormalApiResponse } from "@/types/api";

/**
 * Mocked HTTP service
 * Returns the minimum and maximum boundaries for the normal range component.
 */
export async function GET() {
  const data: NormalApiResponse = {
    min: 1,
    max: 100,
  };

  return NextResponse.json(data);
}

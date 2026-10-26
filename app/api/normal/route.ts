import { NextResponse } from "next/server";
import { NORMAL_RANGE_DATA } from "@/lib/mock-data";

/**
 * Mocked HTTP service
 * Returns the minimum and maximum boundaries for the normal range component.
 */
export async function GET() {
  return NextResponse.json(NORMAL_RANGE_DATA);
}

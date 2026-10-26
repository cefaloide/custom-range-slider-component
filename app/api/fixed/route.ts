import { NextResponse } from "next/server";
import { FIXED_RANGE_DATA } from "@/lib/mock-data";

/**
 * Mocked HTTP service
 * Returns the array of fixed option numbers for the discrete range component.
 */
export async function GET() {
  return NextResponse.json(FIXED_RANGE_DATA);
}

import { NextResponse } from "next/server";

export interface NormalApiResponse {
  min: number;
  max: number;
}

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

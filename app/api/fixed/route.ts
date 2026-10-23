import { NextResponse } from "next/server";

export interface FixedApiResponse {
  rangeValues: number[];
}

/**
 * Mocked HTTP service
 * Returns the array of fixed option numbers for the discrete range component.
 */
export async function GET() {
  const data: FixedApiResponse = {
    rangeValues: [1.99, 5.99, 10.99, 30.99, 50.99, 70.99],
  };

  return NextResponse.json(data);
}

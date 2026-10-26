// Response shapes shared by the mocked API routes and the pages that consume them

export interface NormalApiResponse {
  min: number;
  max: number;
}

export interface FixedApiResponse {
  rangeValues: number[];
}

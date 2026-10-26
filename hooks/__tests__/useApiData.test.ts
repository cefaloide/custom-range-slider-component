import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useApiData } from "../useApiData";

const URL = "/api/test";

const jsonResponse = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useApiData", () => {
  it("returns data on success", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ min: 1, max: 100 }));
    const { result } = renderHook(() =>
      useApiData<{ min: number; max: number }>(URL),
    );
    expect(result.current.isLoading).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(URL, {
      signal: expect.any(AbortSignal),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ min: 1, max: 100 });
    expect(result.current.error).toBeNull();
  });

  it("sets an error when the response is not ok", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { status: 500 }));
    const { result } = renderHook(() => useApiData(URL));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBe("Error fetching data");
    expect(result.current.data).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it("retry clears the error and refetches", async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError("Network error"))
      .mockResolvedValueOnce(jsonResponse({ ok: true }));
    const { result } = renderHook(() => useApiData(URL));

    await waitFor(() => expect(result.current.error).not.toBeNull());

    act(() => result.current.retry());
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("aborts the request on unmount without setting an error", async () => {
    let signal: AbortSignal | undefined;
    fetchMock.mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) => {
          signal = init?.signal ?? undefined;
          signal?.addEventListener("abort", () =>
            reject(new DOMException("Aborted", "AbortError")),
          );
        }),
    );
    const { result, unmount } = renderHook(() => useApiData(URL));

    unmount();

    expect(signal?.aborted).toBe(true);
    await Promise.resolve();
    expect(result.current.error).toBeNull();
    expect(console.error).not.toHaveBeenCalled();
  });
});

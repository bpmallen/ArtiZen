// src/services/metropolitanMuseumApi.ts

import type { MetFilters } from "../types/artwork";

const MET_BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";

/**
 * Fetch objectIDs from the Met Museum API based on search term and optional filters.
 */
export async function fetchMetSearch(
  pageIndex = 0,
  pageSize = 50,
  keyword?: string,
  filters?: MetFilters
): Promise<{ objectIDs: number[]; total: number }> {
  const params = new URLSearchParams({
    q: keyword?.trim() || "art",
    hasImages: "true",
  });

  if (filters?.title) params.append("title", "true");
  if (filters?.artistOrCulture) params.append("artistOrCulture", "true");
  if (filters?.tags) params.append("tags", "true");

  if (filters?.departmentId != null) {
    params.append("departmentId", String(filters.departmentId));
  }
  if (filters?.isOnView) params.append("isOnView", "true");
  if (filters?.isHighlight) params.append("isHighlight", "true");

  // medium can be string or string[]
  if (filters?.medium) {
    const medium = Array.isArray(filters.medium) ? filters.medium[0] : filters.medium;
    params.append("medium", medium);
  }

  // geoLocation can be string or string[]
  if (filters?.geoLocation) {
    const geo = Array.isArray(filters.geoLocation) ? filters.geoLocation[0] : filters.geoLocation;
    params.append("geoLocation", geo);
  }

  if (filters?.dateBegin != null && filters?.dateEnd != null) {
    params.append("dateBegin", String(filters.dateBegin));
    params.append("dateEnd", String(filters.dateEnd));
  }

  const url = `${MET_BASE_URL}/search?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Met search failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    total: number;
    objectIDs: number[] | null;
  };
  const allIds = data.objectIDs ?? [];
  const start = pageIndex * pageSize;
  return {
    objectIDs: allIds.slice(start, start + pageSize),
    total: data.total,
  };
}

export async function fetchMetArtworkById(id: number) {
  try {
    const url = `${MET_BASE_URL}/objects/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Skipping invalid Met artwork ID: ${id}`);
      return null;
    }
    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.warn(`Error fetching Met artwork with ID ${id}:`, message);
    return null;
  }
}

export async function fetchAllMetObjectIDs(): Promise<number[]> {
  try {
    const response = await fetch(`${MET_BASE_URL}/objects`);
    const data = (await response.json()) as { objectIDs?: unknown };
    if (!Array.isArray(data.objectIDs) || !data.objectIDs.every((n) => typeof n === "number")) {
      console.warn("Failed to fetch full Met object list.");
      return [];
    }
    return data.objectIDs as number[];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : JSON.stringify(err);
    console.error("Error fetching all Met object IDs:", message);
    return [];
  }
}

import type { MetFilters } from "../types/artwork";

const MET_BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";

/**
 * Fetch objectIDs from the Met Museum API based on search term and optional filters.
 */
export async function fetchMetSearch(
  keyword?: string,
  filters?: MetFilters
): Promise<{ objectIDs: number[]; total: number }> {
  const params = new URLSearchParams({
    q: keyword && keyword.trim() ? keyword.trim() : "art",
    hasImages: "true",
  });

  if (filters?.title) params.append("title", "true");
  if (filters?.artistOrCulture) params.append("artistOrCulture", "true");
  if (filters?.tags) params.append("tags", "true");
  if (filters?.departmentId !== undefined)
    params.append("departmentId", String(filters.departmentId));
  if (filters?.isOnView) params.append("isOnView", "true");
  if (filters?.isHighlight) params.append("isHighlight", "true");
  if (filters?.medium) params.append("medium", filters.medium);
  if (filters?.geoLocation) params.append("geoLocation", filters.geoLocation);
  if (filters?.dateBegin !== undefined && filters?.dateEnd !== undefined) {
    params.append("dateBegin", String(filters.dateBegin));
    params.append("dateEnd", String(filters.dateEnd));
  }

  const url = `https://collectionapi.metmuseum.org/public/collection/v1/search?${params.toString()}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Met search failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    total: number;
    objectIDs: number[] | null;
  };

  return {
    objectIDs: data.objectIDs ?? [],
    total: data.total,
  };
}

export async function fetchMetArtworkById(id: number) {
  try {
    const url = `${MET_BASE_URL}/objects/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`Skipping invalid Met artwork ID: ${id}`);
      return null; // ✅ Don't throw
    }
    return await response.json();
  } catch (error: any) {
    console.warn(`Error fetching Met artwork with ID ${id}:`, error.message);
    return null; // ✅ Don't throw
  }
}

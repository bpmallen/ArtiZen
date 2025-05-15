const MET_BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";

// This fetches a page of Met ObjectIDs, plus the total count
export async function fetchMetSearch(
  pageIndex: number = 0,
  pageSize: number = 30
): Promise<{ objectIDs: number[]; total: number }> {
  const params = new URLSearchParams({
    hasImages: "true",
    q: "a", // The Met’s Collection API “search” endpoint always expects a non‐empty q parameter
  });

  const url = `${MET_BASE_URL}/search?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    console.error(`Met Search API Error: ${response.status}`, response.statusText);
    throw new Error(`Met search failed: ${response.status}`);
  }

  const data = (await response.json()) as {
    total: number;
    objectIDs: number[] | null;
  };

  const allIds = data.objectIDs ?? [];
  const start = pageIndex * pageSize;
  const pageIds = allIds.slice(start, start + pageSize);

  return {
    objectIDs: pageIds,
    total: data.total,
  };
}

export async function fetchMetArtworkById(id: number) {
  try {
    const url = `${MET_BASE_URL}/objects/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Met API Error (ID: ${id}): ${response.status} - ${response.statusText}`);
      throw new Error(`Failed to fetch Met artwork with ID ${id}: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Met API Response (ID: ${id}):`, data);
    return data;
  } catch (error: any) {
    console.error(`Error fetching Met artwork with ID ${id}:`, error.message);
    throw error;
  }
}

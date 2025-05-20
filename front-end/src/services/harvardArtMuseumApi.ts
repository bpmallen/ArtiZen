const HARVARD_BASE_URL = "https://api.harvardartmuseums.org";

const HARVARD_API_KEY = import.meta.env.VITE_HARVARD_API_KEY;

export async function fetchHarvardArtworks(
  page: number = 1,
  pageSize: number = 10,
  sortOrder: "date" | "random" = "date",
  keyword?: string
) {
  try {
    let url =
      `${HARVARD_BASE_URL}/object?apikey=${HARVARD_API_KEY}` + `&page=${page}&size=${pageSize}`;

    if (sortOrder === "random") {
      url += `&sort=random`;
    }

    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Harvard API Error: ${response.status} - ${response.statusText}`);
      throw new Error(`Failed to fetch Harvard artworks: ${response.status}`);
    }

    const data = response.json();
    console.log(`Harvard API response (Artwork List):`, data);
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching Harvard artworks:", error.message);
      throw error;
    } else {
      console.error("An unexpected error occurred while fetching Harvard artworks:", error);
      throw new Error(`An unexpected error occurred`);
    }
  }
}

export async function fetchHarvardArtworkById(id: number) {
  try {
    const url = `${HARVARD_BASE_URL}/object/${id}?apikey=${HARVARD_API_KEY}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Harvard API Error (ID: ${id}): ${response.status} - ${response.statusText}`);
      throw new Error(`Failed to fetch Harvard artwork with ID ${id}: ${response.status}`);
    }
    const data = await response.json();
    console.log(`Harvard API Response (ID: ${id}):`, data);
    return data;
  } catch (error: any) {
    console.error(`Error fetching Harvard artwork with ID ${id}:`, error.message);
    throw error;
  }
}

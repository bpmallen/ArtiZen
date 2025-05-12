const HARVARD_BASE_URL = "https://api.harvardartmuseums.org";

const HARVARD_API_KEY = import.meta.env.VITE_HARVARD_API_KEY;

export async function fetchHarvardArtworks(page: number = 1, pageSize: number = 10) {
  try {
    const url = `${HARVARD_BASE_URL}/object?apikey=${HARVARD_API_KEY}&page=${page}&size=${pageSize}`;

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

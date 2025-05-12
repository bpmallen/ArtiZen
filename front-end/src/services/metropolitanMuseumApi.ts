const MET_BASE_URL = "https://collectionapi.metmuseum.org/public/collection/v1";

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

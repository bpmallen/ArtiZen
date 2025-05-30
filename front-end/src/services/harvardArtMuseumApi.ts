import type {
  HarvardFilters,
  CombinedArtwork,
  HarvardArtworksResponse,
  HarvardArtwork,
} from "../types/artwork";

const HARVARD_BASE_URL = "https://api.harvardartmuseums.org";
const HARVARD_API_KEY = import.meta.env.VITE_HARVARD_API_KEY;

export async function fetchHarvardPage(
  page: number,
  pageSize: number,
  searchTerm: string,
  filters: HarvardFilters
): Promise<{ artworks: CombinedArtwork[]; total: number }> {
  if (!HARVARD_API_KEY) {
    console.error("Missing Harvard API key (VITE_HARVARD_API_KEY)");
    return { artworks: [], total: 0 };
  }

  // Build query parameters, converting our 0-based page to Harvard's 1-based API
  const params = new URLSearchParams({
    apikey: HARVARD_API_KEY,
    page: String(page + 1),
    size: String(pageSize),
    hasimage: "1",
    ...(searchTerm && { q: searchTerm }),
    ...(filters.dateBegin && { datebegin: String(filters.dateBegin) }),
    ...(filters.dateEnd && { dateend: String(filters.dateEnd) }),
  });

  if (searchTerm) params.set("q", searchTerm);
  if (filters.classification) params.set("classification", String(filters.classification));
  if (filters.dateBegin) params.set("datebegin", String(filters.dateBegin));
  if (filters.dateEnd) params.set("dateend", String(filters.dateEnd));
  if (filters.century) params.set("century", String(filters.century));
  if (filters.culture) params.set("culture", String(filters.culture));
  if (filters.keyword) params.set("keyword", filters.keyword);

  // Include only the fields we need (plus images for thumbnails)
  params.set(
    "fields",
    [
      "objectnumber",
      "title",
      "dated",
      "datebegin",
      "dateend",
      "people",
      "primaryimageurl",
      "images",
    ].join(",")
  );

  const url = `${HARVARD_BASE_URL}/object?${params.toString()}`;
  console.log("🔗 Harvard fetch URL:", url);

  const res = await fetch(url);
  const text = await res.text();

  // Parse JSON safely
  let data: HarvardArtworksResponse;
  try {
    data = JSON.parse(text) as HarvardArtworksResponse;
  } catch {
    console.warn("Could not parse Harvard response as JSON:", text);
    return { artworks: [], total: 0 };
  }

  // Handle HTTP errors
  if (!res.ok) {
    console.warn("Harvard API error", res.status, data);
    return { artworks: [], total: 0 };
  }

  const records: HarvardArtwork[] = data.records ?? [];
  const total = data.info?.totalrecords ?? 0;

  // Map to our shared CombinedArtwork shape, choosing a thumbnail URL
  const artworks: CombinedArtwork[] = records.map((r) => {
    const thumb = r.primaryimageurl || r.images?.[0]?.baseimageurl || null;

    return {
      id: r.objectnumber,
      title: r.title,
      artistDisplayName: r.people?.map((p) => p.name).join(", ") || null,
      primaryImageSmall: thumb,
      source: "harvard",
      harvardSlim: {
        id: r.id,
        objectnumber: r.objectnumber,
        title: r.title,
        dated: r.dated,
        datebegin: r.datebegin,
        dateend: r.dateend,
        people: r.people,
        primaryimageurl: r.primaryimageurl,
      },
      harvardData: r,
    };
  });

  return { artworks, total };
}

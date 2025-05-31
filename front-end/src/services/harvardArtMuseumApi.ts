// src/services/harvardArtMuseumApi.ts

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
  filters: HarvardFilters,
  sort: "dateAsc" | "dateDesc"
): Promise<{ artworks: CombinedArtwork[]; total: number }> {
  if (!HARVARD_API_KEY) {
    console.error("❌ Missing Harvard API key (VITE_HARVARD_API_KEY)");
    return { artworks: [], total: 0 };
  }

  // Always request only those with images. If user typed a searchTerm, AND it.
  let qClause = "imagecount>0";
  if (searchTerm) {
    qClause = `(${searchTerm}) AND imagecount>0`;
  }

  const params = new URLSearchParams({
    apikey: HARVARD_API_KEY,
    page: String(page + 1),
    size: String(pageSize),
    q: qClause,
    ...(filters.dateBegin && { datebegin: String(filters.dateBegin) }),
    ...(filters.dateEnd && { dateend: String(filters.dateEnd) }),
  });

  // Add additional filters if present:
  if (filters.classification) {
    params.set("classification", String(filters.classification));
  }
  if (filters.century) {
    params.set("century", String(filters.century));
  }
  if (filters.culture) {
    params.set("culture", String(filters.culture));
  }
  if (filters.keyword) {
    params.set("keyword", filters.keyword);
  }

  // We will sort client‐side, so do NOT send sort/sortorder to the API.
  // Ask only for the fields we need:
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

  let data: HarvardArtworksResponse;
  try {
    data = JSON.parse(text) as HarvardArtworksResponse;
  } catch {
    console.warn("❌ Could not parse Harvard response as JSON:", text);
    return { artworks: [], total: 0 };
  }

  if (!res.ok) {
    console.warn("❌ Harvard API error", res.status, data);
    return { artworks: [], total: 0 };
  }

  const records: HarvardArtwork[] = data.records ?? [];
  const total = data.info?.totalrecords ?? 0;

  // Map each record → CombinedArtwork, picking thumbnail from primaryimageurl or images[0].baseimageurl
  // Then filter out any entry whose thumbnail is still null.
  const artworks: CombinedArtwork[] = records
    .map((r) => {
      // Try the direct “primaryimageurl” first; otherwise fall back to first images[].baseimageurl
      const thumb = r.primaryimageurl ?? r.images?.[0]?.baseimageurl ?? null;

      return {
        // NOTE: CombinedArtwork.id is a non‐nullable string
        id: r.objectnumber,
        // CombinedArtwork.title must be string, not null
        title: r.title || "",
        // CombinedArtwork.artistDisplayName is allowed to be string|null
        artistDisplayName: r.people?.map((p) => p.name).join(", ") || null,
        // this might be null → we’ll filter out down below
        primaryImageSmall: thumb,
        // source must be the literal "harvard"
        source: "harvard" as const,
        // harvardSlim is an object in CombinedArtwork
        harvardSlim: {
          id: r.id,
          objectnumber: r.objectnumber,
          title: r.title || "",
          dated: r.dated,
          datebegin: r.datebegin,
          dateend: r.dateend,
          people: r.people,
          primaryimageurl: r.primaryimageurl,
        },
        // harvardData holds the full original record
        harvardData: r,
      };
    })
    // Filter out any artwork whose `primaryImageSmall` is still null
    .filter((a) => a.primaryImageSmall !== null);

  return { artworks, total };
}

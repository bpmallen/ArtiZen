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
  filters: HarvardFilters
  // sort: "dateAsc" | "dateDesc"
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

  params.set(
    "fields",
    [
      "id",
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
  // console.log("🔗 Harvard fetch URL:", url);

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

  const artworks: CombinedArtwork[] = records
    .map((r) => {
      const thumb = r.primaryimageurl ?? r.images?.[0]?.baseimageurl ?? null;

      return {
        id: r.id.toString(),

        title: r.title || "",

        artistDisplayName: r.people?.map((p) => p.name).join(", ") || null,

        primaryImageSmall: thumb,

        source: "harvard" as const,

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

        harvardData: r,
      };
    })

    .filter((a) => a.primaryImageSmall !== null);

  return { artworks, total };
}

// services/metSlim.ts
import { fetchMetSearch, fetchMetArtworkById } from "./metropolitanMuseumApi";
import type { MetSlim, CombinedArtwork, MetFilters } from "../types/artwork";

export async function fetchMetPageSlim(
  page: number,
  pageSize: number,
  searchTerm: string,
  filters: MetFilters
): Promise<{ artworks: CombinedArtwork[]; total: number }> {
  // 1️⃣ search for IDs
  const { objectIDs, total } = await fetchMetSearch(page, pageSize, searchTerm, filters);
  // 2️⃣ fetch each ID’s slim fields
  const raws = await Promise.all(
    objectIDs.map((id) =>
      fetchMetArtworkById(id).then((r) =>
        r && r.primaryImageSmall
          ? ({
              objectID: r.objectID,
              title: r.title,
              artistDisplayName: r.artistDisplayName,
              primaryImageSmall: r.primaryImageSmall,
              objectEndDate: r.objectEndDate,
            } as MetSlim)
          : null
      )
    )
  );
  const slims = raws.filter((r): r is MetSlim => !!r);
  // 3️⃣ wrap as CombinedArtwork
  const artworks: CombinedArtwork[] = slims.map((s) => ({
    id: s.objectID,
    title: s.title,
    artistDisplayName: s.artistDisplayName,
    primaryImageSmall: s.primaryImageSmall,
    source: "met",
    metSlim: s,
  }));
  return { artworks, total };
}

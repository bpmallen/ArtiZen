import { useState, useEffect } from "react";
import { fetchMetPageSlim } from "../services/metSlim";
import type { CombinedArtwork, MetFilters } from "../types/artwork";

const ARTWORKS_PER_PAGE = 10;

export function useMetArtworks(
  searchTerm: string,
  filters: MetFilters,
  page: number,
  sort: "relevance" | "titleAsc" | "titleDesc" | "dateAsc" | "dateDesc"
) {
  const [artworks, setArtworks] = useState<CombinedArtwork[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchMetPageSlim(page, ARTWORKS_PER_PAGE, searchTerm, filters)
      .then(({ artworks: fetched, total: fetchedTotal }) => {
        let sorted = [...fetched];

        if (sort === "titleAsc") {
          sorted = fetched.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (sort === "titleDesc") {
          sorted = fetched.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        } else if (sort === "dateAsc") {
          sorted = fetched.sort((a, b) => {
            const aDate = a.metSlim?.objectEndDate ?? 0;
            const bDate = b.metSlim?.objectEndDate ?? 0;
            return aDate - bDate;
          });
        } else if (sort === "dateDesc") {
          sorted = fetched.sort((a, b) => {
            const aDate = a.metSlim?.objectEndDate ?? 0;
            const bDate = b.metSlim?.objectEndDate ?? 0;
            return bDate - aDate;
          });
        }

        setArtworks(sorted);
        setTotal(fetchedTotal);
        setError(null);
      })
      .catch((err) => {
        console.error("useMetArtworks error:", err);
        setError(err);
        setArtworks([]);
        setTotal(0);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchTerm, filters, page, sort]);

  return { artworks, total, loading, error };
}

import { useState, useEffect } from "react";
import type { CombinedArtwork, HarvardFilters } from "../types/artwork";
import { fetchHarvardPage } from "../services/harvardArtMuseumApi";

const PAGE_SIZE = 10;

export function useHarvardArtworks(
  searchTerm: string,
  filters: HarvardFilters,
  page: number,
  sort: "relevance" | "titleAsc" | "titleDesc" | "dateAsc" | "dateDesc"
) {
  const [artworks, setArtworks] = useState<CombinedArtwork[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);

    const apiSort: "dateAsc" | "dateDesc" = sort === "dateDesc" ? "dateDesc" : "dateAsc";

    fetchHarvardPage(page, PAGE_SIZE, searchTerm, filters, apiSort)
      .then(({ artworks: fetched, total: fetchedTotal }) => {
        const sorted = [...fetched];

        if (sort === "titleAsc") {
          sorted.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
        } else if (sort === "titleDesc") {
          sorted.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
        } else if (sort === "relevance") {
          // No further action needed; `sorted` is already a shallow copy of `fetched`.
        }

        setArtworks(sorted);
        setTotal(fetchedTotal);
        setError(null);
      })
      .catch((err) => {
        console.error("useHarvardArtworks error:", err);
        setError(err);
        setArtworks([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [searchTerm, filters, page, sort]);

  return { artworks, total, loading, error };
}

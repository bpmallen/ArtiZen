import { useState, useEffect } from "react";
import type { CombinedArtwork, MetFilters } from "../types/artwork";
import { fetchHarvardPage } from "../services/harvardArtMuseumApi";

const PAGE_SIZE = 5;

export function useHarvardArtworks(
  searchTerm: string,
  filters: MetFilters,
  page: number,
  sort: "dateAsc" | "dateDesc"
) {
  const [artworks, setArtworks] = useState<CombinedArtwork[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchHarvardPage(page, PAGE_SIZE, searchTerm, filters, sort)
      .then(({ artworks, total }) => {
        console.log("🔍 Harvard hook result:", { artworks, total });
        setArtworks(artworks);
        setTotal(total);
        setError(null);
      })
      .catch((err) => {
        console.error("Harvard hook error:", err);
        setArtworks([]);
        setTotal(0);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [searchTerm, filters, page, sort]);

  return { artworks, total, loading, error };
}

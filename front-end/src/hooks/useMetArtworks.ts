import { useState, useEffect, useMemo } from "react";
import { fetchMetSearch, fetchMetArtworkById } from "../services/metropolitanMuseumApi";
import type { CombinedArtwork, MetArtwork, MetFilters } from "../types/artwork";

const ARTWORKS_PER_PAGE = 5;
const FETCH_IDS_PER_PAGE = 50;

export function useMetArtworks(
  searchTerm: string,
  filters: MetFilters,
  page: number,
  sort: "dateAsc" | "dateDesc"
) {
  const [allMetIDs, setAllMetIDs] = useState<number[]>([]);
  const [metBatch, setMetBatch] = useState<MetArtwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch IDs
  useEffect(() => {
    setLoading(true);
    fetchMetSearch(searchTerm, filters)
      .then((res) => {
        setAllMetIDs(res.objectIDs);
        setError(null);
      })
      .catch((err) => {
        setError(err);
        setAllMetIDs([]);
      })
      .finally(() => setLoading(false));
  }, [searchTerm, filters]);

  // Fetch batch by page
  useEffect(() => {
    const start = page * FETCH_IDS_PER_PAGE;
    const end = start + FETCH_IDS_PER_PAGE;
    const ids = allMetIDs.slice(start, end);
    if (!ids.length) {
      setMetBatch([]);
      return;
    }
    setLoading(true);
    Promise.all(ids.map(fetchMetArtworkById))
      .then((results) => {
        const valid = results.filter((a): a is MetArtwork => !!a && !!a.primaryImageSmall);
        setMetBatch(valid.slice(0, ARTWORKS_PER_PAGE));
      })
      .catch((err) => {
        setError(err);
        setMetBatch([]);
      })
      .finally(() => setLoading(false));
  }, [allMetIDs, page]);

  //  Derived & sorted combined artworks
  const artworks = useMemo<CombinedArtwork[]>(() => {
    return metBatch
      .map((art) => ({
        id: art.objectID,
        title: art.title || null,
        artistDisplayName: art.artistDisplayName || null,
        primaryImageSmall: art.primaryImageSmall || null,
        source: "met" as const,
        metData: art,
      }))
      .sort((a, b) => {
        const dateA = a.metData?.objectEndDate ?? 0;
        const dateB = b.metData?.objectEndDate ?? 0;
        return sort === "dateAsc" ? dateA - dateB : dateB - dateA;
      });
  }, [metBatch, sort]);

  return {
    artworks,
    total: allMetIDs.length,
    loading,
    error,
  };
}

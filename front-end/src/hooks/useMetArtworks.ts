import { useState, useEffect, useMemo } from "react";
import {
  fetchMetSearch,
  fetchMetArtworkById,
  fetchAllMetObjectIDs,
} from "../services/metropolitanMuseumApi";
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
  const [totalIDs, setTotalIDs] = useState(0);
  const [metBatch, setMetBatch] = useState<MetArtwork[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  //  “browsing all” (no query, no filters)?
  const isBrowsingAll = searchTerm.trim() === "" && Object.keys(filters).length === 0;

  // 1) If browsing all, grab every_ID once
  useEffect(() => {
    if (!isBrowsingAll) return;
    setLoading(true);
    fetchAllMetObjectIDs()
      .then((ids) => {
        setAllMetIDs(ids);
        setTotalIDs(ids.length);
      })
      .catch((err) => {
        console.error("Failed to fetch ALL Met IDs:", err);
        setAllMetIDs([]);
        setTotalIDs(0);
        setError(err);
      })
      .finally(() => setLoading(false));
  }, [isBrowsingAll]);

  //  2) Otherwise do a paginated search
  useEffect(() => {
    if (isBrowsingAll) return;
    setLoading(true);
    fetchMetSearch(searchTerm, filters)
      .then(({ objectIDs, total }) => {
        setAllMetIDs(objectIDs);
        setTotalIDs(total);
      })
      .catch((err) => {
        console.error("Met search failed:", err);
        setError(err);
        setAllMetIDs([]);
        setTotalIDs(0);
      })
      .finally(() => setLoading(false));
  }, [searchTerm, filters, isBrowsingAll]);

  // 3) Now fetch just the current page’s artworks, but if we're “browsing all” we over-fetch FETCH_IDS_PER_PAGE
  useEffect(() => {
    if (allMetIDs.length === 0) {
      setMetBatch([]);
      return;
    }
    let isCurrent = true;
    setLoading(true);

    // pick how many raw IDs to pull in (50 for browse-all, 5 for a filtered search)
    const rawCount = isBrowsingAll ? FETCH_IDS_PER_PAGE : ARTWORKS_PER_PAGE;
    const start = page * rawCount;
    const end = start + rawCount;
    const pageIDs = allMetIDs.slice(start, end);

    Promise.all(pageIDs.map(fetchMetArtworkById))
      .then((results) => {
        if (!isCurrent) return;
        const valid = results.filter((a): a is MetArtwork => !!a && !!a.primaryImageSmall);
        setMetBatch(valid.slice(0, ARTWORKS_PER_PAGE));
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error("Error fetching Met batch:", err);
        setError(err);
        setMetBatch([]);
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [allMetIDs, page, isBrowsingAll]);

  //  4) Derived & sorted combined artworks
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

  return { artworks, total: totalIDs, loading, error };
}

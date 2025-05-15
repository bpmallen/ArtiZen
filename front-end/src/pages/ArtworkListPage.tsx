import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHarvardArtworks } from "../services/harvardArtMuseumApi";
import { fetchMetSearch, fetchMetArtworkById } from "../services/metropolitanMuseumApi";
import type {
  HarvardArtworksResponse,
  MetArtwork,
  CombinedArtwork,
  HarvardArtwork,
} from "../types/artwork";

const INITIAL_BATCH_SIZE = 30;
const ARTWORKS_PER_PAGE = 5;

function ArtworkListPage() {
  // Filter state
  const [filter, setFilter] = useState<"all" | "harvard" | "met">("all");

  // Harvard pagination state
  const [harvardPage, setHarvardPage] = useState(1);
  const [harvardBatch, setHarvardBatch] = useState<HarvardArtwork[]>([]);
  const [harvardDisplayedIds, setHarvardDisplayedIds] = useState<number[]>([]);

  // Met pagination state
  const [metPage, setMetPage] = useState(0);
  const [metBatch, setMetBatch] = useState<MetArtwork[]>([]);
  const [metDisplayedIds, setMetDisplayedIds] = useState<number[]>([]);

  // Harvard API query for paginated batch
  const {
    data: harvardData,
    isLoading: harvardLoading,
    isError: harvardErrorFlag,
    error: harvardError,
  } = useQuery<HarvardArtworksResponse, Error>({
    queryKey: ["harvard", harvardPage] as const,
    queryFn: () => fetchHarvardArtworks(harvardPage, INITIAL_BATCH_SIZE, "random"),
    enabled: filter !== "met",
    placeholderData: (old) => old,
    staleTime: 5 * 60_000,
  });

  // Populate Harvard batch when new data arrives
  useEffect(() => {
    if (!harvardData) return;
    const valid = harvardData.records.filter((a) => !!a.primaryimageurl);
    setHarvardBatch(valid);
    setHarvardDisplayedIds([]);
  }, [harvardData, harvardPage]);

  // Add next page of Harvard IDs to displayed list
  useEffect(() => {
    if (!harvardBatch.length) return;
    const pool = harvardBatch.filter((a) => !harvardDisplayedIds.includes(a.id));
    const nextIds = pool.slice(0, ARTWORKS_PER_PAGE).map((a) => a.id);
    if (nextIds.length) setHarvardDisplayedIds((prev) => [...prev, ...nextIds]);
  }, [harvardBatch, harvardPage]);

  // Met API query for paginated batch of IDs
  const {
    data: metData,
    isLoading: metLoading,
    isError: metErrorFlag,
    error: metError,
  } = useQuery<{ objectIDs: number[]; total: number }, Error>({
    queryKey: ["met", metPage, INITIAL_BATCH_SIZE] as const,
    queryFn: () => fetchMetSearch(metPage, INITIAL_BATCH_SIZE),
    enabled: filter !== "harvard",
  });

  // Fetch full Met artworks when IDs arrive
  useEffect(() => {
    if (!metData?.objectIDs) return;
    setMetDisplayedIds([]);
    Promise.all(metData.objectIDs.map((id) => fetchMetArtworkById(id)))
      .then((results) => {
        const valid = results.filter((art) => !!art.primaryImageSmall);
        setMetBatch(valid);
      })
      .catch(console.error);
  }, [metData, metPage]);

  // Add next page of Met IDs to displayed list
  useEffect(() => {
    if (!metBatch.length) return;
    const pool = metBatch.filter((a) => !metDisplayedIds.includes(a.objectID));
    const nextIds = pool.slice(0, ARTWORKS_PER_PAGE).map((a) => a.objectID);
    if (nextIds.length) setMetDisplayedIds((prev) => [...prev, ...nextIds]);
  }, [metBatch, metPage]);

  // Compute displayed Harvard artworks
  const harvardArtworks = useMemo<CombinedArtwork[]>(
    () =>
      harvardBatch
        .filter((a) => harvardDisplayedIds.includes(a.id))
        .map((art) => ({
          id: art.id,
          title: art.title,
          artistDisplayName: art.people?.[0]?.displayname || null,
          primaryImageSmall: art.primaryimageurl || null,
          source: "harvard",
          harvardData: art,
        })),
    [harvardBatch, harvardDisplayedIds]
  );

  // Compute displayed Met artworks
  const metArtworks = useMemo<CombinedArtwork[]>(
    () =>
      metBatch
        .filter((a) => metDisplayedIds.includes(a.objectID))
        .map((art) => ({
          id: art.objectID,
          title: art.title || null,
          artistDisplayName: art.artistDisplayName || null,
          primaryImageSmall: art.primaryImageSmall || null,
          source: "met",
          metData: art,
        })),
    [metBatch, metDisplayedIds]
  );

  // Combine and filter by source
  const combinedArtworks = useMemo(
    () =>
      [...harvardArtworks, ...metArtworks].filter((a) => filter === "all" || a.source === filter),
    [harvardArtworks, metArtworks, filter]
  );

  const isLoading = harvardLoading || metLoading;
  const isError = harvardErrorFlag || metErrorFlag;

  // Next page handler
  const handleNext = useCallback(() => {
    setHarvardPage((p) => p + 1);
    setMetPage((p) => p + 1);
  }, []);

  // Previous page handler
  const handlePrev = useCallback(() => {
    // don’t go before page 1 for Harvard, or before page 0 for Met
    setHarvardPage((p) => Math.max(1, p - 1));
    setMetPage((p) => Math.max(0, p - 1));
  }, []);

  if (isLoading) return <div>Loading…</div>;
  if (isError) return <div>Error: {(harvardError || metError)?.message}</div>;

  return (
    <div>
      <h2>Exhibition Curation Platform</h2>
      <div>
        {(["all", "harvard", "met"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} disabled={filter === f}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {combinedArtworks.map((art) => (
        <div key={art.id} style={{ margin: "1em 0" }}>
          {art.primaryImageSmall && (
            <img
              src={art.primaryImageSmall}
              alt={art.title || ""}
              style={{ maxWidth: 100, maxHeight: 100 }}
            />
          )}
          <div>
            <strong>{art.title}</strong> ({art.source})
          </div>
        </div>
      ))}
      <div style={{ margin: "1em 0" }}>
        <button onClick={handlePrev} disabled={harvardPage === 1 && metPage === 0}>
          Prev Page
        </button>
        <button onClick={handleNext} disabled={isLoading}>
          Next Page
        </button>
      </div>
    </div>
  );
}

export default ArtworkListPage;

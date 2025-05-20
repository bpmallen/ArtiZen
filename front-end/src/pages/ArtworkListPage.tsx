import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  // Global search state
  const [harvardSort, setHarvardSort] = useState<"dated" | "title">("dated");
  const [metSort, setMetSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [inputValue, setInputValue] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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
    queryKey: ["harvard", harvardPage, searchTerm, harvardSort] as const,
    queryFn: () =>
      fetchHarvardArtworks(
        harvardPage,
        INITIAL_BATCH_SIZE,
        harvardSort === "dated" ? "date" : "random",
        searchTerm.trim() || undefined
      ),

    enabled: filter !== "met",
    placeholderData: (old) => old,
    staleTime: 5 * 60_000,
  });

  // Populate Harvard batch when new data arrives
  useEffect(() => {
    if (!harvardData) return;
    const valid = harvardData.records.filter(
      (a) => Boolean(a.primaryimageurl) || (Array.isArray(a.images) && a.images.length > 0)
    );
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
    queryKey: ["met", metPage, searchTerm] as const,
    queryFn: () => fetchMetSearch(metPage, ARTWORKS_PER_PAGE * 2, searchTerm),
    enabled: filter !== "harvard",
  });

  useEffect(() => {
    if (!metData?.objectIDs) return;
    Promise.all(metData.objectIDs.map(fetchMetArtworkById))
      .then((results) => {
        const valid = results.filter((a) => !!a.primaryImageSmall);
        setMetBatch(valid.slice(0, ARTWORKS_PER_PAGE));
      })
      .catch(console.error);
  }, [metData]);

  // Add next page of Met IDs to displayed list
  useEffect(() => {
    if (!metBatch.length) return;
    const pool = metBatch.filter((a) => !metDisplayedIds.includes(a.objectID));
    const nextIds = pool.slice(0, ARTWORKS_PER_PAGE).map((a) => a.objectID);
    if (nextIds.length) setMetDisplayedIds((prev) => [...prev, ...nextIds]);
  }, [metBatch, metPage]);

  const qc = useQueryClient();
  useEffect(() => {
    // as soon as metPage changes, kick off the next page’s search
    qc.prefetchQuery({
      queryKey: ["met", metPage + 1, ARTWORKS_PER_PAGE] as const,
      queryFn: () => fetchMetSearch(metPage + 1, ARTWORKS_PER_PAGE),
    });
  }, [metPage, qc]);

  // Compute displayed Harvard artworks
  const harvardArtworks = useMemo<CombinedArtwork[]>(
    () =>
      harvardBatch
        .filter((a) => harvardDisplayedIds.includes(a.id))
        .map((art) => {
          const primaryUrl = art.primaryimageurl;
          const fallbackUrl =
            Array.isArray(art.images) && art.images.length > 0
              ? art.images[0].baseimageurl // or `.url` depending on your field
              : null;
          const imgUrl = primaryUrl || fallbackUrl || null;

          return {
            id: art.id,
            title: art.title,
            artistDisplayName: art.people?.[0]?.displayname || null,
            primaryImageSmall: imgUrl,
            source: "harvard",
            harvardData: art,
          };
        }),
    [harvardBatch, harvardDisplayedIds]
  );

  // Compute displayed Met artworks
  const metArtworks = useMemo<CombinedArtwork[]>(() => {
    // map your batch to CombinedArtwork
    const list = metBatch.map((art) => ({
      id: art.objectID,
      title: art.title || null,
      artistDisplayName: art.artistDisplayName || null,
      primaryImageSmall: art.primaryImageSmall || null,
      source: "met" as const,
      metData: art,
    }));

    // now sort by objectDate
    return list
      .sort((a, b) => {
        const dateA = a.metData?.objectEndDate ?? 0;
        const dateB = b.metData?.objectEndDate ?? 0;
        return metSort === "dateAsc" ? dateA - dateB : dateB - dateA;
      })
      .slice(0, ARTWORKS_PER_PAGE);
  }, [metBatch, metSort]);

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
      <input
        type="text"
        placeholder="Search artworks.."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        style={{ width: "70%", padding: "0.5em", marginRight: "0.5em" }}
      />
      <button onClick={() => setSearchTerm(inputValue)}>Search</button>
      <select value={harvardSort} onChange={(e) => setHarvardSort(e.target.value as any)}>
        <option value="dated">Date</option>
        <option value="random">Random</option>
      </select>
      <select
        value={metSort}
        onChange={(e) => setMetSort(e.target.value as any)}
        style={{ marginLeft: "1em" }}
      >
        <option value="dateAsc">Date ↑</option>
        <option value="dateDesc">Date ↓</option>
      </select>

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

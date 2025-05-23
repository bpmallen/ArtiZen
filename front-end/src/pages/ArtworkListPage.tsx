import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMetSearch, fetchMetArtworkById } from "../services/metropolitanMuseumApi";
import type { CombinedArtwork, MetArtwork, MetFilters } from "../types/artwork";

const ARTWORKS_PER_PAGE = 5;

function ArtworkListPage() {
  const [filter, setFilter] = useState<"all" | "harvard" | "met">("met");
  const [inputValue, setInputValue] = useState("");
  const seedTerms = ["art", "sculpture", "cat", "portrait", "flower", "greek", "statue"];
  const [searchTerm, setSearchTerm] = useState(
    () => seedTerms[Math.floor(Math.random() * seedTerms.length)]
  );

  const [metPage, setMetPage] = useState(0);
  const [metSort, setMetSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [metFilters, setMetFilters] = useState<MetFilters>({});
  const [metBatchLoading, setMetBatchLoading] = useState(false);

  const {
    data: metData,
    isLoading: metLoading,
    isError: metError,
    error,
  } = useQuery({
    queryKey: ["met", metPage, searchTerm, metFilters],
    queryFn: () => fetchMetSearch(metPage, ARTWORKS_PER_PAGE * 2, searchTerm, metFilters),
    enabled: filter !== "harvard",
  });

  const [metBatch, setMetBatch] = useState<MetArtwork[]>([]);
  const [metDisplayedIds, setMetDisplayedIds] = useState<number[]>([]);

  useEffect(() => {
    if (!metData?.objectIDs) return;
    setMetBatchLoading(true);
    console.log("🔎 Raw objectIDs:", metData.objectIDs);
    Promise.all(metData.objectIDs.map(fetchMetArtworkById))
      .then((results) => {
        console.log("Fetched Met results:", results);
        const valid = results.filter((a): a is MetArtwork => !!a && !!a.primaryImageSmall);
        console.log("Valid Met artworks:", valid);
        setMetBatch(valid);
      })
      .finally(() => {
        setMetBatchLoading(false);
      });
  }, [metData]);

  useEffect(() => {
    if (!metBatch.length) return;
    const pool = metBatch.filter((a) => !metDisplayedIds.includes(a.objectID));
    const nextIds = pool.slice(0, ARTWORKS_PER_PAGE).map((a) => a.objectID);
    if (nextIds.length) setMetDisplayedIds((prev) => [...prev, ...nextIds]);
  }, [metBatch, metPage]);

  useEffect(() => {
    console.log("Met batch:", metBatch);
  }, [metBatch]);

  const metArtworks = useMemo<CombinedArtwork[]>(() => {
    if (!metBatch.length) return [];
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
        return metSort === "dateAsc" ? dateA - dateB : dateB - dateA;
      });
  }, [metBatch, metSort]);

  const combinedArtworks = useMemo(() => {
    if (filter === "met") return metArtworks;
    return []; // phase Harvard in later
  }, [filter, metArtworks]);

  const handleNext = useCallback(() => {
    setMetPage((p) => p + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setMetPage((p) => Math.max(0, p - 1));
  }, []);

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

      <div style={{ marginTop: "1em" }}>
        <input
          type="text"
          placeholder="Search artworks..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={() => setSearchTerm(inputValue)}>Search</button>
      </div>

      <div style={{ marginTop: "1em" }}>
        <label>
          Sort by date:
          <select value={metSort} onChange={(e) => setMetSort(e.target.value as any)}>
            <option value="dateAsc">Date ↑</option>
            <option value="dateDesc">Date ↓</option>
          </select>
        </label>
      </div>

      {combinedArtworks.length === 0 && !metLoading && !metBatchLoading && (
        <p>No artworks found.</p>
      )}

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

      <div style={{ marginTop: "1em" }}>
        <button onClick={handlePrev} disabled={metPage === 0}>
          Prev Page
        </button>
        <button onClick={handleNext} disabled={metLoading}>
          Next Page
        </button>
      </div>

      {(metLoading || metBatchLoading) && <p>Loading…</p>}
      {metError && <p>Error: {error?.message}</p>}
      <button onClick={() => setMetFilters({ isHighlight: true })}>Show highlights only</button>
    </div>
  );
}

export default ArtworkListPage;

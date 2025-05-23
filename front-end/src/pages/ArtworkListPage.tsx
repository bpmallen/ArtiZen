import { useState, useEffect, useMemo, useCallback } from "react";
import { fetchMetSearch, fetchMetArtworkById } from "../services/metropolitanMuseumApi";
import type { CombinedArtwork, MetArtwork, MetFilters } from "../types/artwork";

const ARTWORKS_PER_PAGE = 5;
const FETCH_IDS_PER_PAGE = 50;

function ArtworkListPage() {
  const [filter, setFilter] = useState<"all" | "harvard" | "met">("met");
  const [inputValue, setInputValue] = useState("");
  const seedTerms = ["art", "sculpture", "cat", "portrait", "flower", "greek", "statue"];
  const [searchTerm, setSearchTerm] = useState(
    () => seedTerms[Math.floor(Math.random() * seedTerms.length)]
  );
  const [departments, setDepartments] = useState<{ departmentId: number; displayName: string }[]>(
    []
  );

  const [metFilters, setMetFilters] = useState<MetFilters>({});
  const [allMetIDs, setAllMetIDs] = useState<number[]>([]);
  const [metPage, setMetPage] = useState(0);
  const [metBatch, setMetBatch] = useState<MetArtwork[]>([]);
  const [metBatchLoading, setMetBatchLoading] = useState(false);
  const [metSort, setMetSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [metError, setMetError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("https://collectionapi.metmuseum.org/public/collection/v1/departments")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.departments)) {
          setDepartments(data.departments);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch departments:", err);
      });
  }, []);

  // Fetch all matching objectIDs on search or filter change
  useEffect(() => {
    setMetBatch([]); // Clear previous batch
    setMetBatchLoading(true);
    fetchMetSearch(searchTerm, metFilters)
      .then((res) => {
        setAllMetIDs(res.objectIDs);
        setMetPage(0); // reset to first page
        setMetError(null);
      })
      .catch((err) => {
        console.error("Failed to fetch Met IDs:", err);
        setMetError(err);
        setAllMetIDs([]);
      })
      .finally(() => setMetBatchLoading(false));
  }, [searchTerm, metFilters]);

  // On page change, fetch artworks from the relevant slice of IDs
  useEffect(() => {
    const start = metPage * FETCH_IDS_PER_PAGE;
    const end = start + FETCH_IDS_PER_PAGE;
    const currentIds = allMetIDs.slice(start, end);
    if (currentIds.length === 0) {
      setMetBatch([]);
      return;
    }

    setMetBatchLoading(true);
    Promise.all(currentIds.map(fetchMetArtworkById))
      .then((results) => {
        const valid = results.filter((a): a is MetArtwork => !!a && !!a.primaryImageSmall);
        setMetBatch(valid.slice(0, ARTWORKS_PER_PAGE)); // Display 5
      })
      .catch((err) => {
        console.error("Error loading batch:", err);
        setMetBatch([]);
      })
      .finally(() => {
        setMetBatchLoading(false);
      });
  }, [metPage, allMetIDs]);

  const metArtworks = useMemo<CombinedArtwork[]>(() => {
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
    return []; // phase in Harvard later
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
        <button onClick={() => setSearchTerm(inputValue || "a")}>Search</button>
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
      <div style={{ marginTop: "1em", border: "1px solid #ccc", padding: "1em" }}>
        <strong>Met Filters</strong>

        <div>
          <label>
            <input
              type="checkbox"
              onChange={(e) => setMetFilters((f) => ({ ...f, isHighlight: e.target.checked }))}
            />
            Show highlights only
          </label>
        </div>

        <div>
          <label>
            Department:
            <select
              onChange={(e) => {
                const selectedId = e.target.value ? Number(e.target.value) : undefined;
                setMetFilters((f) => ({ ...f, departmentId: selectedId }));

                // ✅ Fallback query if nothing is typed
                if (!inputValue.trim()) {
                  setInputValue("art");
                  setSearchTerm("art");
                }
              }}
            >
              <option value="">All</option>
              {departments.map((dept) => (
                <option key={dept.departmentId} value={dept.departmentId}>
                  {dept.displayName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div>
          <label>
            Medium:
            <input
              type="text"
              placeholder="e.g. Sculpture"
              onChange={(e) =>
                setMetFilters((f) => ({ ...f, medium: e.target.value || undefined }))
              }
            />
          </label>
        </div>

        <div>
          <label>
            Date Begin:
            <input
              type="number"
              onChange={(e) =>
                setMetFilters((f) => ({ ...f, dateBegin: Number(e.target.value) || undefined }))
              }
            />
          </label>
          <label style={{ marginLeft: "1em" }}>
            Date End:
            <input
              type="number"
              onChange={(e) =>
                setMetFilters((f) => ({ ...f, dateEnd: Number(e.target.value) || undefined }))
              }
            />
          </label>
        </div>
      </div>

      {combinedArtworks.length === 0 && !metBatchLoading && <p>No artworks found.</p>}

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
        <button
          onClick={handleNext}
          disabled={metBatchLoading || (metPage + 1) * FETCH_IDS_PER_PAGE >= allMetIDs.length}
        >
          Next Page
        </button>
      </div>

      {(metBatchLoading || allMetIDs.length === 0) && <p>Loading…</p>}
      {metError && <p>Error: {metError.message}</p>}
    </div>
  );
}

export default ArtworkListPage;

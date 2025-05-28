import { useState, useMemo, useCallback } from "react";
import type { MetFilters } from "../types/artwork";
import { useMetDepartments } from "../hooks/useMetDepartments";
import { useMetArtworks } from "../hooks/useMetArtworks"; // ✅ correct path

function ArtworkListPage() {
  const [metPage, setMetPage] = useState(0);
  const [metFilters, setMetFilters] = useState<MetFilters>({});
  const [metSort, setMetSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [filter, setFilter] = useState<"all" | "harvard" | "met">("met");
  const [inputValue, setInputValue] = useState("");
  const seedTerms = ["art", "sculpture", "cat", "portrait", "flower", "greek", "statue"];
  const [searchTerm, setSearchTerm] = useState(
    () => seedTerms[Math.floor(Math.random() * seedTerms.length)]
  );

  const {
    artworks: metArtworks,
    total: totalMetIDs,
    loading: metBatchLoading,
    error: metError,
  } = useMetArtworks(searchTerm, metFilters, metPage, metSort);

  const { departments } = useMetDepartments();

  const combinedArtworks = useMemo(() => {
    if (filter === "met") return metArtworks;
    return []; // Harvard to be added
  }, [filter, metArtworks]);

  const totalPages = Math.ceil(totalMetIDs / 50);

  const handleNext = useCallback(() => {
    setMetPage((p) => p + 1);
  }, []);

  const handlePrev = useCallback(() => {
    setMetPage((p) => Math.max(0, p - 1));
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-bold text-blue-600">Tailwind Works!</h1>
      <h2>Exhibition Curation Platform</h2>

      {/* Filter Tabs */}
      <div>
        {(["all", "harvard", "met"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} disabled={filter === f}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginTop: "1em" }}>
        <input
          type="text"
          placeholder="Search artworks..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button onClick={() => setSearchTerm(inputValue || "a")}>Search</button>
      </div>

      {/* Sort */}
      <div style={{ marginTop: "1em" }}>
        <label>
          Sort by date:
          <select value={metSort} onChange={(e) => setMetSort(e.target.value as any)}>
            <option value="dateAsc">Date ↑</option>
            <option value="dateDesc">Date ↓</option>
          </select>
        </label>
      </div>

      {/* Met Filters */}
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

      {/* Results */}
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

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center flex-wrap gap-2">
        <button
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          onClick={handlePrev}
          disabled={metPage === 0}
        >
          Prev
        </button>

        {(() => {
          const pagesToShow = 5;
          const half = Math.floor(pagesToShow / 2);
          let start = Math.max(0, metPage - half);
          let end = start + pagesToShow;

          if (end > totalPages) {
            end = totalPages;
            start = Math.max(0, totalPages - pagesToShow);
          }

          return Array.from({ length: end - start }, (_, i) => start + i).map((p) => (
            <button
              key={p}
              onClick={() => setMetPage(p)}
              className={`px-3 py-1 rounded border ${
                p === metPage
                  ? "text-black font-bold underline underline-offset-4 decoration-2 decoration-blue-600"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              {p + 1}
            </button>
          ));
        })()}

        <button
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          onClick={handleNext}
          disabled={(metPage + 1) * 50 >= totalMetIDs}
        >
          Next
        </button>
      </div>

      {/* Loading / Error */}
      {metBatchLoading && <p>Loading…</p>}
      {metError && <p>Error: {metError.message}</p>}
    </div>
  );
}

export default ArtworkListPage;

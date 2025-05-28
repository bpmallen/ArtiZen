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
  // const seedTerms = ["art", "sculpture", "cat", "portrait", "flower", "greek", "statue"];
  const [searchTerm, setSearchTerm] = useState("");

  const FETCH_IDS_PER_PAGE = 50;

  const {
    artworks: metArtworks,
    total: totalMetIDs,
    loading: metBatchLoading,
    error: metError,
  } = useMetArtworks(searchTerm, metFilters, metPage, metSort);

  console.log("Total Met IDs:", totalMetIDs);

  const { departments } = useMetDepartments();

  const combinedArtworks = useMemo(() => {
    if (filter === "met") return metArtworks;
    return []; // Harvard to be added
  }, [filter, metArtworks]);

  const totalPages = Math.ceil(totalMetIDs / FETCH_IDS_PER_PAGE);
  console.log("Total Met IDs:", totalMetIDs, "Total Pages:", totalPages);

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
      <div className="flex gap-2">
        {(["all", "harvard", "met"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              if (f === "all") {
                setFilter("met");
                setSearchTerm("");
                setInputValue("");
                setMetFilters({});
                setMetPage(0);
              } else if (f === "harvard") {
                setFilter("harvard");
              } else {
                // f === "met"
                setFilter("met");
              }
            }}
            className={filter === f ? "font-bold" : ""}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Met Filters */}
      <div style={{ marginTop: "1em", border: "1px solid #ccc", padding: "1em" }}>
        <strong>Met Filters</strong>
        {/* Search Bar */}
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            className="border rounded px-3 py-1 flex-grow"
            placeholder="Type to search the Met collection…"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button
            className="px-4 py-1 bg-blue-600 text-white rounded"
            onClick={() => {
              setSearchTerm(inputValue.trim() || ""); // if empty, goes into “browse all”
              setMetPage(0); // reset to page 0
            }}
          >
            Search
          </button>
        </div>
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
                const val = e.target.value;
                if (!val) {
                  // user picked "All" → truly clear every filter
                  setMetFilters({});
                } else {
                  setMetFilters((f) => ({
                    ...f,
                    departmentId: Number(val),
                  }));
                }
                // reset back to page 0 whenever you change department
                setMetPage(0);
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
      {/* Loading / Error */}
      {metBatchLoading && <p>Loading…</p>}
      {metError && <p>Error: {metError.message}</p>}
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
    </div>
  );
}

export default ArtworkListPage;

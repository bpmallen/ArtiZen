import { useState, useMemo, useCallback } from "react";
import type { MetFilters } from "../types/artwork";
import { useMetDepartments } from "../hooks/useMetDepartments";
import { useMetArtworks } from "../hooks/useMetArtworks";
import { useHarvardArtworks } from "../hooks/useHarvardArtworks";

function ArtworkListPage() {
  const [metPage, setMetPage] = useState(0);
  const [metFilters, setMetFilters] = useState<MetFilters>({});
  const [metSort, setMetSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [filter, setFilter] = useState<"all" | "harvard" | "met">("met");
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const FETCH_IDS_PER_PAGE = 50;

  // Met hook
  const {
    artworks: metArtworks,
    total: totalMetIDs,
    loading: metLoading,
    error: metError,
  } = useMetArtworks(searchTerm, metFilters, metPage, metSort);

  // Harvard hook
  const {
    artworks: harvArtworks,
    total: totalHarv,
    loading: harvLoading,
    error: harvError,
  } = useHarvardArtworks(searchTerm, metFilters, metPage, metSort);

  // choose active dataset
  const artworks = filter === "harvard" ? harvArtworks : metArtworks;
  const total = filter === "harvard" ? totalHarv : totalMetIDs;
  const loading = filter === "harvard" ? harvLoading : metLoading;
  const error = filter === "harvard" ? harvError : metError;

  const totalPages = Math.ceil(total / FETCH_IDS_PER_PAGE);
  const { departments } = useMetDepartments();

  const handleNext = useCallback(() => setMetPage((p) => p + 1), []);
  const handlePrev = useCallback(() => setMetPage((p) => Math.max(0, p - 1)), []);

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
              } else {
                setFilter(f);
              }
            }}
            className={filter === f ? "font-bold" : ""}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Met Filters (only on Met tab) */}
      {filter === "met" && (
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
                setSearchTerm(inputValue.trim() || "");
                setMetPage(0);
              }}
            >
              Search
            </button>
          </div>

          <label className="block mt-2">
            <input
              type="checkbox"
              onChange={(e) => setMetFilters((f) => ({ ...f, isHighlight: e.target.checked }))}
            />{" "}
            Show highlights only
          </label>

          <label className="block mt-2">
            Department:
            <select
              className="ml-2 border rounded px-2"
              onChange={(e) => {
                const v = e.target.value;
                setMetFilters(v ? { ...metFilters, departmentId: +v } : {});
                setMetPage(0);
              }}
            >
              <option value="">All</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.displayName}
                </option>
              ))}
            </select>
          </label>

          <label className="block mt-2">
            Medium:
            <input
              className="ml-2 border rounded px-2"
              type="text"
              placeholder="e.g. Sculpture"
              onChange={(e) =>
                setMetFilters((f) => ({ ...f, medium: e.target.value || undefined }))
              }
            />
          </label>

          <label className="block mt-2">
            Date Begin:
            <input
              className="ml-2 border rounded px-2"
              type="number"
              onChange={(e) =>
                setMetFilters((f) => ({ ...f, dateBegin: +e.target.value || undefined }))
              }
            />
          </label>

          <label className="block mt-2">
            Date End:
            <input
              className="ml-2 border rounded px-2"
              type="number"
              onChange={(e) =>
                setMetFilters((f) => ({ ...f, dateEnd: +e.target.value || undefined }))
              }
            />
          </label>

          <label className="block mt-2">
            Sort by date:
            <select
              className="ml-2 border rounded px-2"
              value={metSort}
              onChange={(e) => setMetSort(e.target.value as any)}
            >
              <option value="dateAsc">Date ↑</option>
              <option value="dateDesc">Date ↓</option>
            </select>
          </label>
        </div>
      )}

      {/* Loading / Error */}
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {!loading && artworks.length === 0 && <p>No artworks found.</p>}

      {/* Results */}
      {artworks.map((art) => (
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
          onClick={handlePrev}
          disabled={metPage === 0}
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
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
            start = Math.max(0, end - pagesToShow);
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
          onClick={handleNext}
          disabled={(metPage + 1) * FETCH_IDS_PER_PAGE >= total}
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ArtworkListPage;

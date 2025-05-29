import React, { useState, useCallback } from "react";
import type { MetFilters, HarvardFilters } from "../types/artwork";
import { useMetDepartments } from "../hooks/useMetDepartments";
import { useMetArtworks } from "../hooks/useMetArtworks";
import { useHarvardArtworks } from "../hooks/useHarvardArtworks";

function ArtworkListPage() {
  const FETCH_IDS_PER_PAGE = 50;

  // ——— Met state/hooks ———
  const [metPage, setMetPage] = useState(0);
  const [metFilters, setMetFilters] = useState<MetFilters>({});
  const [metSort, setMetSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [metInputValue, setMetInputValue] = useState("");
  const [metSearchTerm, setMetSearchTerm] = useState("");

  const {
    artworks: metArtworks,
    total: totalMet,
    loading: metLoading,
    error: metError,
  } = useMetArtworks(metSearchTerm, metFilters, metPage, metSort);

  const { departments } = useMetDepartments();

  // ——— Harvard state/hooks ———
  // We'll reuse MetFilters for dateBegin/dateEnd/medium
  const [harvPage, setHarvPage] = useState(0);
  const [harvFilters, setHarvFilters] = useState<HarvardFilters>({});
  const [harvSort, setHarvSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [harvInputValue, setHarvInputValue] = useState("");
  const [harvSearchTerm, setHarvSearchTerm] = useState("");

  const {
    artworks: harvArtworks,
    total: totalHarv,
    loading: harvLoading,
    error: harvError,
  } = useHarvardArtworks(harvSearchTerm, harvFilters, harvPage, harvSort);

  // 1) Make a sorted copy by `dateend`
  const harvToDisplay = React.useMemo(() => {
    // shallow-copy so we don’t mutate original
    const copy = [...harvArtworks];
    return copy.sort((a, b) => {
      const ae = a.harvardSlim?.dateend ?? 0;
      const be = b.harvardSlim?.dateend ?? 0;
      return harvSort === "dateAsc" ? ae - be : be - ae;
    });
  }, [harvArtworks, harvSort]);

  // ——— Tab switching ———
  const [filter, setFilter] = useState<"all" | "harvard" | "met">("met");
  const artworks = filter === "harvard" ? harvToDisplay : metArtworks;
  const total = filter === "harvard" ? totalHarv : totalMet;
  const loading = filter === "harvard" ? harvLoading : metLoading;
  const error = filter === "harvard" ? harvError : metError;
  const page = filter === "harvard" ? harvPage : metPage;
  const setPage = filter === "harvard" ? setHarvPage : setMetPage;
  // const sort = filter === "harvard" ? harvSort : metSort;

  const totalPages = Math.ceil(total / FETCH_IDS_PER_PAGE);

  const handleNext = useCallback(() => setPage((p) => p + 1), [setPage]);
  const handlePrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [setPage]);

  return (
    <div>
      <h1 className="text-4xl font text-red-600">Tailwind Works!</h1>
      <h2>Exhibition Curation Platform</h2>

      {/* Tabs */}
      <div className="flex gap-2">
        {(["all", "harvard", "met"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f === "all" ? "met" : f);
              // reset pages & searches when switching:
              setMetPage(0);
              setHarvPage(0);
            }}
            className={filter === f ? "font-bold" : ""}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Met Filters */}
      {filter === "met" && (
        <div className="mt-4 border p-4">
          <strong>Met Filters</strong>

          {/* Search */}
          <div className="mt-2 flex gap-2">
            <input
              type="text"
              className="border rounded px-3 py-1 flex-grow"
              placeholder="Search Met…"
              value={metInputValue}
              onChange={(e) => setMetInputValue(e.target.value)}
            />
            <button
              className="px-4 py-1 bg-blue-600 text-white rounded"
              onClick={() => {
                setMetSearchTerm(metInputValue.trim());
                setMetPage(0);
              }}
            >
              Search
            </button>
          </div>

          {/* Highlights */}
          <label className="block mt-2">
            <input
              type="checkbox"
              onChange={(e) => setMetFilters((f) => ({ ...f, isHighlight: e.target.checked }))}
            />{" "}
            Show highlights only
          </label>

          {/* Department */}
          <label className="block mt-2">
            Department:
            <select
              className="ml-2 border rounded px-2"
              onChange={(e) => {
                const v = e.target.value;
                setMetFilters((f) =>
                  v ? { ...f, departmentId: +v } : { ...f, departmentId: undefined }
                );
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

          {/* Medium */}
          <label className="block mt-2">
            Medium:
            <input
              type="text"
              className="ml-2 border rounded px-2"
              placeholder="e.g. Sculpture"
              onChange={(e) =>
                setMetFilters((f) => ({ ...f, medium: e.target.value || undefined }))
              }
            />
          </label>

          {/* Date range */}
          <div className="mt-2 flex gap-4">
            <label>
              Date Begin:
              <input
                type="number"
                className="ml-2 border rounded px-2"
                onChange={(e) =>
                  setMetFilters((f) => ({
                    ...f,
                    dateBegin: +e.target.value || undefined,
                  }))
                }
              />
            </label>
            <label>
              Date End:
              <input
                type="number"
                className="ml-2 border rounded px-2"
                onChange={(e) =>
                  setMetFilters((f) => ({
                    ...f,
                    dateEnd: +e.target.value || undefined,
                  }))
                }
              />
            </label>
          </div>

          {/* Sort */}
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

      {/* Harvard Filters */}
      {filter === "harvard" && (
        <div className="border p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">Harvard Filters</h2>

          {/* Main Search */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              className="flex-grow border rounded-l px-3 py-1"
              placeholder="Search Harvard…"
              value={harvInputValue}
              onChange={(e) => setHarvInputValue(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 rounded-r"
              onClick={() => {
                setHarvSearchTerm(harvInputValue.trim());
                setHarvPage(0);
              }}
            >
              Search
            </button>
          </div>

          {/* Keyword Filter */}
          <label className="block mb-4">
            <span className="block mb-1">Keyword:</span>
            <input
              type="text"
              className="w-full border rounded px-3 py-1"
              placeholder="Titles, artists, descriptions…"
              value={harvFilters.keyword ?? ""}
              onChange={(e) =>
                setHarvFilters((f) => ({ ...f, keyword: e.target.value || undefined }))
              }
            />
          </label>

          {/* Sort by Date */}
          <label className="block">
            <span className="block mb-1">Sort by date:</span>
            <select
              className="w-full border rounded px-2 py-1"
              value={harvSort}
              onChange={(e) => setHarvSort(e.target.value as any)}
            >
              <option value="dateAsc">Oldest ↑</option>
              <option value="dateDesc">Newest ↓</option>
            </select>
          </label>
        </div>
      )}

      {/* Loading / Error */}
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {!loading && total === 0 && <p>No artworks found.</p>}

      {/* Results */}
      {artworks.map((art) => (
        <div key={art.id} className="my-4 flex items-center gap-4">
          {art.primaryImageSmall && (
            <img
              src={art.primaryImageSmall}
              alt={art.title || ""}
              className="w-45 h-55 object-cover flex-shrink-0"
            />
          )}

          <div>
            <strong>{art.title}</strong> <span>({art.source})</span>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center flex-wrap gap-2">
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Prev
        </button>

        {(() => {
          const pagesToShow = 5;
          const half = Math.floor(pagesToShow / 2);
          let start = Math.max(0, page - half);
          let end = start + pagesToShow;
          if (end > totalPages) {
            end = totalPages;
            start = Math.max(0, end - pagesToShow);
          }
          return Array.from({ length: end - start }, (_, i) => start + i).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-1 rounded border ${
                p === page
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
          disabled={(page + 1) * FETCH_IDS_PER_PAGE >= total}
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default ArtworkListPage;

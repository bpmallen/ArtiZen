// src/pages/ArtworkListPage.tsx
import { useState, useCallback, useMemo } from "react";
import type { MetFilters, HarvardFilters, CombinedArtwork } from "../types/artwork";
import { useMetDepartments } from "../hooks/useMetDepartments";
import { useMetArtworks } from "../hooks/useMetArtworks";
import { useHarvardArtworks } from "../hooks/useHarvardArtworks";

export default function ArtworkListPage() {
  const FETCH_IDS_PER_PAGE = 50;
  // — Met state
  const [metPage, setMetPage] = useState(0);
  const [metFilters, setMetFilters] = useState<MetFilters>({});
  const [metSort, setMetSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [metInput, setMetInput] = useState("");
  const [metSearch, setMetSearch] = useState("");
  const {
    artworks: metArtworks,
    total: totalMet,
    loading: metLoading,
    error: metError,
  } = useMetArtworks(metSearch, metFilters, metPage, metSort);
  const { departments } = useMetDepartments();

  // — Harvard state
  const [harvPage, setHarvPage] = useState(0);
  const [harvFilters, setHarvFilters] = useState<HarvardFilters>({});
  const [harvSort, setHarvSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [harvInput, setHarvInput] = useState("");
  const [harvSearch, setHarvSearch] = useState("");
  // note: no `sort` arg here
  const {
    artworks: rawHarv,
    total: totalHarv,
    loading: harvLoading,
    error: harvError,
  } = useHarvardArtworks(harvSearch, harvFilters, harvPage, harvSort);

  // client-side filter + sort of those 5 MET results
  const metToDisplay = useMemo<CombinedArtwork[]>(() => {
    return metArtworks
      .filter((a) => {
        const db = metFilters.dateBegin;
        const de = metFilters.dateEnd;
        // grab the year off of the metSlim
        const year = a.metSlim?.objectEndDate ?? 0;
        if (db != null && year < db) return false;
        if (de != null && year > de) return false;
        return true;
      })
      .sort((a, b) => {
        const ay = a.metSlim?.objectEndDate ?? 0;
        const by = b.metSlim?.objectEndDate ?? 0;
        return metSort === "dateAsc" ? ay - by : by - ay;
      });
  }, [metArtworks, metFilters.dateBegin, metFilters.dateEnd, metSort]);

  // client-side sort of those five
  const harvToDisplay = useMemo<CombinedArtwork[]>(() => {
    return [...rawHarv].sort((a, b) => {
      const ea = a.harvardSlim?.dateend ?? 0;
      const eb = b.harvardSlim?.dateend ?? 0;
      return harvSort === "dateAsc" ? ea - eb : eb - ea;
    });
  }, [rawHarv, harvSort]);

  // — Tabs
  const [tab, setTab] = useState<"met" | "harvard">("met");
  const artworks = tab === "harvard" ? harvToDisplay : metToDisplay;
  const total = tab === "harvard" ? totalHarv : totalMet;
  const loading = tab === "harvard" ? harvLoading : metLoading;
  const error = tab === "harvard" ? harvError : metError;
  const page = tab === "harvard" ? harvPage : metPage;
  const setPage = tab === "harvard" ? setHarvPage : setMetPage;

  const totalPages = Math.ceil(total / FETCH_IDS_PER_PAGE);
  const handlePrev = useCallback(() => setPage((p) => Math.max(0, p - 1)), [setPage]);
  const handleNext = useCallback(() => setPage((p) => p + 1), [setPage]);

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Exhibition Curation Platform</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {(["met", "harvard"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setMetPage(0);
              setHarvPage(0);
            }}
            className={t === tab ? "font-bold text-blue-600" : "text-gray-600"}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Met Filters */}
      {tab === "met" && (
        <div className="border p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">MET Filters</h2>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-grow border rounded-l px-3 py-1"
              placeholder="Search Met…"
              value={metInput}
              onChange={(e) => setMetInput(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 rounded-r"
              onClick={() => {
                setMetSearch(metInput.trim());
                setMetPage(0);
              }}
            >
              Search
            </button>
          </div>
          <label className="block mb-2">
            <input
              type="checkbox"
              onChange={(e) => setMetFilters((f) => ({ ...f, isHighlight: e.target.checked }))}
            />{" "}
            Highlights only
          </label>
          <label className="block mb-2">
            Department:
            <select
              className="ml-2 border rounded px-2"
              onChange={(e) =>
                setMetFilters((f) => ({
                  ...f,
                  departmentId: e.target.value ? +e.target.value : undefined,
                }))
              }
            >
              <option value="">All</option>
              {departments.map((d) => (
                <option key={d.departmentId} value={d.departmentId}>
                  {d.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="block mb-2">
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
          <div className="flex gap-4 mb-2">
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
          <label>
            Sort by date:
            <select
              className="ml-2 border rounded px-2"
              value={metSort}
              onChange={(e) => setMetSort(e.target.value as any)}
            >
              <option value="dateAsc">Oldest ↑</option>
              <option value="dateDesc">Newest ↓</option>
            </select>
          </label>
        </div>
      )}

      {/* Harvard Filters */}
      {tab === "harvard" && (
        <div className="border p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">Harvard Filters</h2>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-grow border rounded-l px-3 py-1"
              placeholder="Search Harvard…"
              value={harvInput}
              onChange={(e) => setHarvInput(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 rounded-r"
              onClick={() => {
                setHarvSearch(harvInput.trim());
                setHarvPage(0);
              }}
            >
              Search
            </button>
          </div>
          <label className="block mb-4">
            Keyword:
            <input
              className="w-full border rounded px-3 py-1"
              placeholder="Titles, artists…"
              value={harvFilters.keyword ?? ""}
              onChange={(e) =>
                setHarvFilters((f) => ({ ...f, keyword: e.target.value || undefined }))
              }
            />
          </label>
          <label className="block">
            Sort by date:
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

      {/* Loading / Error / Empty */}
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {!loading && total === 0 && <p>No artworks found.</p>}

      {/* Results */}
      {artworks.map((art) => (
        <div key={art.id} className="flex items-center gap-4 mb-4">
          {art.primaryImageSmall && (
            <img
              src={art.primaryImageSmall}
              alt={art.title || ""}
              className="w-16 h-16 object-cover rounded"
            />
          )}
          <div>
            <strong>{art.title}</strong>{" "}
            <span className="text-sm text-gray-500">{art.source.toUpperCase()}</span>
            {/* --- new date line: --- */}
            <div className="text-sm text-gray-600">
              {art.source === "met"
                ? // MET only has objectEndDate on the slim:
                  art.metSlim?.objectEndDate != null
                  ? String(art.metSlim.objectEndDate)
                  : "n.d."
                : // Harvard uses the `dated` string:
                  art.harvardSlim?.dated || "n.d."}
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center flex-wrap gap-2">
        {/* Prev */}
        <button
          onClick={handlePrev}
          disabled={page === 0}
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Prev
        </button>

        {/* Numeric page buttons (5 at a time) */}
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
              className={`
          px-3 py-1 rounded border
          ${
            p === page
              ? "text-black font-bold underline underline-offset-4 decoration-2 decoration-blue-600"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }
        `}
            >
              {p + 1}
            </button>
          ));
        })()}

        {/* Next */}
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

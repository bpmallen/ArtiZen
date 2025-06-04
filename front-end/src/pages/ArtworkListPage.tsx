import { useState, useCallback, useMemo } from "react";
import type { MetFilters, HarvardFilters, CombinedArtwork } from "../types/artwork";
import { useMetDepartments } from "../hooks/useMetDepartments";
import { useMetArtworks } from "../hooks/useMetArtworks";
import { useHarvardArtworks } from "../hooks/useHarvardArtworks";

export default function ArtworkListPage() {
  const PER_API_PAGE = 5; // each API call fetches 5 items

  // ─── Tabs & “ALL” page state ───
  type TabType = "met" | "harvard" | "all";
  const [tab, setTab] = useState<TabType>("met");
  const [allPage, setAllPage] = useState(0);

  // ─── MET state/hooks ───
  const [metPage, setMetPage] = useState(0);
  const [metFilters, setMetFilters] = useState<MetFilters>({});
  const [metSort, setMetSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [metInput, setMetInput] = useState("");
  const [metSearch, setMetSearch] = useState("");

  // When in “ALL,” MET’s page is driven by allPage; otherwise by metPage
  const metHookPage = tab === "all" ? allPage : metPage;
  const {
    artworks: metArtworks,
    total: totalMet,
    loading: metLoading,
    error: metError,
  } = useMetArtworks(metSearch, metFilters, metHookPage, metSort);

  const { departments } = useMetDepartments();

  // ─── Harvard state/hooks ───
  const [harvPage, setHarvPage] = useState(0);
  const [harvFilters, setHarvFilters] = useState<HarvardFilters>({});
  const [harvSort, setHarvSort] = useState<"dateAsc" | "dateDesc">("dateAsc");
  const [harvInput, setHarvInput] = useState("");
  const [harvSearch, setHarvSearch] = useState("");

  // When in “ALL,” Harvard’s page is driven by allPage; otherwise by harvPage
  const harvHookPage = tab === "all" ? allPage : harvPage;
  const {
    artworks: rawHarv,
    total: totalHarv,
    loading: harvLoading,
    error: harvError,
  } = useHarvardArtworks(harvSearch, harvFilters, harvHookPage, harvSort);

  // ─── Client‐side filter + sort for MET page of 5 ───
  const metToDisplay = useMemo<CombinedArtwork[]>(() => {
    return metArtworks
      .filter((a) => {
        const db = metFilters.dateBegin;
        const de = metFilters.dateEnd;
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

  // ─── Client‐side sort for Harvard page of 5 ───
  const harvToDisplay = useMemo<CombinedArtwork[]>(() => {
    return [...rawHarv].sort((a, b) => {
      const ea = a.harvardSlim?.dateend ?? 0;
      const eb = b.harvardSlim?.dateend ?? 0;
      return harvSort === "dateAsc" ? ea - eb : eb - ea;
    });
  }, [rawHarv, harvSort]);

  // ─── Additional state: “ALL” sort‐by‐date ───
  const [allSort, setAllSort] = useState<"dateAsc" | "dateDesc">("dateAsc");

  // ─── Combine for “ALL” (5 MET + 5 Harvard) and then client‐sort by allSort ───
  const combinedToDisplay = useMemo<CombinedArtwork[]>(() => {
    const merged = [...metToDisplay, ...harvToDisplay];
    return merged.sort((a, b) => {
      const aDate =
        a.source === "met" ? a.metSlim?.objectEndDate ?? 0 : a.harvardSlim?.dateend ?? 0;
      const bDate =
        b.source === "met" ? b.metSlim?.objectEndDate ?? 0 : b.harvardSlim?.dateend ?? 0;
      return allSort === "dateAsc" ? aDate - bDate : bDate - aDate;
    });
  }, [metToDisplay, harvToDisplay, allSort]);

  // ─── Which array to render based on tab ───
  const artworks = useMemo<CombinedArtwork[]>(() => {
    if (tab === "met") return metToDisplay;
    if (tab === "harvard") return harvToDisplay;
    return combinedToDisplay;
  }, [tab, metToDisplay, harvToDisplay, combinedToDisplay]);

  const totalPages = useMemo(() => {
    if (tab === "met") return Math.ceil(totalMet / PER_API_PAGE);
    if (tab === "harvard") return Math.ceil(totalHarv / PER_API_PAGE);
    return Math.max(Math.ceil(totalMet / PER_API_PAGE), Math.ceil(totalHarv / PER_API_PAGE));
  }, [tab, totalMet, totalHarv]);

  // ─── Which page & setter to use ───
  const page = tab === "met" ? metPage : tab === "harvard" ? harvPage : allPage;
  const setPage = useCallback(
    (p: number) => {
      if (tab === "met") setMetPage(p);
      else if (tab === "harvard") setHarvPage(p);
      else setAllPage(p);
    },
    [tab]
  );

  // ─── Combined loading / error ───
  const loading = metLoading || harvLoading;
  const error = metError || harvError;

  const handlePrev = () => setPage(Math.max(0, page - 1));
  const handleNext = () => setPage(Math.min(totalPages - 1, page + 1));

  // ─── “ALL” search input ───
  const [allInput, setAllInput] = useState("");

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Exhibition Curation Platform</h1>

      {/* ─── Tabs ─── */}
      <div className="flex gap-4 mb-6">
        {(["met", "harvard", "all"] as TabType[]).map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setMetPage(0);
              setHarvPage(0);
              setAllPage(0);
            }}
            className={t === tab ? "font-bold text-blue-600" : "text-gray-600"}
          >
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ─── MET Filters (tab === "met") ─── */}
      {tab === "met" && (
        <div className="border p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">MET Filters</h2>
          <div className="flex gap-2 mb-2">
            <input
              className="flex-grow border rounded-l px-3 py-1"
              placeholder="Search MET…"
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

      {/* ─── Harvard Filters (tab === "harvard") ─── */}
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

      {/* ─── ALL Filters + Sort (tab === "all") ─── */}
      {tab === "all" && (
        <div className="border p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">Search Both MET + Harvard</h2>
          <div className="flex gap-2 mb-4">
            <input
              className="flex-grow border rounded-l px-3 py-1"
              placeholder="Search both…"
              value={allInput}
              onChange={(e) => setAllInput(e.target.value)}
            />
            <button
              className="bg-blue-600 text-white px-4 rounded-r"
              onClick={() => {
                setMetSearch(allInput.trim());
                setHarvSearch(allInput.trim());
                setAllPage(0);
              }}
            >
              Search
            </button>
          </div>
          <label className="block mb-4">
            Sort by date:
            <select
              className="mt-1 w-full border rounded px-2 py-1"
              value={allSort}
              onChange={(e) => setAllSort(e.target.value as any)}
            >
              <option value="dateAsc">Oldest ↑</option>
              <option value="dateDesc">Newest ↓</option>
            </select>
          </label>
          <p className="text-sm text-gray-500">
            (Showing 5 from MET + 5 from Harvard on each page.)
          </p>
        </div>
      )}

      {/* ─── Loading / Error / Empty ─── */}
      {loading && <p>Loading…</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {!loading && artworks.length === 0 && <p>No artworks found.</p>}

      {/* ─── Results ─── */}
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
            <div className="text-sm text-gray-600">
              {art.source === "met"
                ? art.metSlim?.objectEndDate ?? "n.d."
                : art.harvardSlim?.dated ?? "n.d."}
            </div>
          </div>
        </div>
      ))}

      {/* ─── Pagination (5 buttons at a time) ─── */}
      <div className="mt-6 flex justify-center items-center flex-wrap gap-2">
        {/* Prev */}
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
          return Array.from({ length: end - start }, (_, i) => start + i).map((pIndex) => (
            <button
              key={pIndex}
              onClick={() => setPage(pIndex)}
              className={`
                px-3 py-1 rounded border
                ${
                  pIndex === page
                    ? "text-black font-bold underline decoration-2 decoration-blue-600"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }
              `}
            >
              {pIndex + 1}
            </button>
          ));
        })()}
        {/* Next */}
        <button
          onClick={handleNext}
          disabled={page + 1 >= totalPages}
          className="px-3 py-1 rounded border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

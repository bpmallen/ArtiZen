import { useState, useCallback, useMemo } from "react";
import type { MetFilters, HarvardFilters, CombinedArtwork } from "../types/artwork";
import { useMetDepartments } from "../hooks/useMetDepartments";
import { useMetArtworks } from "../hooks/useMetArtworks";
import { useHarvardArtworks } from "../hooks/useHarvardArtworks";
import ArtworkCard from "../components/ArtworkCard";

export default function ArtworkListPage() {
  // ─── Tabs & “ALL” page state ───
  type TabType = "met" | "harvard" | "all";
  const [tab, setTab] = useState<TabType>("met");
  const [allPage, setAllPage] = useState(0);

  // ─── MET state/hooks ───
  const [metPage, setMetPage] = useState(0);
  const [metFilters, setMetFilters] = useState<MetFilters>({});
  const [metSort, setMetSort] = useState<
    "relevance" | "titleAsc" | "titleDesc" | "dateAsc" | "dateDesc"
  >("relevance");
  const [metInput, setMetInput] = useState("");
  const [metSearch, setMetSearch] = useState("");

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
  const [harvSort, setHarvSort] = useState<
    "relevance" | "titleAsc" | "titleDesc" | "dateAsc" | "dateDesc"
  >("relevance");
  const [harvInput, setHarvInput] = useState("");
  const [harvSearch, setHarvSearch] = useState("");

  const harvHookPage = tab === "all" ? allPage : harvPage;
  const {
    artworks: harvArtworks,
    total: totalHarv,
    loading: harvLoading,
    error: harvError,
  } = useHarvardArtworks(harvSearch, harvFilters, harvHookPage, harvSort);

  const PER_API_PAGE = 10;

  const metToDisplay = useMemo<CombinedArtwork[]>(() => metArtworks, [metArtworks]);
  const harvToDisplay = useMemo<CombinedArtwork[]>(() => harvArtworks, [harvArtworks]);

  const [allSort, setAllSort] = useState<
    "relevance" | "titleAsc" | "titleDesc" | "dateAsc" | "dateDesc"
  >("relevance");
  const combinedToDisplay = useMemo<CombinedArtwork[]>(() => {
    const merged = [...metToDisplay, ...harvToDisplay];
    if (allSort === "relevance") {
      return merged;
    }
    if (allSort === "titleAsc") {
      return merged.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    }
    if (allSort === "titleDesc") {
      return merged.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
    }
    if (allSort === "dateAsc") {
      return merged.sort((a, b) => {
        const aDate =
          a.source === "met" ? a.metSlim?.objectEndDate ?? 0 : a.harvardSlim?.dateend ?? 0;
        const bDate =
          b.source === "met" ? b.metSlim?.objectEndDate ?? 0 : b.harvardSlim?.dateend ?? 0;
        return aDate - bDate;
      });
    }

    return merged.sort((a, b) => {
      const aDate =
        a.source === "met" ? a.metSlim?.objectEndDate ?? 0 : a.harvardSlim?.dateend ?? 0;
      const bDate =
        b.source === "met" ? b.metSlim?.objectEndDate ?? 0 : b.harvardSlim?.dateend ?? 0;
      return bDate - aDate;
    });
  }, [metToDisplay, harvToDisplay, allSort]);

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

  const page = tab === "met" ? metPage : tab === "harvard" ? harvPage : allPage;
  const setPage = useCallback(
    (p: number) => {
      if (tab === "met") setMetPage(p);
      else if (tab === "harvard") setHarvPage(p);
      else setAllPage(p);
    },
    [tab]
  );

  const loading = metLoading || harvLoading;
  const error = metError || harvError;

  const handlePrev = () => setPage(Math.max(0, page - 1));
  const handleNext = () => setPage(Math.min(totalPages - 1, page + 1));

  return (
    <div className="bg-offwhite min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-heading font-semibold text-text mb-6">
          Exhibition Curation Platform
        </h1>

        {/* ─── Tabs ─── */}
        <div className="flex space-x-6 mb-8 border-b border-text-light">
          {(["met", "harvard", "all"] as TabType[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setMetPage(0);
                setHarvPage(0);
                setAllPage(0);
              }}
              className={
                t === tab
                  ? "pb-2 border-b-2 border-primary text-primary font-semibold"
                  : "pb-2 text-text-light hover:text-primary transition"
              }
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/*  MET Filters */}
        {tab === "met" && (
          <div className="bg-white rounded-lg shadow-card p-6 mb-8">
            <h2 className="font-heading font-medium text-text mb-4">MET Filters</h2>

            {/* Search */}
            <div className="flex gap-2 mb-4">
              <input
                className="flex-grow border border-text-light rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search MET…"
                value={metInput}
                onChange={(e) => setMetInput(e.target.value)}
              />
              <button
                className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 transition"
                onClick={() => {
                  setMetSearch(metInput.trim());
                  setMetPage(0);
                }}
              >
                Search
              </button>
            </div>

            {/* Highlights only */}
            <label className="block mb-4">
              <input
                type="checkbox"
                className="mr-2"
                onChange={(e) => setMetFilters((f) => ({ ...f, isHighlight: e.target.checked }))}
              />
              Highlights only
            </label>

            {/* Row 1: Department & Geographic Location */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <label className="block">
                Department:
                <select
                  className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={typeof metFilters.departmentId === "number" ? metFilters.departmentId : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMetFilters((f) => ({
                      ...f,
                      departmentId: val ? Number(val) : undefined,
                    }));
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

              <label className="block">
                Geographic Location:
                <select
                  className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={metFilters.geoLocation ?? ""}
                  onChange={(e) =>
                    setMetFilters((f) => ({
                      ...f,
                      geoLocation: e.target.value || undefined,
                    }))
                  }
                >
                  <option value="">All</option>
                  <option value="Egypt">Egypt</option>
                  <option value="Italy">Italy</option>
                  <option value="China">China</option>
                  <option value="France">France</option>
                  <option value="Greece">Greece</option>
                  <option value="Peru">Peru</option>
                </select>
              </label>
            </div>

            {/* Row 2: Date/Era, Medium & Sort By */}
            <div className="grid grid-cols-3 gap-4">
              <label className="block">
                Date / Era:
                <select
                  className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={
                    metFilters.dateBegin != null && metFilters.dateEnd != null
                      ? `${metFilters.dateBegin}-${metFilters.dateEnd}`
                      : ""
                  }
                  onChange={(e) => {
                    const [begin, end] = e.target.value.split("-").map(Number);
                    setMetFilters((f) => ({
                      ...f,
                      dateBegin: isNaN(begin) ? undefined : begin,
                      dateEnd: isNaN(end) ? undefined : end,
                    }));
                  }}
                >
                  <option value="">All</option>
                  <option value="0-1599">Before 1600</option>
                  <option value="1600-1699">1600s</option>
                  <option value="1700-1799">1700s</option>
                  <option value="1800-1899">1800s</option>
                  <option value="1900-1999">1900s</option>
                  <option value="2000-2100">2000s+</option>
                </select>
              </label>
              {/*  Medium Input  */}
              <label className="block">
                Medium:
                <input
                  type="text"
                  className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="e.g. Sculpture"
                  onChange={(e) =>
                    setMetFilters((f) => ({
                      ...f,
                      medium: e.target.value || undefined,
                    }))
                  }
                />
              </label>
              {/* Sort by Dropdown  */}
              <label className="block">
                Sort by:
                <select
                  className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={metSort}
                  onChange={(e) =>
                    setMetSort(
                      e.target.value as
                        | "relevance"
                        | "titleAsc"
                        | "titleDesc"
                        | "dateAsc"
                        | "dateDesc"
                    )
                  }
                >
                  <option value="relevance">Relevance</option>
                  <option value="titleAsc">Title A → Z</option>
                  <option value="titleDesc">Title Z → A</option>
                  <option value="dateDesc">Date Newest → Oldest</option>
                  <option value="dateAsc">Date Oldest → Newest</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/*  Harvard Filters */}
        {tab === "harvard" && (
          <div className="bg-white rounded-lg shadow-card p-6 mb-8">
            <h2 className="font-heading font-medium text-text mb-4">Harvard Filters</h2>
            <div className="flex gap-2 mb-4">
              <input
                className="flex-grow border border-text-light rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search Harvard…"
                value={harvInput}
                onChange={(e) => setHarvInput(e.target.value)}
              />
              <button
                className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 transition"
                onClick={() => {
                  setHarvSearch(harvInput.trim());
                  setHarvPage(0);
                }}
              >
                Search
              </button>
            </div>
            {/* Keyword input */}
            <label className="block mb-4">
              Keyword:
              <input
                className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Titles, artists…"
                value={harvFilters.keyword ?? ""}
                onChange={(e) =>
                  setHarvFilters((f) => ({
                    ...f,
                    keyword: e.target.value || undefined,
                  }))
                }
              />
            </label>
            {/* Sort by dropdown */}
            <label className="block">
              Sort by:
              <select
                className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={harvSort}
                onChange={(e) =>
                  setHarvSort(
                    e.target.value as
                      | "relevance"
                      | "titleAsc"
                      | "titleDesc"
                      | "dateAsc"
                      | "dateDesc"
                  )
                }
              >
                <option value="relevance">Relevance</option>
                <option value="titleAsc">Title A → Z</option>
                <option value="titleDesc">Title Z → A</option>
                <option value="dateDesc">Date Newest → Oldest</option>
                <option value="dateAsc">Date Oldest → Newest</option>
              </select>
            </label>
          </div>
        )}

        {/*  ALL Filters + Sort  */}
        {tab === "all" && (
          <div className="bg-white rounded-lg shadow-card p-6 mb-8">
            <h2 className="font-heading font-medium text-text mb-4">Search Both MET + Harvard</h2>
            <div className="flex gap-2 mb-4">
              <input
                className="flex-grow border border-text-light rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Search both…"
                value={metInput}
                onChange={(e) => setMetInput(e.target.value)}
              />
              <button
                className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 transition"
                onClick={() => {
                  setMetSearch(metInput.trim());
                  setHarvSearch(metInput.trim());
                  setAllPage(0);
                }}
              >
                Search
              </button>
            </div>
            <label className="block mb-4">
              Sort by:
              <select
                className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                value={allSort}
                onChange={(e) =>
                  setAllSort(
                    e.target.value as
                      | "relevance"
                      | "titleAsc"
                      | "titleDesc"
                      | "dateAsc"
                      | "dateDesc"
                  )
                }
              >
                <option value="relevance">Relevance</option>
                <option value="titleAsc">Title A → Z</option>
                <option value="titleDesc">Title Z → A</option>
                <option value="dateDesc">Date Newest → Oldest</option>
                <option value="dateAsc">Date Oldest → Newest</option>
              </select>
            </label>
            <p className="text-sm text-text-light">
              (Showing {PER_API_PAGE} from MET + {PER_API_PAGE} from Harvard on each page.)
            </p>
          </div>
        )}

        {/* Loading / Error / Empty  */}
        {loading && <p className="text-center text-text-light">Loading…</p>}
        {error && <p className="text-center text-red-600">Error: {error.message}</p>}
        {!loading && artworks.length === 0 && (
          <p className="text-center text-text-light">No artworks found.</p>
        )}

        {/* Results  */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {artworks.map((art) => (
            <ArtworkCard key={`${art.source}-${art.id}`} artwork={art} showSource={tab === "all"} />
          ))}
        </div>

        {/* Pagination Controls  */}
        <div className="mt-8 flex justify-center items-center flex-wrap gap-3">
          <button
            onClick={handlePrev}
            disabled={page === 0}
            className="px-3 py-1 rounded-lg border bg-white text-text hover:bg-gray-100 disabled:opacity-50"
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
                className={`px-3 py-1 rounded-lg border ${
                  pIndex === page
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-text border hover:bg-gray-100"
                }`}
              >
                {pIndex + 1}
              </button>
            ));
          })()}
          <button
            onClick={handleNext}
            disabled={page + 1 >= totalPages}
            className="px-3 py-1 rounded-lg border bg-white text-text hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

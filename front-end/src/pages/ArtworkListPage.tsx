import { useState, useCallback, useMemo } from "react";
import type { MetFilters, HarvardFilters, CombinedArtwork } from "../types/artwork";
import { useMetDepartments } from "../hooks/useMetDepartments";
import { useMetArtworks } from "../hooks/useMetArtworks";
import { useHarvardArtworks } from "../hooks/useHarvardArtworks";
import ArtworkCard from "../components/ArtworkCard";

type SortOption = "relevance" | "titleAsc" | "titleDesc" | "dateAsc" | "dateDesc";

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

  const PER_API_PAGE = 30;

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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ─── Tabs ─── */}
        <div className="flex space-x-6 mb-8 border-b border-text-light">
          {(["met", "harvard", "all"] as const).map((t) => (
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

        <div className="flex gap-8">
          {/* ─── Sidebar Filters ─── */}
          <aside className="w-64 pr-4 sticky top-0 self-start space-y-6">
            {tab === "met" && (
              <div className="bg-white rounded-lg shadow-card p-6 space-y-4">
                <h2 className="font-heading text-lg font-medium text-text">MET Filters</h2>
                <label className="block">
                  <input
                    type="checkbox"
                    className="mr-2"
                    onChange={(e) =>
                      setMetFilters((f) => ({ ...f, isHighlight: e.target.checked }))
                    }
                  />
                  Highlights only
                </label>
                <label className="block">
                  Department:
                  <select
                    className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:ring-2 focus:ring-primary"
                    value={
                      typeof metFilters.departmentId === "number" ? metFilters.departmentId : ""
                    }
                    onChange={(e) =>
                      setMetFilters((f) => ({
                        ...f,
                        departmentId: e.target.value ? Number(e.target.value) : undefined,
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
                <label className="block">
                  Geographic Location:
                  <select
                    className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:ring-2 focus:ring-primary"
                    value={metFilters.geoLocation ?? ""}
                    onChange={(e) =>
                      setMetFilters((f) => ({
                        ...f,
                        geoLocation: e.target.value || undefined,
                      }))
                    }
                  >
                    <option value="">All</option>
                    <option>Egypt</option>
                    <option>Italy</option>
                    <option>China</option>
                    <option>France</option>
                    <option>Greece</option>
                    <option>Peru</option>
                  </select>
                </label>
                <label className="block">
                  Date / Era:
                  <select
                    className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:ring-2 focus:ring-primary"
                    value={
                      metFilters.dateBegin != null && metFilters.dateEnd != null
                        ? `${metFilters.dateBegin}-${metFilters.dateEnd}`
                        : ""
                    }
                    onChange={(e) => {
                      const [b, e2] = e.target.value.split("-").map(Number);
                      setMetFilters((f) => ({
                        ...f,
                        dateBegin: isNaN(b) ? undefined : b,
                        dateEnd: isNaN(e2) ? undefined : e2,
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
                <label className="block">
                  Medium:
                  <input
                    type="text"
                    className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:ring-2 focus:ring-primary"
                    placeholder="e.g. Sculpture"
                    onChange={(e) =>
                      setMetFilters((f) => ({
                        ...f,
                        medium: e.target.value || undefined,
                      }))
                    }
                  />
                </label>
                <label className="block">
                  Sort by:
                  <select
                    className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:ring-2 focus:ring-primary"
                    value={metSort}
                    onChange={(e) => setMetSort(e.target.value as SortOption)}
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

            {tab === "harvard" && (
              <div className="bg-white rounded-lg shadow-card p-6 space-y-4">
                <h2 className="font-heading text-lg font-medium text-text">Harvard Filters</h2>
                <label className="block">
                  Keyword:
                  <input
                    type="text"
                    className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:ring-2 focus:ring-primary"
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
                <label className="block">
                  Sort by:
                  <select
                    className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:ring-2 focus:ring-primary"
                    value={harvSort}
                    onChange={(e) => setHarvSort(e.target.value as SortOption)}
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

            {tab === "all" && (
              <div className="bg-white rounded-lg shadow-card p-6 space-y-4">
                <h2 className="font-heading text-lg font-medium text-text">Both Collections</h2>
                <label className="block">
                  Sort by:
                  <select
                    className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:ring-2 focus:ring-primary"
                    value={allSort}
                    onChange={(e) => setAllSort(e.target.value as SortOption)}
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
          </aside>

          {/* ─── Main Content ─── */}
          <main className="flex-1 flex flex-col space-y-6">
            {/* Search Bar */}
            <div className="flex gap-2">
              <input
                className="flex-grow border border-text-light rounded-l-lg px-3 py-2 focus:ring-2 focus:ring-primary"
                placeholder={
                  tab === "met"
                    ? "Search MET…"
                    : tab === "harvard"
                    ? "Search Harvard…"
                    : "Search both…"
                }
                value={tab === "harvard" ? harvInput : metInput}
                onChange={(e) =>
                  tab === "harvard" ? setHarvInput(e.target.value) : setMetInput(e.target.value)
                }
              />
              <button
                className="bg-primary text-white px-4 py-2 rounded-r-lg hover:bg-primary/90 transition"
                onClick={() => {
                  if (tab === "met") {
                    setMetSearch(metInput.trim());
                    setMetPage(0);
                  } else if (tab === "harvard") {
                    setHarvSearch(harvInput.trim());
                    setHarvPage(0);
                  } else {
                    setMetSearch(metInput.trim());
                    setHarvSearch(metInput.trim());
                    setAllPage(0);
                  }
                }}
              >
                Search
              </button>
            </div>

            {/* Results */}
            {error && <p className="text-center text-red-600">Error: {error.message}</p>}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: PER_API_PAGE }).map((_, i) => (
                  <div key={i} className="w-80 h-[28rem] rounded-lg bg-gray-200 skeleton" />
                ))}
              </div>
            ) : artworks.length === 0 ? (
              <p className="text-center text-text-light">No artworks found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((art) => (
                  <ArtworkCard
                    key={`${art.source}-${art.id}`}
                    artwork={art}
                    showSource={tab === "all"}
                  />
                ))}
              </div>
            )}

            {/* ─── Pagination ─── */}
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
                        : "bg-white text-text hover:bg-gray-100"
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
          </main>
        </div>
      </div>
    </div>
  );
}

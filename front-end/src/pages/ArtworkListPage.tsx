import { useState, useMemo } from "react";
import type { MetFilters, HarvardFilters, CombinedArtwork, SortOption } from "../types/artwork";
import { useMetDepartments } from "../hooks/useMetDepartments";
import { useMetArtworks } from "../hooks/useMetArtworks";
import { useHarvardArtworks } from "../hooks/useHarvardArtworks";
import ArtworkCard from "../components/ArtworkCard";
import Sidebar from "../components/Sidebar";
import bgImage from "../assets/jack-hunter-1L4E_lsIb9Q-unsplash.jpg";

export default function ArtworkListPage() {
  type TabType = "met" | "harvard" | "all";
  const [tab, setTab] = useState<TabType>("met");

  // MET state
  const [metFilters, setMetFilters] = useState<MetFilters>({});
  const [metSort, setMetSort] = useState<SortOption>("relevance");
  const [metInput, setMetInput] = useState("");
  const [metSearch, setMetSearch] = useState("");
  const [metPage, setMetPage] = useState(0);
  const { departments } = useMetDepartments();

  // Harvard state
  const [harvFilters, setHarvFilters] = useState<HarvardFilters>({});
  const [harvSort, setHarvSort] = useState<SortOption>("relevance");
  const [harvInput, setHarvInput] = useState("");
  const [harvSearch, setHarvSearch] = useState("");
  const [harvPage, setHarvPage] = useState(0);

  // All state
  const [allPage, setAllPage] = useState(0);
  const [allSort, setAllSort] = useState<SortOption>("relevance");

  const PER_API_PAGE = 30;
  const pageParam = tab === "met" ? metPage : tab === "harvard" ? harvPage : allPage;

  const {
    artworks: metArtworks,
    total: totalMet,
    loading: metLoading,
    error: metError,
  } = useMetArtworks(metSearch, metFilters, pageParam, metSort);

  const {
    artworks: harvArtworks,
    total: totalHarv,
    loading: harvLoading,
    error: harvError,
  } = useHarvardArtworks(harvSearch, harvFilters, pageParam, harvSort);

  const combinedArtworks = useMemo<CombinedArtwork[]>(() => {
    const merged = [...metArtworks, ...harvArtworks];
    switch (allSort) {
      case "titleAsc":
        return merged.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      case "titleDesc":
        return merged.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
      case "dateAsc":
        return merged.sort((a, b) => {
          const aDate =
            a.source === "met" ? a.metSlim?.objectEndDate ?? 0 : a.harvardSlim?.dateend ?? 0;
          const bDate =
            b.source === "met" ? b.metSlim?.objectEndDate ?? 0 : b.harvardSlim?.dateend ?? 0;
          return aDate - bDate;
        });
      case "dateDesc":
        return merged.sort((a, b) => {
          const aDate =
            a.source === "met" ? a.metSlim?.objectEndDate ?? 0 : a.harvardSlim?.dateend ?? 0;
          const bDate =
            b.source === "met" ? b.metSlim?.objectEndDate ?? 0 : b.harvardSlim?.dateend ?? 0;
          return bDate - aDate;
        });
      default:
        return merged;
    }
  }, [metArtworks, harvArtworks, allSort]);

  const artworks = useMemo<CombinedArtwork[]>(() => {
    if (tab === "met") return metArtworks;
    if (tab === "harvard") return harvArtworks;
    return combinedArtworks;
  }, [tab, metArtworks, harvArtworks, combinedArtworks]);

  const totalPages = useMemo(() => {
    if (tab === "met") return Math.ceil(totalMet / PER_API_PAGE);
    if (tab === "harvard") return Math.ceil(totalHarv / PER_API_PAGE);
    return Math.max(Math.ceil(totalMet / PER_API_PAGE), Math.ceil(totalHarv / PER_API_PAGE));
  }, [tab, totalMet, totalHarv]);

  const handlePrev = () => {
    const newPage = Math.max(0, pageParam - 1);
    if (tab === "met") setMetPage(newPage);
    else if (tab === "harvard") setHarvPage(newPage);
    else setAllPage(newPage);
  };

  const handleNext = () => {
    const newPage = Math.min(totalPages - 1, pageParam + 1);
    if (tab === "met") setMetPage(newPage);
    else if (tab === "harvard") setHarvPage(newPage);
    else setAllPage(newPage);
  };

  const loading = metLoading || harvLoading;
  const error = metError || harvError;

  return (
    <>
      {/* ─── Hero Banner ─── */}
      <section
        className="relative h-90 w-full bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
        // https://images.unsplash.com/photo-1601887389937-0b02c26b602c?q=80&w=2523&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D
      >
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* banner content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
          <h1 className="text-4xl lg:text-5xl font-heading ">Discover & Curate</h1>
          <p className="mt-2 max-w-xl text-lg">
            Explore thousands of artworks from the MET and Harvard Art Museums.
          </p>
        </div>
      </section>

      <section className="flex bg-black text-white min-h-screen">
        {/* Sidebar flush-left */}
        <Sidebar
          className="w-72"
          tab={tab}
          metFilters={metFilters}
          setMetFilters={setMetFilters}
          metSort={metSort}
          setMetSort={setMetSort}
          departments={departments}
          harvFilters={harvFilters}
          setHarvFilters={setHarvFilters}
          harvSort={harvSort}
          setHarvSort={setHarvSort}
          allSort={allSort}
          setAllSort={setAllSort}
        />

        {/* Main content centered */}
        <div className="flex-1 max-w-7xl mx-auto px-4 py-8">
          {/* Tabs */}
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

          {/* Search Bar */}
          <div className="flex gap-2 mb-6">
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
                  setHarvSearch(harvInput.trim());
                  setAllPage(0);
                }
              }}
            >
              Search
            </button>
          </div>

          {/* Results Grid */}
          {error && <p className="text-center text-red-600">Error: {error.message}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading
              ? Array.from({ length: PER_API_PAGE }).map((_, i) => (
                  <div
                    key={i}
                    className="w-full h-[28rem] aspect-square rounded-lg bg-gray-800 skeleton"
                  />
                ))
              : artworks.map((art) => (
                  <div
                    key={`${art.source}-${art.id}`}
                    className="p-2 transition-transform duration-200 hover:scale-105"
                  >
                    <ArtworkCard artwork={art} showSource={tab === "all"} />
                  </div>
                ))}
          </div>

          {/* Pagination (5 at a time) */}
          <div className="mt-8 flex justify-center items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={pageParam === 0}
              className="px-3 py-1 rounded-lg border border-white bg-black text-white hover:bg-gray-700 disabled:opacity-50"
            >
              Prev
            </button>
            {(() => {
              const pagesToShow = 5;
              const half = Math.floor(pagesToShow / 2);
              let start = Math.max(0, pageParam - half);
              let end = start + pagesToShow;
              if (end > totalPages) {
                end = totalPages;
                start = Math.max(0, end - pagesToShow);
              }
              return Array.from({ length: end - start }, (_, i) => start + i).map((pIndex) => (
                <button
                  key={pIndex}
                  onClick={() => {
                    if (tab === "met") setMetPage(pIndex);
                    else if (tab === "harvard") setHarvPage(pIndex);
                    else setAllPage(pIndex);
                  }}
                  className={`px-3 py-1 rounded-lg border ${
                    pIndex === pageParam
                      ? "bg-white text-black border-black"
                      : "bg-black text-white border-white hover:bg-gray-700"
                  }`}
                >
                  {pIndex + 1}
                </button>
              ));
            })()}
            <button
              onClick={handleNext}
              disabled={pageParam + 1 >= totalPages}
              className="px-3 py-1 rounded-lg border border-white bg-black text-white hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

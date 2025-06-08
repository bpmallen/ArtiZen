import React from "react";
import type { MetFilters, HarvardFilters, SortOption, Department } from "../types/artwork";

interface SidebarProps {
  className?: string; // allows you to pass in a fixed width
  tab: "met" | "harvard" | "all";

  // MET
  metFilters: MetFilters;
  setMetFilters: React.Dispatch<React.SetStateAction<MetFilters>>;
  metSort: SortOption;
  setMetSort: React.Dispatch<React.SetStateAction<SortOption>>;
  departments: Department[];

  // HARVARD
  harvFilters: HarvardFilters;
  setHarvFilters: React.Dispatch<React.SetStateAction<HarvardFilters>>;
  harvSort: SortOption;
  setHarvSort: React.Dispatch<React.SetStateAction<SortOption>>;

  // ALL
  allSort: SortOption;
  setAllSort: React.Dispatch<React.SetStateAction<SortOption>>;
}

export default function Sidebar({
  className = "",
  tab,
  metFilters,
  setMetFilters,
  metSort,
  setMetSort,
  departments,
  harvFilters,
  setHarvFilters,
  harvSort,
  setHarvSort,
  allSort,
  setAllSort,
}: SidebarProps) {
  return (
    <aside
      className={`
        sticky top-10
        bg-black text-white space-y-6 p-6
        ${className}
      `}
    >
      {/* ─── MET Filters ─── */}
      {tab === "met" && (
        <div className="bg-black rounded-lg shadow-card p-6 space-y-4">
          <h2 className="font-heading text-lg font-medium text-text">MET Filters</h2>

          <label className="block">
            <input
              type="checkbox"
              className="mr-2"
              checked={!!metFilters.isHighlight}
              onChange={(e) => setMetFilters((f) => ({ ...f, isHighlight: e.target.checked }))}
            />
            Highlights only
          </label>

          <label className="block">
            Department:
            <select
              className="mt-1 w-full border border-text-light rounded px-3 py-2 focus:ring-2 focus:ring-primary"
              value={metFilters.departmentId != null ? String(metFilters.departmentId) : ""}
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
              value={metFilters.medium ?? ""}
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
              <option value="dateDesc">Newest → Oldest</option>
              <option value="dateAsc">Oldest → Newest</option>
            </select>
          </label>
        </div>
      )}

      {/* ─── Harvard Filters ─── */}
      {tab === "harvard" && (
        <div className="bg-black rounded-lg shadow-card p-6 space-y-4">
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
              <option value="dateDesc">Newest → Oldest</option>
              <option value="dateAsc">Oldest → Newest</option>
            </select>
          </label>
        </div>
      )}

      {/* ─── All Collections Sort ─── */}
      {tab === "all" && (
        <div className="bg-black rounded-lg shadow-card p-6 space-y-4">
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
              <option value="dateDesc">Newest → Oldest</option>
              <option value="dateAsc">Oldest → Newest</option>
            </select>
          </label>
        </div>
      )}
    </aside>
  );
}

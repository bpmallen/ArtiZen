import { useState, useCallback, useMemo } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchHarvardArtworks } from "../services/harvardArtMuseumApi";
import { fetchMetArtworkById } from "../services/metropolitanMuseumApi.ts";
import type { HarvardArtworksResponse, MetArtwork, CombinedArtwork } from "../types/artwork.d.ts";

const initialMetObjectIds = [437133, 2, 436535, 326859, 45960];

function ArtworkListPage() {
  const [filter, setFilter] = useState<"all" | "harvard" | "met">("all");
  const {
    data: harvardData,
    fetchNextPage: fetchNextHarvardPage,
    hasNextPage: hasNextHarvardPage,
    isFetchingNextPage: isFetchingHarvardNextPage,
    isLoading: isHarvardLoading,
    isError: isHarvardError,
    error: harvardError,
  } = useInfiniteQuery<
    HarvardArtworksResponse,
    Error,
    { pages: CombinedArtwork[][]; pageParams: unknown[] }
  >({
    queryKey: ["harvardArtworks"],
    queryFn: ({ pageParam = 1 }) => fetchHarvardArtworks(pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage?.info?.next) {
        const urlParams = new URLSearchParams(new URL(lastPage.info.next).search);
        const nextPage = urlParams.get("page");
        return nextPage ? parseInt(nextPage, 10) : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
    select: (data) => ({
      ...data,
      pages: data.pages.map(
        (page) =>
          page?.records?.map((artwork) => ({
            id: artwork.id,
            title: artwork.title,
            artistDisplayName: artwork.people?.[0]?.displayname || null,
            primaryImageSmall: artwork.primaryimageurl,
            source: "harvard" as const,
            harvardData: artwork,
          })) || []
      ),
    }),
  });

  const {
    isLoading: isMetArtworksLoading,
    isError: isMetArtworksError,
    data: metArtworksRaw, // Renamed to avoid confusion
    error: metArtworksError,
  } = useQuery<MetArtwork[], Error>({
    queryKey: ["metArtworks", initialMetObjectIds],
    queryFn: () => Promise.all(initialMetObjectIds.map((id: number) => fetchMetArtworkById(id))),
    enabled: true,
  });

  const metArtworks = useMemo(() => {
    return (
      metArtworksRaw?.map((artwork) => ({
        id: artwork.objectID,
        title: artwork.title,
        artistDisplayName: artwork.artistDisplayName || null,
        primaryImageSmall: artwork.primaryImageSmall || null,
        source: "met" as const,
        metData: artwork,
      })) || []
    );
  }, [metArtworksRaw]);

  const combinedArtworks = useMemo((): CombinedArtwork[] => {
    const harvardItems = (harvardData?.pages?.flat() as CombinedArtwork[]) || [];
    const metItems: CombinedArtwork[] = metArtworks || [];
    return [...harvardItems, ...metItems];
  }, [harvardData, metArtworks]);

  const filteredArtworks = useMemo(() => {
    if (filter === "all") return combinedArtworks;
    return combinedArtworks.filter((artwork: CombinedArtwork) => artwork.source === filter);
  }, [combinedArtworks, filter]);

  const isLoading = isHarvardLoading || isMetArtworksLoading;
  const isError = isHarvardError || isMetArtworksError;
  const isFetching = isFetchingHarvardNextPage;
  const error = harvardError?.message || metArtworksError?.message;

  const handleFilterChange = useCallback(
    (newFilter: "all" | "harvard" | "met") => {
      setFilter(newFilter);
    },
    [setFilter]
  );

  if (isLoading) return <div>Loading artworks...</div>;
  if (isError) return <div>Error loading artworks: {error}</div>;

  return (
    <div>
      <h2>Exhibition Curation Platform</h2>
      <div>
        <button onClick={() => handleFilterChange("all")} disabled={filter === "all"}>
          All
        </button>
        <button onClick={() => handleFilterChange("harvard")} disabled={filter === "harvard"}>
          Harvard
        </button>
        <button onClick={() => handleFilterChange("met")} disabled={filter === "met"}>
          Metropolitan
        </button>
      </div>
      {isFetching && <div>Loading more artworks...</div>}
      {filteredArtworks.map((artwork: CombinedArtwork) => (
        <div key={artwork.id}>
          {artwork.title} ({artwork.source})
        </div>
      ))}
      {filter !== "met" && (
        <button onClick={() => fetchNextHarvardPage()} disabled={!hasNextHarvardPage || isFetching}>
          {isFetching
            ? "Loading more..."
            : hasNextHarvardPage
            ? "Next Page (Harvard)"
            : "No more Harvard artworks"}
        </button>
      )}
    </div>
  );
}

export default ArtworkListPage;

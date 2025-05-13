import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { fetchHarvardArtworks } from "../services/harvardArtMuseumApi";
import { fetchMetArtworkById } from "../services/metropolitanMuseumApi.ts";
import type { HarvardArtwork, HarvardArtworksResponse, MetArtwork } from "../types/artwork.d.ts";

const initialMetObjectIds = [437133, 2, 436535, 326859, 45960];

function ArtworkListPage() {
  const {
    data: harvardData,
    fetchNextPage: fetchNextHarvardPage,
    hasNextPage: hasNextHarvardPage,
    isFetchingNextPage: isFetchingHarvardNextPage,
    isLoading: isHarvardLoading,
    isError: isHarvardError,
    error: harvardError,
  } = useInfiniteQuery<HarvardArtworksResponse, Error>({
    queryKey: [`harvardArtworks`],
    queryFn: ({ pageParam = 1 }) => fetchHarvardArtworks(pageParam as number),
    getNextPageParam: (lastPage) => {
      if (lastPage?.info?.next) {
        const urlParams = new URLSearchParams(new URL(lastPage.info.next).search);
        const nextPage = urlParams.get(`page`);
        return nextPage ? parseInt(nextPage, 10) : undefined;
      }
      return undefined;
    },
    initialPageParam: 1,
    select: (data) => data,
  });

  const {
    isLoading: isMetArtworksLoading,
    isError: isMetArtworksError,
    data: metArtworks,
    error: metArtworksError,
  } = useQuery<MetArtwork[], Error>({
    queryKey: ["metArtworks", initialMetObjectIds],
    queryFn: () => Promise.all(initialMetObjectIds.map((id: number) => fetchMetArtworkById(id))),
    enabled: true,
  });

  const isLoading = isHarvardLoading || isMetArtworksLoading;
  const isError = isHarvardError || isMetArtworksError;
  const isFetching = isFetchingHarvardNextPage;
  const error = harvardError?.message || metArtworksError?.message;

  if (isLoading) return <div>Loading artworks...</div>;
  if (isError) return <div>Error loading artworks: {error}</div>;

  return (
    <div>
      <h2>Harvard Art Museums</h2>
      {isFetching && <div>Loading next page...</div>}
      {harvardData?.pages?.flatMap((page) =>
        (page as HarvardArtworksResponse)?.records?.map((artwork: HarvardArtwork) => (
          <div key={artwork.id}>{artwork.title}</div>
        ))
      )}
      <button onClick={() => fetchNextHarvardPage()} disabled={!hasNextHarvardPage || isFetching}>
        {isFetching ? "Loading more..." : hasNextHarvardPage ? "Next Page" : "No more pages"}
      </button>
      <h2>Metropolitan Museum of Art</h2>
      {metArtworks?.map((artwork: MetArtwork) => (
        <div key={artwork.objectID}>{artwork.title}</div>
      ))}
    </div>
  );
}
export default ArtworkListPage;

import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchHarvardArtworks } from "../services/harvardArtMuseumApi";
import { fetchMetArtworkById } from "../services/metropolitanMuseumApi.ts";
import type { HarvardArtworksResponse, MetArtwork, CombinedArtwork } from "../types/artwork.d.ts";

const initialMetObjectIds = [437133, 2, 436535, 326859, 45960];
const HARVARD_PAGE_SIZE = 5;
const INITIAL_COMBINED_COUNT = 10;

function ArtworkListPage() {
  const [filter, setFilter] = useState<"all" | "harvard" | "met">("all");
  const [harvardPage, setHarvardPage] = useState(1);

  const {
    isLoading: isHarvardLoading,
    isError: isHarvardError,
    data: harvardData,
    error: harvardError,
  } = useQuery<HarvardArtworksResponse, Error>({
    queryKey: ["harvardArtworks", harvardPage, HARVARD_PAGE_SIZE],
    queryFn: () => fetchHarvardArtworks(harvardPage, HARVARD_PAGE_SIZE),
  });

  const {
    isLoading: isMetArtworksLoading,
    isError: isMetArtworksError,
    data: metArtworksRaw,
    error: metArtworksError,
  } = useQuery<MetArtwork[], Error>({
    queryKey: ["metArtworks", initialMetObjectIds.slice(0, 5)],
    queryFn: () =>
      Promise.all(initialMetObjectIds.slice(0, 5).map((id: number) => fetchMetArtworkById(id))),
    enabled: true,
  });

  const metArtworks = useMemo((): CombinedArtwork[] => {
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
    const harvardItems: CombinedArtwork[] =
      harvardData?.records?.map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        artistDisplayName: artwork.people?.[0]?.displayname || null,
        primaryImageSmall: artwork.primaryimageurl,
        source: "harvard" as const,
        harvardData: artwork,
      })) || [];
    const metItems: CombinedArtwork[] = metArtworks || [];
    return [...harvardItems, ...metItems];
  }, [harvardData, metArtworks]);

  const filteredArtworks = useMemo(() => {
    if (filter === "all") return combinedArtworks.slice(0, INITIAL_COMBINED_COUNT);
    return combinedArtworks
      .filter((artwork: CombinedArtwork) => artwork.source === filter)
      .slice(0, INITIAL_COMBINED_COUNT);
  }, [combinedArtworks, filter]);

  const isLoading = isHarvardLoading || isMetArtworksLoading;
  const isError = isHarvardError || isMetArtworksError;
  const error = harvardError?.message || metArtworksError?.message;
  const totalHarvardPages = harvardData?.info?.pages || 1;

  const handleFilterChange = useCallback(
    (newFilter: "all" | "harvard" | "met") => {
      setFilter(newFilter);
      setHarvardPage(1);
    },
    [setFilter]
  );

  const handleNextPage = useCallback(() => {
    if (harvardPage < totalHarvardPages) {
      setHarvardPage((prevPage) => prevPage + 1);
    }
  }, [harvardPage, totalHarvardPages]);

  const handlePrevPage = useCallback(() => {
    if (harvardPage > 1) {
      setHarvardPage((prevPage) => prevPage - 1);
    }
  }, [harvardPage]);

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
      {filteredArtworks.map((artwork: CombinedArtwork) => (
        <div key={artwork.id}>
          {artwork.title} ({artwork.source})
        </div>
      ))}

      {filter !== "met" && (
        <div>
          <button onClick={handlePrevPage} disabled={harvardPage === 1}>
            Previous Page
          </button>
          <span>
            Page {harvardPage} of {totalHarvardPages}
          </span>
          <button onClick={handleNextPage} disabled={harvardPage === totalHarvardPages}>
            Next Page
          </button>
        </div>
      )}
    </div>
  );
}

export default ArtworkListPage;

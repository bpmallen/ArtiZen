import { useQuery } from "@tanstack/react-query";
import { fetchHarvardArtworks } from "../services/harvardArtMuseumApi";
import type { HarvardArtwork, HarvardArtworksResponse } from "../types/artwork.d.ts";

function ArtworkListPage() {
  const {
    isLoading: isHarvardLoading,
    isError: isHarvardError,
    data: harvardData,
    error: harvardError,
  } = useQuery<HarvardArtworksResponse, Error>({
    queryKey: [`harvardArtworks`, 1, 10],
    queryFn: () => fetchHarvardArtworks(1, 10),
  });

  if (isHarvardLoading) {
    return <div>Loading Harvard artworks...</div>;
  }

  if (isHarvardError) {
    return <div>Error loading Harvard artworks: {harvardError?.message}</div>;
  }

  return (
    <div>
      <h2>Harvard Art Museums</h2>
      {harvardData?.records?.map((artwork: HarvardArtwork) => {
        return <div key={artwork.id}>{artwork.title}</div>;
      })}
    </div>
  );
}

export default ArtworkListPage;

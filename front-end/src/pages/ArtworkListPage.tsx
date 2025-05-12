import { useQuery } from "@tanstack/react-query";
import { fetchHarvardArtworks } from "../services/harvardArtMuseumApi";
import { fetchMetArtworkById } from "../services/metropolitanMuseumApi.ts";
import type { HarvardArtwork, HarvardArtworksResponse, MetArtwork } from "../types/artwork.d.ts";

const initialMetObjectIds = [437133, 2, 436535, 326859, 45960];

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
  const error = harvardError?.message || metArtworksError?.message;

  if (isLoading) return <div>Loading artworks...</div>;
  if (isError) return <div>Error loading artworks: {error}</div>;

  return (
    <div>
      <h2>Harvard Art Museums</h2>
      {harvardData?.records?.map((artwork: HarvardArtwork) => {
        return <div key={artwork.id}>{artwork.title}</div>;
      })}
      <h2>Metropolitan Museum of Art</h2>
      {metArtworks?.map((artwork: MetArtwork) => (
        <div key={artwork.objectID}>{artwork.title}</div>
      ))}
    </div>
  );
}

export default ArtworkListPage;

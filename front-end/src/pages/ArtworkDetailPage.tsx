import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/useAuth";
import { fetchMetById, fetchHarvardById } from "../services/artworkDetails";
import CreateCollectionModal from "../components/CreateCollectionModal";
import type { CombinedArtwork, MetSlim, HarvardSlim } from "../types/artwork";

export default function ArtworkDetailPage() {
  const { source, artworkId } = useParams<{
    source: "met" | "harvard";
    artworkId: string;
  }>();
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = React.useState(false);

  const {
    data: rawDetail,
    isLoading,
    isError,
    error,
  } = useQuery<{
    primaryImageSmall: string | null;
    title: string;
    date: string | number;
  }>({
    queryKey: ["artwork", source, artworkId],
    queryFn: async () => {
      if (source === "met") {
        return await fetchMetById(artworkId!);
      } else {
        return await fetchHarvardById(artworkId!);
      }
    },
    enabled: Boolean(source && artworkId),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <p>Loading artwork details…</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center text-red-600">
        <p>Error loading artwork details.</p>
        <p>{error!.message}</p>
      </div>
    );
  }

  const detail = rawDetail!;
  const detailDate = detail.date;

  const combined: CombinedArtwork = {
    id: source === "met" ? Number(artworkId!) : artworkId!,
    source: source!,
    title: detail.title || null,
    artistDisplayName: null,
    primaryImageSmall: detail.primaryImageSmall,
    // Only set metSlim if source is "met"
    metSlim:
      source === "met"
        ? ({
            objectID: Number(artworkId!),
            title: detail.title || null,
            artistDisplayName: null,
            primaryImageSmall: detail.primaryImageSmall,
            objectEndDate: typeof detail.date === "number" ? detail.date : null,
          } as MetSlim)
        : undefined,

    harvardSlim:
      source === "harvard"
        ? ({
            id: 0,
            objectnumber: artworkId!,
            title: detail.title || null,
            dated: typeof detail.date === "string" ? detail.date : null,
            datebegin: null,
            dateend: typeof detail.date === "number" ? detail.date : null,
            people: [], // we didn’t fetch “people” in fetchHarvardById
            primaryimageurl: detail.primaryImageSmall,
          } as HarvardSlim)
        : undefined,
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
        ← Back to Gallery
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left: Large image or fallback */}
        {combined.primaryImageSmall ? (
          <img
            src={combined.primaryImageSmall}
            alt={combined.title || ""}
            className="w-full md:w-1/2 rounded shadow-lg object-contain"
          />
        ) : (
          <div className="w-full md:w-1/2 h-64 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}

        {/* Right: Display title, source, and date */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{combined.title || "Untitled"}</h1>
          <p className="text-gray-700">
            <span className="font-medium">Source:</span> {combined.source.toUpperCase()}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Date:</span> {detailDate ?? "Unknown"}
          </p>

          {/* Show “Add to Collection” only if logged in */}
          {isAuthenticated && (
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
            >
              Add to Collection
            </button>
          )}
        </div>
      </div>

      {isAuthenticated && showModal && (
        <CreateCollectionModal artwork={combined} close={() => setShowModal(false)} />
      )}
    </div>
  );
}

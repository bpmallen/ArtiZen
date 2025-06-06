// front-end/src/pages/ArtworkDetailPage.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/useAuth";
import CreateCollectionModal from "../components/CreateCollectionModal";
import type { CombinedArtwork, MetSlim, HarvardSlim } from "../types/artwork";
import {
  fetchMetById,
  type MetDetail,
  fetchHarvardById,
  type HarvardDetail,
} from "../services/artworkDetails";

export default function ArtworkDetailPage() {
  const { source, artworkId } = useParams<{ source: "met" | "harvard"; artworkId: string }>();
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = React.useState(false);

  const {
    data: rawDetail,
    isLoading,
    isError,
    error,
  } = useQuery<MetDetail | HarvardDetail>({
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
        <p>{(error as Error).message}</p>
      </div>
    );
  }

  const detail = rawDetail!;

  // Common fields
  const imageUrl = detail.primaryImageSmall;
  const title = detail.title;

  // Use 'objectDate' (string) for Met, and 'date' (could be number|string) for Harvard
  const dateString =
    source === "met"
      ? (detail as MetDetail).objectDate // full string “ca. 1512–15”
      : typeof (detail as HarvardDetail).date === "string"
      ? ((detail as HarvardDetail).date as string)
      : null;

  // Met‐specific fields
  let artistDisplay = "";
  let artistBio = "";
  let mediumDisplay = "";
  let cultureDisplay = "";
  let dimensionsDisplay = "";
  let creditDisplay = "";
  let metLabelText: string | null = null;

  if (source === "met") {
    const met = detail as MetDetail;
    artistDisplay = met.artistDisplayName || "Unknown artist";
    artistBio = met.artistDisplayBio || ""; // ← Now valid
    mediumDisplay = met.medium || "Unknown medium";
    cultureDisplay = met.culture || "Unknown culture";
    dimensionsDisplay = met.dimensions || "";
    creditDisplay = met.creditLine || "";
    metLabelText = met.labelText || null;
    console.log("metLabelText = ", metLabelText);
  } else {
    const harv = detail as HarvardDetail;
    artistDisplay = harv.people.length ? harv.people.map((p) => p.name).join(", ") : "Unknown";
    mediumDisplay = harv.medium || "Unknown medium";
    cultureDisplay = harv.culture || "Unknown culture";
    dimensionsDisplay = harv.dimensions || "";
    creditDisplay = harv.creditline || "";
    // provenanceDisplay = harv.provenance || "";
  }

  const combined: CombinedArtwork = {
    id: source === "met" ? Number(artworkId!) : artworkId!,
    source: source!,
    title: title || null,
    artistDisplayName: artistDisplay || null,
    primaryImageSmall: imageUrl,
    metSlim:
      source === "met"
        ? ({
            objectID: Number(artworkId!),
            title: title || null,
            artistDisplayName: artistDisplay || null,
            primaryImageSmall: imageUrl,

            objectEndDate: ((detail as MetDetail).date as number) ?? null,
          } as MetSlim)
        : undefined,
    harvardSlim:
      source === "harvard"
        ? ({
            id: 0,
            objectnumber: artworkId!,
            title: title || null,

            dated:
              typeof (detail as HarvardDetail).date === "string"
                ? ((detail as HarvardDetail).date as string)
                : null,
            datebegin: null,
            dateend:
              typeof (detail as HarvardDetail).date === "number"
                ? ((detail as HarvardDetail).date as number)
                : null,
            people: (detail as HarvardDetail).people,
            primaryimageurl: imageUrl,
          } as HarvardSlim)
        : undefined,
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link to="/" className="text-blue-600 hover:underline">
        ← Back to Gallery
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full md:w-1/2 rounded shadow-lg object-contain"
          />
        ) : (
          <div className="w-full md:w-1/2 h-64 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}

        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-gray-800">{title}</h1>

          {/*  SHOW FULL objectDate STRING */}
          <p className="text-gray-700">
            <span className="font-medium">Date:</span> {dateString || "Unknown"}
          </p>

          {/*  Artist name and bio */}
          <p className="text-gray-700">
            <span className="font-medium">Artist:</span> {artistDisplay}
          </p>
          {source === "met" && artistBio && <p className="text-gray-600 italic">{artistBio}</p>}

          {/* Medium and Culture */}
          <p className="text-gray-700">
            <span className="font-medium">Medium:</span> {mediumDisplay}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Culture:</span> {cultureDisplay}
          </p>

          {/* Dimensions */}
          {dimensionsDisplay && (
            <p className="text-gray-700">
              <span className="font-medium">Dimensions:</span> {dimensionsDisplay}
            </p>
          )}

          {/* Credit Line */}
          {creditDisplay && (
            <p className="text-gray-700">
              <span className="font-medium">Credit Line:</span> {creditDisplay}
            </p>
          )}
        </div>
      </div>

      {/* About this work (Met only) */}
      {source === "met" && metLabelText ? (
        <div className="prose max-w-3xl mx-auto p-4 bg-gray-50 rounded">
          <h2 className="text-2xl font-semibold mb-2">About this work</h2>
          <div className="text-gray-800" dangerouslySetInnerHTML={{ __html: metLabelText }} />
        </div>
      ) : source === "met" ? (
        <div className="max-w-3xl mx-auto p-4 bg-gray-50 rounded text-gray-600">
          <h2 className="text-2xl font-semibold mb-2">About this work</h2>
          <p>No description available.</p>
        </div>
      ) : null}

      {isAuthenticated && (
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Add to Collection
          </button>
        </div>
      )}

      {isAuthenticated && showModal && (
        <CreateCollectionModal artwork={combined} close={() => setShowModal(false)} />
      )}
    </div>
  );
}

import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/useAuth";
import CreateCollectionModal from "../components/CreateCollectionModal";

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
        <p className="text-white">Loading artwork details…</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center">
        <p className="text-white">Error loading artwork details.</p>
        <p className="text-white">{(error as Error).message}</p>
      </div>
    );
  }

  const detail = rawDetail!;
  const isMet = source === "met";
  const met = detail as MetDetail;
  const harv = detail as HarvardDetail;

  const imageUrl = isMet ? met.primaryImageSmall : harv.primaryimageurl;
  const title = detail.title;
  const dateString = isMet ? met.objectDate : harv.dated;

  const artistDisplay = isMet
    ? met.artistDisplayName || "Unknown artist"
    : harv.people?.length
    ? harv.people.map((p) => p.name).join(", ")
    : "Unknown artist";

  // Artist bio (MET only)
  const artistBio = isMet ? met.artistDisplayBio : null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link to="/" className="text-blue-400 hover:underline">
        ← Back to Gallery
      </Link>

      {/* Main Image + All Details in One Block*/}
      <div className="flex flex-col md:flex-row gap-8">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || ""}
            className="w-full md:w-1/2 rounded shadow-lg object-contain"
          />
        ) : (
          <div className="w-full md:w-1/2 h-64 bg-gray-800 flex items-center justify-center">
            <p className="text-white">No image available</p>
          </div>
        )}

        <div className="flex-1 space-y-4">
          {/*  Title + Core Fields */}
          <h1 className="text-3xl font-bold text-white">{title}</h1>

          <p className="text-white">
            <span className="font-medium">Date:</span> {dateString || "Unknown"}
          </p>

          <p className="text-white">
            <span className="font-medium">Artist:</span> {artistDisplay}
          </p>
          {artistBio && <p className="text-white italic">{artistBio}</p>}

          <p className="text-white">
            <span className="font-medium">Medium:</span>{" "}
            {isMet ? met.medium || "Unknown" : harv.medium || "Unknown"}
          </p>

          <p className="text-white">
            <span className="font-medium">Culture:</span>{" "}
            {isMet ? met.culture || "Unknown" : harv.culture || "Unknown"}
          </p>

          {(isMet ? met.dimensions : harv.dimensions) && (
            <p className="text-white">
              <span className="font-medium">Dimensions:</span>{" "}
              {isMet ? met.dimensions : harv.dimensions}
            </p>
          )}

          {(isMet ? met.creditLine : harv.creditline) && (
            <p className="text-white">
              <span className="font-medium">Credit Line:</span>{" "}
              {isMet ? met.creditLine : harv.creditline}
            </p>
          )}

          {/* Shared Additional Details  */}
          {isMet ? (
            <>
              {met.department && (
                <p className="text-white">
                  <span className="font-medium">Department:</span> {met.department}
                </p>
              )}
              {met.classification && (
                <p className="text-white">
                  <span className="font-medium">Classification:</span> {met.classification}
                </p>
              )}
              {met.objectName && (
                <p className="text-white">
                  <span className="font-medium">Object Name:</span> {met.objectName}
                </p>
              )}
              {met.period && (
                <p className="text-white">
                  <span className="font-medium">Period:</span> {met.period}
                </p>
              )}
              {met.dynasty && (
                <p className="text-white">
                  <span className="font-medium">Dynasty:</span> {met.dynasty}
                </p>
              )}
              {met.reign && (
                <p className="text-white">
                  <span className="font-medium">Reign:</span> {met.reign}
                </p>
              )}
              {met.country && (
                <p className="text-white">
                  <span className="font-medium">Country:</span> {met.country}
                </p>
              )}
              {met.region && (
                <p className="text-white">
                  <span className="font-medium">Region:</span> {met.region}
                </p>
              )}
              {met.subregion && (
                <p className="text-white">
                  <span className="font-medium">Subregion:</span> {met.subregion}
                </p>
              )}
              {met.city && (
                <p className="text-white">
                  <span className="font-medium">City:</span> {met.city}
                </p>
              )}
              {met.state && (
                <p className="text-white">
                  <span className="font-medium">State:</span> {met.state}
                </p>
              )}
              {met.excavation && (
                <p className="text-white">
                  <span className="font-medium">Excavation:</span> {met.excavation}
                </p>
              )}
              {met.locus && (
                <p className="text-white">
                  <span className="font-medium">Locus:</span> {met.locus}
                </p>
              )}
            </>
          ) : (
            <>
              {harv.department && (
                <p className="text-white">
                  <span className="font-medium">Department:</span> {harv.department}
                </p>
              )}
              {harv.classification && (
                <p className="text-white">
                  <span className="font-medium">Classification:</span> {harv.classification}
                </p>
              )}
              {harv.provenance && (
                <p className="text-white">
                  <span className="font-medium">Provenance:</span> {harv.provenance}
                </p>
              )}
              {harv.labeltext && (
                <p className="text-white">
                  <span className="font-medium">Label Text:</span> {harv.labeltext}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/*  “Add to Collection” Button (if logged in)  */}
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
        <CreateCollectionModal
          artwork={{
            id: isMet ? Number(artworkId!) : artworkId!,
            title: detail.title,
            source: source!,
            artistDisplayName: artistDisplay,
            primaryImageSmall: imageUrl,
            metSlim: isMet
              ? {
                  objectID: Number(artworkId!),
                  title: detail.title,
                  artistDisplayName: met.artistDisplayName,
                  primaryImageSmall: imageUrl,
                  objectEndDate: met.objectEndDate ?? null,
                }
              : undefined,
            harvardSlim: !isMet
              ? {
                  id: harv.id,
                  objectnumber: harv.objectnumber,
                  title: detail.title,
                  dated: harv.dated,
                  datebegin: harv.datebegin,
                  dateend: harv.dateend,
                  people: harv.people.map((p) => ({ name: p.name })),
                  primaryimageurl: harv.primaryimageurl,
                }
              : undefined,
          }}
          close={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

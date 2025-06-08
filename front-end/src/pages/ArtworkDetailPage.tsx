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
import { assetUrl } from "../cloudinary";
const bgImage = assetUrl("adrianna-geo-1rBg5YSi00c-unsplash_mutow7", "1749423015", "jpg");
console.log("bgImage →", bgImage);

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
  } = useQuery<MetDetail | HarvardDetail>({
    queryKey: ["artwork", source, artworkId],
    queryFn: async () => {
      if (source === "met") return await fetchMetById(artworkId!);
      return await fetchHarvardById(artworkId!);
    },
    enabled: Boolean(source && artworkId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white font-roboto flex items-center justify-center">
        <p>Loading artwork details…</p>
      </div>
    );
  }
  if (isError) {
    return (
      <div className="min-h-screen bg-black text-white font-roboto flex flex-col items-center justify-center p-4">
        <p>Error loading artwork details.</p>
        <p>{(error as Error).message}</p>
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
  const artistBio = isMet ? met.artistDisplayBio : null;

  return (
    <div className="min-h-screen bg-black text-white font-roboto">
      {/* Hero Banner */}
      <section
        className="relative h-80 w-full bg-cover bg-center mb-6 filter grayscale brightness-75 contrast-125"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-heading uppercase tracking-wide text-white">
            Artwork Details
          </h1>
          <p className="mt-2 max-w-xl text-lg text-white">
            Explore the full details of this piece.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Link to="/" className="text-slate-400 hover:text-slate-200">
          ← Back to Gallery
        </Link>

        <div className="flex flex-col md:flex-row gap-6">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title || ""}
              className="w-full md:w-1/2 rounded shadow-lg object-contain"
            />
          ) : (
            <div className="w-full md:w-1/2 h-64 bg-slate-900 flex items-center justify-center">
              <p className="text-slate-400">No image available</p>
            </div>
          )}

          <div className="flex-1 space-y-3 leading-relaxed">
            <h2 className="text-3xl font-bold">{title}</h2>

            <p>
              <span className="font-bold">Date:</span>
              <span className="italic font-light text-slate-300">
                {` ${dateString || "Unknown"}`}
              </span>
            </p>

            <p>
              <span className="font-bold">Artist:</span>
              <span className="italic font-light text-slate-300">{` ${artistDisplay}`}</span>
            </p>
            {artistBio && <p className="italic font-light text-slate-300">{artistBio}</p>}

            <p>
              <span className="font-bold">Medium:</span>
              <span className="italic font-light text-slate-300">
                {` ${isMet ? met.medium || "Unknown" : harv.medium || "Unknown"}`}
              </span>
            </p>

            <p>
              <span className="font-bold">Culture:</span>
              <span className="italic font-light text-slate-300">
                {` ${isMet ? met.culture || "Unknown" : harv.culture || "Unknown"}`}
              </span>
            </p>

            {(isMet ? met.dimensions : harv.dimensions) && (
              <p>
                <span className="font-bold">Dimensions:</span>
                <span className="italic font-light text-slate-300">
                  {` ${isMet ? met.dimensions : harv.dimensions}`}
                </span>
              </p>
            )}

            {(isMet ? met.creditLine : harv.creditline) && (
              <p>
                <span className="font-bold">Credit Line:</span>
                <span className="italic font-light text-slate-300">
                  {` ${isMet ? met.creditLine : harv.creditline}`}
                </span>
              </p>
            )}

            {isMet ? (
              <>
                {met.department && (
                  <p>
                    <span className="font-bold">Department:</span>
                    <span className="italic font-light text-slate-300">{` ${met.department}`}</span>
                  </p>
                )}
                {met.classification && (
                  <p>
                    <span className="font-bold">Classification:</span>
                    <span className="italic font-light text-slate-300">
                      {` ${met.classification}`}
                    </span>
                  </p>
                )}
                {met.objectName && (
                  <p>
                    <span className="font-bold">Object Name:</span>
                    <span className="italic font-light text-slate-300">{` ${met.objectName}`}</span>
                  </p>
                )}
                {/* add any other MET-specific fields similarly */}
              </>
            ) : (
              <>
                {harv.department && (
                  <p>
                    <span className="font-bold">Department:</span>
                    <span className="italic font-light text-slate-300">
                      {` ${harv.department}`}
                    </span>
                  </p>
                )}
                {harv.classification && (
                  <p>
                    <span className="font-bold">Classification:</span>
                    <span className="italic font-light text-slate-300">
                      {` ${harv.classification}`}
                    </span>
                  </p>
                )}
                {/* add any other Harvard-specific fields similarly */}
              </>
            )}
          </div>
        </div>

        {isAuthenticated && (
          <div className="text-center">
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded"
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
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import CreateCollectionModal from "./CreateCollectionModal";
import type { CombinedArtwork } from "../types/artwork";

interface ArtworkCardProps {
  artwork: CombinedArtwork;
  showSource: boolean;
}

export default function ArtworkCard({ artwork, showSource }: ArtworkCardProps) {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div
      className="
            artwork-card
            relative
            w-full            /* fill its grid column */ :contentReference[oaicite:0]{index=0}
            h-[32rem]        /* larger fixed height */ :contentReference[oaicite:1]{index=1}
            bg-offwhite
            text-text
            rounded-lg
            overflow-hidden
             flex-col
            border border-white   /* white outline for grid lines */ :contentReference[oaicite:2]{index=2}
            shadow-card
          "
    >
      {/* Image */}
      <Link
        to={`/artwork/${artwork.source}/${artwork.id}`}
        className="flex-grow w-full overflow-hidden"
      >
        {artwork.primaryImageSmall ? (
          <img
            src={artwork.primaryImageSmall}
            alt={artwork.title || ""}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
        )}
      </Link>

      {/* Details footer */}
      <div className="p-4 h-40 flex flex-col justify-between">
        {/* Title row with save icon on the right */}
        <div className="flex items-center space-x-2">
          <Link to={`/artwork/${artwork.source}/${artwork.id}`} className="flex-1 min-w-0">
            <h3 className="text-lg font-heading font-semibold text-text truncate">
              {artwork.title || "Untitled"}
            </h3>
          </Link>

          {isAuthenticated && (
            <button
              onClick={() => setShowModal(true)}
              className="cursor-pointer text-text-light hover:text-primary flex-shrink-0"
              title="Save to Collection"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-6 h-6"
              >
                <path d="M6 4a2 2 0 0 0-2 2v16l8-5.333L20 22V6a2 2 0 0 0-2-2H6z" />
              </svg>
            </button>
          )}
        </div>

        {/* Artist */}
        <p className="text-sm text-text-light truncate">
          {artwork.source === "met"
            ? artwork.metSlim?.artistDisplayName || "Unknown Artist"
            : artwork.harvardSlim?.people?.[0]?.name || "Unknown Artist"}
        </p>

        {/* Date + optional source */}
        <div className="flex justify-between text-sm text-text-light">
          <span>
            {artwork.source === "met"
              ? artwork.metSlim?.objectEndDate ?? "n.d."
              : artwork.harvardSlim?.dated ?? "n.d."}
          </span>
          {showSource && <span className="uppercase">{artwork.source}</span>}
        </div>
      </div>

      {/* Modal */}
      {showModal && <CreateCollectionModal artwork={artwork} close={() => setShowModal(false)} />}
    </div>
  );
}

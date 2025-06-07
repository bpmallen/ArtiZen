// src/components/ArtworkCard.tsx
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
    <div className="relative w-64 h-80 bg-white rounded-lg shadow-card overflow-hidden flex flex-col">
      {/* Image */}
      <Link
        to={`/artwork/${artwork.source}/${artwork.id}`}
        className="block h-40 w-full overflow-hidden rounded-t-lg"
      >
        {artwork.primaryImageSmall ? (
          <img
            src={artwork.primaryImageSmall}
            alt={artwork.title || ""}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">No Image</div>
        )}
      </Link>

      {/* Title + Save row */}
      <div className="p-3 flex flex-col flex-1">
        <div className="flex items-center justify-between">
          <Link to={`/artwork/${artwork.source}/${artwork.id}`} className="flex-1">
            <h3 className="text-sm font-heading font-semibold text-text truncate">
              {artwork.title || "Untitled"}
            </h3>
          </Link>

          {isAuthenticated && (
            <button
              onClick={() => setShowModal(true)}
              className="ml-2 cursor-pointer text-text-light hover:text-primary"
              title="Save to Collection"
            >
              {/* Bookmark SVG */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path d="M6 4a2 2 0 0 0-2 2v16l8-5.333L20 22V6a2 2 0 0 0-2-2H6z" />
              </svg>
            </button>
          )}
        </div>

        {/* Artist */}
        <p className="mt-1 text-xs text-text-light truncate">
          {artwork.source === "met"
            ? artwork.metSlim?.artistDisplayName || "Unknown Artist"
            : artwork.harvardSlim?.people?.[0]?.name || "Unknown Artist"}
        </p>

        {/* Date + conditional source */}
        <p className="mt-1 text-xs text-text-light flex justify-between">
          <span>
            {artwork.source === "met"
              ? artwork.metSlim?.objectEndDate ?? "n.d."
              : artwork.harvardSlim?.dated ?? "n.d."}
          </span>
          {showSource && <span className="uppercase">{artwork.source}</span>}
        </p>
      </div>

      {/* Modal */}
      {showModal && <CreateCollectionModal artwork={artwork} close={() => setShowModal(false)} />}
    </div>
  );
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import CreateCollectionModal from "./CreateCollectionModal";
import type { CombinedArtwork } from "../types/artwork";
import { ImBin } from "react-icons/im";

interface ArtworkCardProps {
  artwork: CombinedArtwork;
  showSource: boolean;
  onRemove?: () => void;
}

export default function ArtworkCard({ artwork, showSource, onRemove }: ArtworkCardProps) {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="artwork-card relative w-full aspect-square bg-offwhite text-text rounded-lg overflow-hidden flex flex-col border border-white shadow-card">
      {/* Image Section */}
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

      {/* Details Footer */}
      <div className="p-4 h-40 flex flex-col justify-between bg-black">
        {/* Title & Actions */}
        <div className="flex items-center justify-between">
          <Link to={`/artwork/${artwork.source}/${artwork.id}`} className="flex-1 min-w-0">
            <h3 className="text-lg font-heading font-semibold text-text truncate">
              {artwork.title || "Untitled"}
            </h3>
          </Link>
          <div className="flex items-center space-x-2">
            {onRemove ? (
              <button
                onClick={onRemove}
                className="cursor-pointer text-text-light hover:text-red-500"
                title="Remove from Collection"
              >
                <ImBin className="w-5 h-5" />
              </button>
            ) : isAuthenticated ? (
              <button
                onClick={() => setShowModal(true)}
                className="cursor-pointer text-text-light hover:text-primary"
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
            ) : null}
          </div>
        </div>

        {/* Artist */}
        <p className="text-sm text-text-light truncate">
          {artwork.source === "met"
            ? artwork.metSlim?.artistDisplayName || "Unknown Artist"
            : artwork.harvardSlim?.people?.[0]?.name || "Unknown Artist"}
        </p>

        {/* Date + Source */}
        <div className="flex justify-between items-center text-sm text-text-light">
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

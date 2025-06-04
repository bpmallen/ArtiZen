import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import CreateCollectionModal from "./CreateCollectionModal";
import type { CombinedArtwork } from "../types/artwork";

interface ArtworkCardProps {
  artwork: CombinedArtwork;
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const { isAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="flex items-center gap-4 mb-4 border p-2 rounded">
      {artwork.primaryImageSmall && (
        <img
          src={artwork.primaryImageSmall}
          alt={artwork.title || ""}
          className="w-16 h-16 object-cover rounded"
        />
      )}

      <div className="flex-1">
        <strong>{artwork.title}</strong>{" "}
        <span className="text-sm text-gray-500">{artwork.source.toUpperCase()}</span>
        <div className="text-sm text-gray-600">
          {artwork.source === "met"
            ? artwork.metSlim?.objectEndDate ?? "n.d."
            : artwork.harvardSlim?.dated ?? "n.d."}
        </div>
      </div>

      {isAuthenticated && (
        <button
          onClick={() => setShowModal(true)}
          className="text-red-500 hover:text-red-700 text-lg"
          title="Save to Collection"
        >
          ♥
        </button>
      )}

      {showModal && <CreateCollectionModal artwork={artwork} close={() => setShowModal(false)} />}
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";

interface RemoveItemArgs {
  artworkId: string;
  source: "met" | "harvard";
}

export default function CollectionDetailPage() {
  const { currentUser } = useAuth();
  const { collectionName } = useParams<{ collectionName: string }>();
  const qc = useQueryClient();

  // Fetch all collections, then find the one matching `collectionName`
  const { data: collections = [], isLoading } = useCollections();
  const collection = collections.find((c) => c.name === collectionName);

  // Mutation to remove an artwork from this collection:
  const removeMutation = useMutation<void, Error, RemoveItemArgs>({
    mutationFn: async ({ artworkId, source }) => {
      await apiClient.delete(
        `/users/${
          currentUser!._id
        }/collections/${collectionName}/items/${artworkId}?source=${source}`
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
    },
  });

  if (isLoading) {
    return <p className="p-4">Loading…</p>;
  }

  if (!collection) {
    return (
      <div className="p-4">
        <p>Collection “{collectionName}” not found.</p>
        <Link to="/collections" className="text-blue-600 hover:underline">
          ← Back to My Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">{collection.name}</h2>

      {collection.items.length === 0 ? (
        <p>No artworks saved here yet.</p>
      ) : (
        <div className="space-y-4">
          {collection.items.map((item) => (
            <div
              key={`${item.source}-${item.artworkId}`}
              className="flex items-center justify-between border p-3 rounded"
            >
              <div>
                <span className="font-medium">{item.artworkId}</span>{" "}
                <span className="text-sm text-gray-600">({item.source})</span>
              </div>
              <button
                onClick={() =>
                  removeMutation.mutate({
                    artworkId: item.artworkId,
                    source: item.source,
                  })
                }
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6">
        <Link to="/collections" className="text-blue-600 hover:underline">
          ← Back to all collections
        </Link>
      </div>
    </div>
  );
}

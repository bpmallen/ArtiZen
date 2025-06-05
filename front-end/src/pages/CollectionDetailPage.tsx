import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useCollections } from "../hooks/useCollections";
import {
  useMutation,
  useQueryClient,
  useQueries,
  type UseQueryResult,
} from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import { fetchMetById, fetchHarvardById } from "../services/artworkDetails";

interface RemoveItemArgs {
  artworkId: string;
  source: "met" | "harvard";
}

interface ArtworkDetails {
  primaryImageSmall: string;
  title: string;
  date: number | string;
}

export default function CollectionDetailPage() {
  const { currentUser } = useAuth();
  const { collectionName } = useParams<{ collectionName: string }>();
  const qc = useQueryClient();

  //  Fetch all collections, then pick the one matching URL param
  const { data: collections = [], isLoading: collectionsLoading } = useCollections();
  const collection = collections.find((c) => c.name === collectionName);

  // Prepare a an array of items (even if collection is undefined)
  const items = collection ? collection.items : [];

  // useQueries must be called unconditionally. If `items` is empty, queries: [].
  const detailQueries: UseQueryResult<ArtworkDetails, Error>[] = useQueries({
    queries: items.map((item) => ({
      queryKey: [item.source, item.artworkId],
      queryFn: (): Promise<ArtworkDetails> =>
        item.source === "met" ? fetchMetById(item.artworkId) : fetchHarvardById(item.artworkId),
      staleTime: Infinity,
    })),
  });

  // Mutation to remove an item from this collection
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

  if (collectionsLoading) {
    return <p className="p-4">Loading collections…</p>;
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

  // 6) Render the detail view
  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">{collection.name}</h2>

      {items.length === 0 ? (
        <p>No artworks saved here yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => {
            const { data: details, isLoading: isDetailsLoading } = detailQueries[index];

            return (
              <div
                key={`${item.source}-${item.artworkId}`}
                className="flex items-center justify-between border p-3 rounded"
              >
                <div className="flex items-center gap-3">
                  {isDetailsLoading || !details ? (
                    <div className="w-16 h-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    <img
                      src={details.primaryImageSmall}
                      alt={details.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}

                  <div>
                    <div className="font-medium">
                      {isDetailsLoading || !details ? "Loading…" : details.title}
                    </div>
                    <div className="text-sm text-gray-600">
                      {isDetailsLoading || !details ? "" : details.date ?? "n.d."}{" "}
                      <span className="italic">({item.source.toUpperCase()})</span>
                    </div>
                  </div>
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
            );
          })}
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

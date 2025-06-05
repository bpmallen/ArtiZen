import { useParams, Link, useNavigate } from "react-router-dom";
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
import { useState } from "react";

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
  const navigate = useNavigate();
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
    onError: (err: Error) => {
      console.error("Failed to remove item:", err);
    },
  });

  // Mutation: rename the entire collection
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(collectionName || "");

  const renameMutation = useMutation<void, Error, string>({
    mutationFn: async (name: string) => {
      await apiClient.put(`/users/${currentUser!._id}/collections/${collectionName}`, {
        newName: name,
      });
    },
    onSuccess: () => {
      // Invalidate so collections list refreshes
      qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
      // Navigate to the newly renamed collection
      navigate(`/collections/${newName}`);
    },
    onError: (err: Error) => {
      console.error("Rename collection failed:", err);
    },
  });

  // Mutation: delete the entire collection
  const deleteMutation = useMutation<void, Error>({
    mutationFn: async () => {
      await apiClient.delete(`/users/${currentUser!._id}/collections/${collectionName}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
      navigate("/collections");
    },
    onError: (err: Error) => {
      console.error("Delete collection failed:", err);
    },
  });

  //Early returns for loading / missing collection
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

  return (
    <div className="p-4">
      {/* Header: Collection Name + Rename / Delete Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold">{collection.name}</h2>

        <div className="flex items-center gap-2">
          {/* Rename button / input */}
          {!isRenaming ? (
            <button
              onClick={() => {
                setIsRenaming(true);
                setNewName(collectionName!);
              }}
              className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Rename
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="border border-gray-400 rounded px-2 py-1"
              />
              <button
                disabled={!newName.trim() || newName === collectionName}
                onClick={() => renameMutation.mutate(newName.trim())}
                className={`px-3 py-1 rounded text-white ${
                  !newName.trim() || newName === collectionName
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Save
              </button>
              <button
                onClick={() => setIsRenaming(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Delete button */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  `Are you sure you want to delete the entire collection “${collectionName}”?`
                )
              ) {
                deleteMutation.mutate();
              }
            }}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete Collection
          </button>
        </div>
      </div>

      {/*  Artwork Items */}
      {items.length === 0 ? (
        <p>No artworks saved here yet.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => {
            const { data: details, isLoading: isDetailsLoading } = detailQueries[idx];

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

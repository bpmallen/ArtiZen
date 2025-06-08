import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import type { CombinedArtwork } from "../types/artwork";
import type { AxiosResponse } from "axios";
import Modal from "./Modal";

interface CreateCollectionModalProps {
  artwork: CombinedArtwork;
  close: () => void;
}

export default function CreateCollectionModal({ artwork, close }: CreateCollectionModalProps) {
  const { currentUser } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useCollections();
  const collections = useMemo(() => data ?? [], [data]);

  const [selected, setSelected] = useState<string>("");
  const [newName, setNewName] = useState("");

  const saveToExistingMutation = useMutation<AxiosResponse, Error, string>({
    mutationFn: (collectionName) =>
      apiClient.post(`/users/${currentUser!._id}/collections/${collectionName}/items`, {
        artworkId: artwork.id,
        source: artwork.source,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
      close();
    },
  });

  const createAndSaveMutation = useMutation<AxiosResponse, Error, string>({
    mutationFn: async (collectionName) => {
      await apiClient.post(`/users/${currentUser!._id}/collections`, {
        name: collectionName,
      });
      return apiClient.post(`/users/${currentUser!._id}/collections/${collectionName}/items`, {
        artworkId: artwork.id,
        source: artwork.source,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
      close();
    },
  });

  useEffect(() => {
    if (!isLoading && collections.length > 0) {
      setSelected(collections[0].name);
    }
  }, [isLoading, collections]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center z-50">
        <div className="bg-gray-900 rounded-lg p-6 w-80 max-h-[80vh] overflow-auto">
          <p className="text-center py-4 text-white">Loading collections…</p>
          <button
            onClick={close}
            className="mt-4 w-full px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <Modal onClose={close}>
      <div className="bg-white p-6 rounded-lg w-80 mx-auto font-roboto text-black">
        {isLoading ? (
          <>
            <p className="text-center py-4">Loading collections…</p>
            <button
              onClick={close}
              className="w-full mt-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h3 className="text-lg font-semibold mb-4">Save “{artwork.title}” to a Collection</h3>

            {/* Existing */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Choose an existing:</label>
              <select
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 bg-white text-black focus:border-blue-600 outline-none"
              >
                {collections.map((col) => (
                  <option key={col.name} value={col.name}>
                    {col.name} ({col.items.length} items)
                  </option>
                ))}
              </select>
              <button
                disabled={!selected}
                onClick={() => saveToExistingMutation.mutate(selected)}
                className={`w-full mt-2 py-2 rounded text-white ${
                  selected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Save to “{selected}”
              </button>
            </div>

            <hr className="border-gray-300 my-4" />

            {/* New */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Or create new:</label>
              <input
                type="text"
                placeholder="New collection name"
                className="w-full border border-gray-300 rounded px-2 py-1 mb-2 bg-white text-black focus:border-green-600 outline-none"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <button
                disabled={!newName.trim()}
                onClick={() => createAndSaveMutation.mutate(newName.trim())}
                className={`w-full py-2 rounded text-white ${
                  newName.trim()
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Create &amp; Save
              </button>
            </div>

            {/* Cancel */}
            <button
              onClick={close}
              className="w-full py-2 rounded bg-red-600 hover:bg-red-700 text-white"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </Modal>
  );
}

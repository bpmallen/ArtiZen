// front-end/src/components/CreateCollectionModal.tsx

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../contexts/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import type { CombinedArtwork } from "../types/artwork";
import type { AxiosResponse } from "axios";

interface CreateCollectionModalProps {
  artwork: CombinedArtwork;
  close: () => void;
}

export default function CreateCollectionModal({ artwork, close }: CreateCollectionModalProps) {
  const { currentUser } = useAuth();
  const qc = useQueryClient();

  // Fetch existing collections
  const { data, isLoading } = useCollections();

  // Memoize the `collections` array so it only changes when `data` changes
  const collections = useMemo(() => data ?? [], [data]);

  //  State for selected existing collection and new-collection name
  const [selected, setSelected] = useState<string>("");
  const [newName, setNewName] = useState("");

  //  Mutation: save to existing collection
  const saveToExistingMutation = useMutation<AxiosResponse, Error, string>({
    mutationFn: async (collectionName) => {
      return await apiClient.post(
        `/users/${currentUser!._id}/collections/${collectionName}/items`,
        {
          artworkId: artwork.id,
          source: artwork.source,
        }
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
      close();
    },
  });

  //  Mutation: create a new collection, then save
  const createAndSaveMutation = useMutation<AxiosResponse, Error, string>({
    mutationFn: async (collectionName) => {
      //  Create the new collection
      await apiClient.post(`/users/${currentUser!._id}/collections`, {
        name: collectionName,
      });
      //  Then add the artwork to it
      return await apiClient.post(
        `/users/${currentUser!._id}/collections/${collectionName}/items`,
        {
          artworkId: artwork.id,
          source: artwork.source,
        }
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
      close();
    },
  });

  // Pre-select the first existing collection once `collections` is loaded
  useEffect(() => {
    if (!isLoading && collections.length > 0) {
      setSelected(collections[0].name);
    }
  }, [isLoading, collections]);

  if (isLoading) {
    return (
      <div style={overlayStyles}>
        <div style={modalStyles}>
          <p className="text-center py-4">Loading collections…</p>
          <button onClick={close} className="mt-4 px-4 py-2 bg-gray-200 rounded">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyles}>
      <div style={modalStyles} className="bg-white rounded p-6 w-80 max-h-[80vh] overflow-auto">
        <h3 className="text-lg font-semibold mb-4 text-black">
          Save “{artwork.title}” to a Collection
        </h3>

        {/* Dropdown of existing collections */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-black">Choose an existing:</label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full border border-gray-400 rounded px-2 py-1 bg-gray-100 text-gray-900 focus:border-blue-500 focus:outline-none"
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
            className={`mt-2 w-full px-4 py-2 rounded text-white ${
              selected ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Save to “{selected}”
          </button>
        </div>

        <hr className="my-4" />

        {/* Input for creating a new collection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Or create new:</label>
          <input
            type="text"
            placeholder="New collection name"
            className="w-full border border-gray-400 rounded px-2 py-1 mb-2 bg-gray-100 text-gray-900 focus:border-blue-500"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            disabled={!newName.trim()}
            onClick={() => createAndSaveMutation.mutate(newName.trim())}
            className={`w-full px-4 py-2 rounded text-white ${
              newName.trim() ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            Create & Save
          </button>
        </div>

        {/* Cancel button */}
        <button
          onClick={close}
          className="mt-2 w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// Overlay (semi-transparent backdrop) styles
const overlayStyles: React.CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

// Modal container styles
const modalStyles: React.CSSProperties = {
  maxWidth: "320px",
  width: "100%",
};

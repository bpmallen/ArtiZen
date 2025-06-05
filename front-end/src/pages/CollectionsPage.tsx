import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import type { Collection } from "../types/collection";
import type { AxiosResponse } from "axios";
import { Link, Outlet } from "react-router-dom";

export default function CollectionsPage() {
  const { currentUser } = useAuth();
  const qc = useQueryClient();

  const { data, isLoading } = useCollections();

  const collections: Collection[] = data ?? [];

  const [newName, setNewName] = useState("");

  const createMutation = useMutation<AxiosResponse, Error, string>({
    mutationFn: async (name: string) => {
      return await apiClient.post(`/users/${currentUser!._id}/collections`, { name });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
    },
  });

  if (isLoading) {
    return <p>Loading collections…</p>;
  }

  return (
    <div className="p-4">
      {/*  List of collections with links */}
      <h2 className="text-2xl font-semibold mb-4">My Collections</h2>
      <div className="space-y-2 mb-6">
        {collections.length === 0 ? (
          <p>No collections yet.</p>
        ) : (
          collections.map((col: Collection) => (
            <Link
              key={col.name}
              to={col.name} // “Greece_favourites” etc.
              className="block text-blue-600 hover:underline"
            >
              {col.name} ({col.items.length} items)
            </Link>
          ))
        )}
      </div>

      {/*  Create‐new‐collection form */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="New collection name"
          className="border border-gray-400 rounded px-2 py-1 mr-2"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          disabled={!newName.trim()}
          onClick={() => {
            createMutation.mutate(newName.trim());
            setNewName("");
          }}
          className={`px-4 py-2 rounded text-white ${
            newName.trim() ? "bg-green-600 hover:bg-green-700" : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          Create
        </button>
      </div>

      {/* Outlet for the nested route (/collections/:collectionName) */}
      <Outlet />
    </div>
  );
}

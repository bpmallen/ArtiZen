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
    <div style={{ padding: 20 }}>
      <h2>My Collections</h2>

      {/* New collection form */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="New collection name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          style={{ padding: "0.5rem", width: "200px" }}
        />
        <button
          disabled={!newName.trim()}
          onClick={() => {
            createMutation.mutate(newName.trim());
            setNewName("");
          }}
          style={{ marginLeft: 8, padding: "0.5rem" }}
        >
          Create
        </button>
      </div>

      {/* List each collection with its item count */}
      {collections.length === 0 ? (
        <p>You don’t have any collections yet.</p>
      ) : (
        collections.map((col: Collection) => (
          <div key={col.name} style={{ marginBottom: 10 }}>
            <Link to={`/collections/${col.name}`} className="text-blue-600 hover:underline">
              {col.name} ({col.items.length} items)
            </Link>
          </div>
        ))
      )}
      <Outlet />
    </div>
  );
}

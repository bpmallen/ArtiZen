import { useState } from "react";
import { useAuth } from "../contexts/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";
import type { Collection } from "../types/collection";
import { Link, Outlet } from "react-router-dom";
import { ImBin } from "react-icons/im";
import { assetUrl } from "../cloudinary";

const bgImage = assetUrl(
  "B0E4BFC1-D817-4C61-8485-AEE206345312_1_201_a_t0xn6e",
  "1749423015",
  "jpg"
);

export default function CollectionsPage() {
  const { currentUser } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useCollections();
  const collections: Collection[] = data ?? [];

  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  async function handleDelete(name: string) {
    await apiClient.delete(`/users/${currentUser!._id}/collections/${encodeURIComponent(name)}`);
    qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
  }

  if (isLoading) {
    return <p className="p-4 text-white">Loading collections…</p>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Banner */}
      <section
        className="relative h-90 w-full bg-cover bg-center mb-6 filter grayscale brightness-75 contrast-125"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-4xl lg:text-5xl font-heading uppercase tracking-wide">
            My Collections
          </h1>
          <p className="mt-1 max-w-xl text-base">
            Create, view, and manage all your curated collections.
          </p>
        </div>
      </section>

      {/* Centered Container */}
      <div className="max-w-3xl mx-auto px-4">
        {/* Back */}
        <div className="mb-2 text-center">
          <Link to="/" className="text-slate-400 hover:text-slate-200">
            ← Back to Gallery
          </Link>
        </div>

        {/* Title */}
        <div className="flex items-center justify-center mb-4">
          <div className="h-px flex-grow bg-slate-600" />
          <h2 className="px-4 text-2xl font-semibold uppercase tracking-wide">Collections</h2>
          <div className="h-px flex-grow bg-slate-600" />
        </div>

        {/* List */}
        <div className="space-y-4 mb-4 font-roboto">
          {collections.length === 0 ? (
            <p className="text-center">No collections yet.</p>
          ) : (
            collections.map((col) => (
              <div key={col.name} className="grid grid-cols-[1fr_4rem_3rem] items-center gap-4">
                {/* Constrain the link width so buttons sit close by */}
                {editing === col.name ? (
                  <>
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="border border-slate-600 rounded px-2 py-1 bg-slate-800 text-white flex-grow"
                    />
                    <button
                      onClick={async () => {
                        const t = renameValue.trim();
                        if (!t) return;
                        await apiClient.put(
                          `/users/${currentUser!._id}/collections/${encodeURIComponent(col.name)}`,
                          { newName: t }
                        );
                        await qc.invalidateQueries({
                          queryKey: ["collections", currentUser!._id],
                        });
                        setEditing(null);
                        setRenameValue("");
                      }}
                      className="px-2 py-1 bg-slate-600 rounded hover:bg-slate-500 text-white text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="px-2 py-1 bg-slate-700 rounded hover:bg-slate-600 text-white text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={encodeURIComponent(col.name)}
                      className="text-slate-300 hover:text-slate-100 truncate"
                    >
                      {col.name} ({col.items.length})
                    </Link>
                    <button
                      onClick={() => {
                        setEditing(col.name);
                        setRenameValue(col.name);
                      }}
                      className="w-16 py-1 bg-slate-600 rounded hover:bg-slate-500 text-white text-sm"
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${col.name}"?`)) {
                          handleDelete(col.name);
                        }
                      }}
                      title="Delete"
                      className="w-full px-2 py-1 bg-slate-600 rounded hover:bg-slate-500 flex items-center justify-center"
                    >
                      <ImBin className="w-4 h-4 text-red-300" />
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create Form */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            placeholder="New collection name"
            className="border border-slate-600 rounded px-2 py-1 bg-slate-800 text-white placeholder-slate-500 flex-grow"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            disabled={!newName.trim()}
            onClick={async () => {
              await apiClient.post(`/users/${currentUser!._id}/collections`, {
                name: newName.trim(),
              });
              await qc.invalidateQueries({
                queryKey: ["collections", currentUser!._id],
              });
              setNewName("");
            }}
            className={`px-3 py-1 rounded text-white text-sm ${
              newName.trim() ? "bg-slate-600 hover:bg-slate-500" : "bg-slate-700 cursor-not-allowed"
            }`}
          >
            Create
          </button>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

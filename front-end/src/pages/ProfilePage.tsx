// front-end/src/pages/ProfilePage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../services/apiClient";

export default function ProfilePage() {
  const { currentUser, setCurrentUser } = useAuth();
  const [imageUrl, setImageUrl] = useState(currentUser?.profileImageUrl || "");
  const qc = useQueryClient();

  const profileMutation = useMutation<
    { user: { _id: string; username: string; profileImageUrl: string } },
    Error,
    string
  >({
    mutationFn: async (newUrl: string) => {
      const res = await apiClient.put(`/users/${currentUser!._id}`, {
        profileImageUrl: newUrl,
      });
      return res.data as { user: { _id: string; username: string; profileImageUrl: string } };
    },
    onSuccess: (data) => {
      setCurrentUser(data.user);
      qc.invalidateQueries({ queryKey: ["user", data.user._id] });
      alert("Profile image updated!");
    },
  });

  useEffect(() => {
    if (currentUser) {
      setImageUrl(currentUser.profileImageUrl);
    }
  }, [currentUser]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    profileMutation.mutate(imageUrl.trim());
  };

  const loading = profileMutation.status === "pending";
  const failed = profileMutation.status === "error";

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-3xl font-semibold mb-6">My Profile</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Profile Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500 bg-white text-gray-800"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Saving…" : "Save"}
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentUser) {
                setImageUrl(currentUser.profileImageUrl);
                profileMutation.reset();
              }
            }}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            Cancel
          </button>
        </div>

        {failed && <p className="text-red-500 text-sm">Update failed. Please try again.</p>}

        {imageUrl.trim() && (
          <div className="mt-6">
            <p className="text-gray-700 mb-2 font-medium">Preview:</p>
            <img
              src={imageUrl}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover border border-gray-300"
            />
          </div>
        )}
      </form>
    </div>
  );
}

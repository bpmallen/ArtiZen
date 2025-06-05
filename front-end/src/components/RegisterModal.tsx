import { useState } from "react";
import Modal from "./Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, setAuthToken } from "../services/apiClient";
import { useAuth } from "../contexts/useAuth";

interface BackendUser {
  _id: string;
  username: string;
  profileImageUrl: string;
}

interface RegisterResponse {
  user: BackendUser;
  token: string;
}

export default function RegisterModal({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [profileImageUrl, setProfileImageUrl] = useState("");
  const queryClient = useQueryClient();
  const { login } = useAuth();

  const registerMutation = useMutation<RegisterResponse, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.post<RegisterResponse>("/auth/register", {
        username,
        password,
        profileImageUrl: profileImageUrl.trim() || undefined,
      });
      return response.data;
    },
    onSuccess: (data) => {
      const { user, token } = data;

      localStorage.setItem("token", token);
      setAuthToken(token);

      login(token, user);

      queryClient.invalidateQueries({ queryKey: ["collections", user._id] });

      onClose();
    },
    onError: (err) => {
      console.error("Registration failed:", err);
      alert("Registration failed. Try another username.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerMutation.mutate();
  };

  const loading = registerMutation.status === "pending";
  const error = registerMutation.status === "error";

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Choose a username"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500 bg-white text-gray-800"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Choose a password"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500 bg-white text-gray-800"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Profile Image URL (optional)
          </label>
          <input
            type="text"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500 bg-white text-gray-800"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Registering…" : "Register"}
        </button>

        {error && (
          <p className="mt-2 text-sm text-red-500">Registration failed. Try another username.</p>
        )}
      </form>
    </Modal>
  );
}

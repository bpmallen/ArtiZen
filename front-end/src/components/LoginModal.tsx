import React, { useState } from "react";
import Modal from "./Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient, setAuthToken } from "../services/apiClient";
import { useAuth } from "../contexts/useAuth";

import { IoEyeOutline, IoEyeOffOutline } from "react-icons/io5";

interface BackendUser {
  _id: string;
  username: string;
  profileImageUrl: string;
}

interface LoginResponse {
  user: BackendUser;
  token: string;
}

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  const { login } = useAuth();

  const loginMutation = useMutation<LoginResponse, Error, void>({
    mutationFn: async () => {
      const response = await apiClient.post<LoginResponse>("/auth/login", {
        username,
        password,
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
      console.error("Login failed:", err);
      alert("Login failed. Please check your credentials.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
  };

  const loading = loginMutation.status === "pending";
  const error = loginMutation.status === "error";

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">Log In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white text-gray-800"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 bg-white text-gray-800"
              required
            />
            {/* Toggle checkbox/button */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute inset-y-0 right-0 px10 flex items-center  focus:outline-none"
              // style={{ top: "50%", transform: "translateY(-50%)" }}
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in…" : "Log In"}
        </button>

        {error && <p className="mt-2 text-sm text-red-500">Login failed. Please try again.</p>}
      </form>
    </Modal>
  );
}

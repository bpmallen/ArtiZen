// src/components/LoginModal.tsx
import React, { useState } from "react";
import Modal from "./Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
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
  const { login } = useAuth();
  const queryClient = useQueryClient();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  const loginMutation = useMutation<LoginResponse, AxiosError<{ message: string }>, void>({
    mutationFn: async () => {
      const res = await apiClient.post<LoginResponse>("/auth/login", {
        username,
        password,
      });
      return res.data;
    },
    onSuccess: ({ user, token }) => {
      localStorage.setItem("token", token);
      setAuthToken(token);
      login(token, user);
      queryClient.invalidateQueries({ queryKey: ["collections", user._id] });
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? err.message;
      alert(msg);
      setServerError(msg);
    },
  });

  const loading = loginMutation.status === "pending";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    loginMutation.mutate();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">Log In</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
            required
          />
        </div>

        {/* Password with toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 flex items-center"
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Logging in…" : "Log In"}
        </button>

        {/* Inline server error */}
        {serverError && <p className="mt-2 text-sm text-red-500">{serverError}</p>}
      </form>
    </Modal>
  );
}

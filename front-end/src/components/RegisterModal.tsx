import React, { useEffect, useState } from "react";
import Modal from "./Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { apiClient, setAuthToken } from "../services/apiClient";
import { useAuth } from "../contexts/useAuth";
import { IoEyeOutline, IoEyeOffOutline, IoCameraOutline } from "react-icons/io5";

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string>("");

  const usernameValid = username.length >= 3;
  const passwordLengthValid = password.length >= 6;
  const passwordNumberValid = /\d/.test(password);

  const queryClient = useQueryClient();
  const { login } = useAuth();

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview("");
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const registerMutation = useMutation<RegisterResponse, AxiosError<{ message: string }>, void>({
    mutationFn: async () => {
      const form = new FormData();
      form.append("username", username);
      form.append("password", password);
      if (avatarFile) form.append("avatar", avatarFile);

      const res = await apiClient.post<RegisterResponse>("/auth/register", form, {
        headers: { "Content-Type": "multipart/form-data" },
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    registerMutation.mutate();
  };

  return (
    <Modal onClose={onClose}>
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">Register</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
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
          <p className="mt-1 text-sm">
            <span
              className={usernameValid ? "text-green-500 font-roboto" : "text-red-500 font-roboto"}
            >
              {usernameValid ? "✔" : "✖"} Username must be at least 3 characters
            </span>
          </p>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              className="w-full border font-roboto border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-green-500 bg-white text-gray-800"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 px-3 flex items-center focus:outline-none"
            >
              {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
            </button>
          </div>
          <div className="mt-1 space-y-1 text-sm">
            <p
              className={
                passwordLengthValid ? "text-green-500 font-roboto" : "text-red-500 font-roboto"
              }
            >
              {passwordLengthValid ? "✔" : "✖"} At least 6 characters
            </p>
            <p
              className={
                passwordNumberValid ? "text-green-500 font-roboto" : "text-red-500 font-roboto"
              }
            >
              {passwordNumberValid ? "✔" : "✖"} Contains at least one number
            </p>
          </div>
        </div>

        {/* Avatar */}
        <div>
          <label className="block text-sm font-medium mb-1">Upload Avatar (optional)</label>
          <div className="flex items-center space-x-4">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Preview"
                className="w-16 h-16 rounded-full object-cover border"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <IoCameraOutline className="w-6 h-6 text-gray-500" />
              </div>
            )}
            <label
              htmlFor="avatar-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <IoCameraOutline />
              <span className="underline">Choose File</span>
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={
            registerMutation.status === "pending" ||
            !usernameValid ||
            !passwordLengthValid ||
            !passwordNumberValid
          }
          className={`w-full py-2 rounded text-white font-roboto ${
            registerMutation.status === "pending" ||
            !usernameValid ||
            !passwordLengthValid ||
            !passwordNumberValid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {registerMutation.status === "pending" ? "Registering…" : "Register"}
        </button>

        {/* Server Error */}
        {serverError && <p className="mt-2 text-sm text-red-500 font-roboto">{serverError}</p>}
      </form>
    </Modal>
  );
}

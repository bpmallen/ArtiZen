import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../contexts/useAuth";
import { apiClient } from "../services/apiClient";
import type { Collection } from "../types/collection";

export function useCollections() {
  const { currentUser } = useAuth();

  return useQuery<Collection[], Error>({
    queryKey: ["collections", currentUser?._id],
    queryFn: async () => {
      const res = await apiClient.get(`/users/${currentUser!._id}/collections`);
      return res.data.collections as Collection[];
    },
    enabled: Boolean(currentUser),
  });
}

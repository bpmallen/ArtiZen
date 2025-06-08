import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useCollections } from "../hooks/useCollections";
import {
  useQueries,
  useMutation,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { fetchMetById, fetchHarvardById } from "../services/artworkDetails";
import type { MetDetail, HarvardDetail } from "../services/artworkDetails";
import type { CombinedArtwork } from "../types/artwork";
import ArtworkCard from "../components/ArtworkCard";

import { ImBin } from "react-icons/im";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { apiClient } from "../services/apiClient";
import { useMemo } from "react";

interface RemoveItemArgs {
  artworkId: string;
  source: "met" | "harvard";
}

export default function CollectionDetailPage() {
  const { currentUser } = useAuth();
  const { collectionName } = useParams<{ collectionName: string }>();
  const qc = useQueryClient();

  const { data: collections = [], isLoading: colsLoading } = useCollections();
  const collection = collections.find((c) => c.name === collectionName);

  const items = useMemo(() => (collection ? collection.items : []), [collection]);
  const pagedItems = items;

  const detailQueries = useQueries({
    queries: pagedItems.map((item) => ({
      queryKey: [item.source, item.artworkId] as const,
      queryFn: () =>
        item.source === "met" ? fetchMetById(item.artworkId) : fetchHarvardById(item.artworkId),
      staleTime: Infinity,
    })),
  }) as UseQueryResult<MetDetail | HarvardDetail, Error>[];

  const removeMutation = useMutation<void, Error, RemoveItemArgs>({
    mutationFn: async ({ artworkId, source }) => {
      await apiClient.delete(
        `/users/${
          currentUser!._id
        }/collections/${collectionName}/items/${artworkId}?source=${source}`
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["collections", currentUser!._id] });
    },
  });

  if (colsLoading) {
    return <p className="p-4">Loading collections…</p>;
  }
  if (!collection) {
    return (
      <div className="p-4">
        <p>Collection “{collectionName}” not found.</p>
        <Link to="/collections" className="text-blue-600 hover:underline">
          ← Back to Collections
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Ensure the pagination bullets sit below slides */}
      <style>{`
        .swiper-pagination {
          position: relative !important;
          bottom: auto !important;
          margin-top: 1rem !important;
          z-index: 20 !important;
        }
      `}</style>

      <div className="min-h-screen bg-gray-900 text-white p-4">
        <h2 className="text-2xl font-semibold mb-6">{collection.name}</h2>

        <Swiper
          className="relative pb-8 overflow-visible"
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={16}
          slidesPerView={1}
          autoHeight
          navigation
          pagination={{ clickable: true }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {pagedItems.map((item, idx) => {
            const q = detailQueries[idx];
            if (q.isLoading || !q.data) {
              return (
                <SwiperSlide
                  key={`${item.source}-${item.artworkId}`}
                  className="flex justify-center"
                >
                  <div className="h-60 bg-gray-500 animate-pulse rounded-lg" />
                </SwiperSlide>
              );
            }

            const details = q.data;
            const isMet = item.source === "met";
            const artwork: CombinedArtwork = {
              id: item.artworkId,
              source: item.source,
              title: details.title ?? null,
              primaryImageSmall: isMet
                ? (details as MetDetail).primaryImageSmall
                : (details as HarvardDetail).primaryimageurl,
              artistDisplayName: isMet
                ? (details as MetDetail).artistDisplayName || null
                : (details as HarvardDetail).people?.[0]?.name || null,
              metSlim: isMet
                ? {
                    objectID: (details as MetDetail).objectID,
                    title: (details as MetDetail).title,
                    artistDisplayName: (details as MetDetail).artistDisplayName,
                    primaryImageSmall: (details as MetDetail).primaryImageSmall,
                    objectEndDate: (details as MetDetail).objectEndDate,
                  }
                : undefined,
              harvardSlim: !isMet
                ? {
                    id: (details as HarvardDetail).id,
                    objectnumber: (details as HarvardDetail).objectnumber,
                    title: (details as HarvardDetail).title,
                    datebegin: (details as HarvardDetail).datebegin,
                    dateend: (details as HarvardDetail).dateend,
                    dated: (details as HarvardDetail).dated,
                    people: (details as HarvardDetail).people ?? [],
                    primaryimageurl: (details as HarvardDetail).primaryimageurl,
                  }
                : undefined,
            };

            return (
              <SwiperSlide
                key={`${item.source}-${item.artworkId}`}
                className="flex justify-center overflow-visible"
              >
                <div className="relative w-full min-h-[24rem] bg-gray-800 rounded-lg overflow-visible">
                  {/* Remove button */}
                  <button
                    onClick={() =>
                      removeMutation.mutate({
                        artworkId: item.artworkId,
                        source: item.source,
                      })
                    }
                    className="absolute top-2 right-2 z-10 bg-black/50 text-white rounded-full p-1 cursor-pointer"
                  >
                    <ImBin className="w-4 h-4" />
                  </button>

                  {/* Artwork card */}
                  <div className="w-full h-full p-2">
                    <ArtworkCard artwork={artwork} showSource={false} />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </>
  );
}

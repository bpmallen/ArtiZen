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

import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { ImBin } from "react-icons/im";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import type { NavigationOptions } from "swiper/modules/navigation";
import bgImage from "../assets/chris-czermak-PamFFHL6fVY-unsplash.jpg";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { apiClient } from "../services/apiClient";
import { useMemo, useRef } from "react";

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

  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const navOptions = {
    prevEl: prevRef.current,
    nextEl: nextRef.current,
  } as NavigationOptions;

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

  if (colsLoading) return <p className="p-4">Loading collections…</p>;
  if (!collection)
    // const bgImage =
    //   "https://images.unsplash.com/photo-1601887389937-0b02c26b602c?q=80&w=2523&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    return (
      <div className="p-4">
        <p>Collection “{collectionName}” not found.</p>
        <Link to="/collections" className="text-blue-600 hover:underline">
          ← Back to Collections
        </Link>
      </div>
    );

  return (
    <div className="relative min-h-screen bg-black text-white p-6">
      {/* ─── Hero Banner ─── */}
      <section
        className="relative h-90 w-full bg-cover bg-center mb-8 filter grayscale brightness-75 contrast-125"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        {/* dark overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* banner content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
          <h1 className="text-4xl lg:text-5xl font-heading">{collection.name}</h1>
          <p className="mt-2 max-w-xl text-lg">A curated look into your personal collection.</p>
        </div>
      </section>
      {/* Global overrides: wider pagination dashes */}
      <style>{`
        .swiper-pagination-bullet {
          width: 2rem !important;
          height: 0.25rem !important;
          background: none !important;
          margin: 0 0.25rem !important;
        }
        .swiper-pagination-bullet:after {
          content: '';
          display: block;
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 9999px;
        }
      `}</style>

      {/* Hero banner above title */}
      <div className="mb-8"></div>

      {/* Centered title with decorative lines */}
      <div className="flex items-center justify-center mb-4">
        <div className="h-px flex-grow bg-gray-600" />
        <h2 className="px-6 text-3xl font-semibold uppercase tracking-wider">{collection.name}</h2>
        <div className="h-px flex-grow bg-gray-600" />
      </div>

      {/* Back link */}
      <div className="text-center mb-8">
        <Link to="/collections" className="text-gray-400 hover:text-white">
          ← Back to Collections
        </Link>
      </div>

      {/* Custom Prev / Next buttons inset 1rem */}
      <button
        ref={prevRef}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-black/70 rounded-full text-white hover:bg-black/90 cursor-pointer"
      >
        <FiChevronLeft size={36} />
      </button>
      <button
        ref={nextRef}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 bg-black/70 rounded-full text-white hover:bg-black/90 cursor-pointer"
      >
        <FiChevronRight size={36} />
      </button>

      <div className="pl-16 pr-16">
        <Swiper
          className="relative pb-8 overflow-visible"
          modules={[Navigation, Pagination, A11y]}
          spaceBetween={24}
          slidesPerView={1}
          autoHeight
          onBeforeInit={(swiper) => {
            if (swiper.params.navigation) {
              swiper.params.navigation.prevEl = prevRef.current!;
              swiper.params.navigation.nextEl = nextRef.current!;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
          navigation={navOptions}
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
                  <div className="h-60 bg-gray-600 animate-pulse rounded-lg shadow-lg" />
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
              <SwiperSlide key={`${item.source}-${item.artworkId}`} className="flex justify-center">
                <div className="relative w-11/12 max-w-sm min-h-[24rem] bg-gray-800 rounded-lg overflow-visible shadow-lg transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <button
                    onClick={() =>
                      removeMutation.mutate({ artworkId: item.artworkId, source: item.source })
                    }
                    className="absolute top-3 right-3 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 cursor-pointer"
                  >
                    <ImBin className="w-5 h-5" />
                  </button>
                  <div className="w-full h-full p-4">
                    <ArtworkCard artwork={artwork} showSource={false} />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}

import { useEffect } from "react";
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
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import type { NavigationOptions } from "swiper/types";
import { assetUrl } from "../cloudinary";

const bgImage = assetUrl("chris-czermak-PamFFHL6fVY-unsplash_onknte", "1749423015", "jpg");

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

  useEffect(() => {
    // only run once, after first render
    if (prevRef.current && nextRef.current) {
      // force Swiper to re-init nav on the real DOM nodes
      const event = new Event("resize");
      window.dispatchEvent(event);
    }
  }, []);

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
    <div className="min-h-screen bg-black text-white px-6 pt-6 pb-6">
      {/* Hero Banner */}
      <section
        className="relative h-90 w-full bg-cover bg-center mb-8 filter grayscale brightness-75 contrast-125"
        style={{ backgroundImage: `url(${bgImage})` }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center text-white">
          <h1 className="text-4xl lg:text-5xl font-heading">{collection!.name}</h1>
          <p className="mt-2 max-w-xl text-lg">A curated look into your personal collection.</p>
        </div>
      </section>

      {/* Decorative Title */}
      <div className="flex items-center justify-center mb-4">
        <div className="h-px flex-grow bg-gray-600" />
        <h2 className="px-6 text-3xl font-semibold uppercase tracking-wider">{collection!.name}</h2>
        <div className="h-px flex-grow bg-gray-600" />
      </div>

      {/* Back link */}
      <div className="text-center mb-8">
        <Link to="/collections" className="text-gray-400 hover:text-white">
          ← Back to Collections
        </Link>
        {/* Mobile‐only arrows under the link */}
        <div className="flex justify-center space-x-4 mt-4 sm:hidden">
          <button
            ref={prevRef}
            className="p-3 bg-black/70 rounded-full text-white hover:bg-black/90 z-10"
          >
            <FiChevronLeft size={28} />
          </button>
          <button
            ref={nextRef}
            className="p-3 bg-black/70 rounded-full text-white hover:bg-black/90 z-10"
          >
            <FiChevronRight size={28} />
          </button>
        </div>
      </div>

      {/* Carousel + Arrows */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, A11y]}
          className="relative pb-8 overflow-visible"
          wrapperClass="overflow-visible"
          navigation={{
            prevEl: prevRef.current!,
            nextEl: nextRef.current!,
          }}
          pagination={{ clickable: true }}
          centeredSlidesBounds
          autoHeight
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 24,
              slidesOffsetBefore: 0,
              slidesOffsetAfter: 0,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 24,
              slidesOffsetBefore: 24,
              slidesOffsetAfter: 24,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 24,
              slidesOffsetBefore: 24,
              slidesOffsetAfter: 24,
            },
          }}
          onBeforeInit={(swiper) => {
            const nav = swiper.params.navigation as NavigationOptions;
            nav.prevEl = prevRef.current!;
            nav.nextEl = nextRef.current!;
            swiper.navigation.init();
            swiper.navigation.update();
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
                  <div className="h-60 w-80 bg-gray-600 animate-pulse rounded-lg shadow-lg" />
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
                <div className="relative overflow-visible transition-transform duration-300 hover:scale-105">
                  <div className="w-80 max-w-sm shadow-lg rounded-lg overflow-hidden">
                    <ArtworkCard
                      artwork={artwork}
                      showSource={false}
                      onRemove={() => {
                        if (
                          window.confirm(`Remove “${artwork.title}” from “${collection!.name}”?`)
                        ) {
                          removeMutation.mutate({
                            artworkId: item.artworkId,
                            source: item.source,
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* Prev arrow */}
        <button
          ref={prevRef}
          className="hidden sm:flex pointer-events-auto absolute left-2 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/70 rounded-full text-white hover:bg-black/90"
        >
          <FiChevronLeft size={28} />
        </button>

        {/* Next arrow */}
        <button
          ref={nextRef}
          className="hidden sm:flex pointer-events-auto absolute right-2 top-1/2 -translate-y-1/2 z-50 p-3 bg-black/70 rounded-full text-white hover:bg-black/90"
        >
          <FiChevronRight size={28} />
        </button>
      </div>
    </div>
  );
}

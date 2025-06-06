import { apiClient } from "./apiClient";

export interface MetDetail {
  primaryImageSmall: string | null;
  title: string;
  date: string | number | null;
  objectDate: string | null;
  artistDisplayName: string | null;
  artistDisplayBio: string | null;
  medium: string | null;
  culture: string | null;
  dimensions: string | null;
  creditLine: string | null;
  labelText: string | null;
  objectURL: string | null;
}

export async function fetchMetById(objectId: string): Promise<MetDetail> {
  const res = await apiClient.get(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
  );

  const raw = res.data;

  const {
    primaryImageSmall,
    title,
    objectEndDate,
    objectDate,
    artistDisplayName,
    artistDisplayBio,
    medium,
    culture,
    dimensions,
    creditLine,
    labelText,
    objectURL,
  } = raw;

  return {
    primaryImageSmall: primaryImageSmall || null,
    title: title || "Untitled",
    date: objectEndDate ?? null,
    objectDate: objectDate || null,
    artistDisplayName: artistDisplayName || null,
    artistDisplayBio: artistDisplayBio || null,
    medium: medium || null,
    culture: culture || null,
    dimensions: dimensions || null,
    creditLine: creditLine || null,
    labelText: labelText || null,
    objectURL: objectURL || null,
  };
}

export interface HarvardDetail {
  primaryImageSmall: string | null;
  title: string;
  date: string | number | null;
  people: { name: string }[];
  medium: string | null;
  culture: string | null;
  dimensions: string | null;
  creditline: string | null;
  provenance: string | null;
}

export async function fetchHarvardById(objectNumber: string): Promise<HarvardDetail> {
  const res = await apiClient.get(
    `https://api.harvardartmuseums.org/object/${objectNumber}?apikey=${
      import.meta.env.VITE_HARVARD_API_KEY
    }&fields=primaryimageurl,title,dateend,people,medium,culture,dimensions,creditline,provenance`
  );

  const {
    primaryimageurl,
    title,
    dateend,
    people,
    medium,
    culture,
    dimensions,
    creditline,
    provenance,
  } = res.data;

  return {
    primaryImageSmall: primaryimageurl || null,
    title: title || "Untitled",
    date: dateend ?? null,
    people: Array.isArray(people) ? people : [],
    medium: medium || null,
    culture: culture || null,
    dimensions: dimensions || null,
    creditline: creditline || null,
    provenance: provenance || null,
  };
}

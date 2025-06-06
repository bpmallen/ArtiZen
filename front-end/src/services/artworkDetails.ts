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
  dated: string | null; // ← the textual date (e.g. “c. 1648-1656”)
  dateend: number | null; // ← the numeric end‐year
  people: { name: string }[];
  medium: string | null;
  culture: string | null;
  dimensions: string | null;
  creditline: string | null;
  provenance: string | null;
  classification: string | null;
  objectnumber: string;
}

export async function fetchHarvardById(objectNumber: string): Promise<HarvardDetail> {
  const fields = [
    "primaryimageurl",
    "title",
    "dated", // ← request the textual “dated” field
    "dateend",
    "people",
    "medium",
    "culture",
    "dimensions",
    "creditline",
    "provenance",
    "classification",
    "objectnumber",
  ].join(",");

  const res = await apiClient.get(
    `https://api.harvardartmuseums.org/object/${objectNumber}?apikey=${
      import.meta.env.VITE_HARVARD_API_KEY
    }&fields=${fields}`
  );

  const raw = res.data;
  return {
    primaryImageSmall: raw.primaryimageurl || null,
    title: raw.title || "Untitled",
    dated: raw.dated || null, // ← include `dated`
    dateend: raw.dateend ?? null, // ← include `dateend`
    people: Array.isArray(raw.people) ? raw.people : [],
    medium: raw.medium || null,
    culture: raw.culture || null,
    dimensions: raw.dimensions || null,
    creditline: raw.creditline || null,
    provenance: raw.provenance || null,
    classification: raw.classification || null,
    objectnumber: raw.objectnumber,
  };
}

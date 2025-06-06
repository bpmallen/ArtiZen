import { apiClient } from "./apiClient";

export interface MetDetail {
  objectID: number;
  primaryImageSmall: string | null;
  title: string | null;
  department: string | null;
  objectName: string | null;
  culture: string | null;
  period: string | null;
  dynasty: string | null;
  reign: string | null;
  portfolio: string | null;
  artistRole: string | null;
  artistPrefix: string | null;
  artistDisplayName: string | null;
  artistDisplayBio: string | null;
  artistSuffix: string | null;
  artistAlphaSort: string | null;
  artistNationality: string | null;
  artistBeginDate: string | null;
  artistEndDate: string | null;
  artistGender: string | null;
  objectDate: string | null;
  objectBeginDate: number | null;
  objectEndDate: number | null;
  medium: string | null;
  dimensions: string | null;
  measurements: Array<Record<string, unknown>>;
  creditLine: string | null;
  geographyType: string | null;
  city: string | null;
  state: string | null;
  county: string | null;
  country: string | null;
  region: string | null;
  subregion: string | null;
  locale: string | null;
  locus: string | null;
  excavation: string | null;
  river: string | null;
  classification: string | null;
  rightsAndReproduction: string | null;
  linkResource: string | null;
  metadataDate: string | null;
  repository: string | null;
  objectURL: string | null;
  tags: Array<Record<string, unknown>> | null;
  objectWikidata_URL: string | null;
  isTimelineWork: boolean;
  GalleryNumber: string | null;
  labelText?: string | null;
}

export async function fetchMetById(objectId: string): Promise<MetDetail> {
  const res = await apiClient.get(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
  );
  return res.data as MetDetail;
}

//
// ─── HARVARD INTERFACE + FETCH ────────────────────────────────────────────────
//
export interface HarvardPerson {
  name: string;
  role: string;
  displaydate: string | null;
}

export interface HarvardDetail {
  id: number;
  objectid: number;
  objectnumber: string;
  title: string | null;
  dated: string | null;
  datebegin: number | null;
  dateend: number | null;
  classification: string | null;
  medium: string | null;
  culture: string | null;
  dimensions: string | null;
  department: string | null;
  creditline: string | null;
  description: string | null;
  provenance: string | null;
  labeltext: string | null;
  primaryimageurl: string | null;
  people: HarvardPerson[];
  url: string | null;
}

export async function fetchHarvardById(objectNumber: string): Promise<HarvardDetail> {
  const res = await apiClient.get(
    `https://api.harvardartmuseums.org/object/${objectNumber}?apikey=${
      import.meta.env.VITE_HARVARD_API_KEY
    }`
  );
  return res.data as HarvardDetail;
}

import { apiClient } from "./apiClient";

export async function fetchMetById(objectId: string) {
  const res = await apiClient.get(
    `https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectId}`
  );

  const { primaryImageSmall, title, objectEndDate } = res.data;
  return { primaryImageSmall, title, date: objectEndDate };
}

export async function fetchHarvardById(objectNumber: string) {
  const res = await apiClient.get(
    `https://api.harvardartmuseums.org/object/${objectNumber}?apikey=${
      import.meta.env.VITE_HARVARD_API_KEY
    }&fields=primaryimageurl,title,dateend`
  );
  const { primaryimageurl, title, dateend } = res.data;
  return { primaryImageSmall: primaryimageurl, title, date: dateend };
}

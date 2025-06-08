export interface CollectionItem {
  artworkId: string;
  source: "met" | "harvard";
  savedAt: string;
}

export interface Collection {
  _id: string;
  name: string;
  items: CollectionItem[];
}

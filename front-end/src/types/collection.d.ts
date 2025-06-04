export interface CollectionItem {
  artworkId: string;
  source: "met" | "harvard";
  savedAt: string;
}

export interface Collection {
  name: string;
  items: CollectionItem[];
}

export interface HarvardImage {
  baseimageurl: string | null;
  format: string;
  height: number;
  iiifbaseuri: string | null;
  publiccaption: string | null;
  rendition: string;
  url: string;
  width: number;
}

export interface HarvardWorkType {
  worktypeid: string;
  worktype: string;
}

export interface HarvardPerson {
  personid: number;
  role: string;
  displayname: string;
  prefix: string | null;
  alphasort: string;
  birthplace: string | null;
  deathplace: string | null;
  displaydate: string | null;
  culture: string | null;
  gender: string | null;
  name: string;
  displayorder: number;
}

export interface HarvardColor {
  color: string;
  spectrum: string;
  hue: string;
  percent: number;
  css3: string;
}

export interface HarvardSeeAlso {
  id: string;
  type: string;
  format: string;
  profile: string;
}

export interface HarvardArtwork {
  id: number;
  objectid: number;
  objectnumber: string;
  title: string | null;
  titlescount: number;
  dated: string | null;
  datebegin: number | null;
  dateend: number | null;
  century: string | null;
  culture: string | null;
  classification: string | null;
  classificationid: number | null;
  division: string | null;
  department: string | null;
  contact: string | null;
  creditline: string | null;
  accessionyear: string | null;
  accessionmethod: string | null;
  medium: string | null;
  technique: string | null;
  techniqueid: number | null;
  dimensions: string | null;
  markscount: number;
  publicationcount: number;
  totaluniquepageviews: number | null;
  totalpageviews: number | null;
  dateoflastpageview: string | null;
  dateoffirstpageview: string | null;
  rank: number | null;
  relatedcount: number;
  signed: string | null;
  state: string | null;
  verificationlevel: number | null;
  verificationleveldescription: string | null;
  labeltext: string | null;
  copyright: string | null;
  description: string | null;
  commentary: string | null;
  period: string | null;
  periodid: string | null;
  style: string | null;
  worktypes: HarvardWorkType[];
  imagecount: number;
  images: HarvardImage[];
  primaryimageurl: string | null;
  peoplecount: number;
  people: HarvardPerson[];
  colorcount: number;
  colors: HarvardColor[];
  provenance: string | null;
  groupcount: number;
  exhibitioncount: number;
  imagepermissionlevel: number | null;
  mediacount: number;
  lendingpermissionlevel: number | null;
  lastupdate: string | null;
  createdate: string | null;
  url: string | null;
  seeAlso: HarvardSeeAlso[];
  contextualtextcount: number;
}

export interface HarvardArtworksResponse {
  info: {
    totalrecordsperquery: number;
    totalrecords: number;
    pages: number;
    page: number;
    next: string;
    prev: string;
    responsetime: string;
  };
  records: HarvardArtwork[];
}

export interface MetArtwork {
  objectID: number;
  isHighlight: boolean;
  accessionNumber: string | null;
  accessionYear: string | null;
  isPublicDomain: boolean;
  primaryImage: string;
  primaryImageSmall: string;
  additionalImages: string[];
  constituents: any[] | null;
  department: string;
  objectName: string;
  title: string;
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
  artistWikidata_URL: string | null;
  artistULAN_URL: string | null;
  objectDate: string | null;
  objectBeginDate: number | null;
  objectEndDate: number | null;
  medium: string | null;
  dimensions: string | null;
  measurements: any[] | null;
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
  metadataDate: string;
  repository: string | null;
  objectURL: string;
  tags: any[] | null;
  objectWikidata_URL: string | null;
  isTimelineWork: boolean;
  GalleryNumber: string | null;
}

export interface MetSlim {
  objectID: number;
  title: string | null;
  artistDisplayName: string | null;
  primaryImageSmall: string | null;
  objectEndDate: number | null;
}

export interface HarvardSlim {
  id: number;
  objectnumber: string;
  title: string | null; // your UI uses this
  dated: string | null; // e.g. "1867"
  datebegin: number | null; // numeric begin
  dateend: number | null; // numeric end
  people: { name: string }[]; // now _always_ an array
  primaryimageurl: string | null;
}

export interface CombinedArtwork {
  id: number | string;
  title: string | null;
  artistDisplayName: string | null;
  primaryImageSmall: string | null;
  source: "met" | "harvard";
  metSlim?: MetSlim;
  harvardSlim?: HarvardSlim;
  metData?: MetArtwork;
  harvardData?: HarvardArtwork;
}

export interface DateRangeFilter {
  dateBegin?: number;
  dateEnd?: number;
}

export interface MetFilters extends DateRangeFilter {
  q?: string;
  title?: boolean;
  tags?: boolean;
  isOnView?: boolean;
  isHighlight?: boolean;
  artistOrCulture?: boolean;
  departmentId?: number | number[];
  hasImages?: boolean;
  medium?: string;
  geoLocation?: string | string[];
}

export interface HarvardFilters extends DateRangeFilter {
  q?: string;
  hasimage?: boolean;
  classification?: string | string[];
  century?: string | string[];
  culture?: string | string[];
  person?: number | string;
  place?: number | string;
  exhibition?: number | string;
  gallery?: number | string;
  group?: number | string;
  technique?: string | string[];
  worktype?: string | string[];
  keyword?: string;
  color?: string;
}

export type Filters =
  | { source: "met"; filters: MetFilters }
  | { source: "harvard"; filters: HarvardFilters };

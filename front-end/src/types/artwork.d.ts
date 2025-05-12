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

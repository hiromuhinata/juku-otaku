export type Juku = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  price_min: number | null;
  price_max: number | null;
  created_at: string;
  updated_at: string;
};

export type JukuTag = {
  id: string;
  juku_id: string;
  name: string;
};

export type JukuTarget = {
  id: string;
  juku_id: string;
  description: string;
};

export type JukuMedia = {
  id: string;
  juku_id: string;
  url: string;
  type: 'image' | 'video';
  caption: string | null;
  order: number;
};

export interface User {
  id: string;
  googleId: string;
  email: string;
  name: string;
  alias: string | null;
  residence: string | null;
  age: number | null;
  avatarUrl: string | null;
  createdAt: Date;
}

export interface Tag {
  id: string;
  key: string;
  label: string;
  emoji: string;
  color: string;
}

export interface Photo {
  id: string;
  poiId: string;
  cloudinaryUrl: string;
  thumbnailUrl: string;
  isMain: boolean;
}

export interface POI {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  lat: number;
  lng: number;
  dateVisited: string;
  mainPhoto: Photo | null;
  photos: Photo[];
  tags: Tag[];
  likesCount: number;
  ratingsAvg: number;
  ratingsCount: number;
  userHasLiked?: boolean;
  userRating?: number;
  userWishlisted?: boolean;
  author: Pick<User, 'id' | 'name' | 'alias' | 'avatarUrl'>;
}

export interface UserStats {
  totalPois: number;
  totalCountries: number;
  totalLikesReceived: number;
  avgRating: number;
  firstTrip: string | null;
  lastTrip: string | null;
}

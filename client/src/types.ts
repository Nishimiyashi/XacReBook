export type BookStatus = 'upcoming' | 'live' | 'ended';
export type BookOrigin = 'mongolian' | 'foreign';

export interface Book {
  id: string;
  title: string;
  author: string;
  summary: string;
  genre: string;
  origin: BookOrigin;
  coverImageUrl: string;
  startingPrice: number;
  marketPrice: number;
  condition: string;
  currentPrice: number;
  auctionEndsAt: string | null;
  status: BookStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MyBidBook extends Book {
  myBid: number;
}

export type Trophy = 'gold' | 'silver' | 'bronze';

export interface LeaderboardEntry {
  rank: number;
  trophy: Trophy;
  name: string;
  amount: number;
}

export interface User {
  id: string;
  name: string;
  phone: string;
}

export interface AdminUser {
  id: string;
  username: string;
}

export interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  userName: string;
  userPhone: string;
}

export interface Bidder {
  rank: number;
  userId: string;
  name: string;
  phone: string;
  amount: number;
  lastBidAt: string | null;
}

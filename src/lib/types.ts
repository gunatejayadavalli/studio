// src/lib/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isHost: boolean;
}

export interface Property {
  id: string;
  hostId: string;
  title: string;
  location: string;
  pricePerNight: number;
  rating: number;
  thumbnail: string;
  images: string[];
  description: string;
  amenities: string[];
  data_ai_hint?: string;
}

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  totalCost: number;
  hasInsurance: boolean;
  guests: number;
}

export interface Faq {
  id: string;
  propertyId: string;
  question: string;
  answer: string;
}

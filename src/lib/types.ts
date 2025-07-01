// src/lib/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Made optional for safety, but will be present
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
  propertyInfo: string;
  data_ai_hint?: string;
}

export interface InsurancePlan {
  id:string;
  name: string;
  pricePercent: number;
  minTripValue: number;
  maxTripValue: number;
  benefits: string[];
  termsUrl: string;
}

export interface Booking {
  id: string;
  userId: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  totalCost: number;
  insurancePlanId?: string;
  guests: number;
  status: 'confirmed' | 'cancelled-by-guest' | 'cancelled-by-host' | string;
  cancellationReason?: string;
}

export type PropertyFormValues = {
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  amenities: string;
  propertyInfo?: string;
};

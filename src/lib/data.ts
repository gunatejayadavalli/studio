import type { User, Property, Booking, Faq } from './types';

export const users: User[] = [
  { id: '1', name: 'Alex Doe', email: 'alex@example.com', avatar: 'https://placehold.co/100x100', isHost: true },
  { id: '2', name: 'Sam Smith', email: 'sam@example.com', avatar: 'https://placehold.co/100x100', isHost: false },
];

export const properties: Property[] = [
  {
    id: '1',
    hostId: '1',
    title: 'Sunny Beachside Villa',
    location: 'Malibu, California',
    pricePerNight: 350,
    rating: 4.9,
    thumbnail: 'https://placehold.co/600x400',
    data_ai_hint: 'beach villa',
    images: ['https://placehold.co/1200x800', 'https://placehold.co/1200x800', 'https://placehold.co/1200x800'],
    description: 'Experience the best of Malibu in this stunning villa with direct beach access and panoramic ocean views. Perfect for a relaxing getaway.',
    amenities: ['WiFi', 'Pool', 'Kitchen', 'Free Parking', 'Air Conditioning'],
  },
  {
    id: '2',
    hostId: '1',
    title: 'Cozy Mountain Cabin',
    location: 'Aspen, Colorado',
    pricePerNight: 220,
    rating: 4.8,
    thumbnail: 'https://placehold.co/600x400',
    data_ai_hint: 'mountain cabin',
    images: ['https://placehold.co/1200x800', 'https://placehold.co/1200x800', 'https://placehold.co/1200x800'],
    description: 'A charming and cozy cabin nestled in the mountains. Ideal for ski trips and hiking adventures. Features a large stone fireplace.',
    amenities: ['WiFi', 'Kitchen', 'Fireplace', 'Heating'],
  },
  {
    id: '3',
    hostId: '2',
    title: 'Modern Downtown Loft',
    location: 'New York, New York',
    pricePerNight: 280,
    rating: 4.7,
    thumbnail: 'https://placehold.co/600x400',
    data_ai_hint: 'downtown loft',
    images: ['https://placehold.co/1200x800', 'https://placehold.co/1200x800', 'https://placehold.co/1200x800'],
    description: 'Stylish and modern loft in the heart of the city. Close to all major attractions, restaurants, and nightlife. Exposed brick walls and high ceilings.',
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Elevator'],
  },
  {
    id: '4',
    hostId: '1',
    title: 'Rustic Lakeside Retreat',
    location: 'Lake Tahoe, California',
    pricePerNight: 190,
    rating: 4.85,
    thumbnail: 'https://placehold.co/600x400',
    data_ai_hint: 'lakeside retreat',
    images: ['https://placehold.co/1200x800', 'https://placehold.co/1200x800', 'https://placehold.co/1200x800'],
    description: 'Escape to this peaceful lakeside retreat. Enjoy beautiful sunsets from the private dock, go for a swim, or take a kayak out on the water.',
    amenities: ['WiFi', 'Kitchen', 'Waterfront', 'Patio'],
  },
  {
    id: '5',
    hostId: '2',
    title: 'Chic Parisian Apartment',
    location: 'Paris, France',
    pricePerNight: 210,
    rating: 4.92,
    thumbnail: 'https://placehold.co/600x400',
    data_ai_hint: 'paris apartment',
    images: ['https://placehold.co/1200x800', 'https://placehold.co/1200x800', 'https://placehold.co/1200x800'],
    description: 'Live like a local in this chic apartment in Le Marais. Beautifully decorated with a mix of modern and vintage furniture. Includes a lovely balcony.',
    amenities: ['WiFi', 'Kitchen', 'Air Conditioning', 'Balcony'],
  },
];

export const bookings: Booking[] = [
  {
    id: 'booking1',
    userId: '1',
    propertyId: '3',
    checkIn: '2024-08-10',
    checkOut: '2024-08-15',
    totalCost: 1400,
    hasInsurance: true,
    guests: 2,
  },
  {
    id: 'booking2',
    userId: '1',
    propertyId: '2',
    checkIn: '2024-09-05',
    checkOut: '2024-09-10',
    totalCost: 1100,
    hasInsurance: false,
    guests: 3,
  },
];

export const faqs: Faq[] = [
  {
    id: 'faq1',
    propertyId: '1',
    question: 'What is the WiFi password?',
    answer: 'The WiFi network is "VillaGuest" and the password is "beachlife123".',
  },
  {
    id: 'faq2',
    propertyId: '1',
    question: 'How do I check in?',
    answer: 'Check-in is via a lockbox. The code will be sent to you on the morning of your arrival.',
  },
  {
    id: 'faq3',
    propertyId: '2',
    question: 'Are there directions to the property?',
    answer: 'From the main highway, take exit 42 onto Mountain Rd. and follow it for 3 miles. The cabin will be on your left, marked with a wooden sign.',
  },
  {
    id: 'faq4',
    propertyId: '3',
    question: 'What is the WiFi password?',
    answer: 'The network is "NYCLoft" and the password is "citydreams".'
  }
];

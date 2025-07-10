
// src/lib/api-client.ts
import { config } from './config';
import type { User, Property, Booking, InsurancePlan, PropertyFormValues, ChatMessage } from './types';

let apiBaseUrl = config.apiUrls.local;

export const setApiBaseUrl = (endpoint: 'local' | 'cloud') => {
    apiBaseUrl = config.apiUrls[endpoint];
    console.log(`API base URL set to: ${apiBaseUrl}`);
};

async function fetchWrapper(endpoint: string, options?: RequestInit) {
  try {
    const response = await fetch(`${apiBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'An unknown API error occurred' }));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }
    // For DELETE requests, there might not be a body
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    return response.json();
  } catch (error: any) {
    console.error(`API call to ${endpoint} failed:`, error);
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      const detailedError = `Network request failed. This may be a CORS issue or a mixed content error. If your application is on HTTPS, your API endpoint (${apiBaseUrl}) must also be on HTTPS.`;
      console.error(detailedError);
      throw new Error(detailedError);
    }
    if (error.name === 'AbortError') {
        console.log('Fetch request was aborted.');
        throw error;
    }
    throw error;
  }
}

// User endpoints
export const getUsers = (): Promise<User[]> => fetchWrapper('/users');
export const registerUser = (data: Omit<User, 'id'>) => fetchWrapper('/register', { method: 'POST', body: JSON.stringify(data) });
export const loginUser = (credentials: { email: string, password: string }): Promise<User> => fetchWrapper('/login', { method: 'POST', body: JSON.stringify(credentials) });
export const updateUser = (userId: number, data: Partial<User>) => fetchWrapper(`/users/${userId}`, { method: 'PUT', body: JSON.stringify(data) });

// Property endpoints
export const getProperties = (): Promise<Property[]> => fetchWrapper('/properties');
export const addProperty = (data: PropertyFormValues, hostId: number): Promise<Property> => {
    const propertyData = {
        ...data,
        hostId,
        amenities: data.amenities.split(',').map(a => a.trim()),
        images: [], // Image upload is a future feature
        thumbnail: 'https://placehold.co/600x400.png' // Default thumbnail
    };
    return fetchWrapper('/properties', { method: 'POST', body: JSON.stringify(propertyData) });
};
export const updateProperty = (propertyId: number, data: PropertyFormValues): Promise<Property> => {
    const propertyData = {
        ...data,
        amenities: data.amenities.split(',').map(a => a.trim()),
    };
    return fetchWrapper(`/properties/${propertyId}`, { method: 'PUT', body: JSON.stringify(propertyData) });
}
export const deleteProperty = (propertyId: number) => fetchWrapper(`/properties/${propertyId}`, { method: 'DELETE' });


// Booking endpoints
export const getBookings = (): Promise<Booking[]> => fetchWrapper('/bookings');
export const createBooking = (data: Omit<Booking, 'id'|'status'|'cancellationReason'>): Promise<Booking> => fetchWrapper('/bookings', { method: 'POST', body: JSON.stringify(data) });
export const updateBooking = (bookingId: number, data: Partial<Booking>) => fetchWrapper(`/bookings/${bookingId}`, { method: 'PUT', body: JSON.stringify(data) });

// Chatbot endpoint
export const getChatbotResponse = async (
    messages: ChatMessage[],
    booking: Booking,
    property: Property,
    host: User,
    insurancePlan?: InsurancePlan,
    eligibleInsurancePlan?: InsurancePlan
): Promise<{ response: string }> => {
    const payload = {
        messages,
        booking: {
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            guests: booking.guests,
            totalCost: booking.totalCost,
            reservationCost: booking.reservationCost,
            serviceFee: booking.serviceFee,
            insuranceCost: booking.insuranceCost,
        },
        property: {
            title: property.title,
            location: property.location,
            description: property.description,
            amenities: property.amenities,
            propertyInfo: property.propertyInfo,
        },
        hostInfo: {
            name: host.name,
            email: host.email,
        },
        insurancePlan: insurancePlan ? {
            name: insurancePlan.name,
            benefits: insurancePlan.benefits,
            termsUrl: insurancePlan.termsUrl,
        } : undefined,
        eligibleInsurancePlan: eligibleInsurancePlan ? {
            name: eligibleInsurancePlan.name,
            benefits: eligibleInsurancePlan.benefits,
            termsUrl: eligibleInsurancePlan.termsUrl,
        } : undefined
    };
    return fetchWrapper(config.chatEndpoint, { method: 'POST', body: JSON.stringify(payload) });
};

// Checkout Chatbot endpoint
export const getCheckoutChatbotResponse = async (
    messages: ChatMessage[],
    property: Property,
    eligibleInsurancePlan: InsurancePlan
): Promise<{ response: string }> => {
    const payload = {
        messages,
        property: { // Pass some property context in case it's useful
            title: property.title,
            location: property.location,
        },
        eligibleInsurancePlan: {
            name: eligibleInsurancePlan.name,
            benefits: eligibleInsurancePlan.benefits,
            termsUrl: eligibleInsurancePlan.termsUrl,
        }
    };
    return fetchWrapper('/chatCheckout', { method: 'POST', body: JSON.stringify(payload) });
};

// Insurance Plan endpoints
export const getInsurancePlans = (): Promise<InsurancePlan[]> => fetchWrapper('/insurance-plans');

// AI Insurance Suggestion
export const getInsuranceSuggestion = (
  location: string,
  tripCost: number,
  insurancePlan: InsurancePlan,
  signal?: AbortSignal
): Promise<{ message: string }> => {
  const payload = {
    location,
    tripCost,
    insurancePlan: {
      name: insurancePlan.name,
      benefits: insurancePlan.benefits,
    },
  };
  return fetchWrapper('/suggest-insurance-message', {
    method: 'POST',
    body: JSON.stringify(payload),
    signal,
  });
};

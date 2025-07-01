
import type { User, Property, Booking, InsurancePlan } from './types';

import propertiesData from '@/data/properties.json';
import usersData from '@/data/users.json';
import bookingsData from '@/data/bookings.json';
import insurancePlansData from '@/data/insurancePlans.json';

// By centralizing the data imports here, we can easily swap out these JSON
// files for API calls to a real backend in the future without changing
// the rest of the application code.

// These are now primarily used as fallbacks or for 'json' mode.
export const initialUsers: User[] = usersData as User[];
export const staticUsers: User[] = usersData as User[];
export const properties: Property[] = propertiesData as Property[];
export const bookings: Booking[] = bookingsData as Booking[];
export const insurancePlans: InsurancePlan[] = insurancePlansData as InsurancePlan[];


"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Booking } from '@/lib/types';
import { bookings as initialBookings } from '@/lib/data';
import { useAuth } from './use-auth';

type BookingsContextType = {
  bookings: Booking[];
  addBooking: (newBookingData: Omit<Booking, 'id' | 'userId' | 'status' | 'cancellationReason'>) => void;
  cancelBooking: (bookingId: string, cancelledBy: 'guest' | 'host', reason?: string) => void;
};

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    try {
      const storedBookings = localStorage.getItem('airbnbAllBookings');
      if (storedBookings) {
        setBookings(JSON.parse(storedBookings));
      } else {
        setBookings(initialBookings);
      }
    } catch (error) {
      console.error("Failed to parse bookings from localStorage", error);
      setBookings(initialBookings);
    }
  }, []);

  useEffect(() => {
    // We avoid writing to localStorage on the initial render before state is hydrated
    if (bookings.length > 0) {
      localStorage.setItem('airbnbAllBookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  const addBooking = (newBookingData: Omit<Booking, 'id' | 'userId' | 'status' | 'cancellationReason'>) => {
    if (!user) return;

    const newBooking: Booking = {
      ...newBookingData,
      id: `booking${Date.now()}`,
      userId: user.id,
      status: 'confirmed',
    };
    setBookings(prevBookings => [...prevBookings, newBooking]);
  };
  
  const cancelBooking = (bookingId: string, cancelledBy: 'guest' | 'host', reason?: string) => {
    setBookings(prevBookings =>
      prevBookings.map(b =>
        b.id === bookingId
          ? {
              ...b,
              status: `cancelled-by-${cancelledBy}`,
              cancellationReason: reason,
            }
          : b
      )
    );
  };


  return (
    <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking }}>
      {children}
    </BookingsContext.Provider>
  );
};

export const useBookings = () => {
  const context = useContext(BookingsContext);
  if (context === undefined) {
    throw new Error('useBookings must be used within a BookingsProvider');
  }
  return context;
};

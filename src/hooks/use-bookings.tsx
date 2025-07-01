"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Booking } from '@/lib/types';
import { bookings as initialBookings } from '@/lib/data';
import { useAuth } from './use-auth';
import { config } from '@/lib/config';
import * as apiClient from '@/lib/api-client';

type BookingsContextType = {
  bookings: Booking[];
  addBooking: (newBookingData: Omit<Booking, 'id' | 'userId' | 'status' | 'cancellationReason'>) => Promise<void>;
  cancelBooking: (bookingId: string, cancelledBy: 'guest' | 'host', reason?: string) => Promise<void>;
  isLoading: boolean;
};

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      if (config.dataSource === 'api') {
        try {
          const apiBookings = await apiClient.getBookings();
          setBookings(apiBookings);
        } catch (e) {
          console.error("Failed to fetch bookings from API", e);
          setBookings([]);
        }
      } else {
        const storedBookings = localStorage.getItem('airbnbAllBookings');
        if (storedBookings) {
          setBookings(JSON.parse(storedBookings));
        } else {
          setBookings(initialBookings);
        }
      }
      setIsLoading(false);
    };

    if(user) { // only load bookings if user is logged in
      loadInitialData();
    } else {
      setBookings([]);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && config.dataSource === 'json') {
      localStorage.setItem('airbnbAllBookings', JSON.stringify(bookings));
    }
  }, [bookings, isLoading]);

  const addBooking = async (newBookingData: Omit<Booking, 'id' | 'userId' | 'status' | 'cancellationReason'>) => {
    if (!user) return;

    if (config.dataSource === 'api') {
      const apiBookingData = { ...newBookingData, userId: user.id };
      const newBooking = await apiClient.createBooking(apiBookingData);
      setBookings(prev => [...prev, newBooking]);
    } else {
      const newBooking: Booking = {
        ...newBookingData,
        id: `booking${Date.now()}`,
        userId: user.id,
        status: 'confirmed',
      };
      setBookings(prevBookings => [...prevBookings, newBooking]);
    }
  };
  
  const cancelBooking = async (bookingId: string, cancelledBy: 'guest' | 'host', reason?: string) => {
    const updatedStatus = `cancelled-by-${cancelledBy}`;
    
    if (config.dataSource === 'api') {
      await apiClient.updateBooking(bookingId, { status: updatedStatus, cancellationReason: reason });
    }

    setBookings(prevBookings =>
      prevBookings.map(b =>
        b.id === bookingId ? { ...b, status: updatedStatus, cancellationReason: reason } : b
      )
    );
  };


  return (
    <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking, isLoading }}>
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

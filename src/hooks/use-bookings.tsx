
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Booking, InsurancePlan } from '@/lib/types';
import { useAuth } from './use-auth';
import * as apiClient from '@/lib/api-client';

type BookingsContextType = {
  bookings: Booking[];
  addBooking: (newBookingData: Omit<Booking, 'id' | 'userId' | 'status' | 'cancellationReason'>) => Promise<void>;
  cancelBooking: (bookingId: number, cancelledBy: 'guest' | 'host', reason?: string) => Promise<void>;
  addInsuranceToBooking: (bookingId: number, insurancePlan: InsurancePlan) => Promise<void>;
  isLoading: boolean;
};

const BookingsContext = createContext<BookingsContextType | undefined>(undefined);

export const BookingsProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadBookings = async () => {
      if (!user) {
        setBookings([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const apiBookings = await apiClient.getBookings();
        setBookings(apiBookings);
      } catch (e) {
        console.error("Failed to fetch bookings from API", e);
        setBookings([]); // Set to empty on error
      } finally {
        setIsLoading(false);
      }
    };

    loadBookings();
  }, [user]);

  const addBooking = async (newBookingData: Omit<Booking, 'id' | 'userId' | 'status' | 'cancellationReason'>) => {
    if (!user) throw new Error("User must be logged in to create a booking.");

    const apiBookingData = { ...newBookingData, userId: user.id };
    const newBooking = await apiClient.createBooking(apiBookingData);
    setBookings(prev => [...prev, newBooking]);
  };
  
  const cancelBooking = async (bookingId: number, cancelledBy: 'guest' | 'host', reason?: string) => {
    const updatedStatus = `cancelled-by-${cancelledBy}`;
    
    await apiClient.updateBooking(bookingId, { status: updatedStatus, cancellationReason: reason });

    setBookings(prevBookings =>
      prevBookings.map(b =>
        b.id === bookingId ? { ...b, status: updatedStatus, cancellationReason: reason } : b
      )
    );
  };
  
  const addInsuranceToBooking = async (bookingId: number, insurancePlan: InsurancePlan) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) throw new Error("Booking not found.");

    const insuranceCost = (booking.reservationCost * insurancePlan.pricePercent) / 100;
    const newTotalCost = booking.totalCost + insuranceCost;

    const updatedData = {
        insurancePlanId: insurancePlan.id,
        totalCost: newTotalCost,
        insuranceCost: insuranceCost,
    };
    
    await apiClient.updateBooking(bookingId, updatedData);

    setBookings(prevBookings =>
      prevBookings.map(b =>
        b.id === bookingId ? { ...b, ...updatedData } : b
      )
    );
  };

  return (
    <BookingsContext.Provider value={{ bookings, addBooking, cancelBooking, addInsuranceToBooking, isLoading }}>
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

    
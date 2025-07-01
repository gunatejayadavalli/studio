// src/hooks/use-static-data.ts
"use client";

import { useState, useEffect } from 'react';
import * as apiClient from '@/lib/api-client';
import type { Property, InsurancePlan, User } from '@/lib/types';

export function useStaticData() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [apiProperties, apiInsurancePlans, apiUsers] = await Promise.all([
          apiClient.getProperties(),
          apiClient.getInsurancePlans(),
          apiClient.getUsers(),
        ]);
        setProperties(apiProperties);
        setInsurancePlans(apiInsurancePlans);
        setUsers(apiUsers);
      } catch (e: any) {
        console.error("Failed to fetch static data from API", e);
        setError(e.message || "An unknown error occurred while fetching data.");
        // Set to empty arrays on error to prevent crashes
        setProperties([]);
        setInsurancePlans([]);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return { properties, insurancePlans, users, isLoading, error };
}

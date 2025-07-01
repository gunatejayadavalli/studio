
// src/hooks/use-static-data.ts
"use client";

import { useState, useEffect } from 'react';
import { config } from '@/lib/config';
import * as apiClient from '@/lib/api-client';
import type { Property, InsurancePlan, User } from '@/lib/types';
import { properties as staticProperties, insurancePlans as staticInsurancePlans, staticUsers } from '@/lib/data';

export function useStaticData() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (config.dataSource === 'api') {
        try {
          const [apiProperties, apiInsurancePlans, apiUsers] = await Promise.all([
            apiClient.getProperties(),
            apiClient.getInsurancePlans(),
            apiClient.getUsers(),
          ]);
          setProperties(apiProperties);
          setInsurancePlans(apiInsurancePlans);
          setUsers(apiUsers);
        } catch (e) {
          console.error("Failed to fetch static data from API", e);
          setProperties(staticProperties);
          setInsurancePlans(staticInsurancePlans);
          setUsers(staticUsers);
        }
      } else {
        setProperties(staticProperties);
        setInsurancePlans(staticInsurancePlans);
        setUsers(staticUsers);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return { properties, insurancePlans, users, isLoading };
}

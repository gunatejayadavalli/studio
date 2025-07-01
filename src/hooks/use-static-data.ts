// src/hooks/use-static-data.ts
"use client";

import { useState, useEffect } from 'react';
import { config } from '@/lib/config';
import * as apiClient from '@/lib/api-client';
import type { Property, InsurancePlan } from '@/lib/types';
import { properties as staticProperties, insurancePlans as staticInsurancePlans } from '@/lib/data';

export function useStaticData() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [insurancePlans, setInsurancePlans] = useState<InsurancePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (config.dataSource === 'api') {
        try {
          const [apiProperties, apiInsurancePlans] = await Promise.all([
            apiClient.getProperties(),
            apiClient.getInsurancePlans(),
          ]);
          setProperties(apiProperties);
          setInsurancePlans(apiInsurancePlans);
        } catch (e) {
          console.error("Failed to fetch static data from API", e);
          setProperties(staticProperties);
          setInsurancePlans(staticInsurancePlans);
        }
      } else {
        setProperties(staticProperties);
        setInsurancePlans(staticInsurancePlans);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  return { properties, insurancePlans, isLoading };
}

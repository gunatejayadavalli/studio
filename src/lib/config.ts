// src/lib/config.ts
export const config = {
  // Switch to 'api' to use the backend, or 'json' to use local data files.
  dataSource: 'json' as 'api' | 'json',
  apiBaseUrl: 'http://localhost:5001',
};

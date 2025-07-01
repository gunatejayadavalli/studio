// src/lib/config.ts
export const config = {
  // The application now exclusively uses the API for data.
  dataSource: 'api' as 'api' | 'json',
  apiBaseUrl: 'http://127.0.0.1:7076'
};

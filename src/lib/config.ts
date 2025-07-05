// src/lib/config.ts
export const config = {
  // The application now exclusively uses the API for data.
  dataSource: 'api' as 'api',
  apiBaseUrl: 'http://127.0.0.1:7076',
  // Switch between the simple chatbot ('/chat') and the advanced agent ('/chatOptimized')
  chatEndpoint: '/chatOptimized' as '/chat' | '/chatOptimized',
};

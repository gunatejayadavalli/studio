
// src/lib/config.ts
export const config = {
  dataSource: 'api' as 'api',
  apiUrls: {
    local: 'http://127.0.0.1:7075/airbnbliteapi',
    cloud: 'http://13.223.36.156:7075/airbnbliteapi',
  },
  // Switch between the simple chatbot ('/chat') and the advanced agent ('/chatOptimized')
  chatEndpoint: '/chatOptimized' as '/chat' | '/chatOptimized',
};

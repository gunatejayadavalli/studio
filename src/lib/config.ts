// src/lib/config.ts
export const config = {
  // The application now exclusively uses the API for data.
  dataSource: 'api' as 'api',
  apiBaseUrl: 'http://127.0.0.1:7075/airbnbliteapi',
  // Switch between the simple chatbot ('/chat') and the advanced agent ('/chatOptimized')
  //apiBaseUrl: 'http://897b80331b4142e0b8e83cb92ee90e59-760212110.us-east-1.elb.amazonaws.com/airbnbliteapi',
  chatEndpoint: '/chatOptimized' as '/chat' | '/chatOptimized',
};
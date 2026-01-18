
export const SYSTEM_CONFIG = {
  LATENCY_BUDGET_MS: 100,
  FRAUD_THRESHOLD_BLOCK: 85,
  FRAUD_THRESHOLD_REVIEW: 60,
  VELOCITY_WINDOW_MS: 60000, // 1 minute
  SPEED_OF_LIGHT_KMH: 1000, // For travel calculation
  MAX_STREAM_SIZE: 50,
};

export const MOCK_MERCHANTS = [
  'Amazon', 'Apple Store', 'Starbucks', 'Walmart', 'Steam', 'Uber', 
  'Airbnb', 'Nike', 'Netflix', 'Best Buy', 'Zelle Transfer', 'Binance'
];

export const MOCK_CITIES = [
  { city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { city: 'Tokyo', country: 'Japan', lat: 35.6895, lng: 139.6917 },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
  { city: 'San Francisco', country: 'USA', lat: 37.7749, lng: -122.4194 },
  { city: 'Lagos', country: 'Nigeria', lat: 6.5244, lng: 3.3792 },
  { city: 'Moscow', country: 'Russia', lat: 55.7558, lng: 37.6173 },
  { city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 }
];

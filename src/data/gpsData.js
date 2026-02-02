/**
 * Mock GPS data from ESP32 devices
 * This data structure represents real-world GPS tracking from IoT devices
 * 
 * Data Source: ESP32 GPS Module
 * - Each device sends: vehicle_id, latitude, longitude, timestamp
 * - This can be easily replaced with Firebase, REST API, or MQTT
 */

// Mock vehicle fleet data
export const mockVehicles = [
  {
    vehicle_id: 'TRUCK-001',
    vehicle_name: 'Delivery Truck Alpha',
    latitude: 51.5074,
    longitude: -0.1278,
    timestamp: new Date(Date.now() - 3000), // 3 seconds ago
    status: 'active',
  },
  {
    vehicle_id: 'VAN-002',
    vehicle_name: 'Service Van Beta',
    latitude: 51.5195,
    longitude: -0.1383,
    timestamp: new Date(Date.now() - 8000), // 8 seconds ago
    status: 'active',
  },
  {
    vehicle_id: 'BUS-003',
    vehicle_name: 'Transit Bus Gamma',
    latitude: 51.4769,
    longitude: -0.2038,
    timestamp: new Date(Date.now() - 25000), // 25 seconds ago (offline)
    status: 'active',
  },
  {
    vehicle_id: 'CAR-004',
    vehicle_name: 'Executive Car Delta',
    latitude: 51.5285,
    longitude: -0.0950,
    timestamp: new Date(Date.now() - 2000), // 2 seconds ago
    status: 'active',
  },
  {
    vehicle_id: 'TRUCK-005',
    vehicle_name: 'Heavy Truck Epsilon',
    latitude: 51.4895,
    longitude: -0.1447,
    timestamp: new Date(Date.now() - 45000), // 45 seconds ago (offline)
    status: 'inactive',
  },
];

/**
 * Simulates receiving real-time GPS updates from ESP32 devices
 * In production, this would connect to Firebase Realtime DB, REST API, or MQTT broker
 */
export const simulateGPSUpdate = (vehicles) => {
  // Return a deep copy with slightly updated positions
  return vehicles.map((vehicle) => ({
    ...vehicle,
    latitude: vehicle.latitude + (Math.random() - 0.5) * 0.001,
    longitude: vehicle.longitude + (Math.random() - 0.5) * 0.001,
    timestamp: new Date(),
  }));
};

/**
 * Determines GPS status based on last update time
 * Online: Last update < 10 seconds
 * Offline: Last update >= 10 seconds
 * 
 * @param {Date} timestamp - Last GPS update timestamp
 * @returns {string} 'Online' or 'Offline'
 */
export const getGPSStatus = (timestamp) => {
  const secondsSinceLastUpdate = (new Date() - timestamp) / 1000;
  return secondsSinceLastUpdate < 10 ? 'Online' : 'Offline';
};

/**
 * API interface for data source abstraction
 * This allows easy replacement with different backends
 */
export class GPSDataService {
  /**
   * Fetch all vehicles from the data source
   * @returns {Promise<Array>} Array of vehicle objects
   */
  static async fetchVehicles() {
    // TODO: Replace with actual API call
    // return fetch('https://api.example.com/vehicles').then(r => r.json());
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockVehicles), 500);
    });
  }

  /**
   * Subscribe to real-time GPS updates
   * @param {Function} callback - Called when data updates
   * @returns {Function} Unsubscribe function
   */
  static subscribeToUpdates(callback) {
    // TODO: Replace with Firebase listener or WebSocket
    // const unsubscribe = firebaseDB.ref('vehicles').on('value', ...);
    // return unsubscribe;

    const interval = setInterval(() => {
      callback(simulateGPSUpdate(mockVehicles));
    }, 5000);

    return () => clearInterval(interval);
  }
}

export default GPSDataService;

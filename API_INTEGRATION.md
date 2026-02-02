# API Integration Guide - Fleet GPS Tracking System

This guide explains how to integrate the GPS Dashboard with various backend services.

## 🔌 Data Service Architecture

The application uses a pluggable data service pattern. All GPS data operations go through `src/data/gpsData.js`:

```javascript
// Current: Mock service
export class GPSDataService {
  static async fetchVehicles() { ... }
  static subscribeToUpdates(callback) { ... }
}
```

To integrate a real backend, replace these methods with actual API calls.

## 🔗 Backend Integration Patterns

### Pattern 1: REST API

**Backend Setup:**
```javascript
// Express.js example
app.get('/api/vehicles', async (req, res) => {
  const vehicles = await Vehicle.find();
  res.json(vehicles);
});

app.post('/api/vehicles/:id/location', async (req, res) => {
  const { latitude, longitude } = req.body;
  const vehicle = await Vehicle.findByIdAndUpdate(
    req.params.id,
    { latitude, longitude, timestamp: new Date() },
    { new: true }
  );
  res.json(vehicle);
});
```

**Frontend Integration:**
```javascript
// Replace in gpsData.js
export class GPSDataService {
  static async fetchVehicles() {
    try {
      const response = await fetch('https://api.example.com/api/vehicles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch vehicles');
      return await response.json();
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return [];
    }
  }

  static subscribeToUpdates(callback) {
    const interval = setInterval(async () => {
      const vehicles = await this.fetchVehicles();
      callback(vehicles);
    }, 5000);

    return () => clearInterval(interval);
  }
}
```

### Pattern 2: WebSocket Real-Time Updates

**Backend Setup:**
```javascript
// Node.js + Socket.IO
const io = require('socket.io')(3001);

io.on('connection', (socket) => {
  console.log('Client connected');

  // Send vehicle updates every second
  const interval = setInterval(async () => {
    const vehicles = await Vehicle.find();
    socket.emit('vehicles_update', vehicles);
  }, 1000);

  socket.on('disconnect', () => {
    clearInterval(interval);
  });
});
```

**Frontend Integration:**
```javascript
import io from 'socket.io-client';

export class GPSDataService {
  static socket = null;

  static connect() {
    this.socket = io('https://api.example.com', {
      auth: {
        token: localStorage.getItem('token')
      }
    });
  }

  static subscribeToUpdates(callback) {
    this.connect();
    
    this.socket.on('vehicles_update', (vehicles) => {
      callback(vehicles);
    });

    return () => this.socket.disconnect();
  }
}
```

**Usage in App.tsx:**
```javascript
useEffect(() => {
  const unsubscribe = GPSDataService.subscribeToUpdates((vehicles) => {
    setVehicles(vehicles);
  });

  return () => unsubscribe();
}, []);
```

### Pattern 3: Firebase Realtime Database

**Firebase Setup:**
```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue } from 'firebase/database';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
```

**Frontend Integration:**
```javascript
import { getDatabase, ref, onValue } from 'firebase/database';

export class GPSDataService {
  static async fetchVehicles() {
    const database = getDatabase();
    const vehiclesRef = ref(database, 'vehicles');
    
    return new Promise((resolve) => {
      onValue(vehiclesRef, (snapshot) => {
        const data = snapshot.val();
        resolve(Object.values(data || {}));
      });
    });
  }

  static subscribeToUpdates(callback) {
    const database = getDatabase();
    const vehiclesRef = ref(database, 'vehicles');

    const unsubscribe = onValue(vehiclesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(Object.values(data));
      }
    });

    return () => unsubscribe();
  }
}
```

### Pattern 4: MQTT

**Backend Setup:**
```javascript
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.example.com');

client.on('connect', () => {
  console.log('Connected to MQTT');
});

// ESP32 publishes to: vehicles/TRUCK-001/location
client.subscribe('vehicles/+/location');

client.on('message', (topic, message) => {
  const vehicleId = topic.split('/')[1];
  const data = JSON.parse(message.toString());
  
  // Save to database
  Vehicle.findByIdAndUpdate(vehicleId, {
    latitude: data.lat,
    longitude: data.lng,
    timestamp: new Date()
  });
});
```

**Frontend Integration:**
```javascript
import mqtt from 'mqtt';

export class GPSDataService {
  static client = null;
  static vehicles = [];

  static connect() {
    this.client = mqtt.connect('wss://broker.example.com:8883', {
      username: 'mqtt_user',
      password: 'mqtt_password'
    });

    this.client.subscribe('vehicles/+/location');
    
    this.client.on('message', (topic, message) => {
      const vehicleId = topic.split('/')[1];
      const data = JSON.parse(message.toString());
      
      // Update local vehicle data
      const idx = this.vehicles.findIndex(v => v.vehicle_id === vehicleId);
      if (idx !== -1) {
        this.vehicles[idx] = {
          ...this.vehicles[idx],
          ...data,
          timestamp: new Date()
        };
      }
    });
  }

  static async fetchVehicles() {
    // Could fetch initial data from API
    if (!this.client) this.connect();
    return this.vehicles;
  }

  static subscribeToUpdates(callback) {
    this.connect();
    
    const interval = setInterval(() => {
      callback([...this.vehicles]);
    }, 1000);

    return () => {
      clearInterval(interval);
      this.client.end();
    };
  }
}
```

**ESP32 Code (Arduino):**
```cpp
#include <WiFi.h>
#include <PubSubClient.h>
#include <TinyGPS++.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";
const char* mqtt_server = "broker.example.com";

WiFiClient espClient;
PubSubClient client(espClient);
TinyGPSPlus gps;

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  client.setServer(mqtt_server, 8883);
}

void loop() {
  // Read GPS data
  while (Serial.available() > 0) {
    gps.encode(Serial.read());
  }

  if (gps.location.isUpdated()) {
    // Prepare JSON
    char payload[256];
    snprintf(payload, sizeof(payload),
      "{\"lat\":%.6f,\"lng\":%.6f}",
      gps.location.lat(),
      gps.location.lng()
    );

    // Publish to MQTT
    client.publish("vehicles/TRUCK-001/location", payload);
  }

  delay(5000); // Publish every 5 seconds
}
```

## 🔐 Authentication & Authorization

### JWT Token Integration

```javascript
// Store token
localStorage.setItem('authToken', response.token);

// Add to requests
export class GPSDataService {
  static getAuthHeader() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  static async fetchVehicles() {
    const response = await fetch('https://api.example.com/vehicles', {
      headers: this.getAuthHeader()
    });
    
    if (response.status === 401) {
      // Token expired, refresh
      await this.refreshToken();
      return this.fetchVehicles(); // Retry
    }

    return response.json();
  }

  static async refreshToken() {
    const response = await fetch('https://api.example.com/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        refreshToken: localStorage.getItem('refreshToken')
      })
    });

    const { token } = await response.json();
    localStorage.setItem('authToken', token);
  }
}
```

## 📡 Data Transformation

Transform backend data to match the application schema:

```javascript
export class GPSDataService {
  static transformVehicle(apiVehicle) {
    return {
      vehicle_id: apiVehicle.id,
      vehicle_name: apiVehicle.name,
      latitude: apiVehicle.gps.latitude,
      longitude: apiVehicle.gps.longitude,
      timestamp: new Date(apiVehicle.last_update),
      status: apiVehicle.is_active ? 'active' : 'inactive'
    };
  }

  static async fetchVehicles() {
    const response = await fetch('https://api.example.com/vehicles');
    const data = await response.json();
    
    return data.map(v => this.transformVehicle(v));
  }
}
```

## 🚨 Error Handling

```javascript
export class GPSDataService {
  static async fetchVehicles() {
    try {
      const response = await fetch('https://api.example.com/vehicles', {
        timeout: 5000
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      
      // Implement retry logic
      if (error.name === 'TypeError') {
        // Network error
        return this.getLocalCachedVehicles();
      }
      
      throw error;
    }
  }
}
```

## 📊 Caching Strategy

```javascript
export class GPSDataService {
  static cache = {
    vehicles: null,
    timestamp: null
  };

  static CACHE_DURATION = 5000; // 5 seconds

  static async fetchVehicles() {
    const now = Date.now();
    
    // Return cached if still valid
    if (
      this.cache.vehicles &&
      now - this.cache.timestamp < this.CACHE_DURATION
    ) {
      return this.cache.vehicles;
    }

    // Fetch fresh data
    const response = await fetch('https://api.example.com/vehicles');
    const vehicles = await response.json();

    // Update cache
    this.cache.vehicles = vehicles;
    this.cache.timestamp = now;

    return vehicles;
  }
}
```

## 🧪 Testing API Integration

```javascript
// Mock for testing
export class GPSDataServiceMock {
  static async fetchVehicles() {
    return mockVehicles;
  }

  static subscribeToUpdates(callback) {
    return () => {};
  }
}

// Use in tests
let dataService;

beforeEach(() => {
  if (process.env.NODE_ENV === 'test') {
    dataService = GPSDataServiceMock;
  } else {
    dataService = GPSDataService;
  }
});
```

## 📚 Example Backend Stack

### Recommended: Node.js + Express + PostgreSQL

```bash
npm init -y
npm install express cors dotenv pg socket.io
```

### API Endpoints

```
GET    /api/vehicles              - List all vehicles
GET    /api/vehicles/:id          - Get vehicle details
POST   /api/vehicles/:id/location - Update location
GET    /api/vehicles/:id/history  - Get location history
POST   /api/auth/login            - User authentication
```

---

**Version:** 1.0.0  
**Last Updated:** February 2, 2026

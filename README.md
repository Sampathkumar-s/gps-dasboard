# Fleet GPS Tracking System

A professional, real-world fleet management dashboard built with React and Vite. This system demonstrates modern IoT integration with ESP32 GPS devices, featuring real-time vehicle tracking, status monitoring, and an interactive map interface.

## 🎯 Features

### Core Functionality
- **Real-time Vehicle Tracking**: Display live GPS positions from ESP32 devices
- **Interactive Map**: Canvas-based map with zoom and pan controls
- **Vehicle Management**: Sidebar listing all vehicles with status indicators
- **Status Monitoring**: Online/Offline status based on GPS update frequency (< 10 seconds = Online)
- **Vehicle Details Panel**: Display selected vehicle coordinates and metadata

### User Experience
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Dark sidebar with gradient accents and light map area
- **Visual Feedback**: Smooth animations, hover effects, and status indicators
- **Accessibility**: Keyboard navigation support, semantic HTML

## 🏗️ Project Structure

```
src/
├── data/
│   └── gpsData.js          # Mock data & GPS data service
├── App.jsx                 # Main app component (state management)
├── Sidebar.jsx             # Vehicle list component
├── MapView.jsx             # Interactive map component
├── App.css                 # App styling
├── Sidebar.css             # Sidebar styling
├── MapView.css             # Map styling
├── index.css               # Global styles
└── main.tsx                # React entry point
```

## 🚗 Data Structure

### Vehicle Object
```javascript
{
  vehicle_id: 'TRUCK-001',           // Unique identifier
  vehicle_name: 'Delivery Truck',    // Display name
  latitude: 51.5074,                 // Current latitude
  longitude: -0.1278,                // Current longitude
  timestamp: Date,                   // Last GPS update
  gpsStatus: 'Online' | 'Offline',  // Status (< 10s = Online)
  status: 'active' | 'inactive'     // Vehicle operational status
}
```

## 🔌 ESP32 Integration

### Current: Mock Data with Simulated Updates
The system currently simulates GPS data from ESP32 devices using mock data and 5-second update intervals.

### Production Options

**REST API:**
```javascript
static async fetchVehicles() {
  return fetch('https://api.example.com/vehicles').then(r => r.json());
}
```

**Firebase:**
```javascript
static subscribeToUpdates(callback) {
  return firebaseDB.ref('vehicles').on('value', (snapshot) => {
    callback(snapshot.val());
  });
}
```

**MQTT (for embedded systems):**
```javascript
const client = mqtt.connect('mqtt://broker.example.com');
client.subscribe('vehicles/+');
client.on('message', (topic, payload) => {
  callback(JSON.parse(payload));
});
```

## 🎨 Color Scheme

- **Primary**: `#667eea` (Purple)
- **Accent**: `#4ecdc4` (Teal - Online vehicles)
- **Danger**: `#ff6b35` (Orange - Selected vehicle)
- **Offline**: `#cccccc` (Gray)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 💻 Code Quality

### Key Principles
✅ Clean, readable variable names  
✅ Comprehensive JSDoc comments  
✅ Component-based architecture  
✅ Separation of concerns  
✅ Responsive design  
✅ Accessibility support

### Example: Well-Documented Function
```javascript
/**
 * Determines GPS status based on last update time
 * Online: Last update < 10 seconds
 * Offline: Last update >= 10 seconds
 */
export const getGPSStatus = (timestamp) => {
  const secondsSinceLastUpdate = (new Date() - timestamp) / 1000;
  return secondsSinceLastUpdate < 10 ? 'Online' : 'Offline';
};
```

## 🧪 Testing

### Mock Vehicles Included
- **TRUCK-001**: Online (3s ago) ✅
- **VAN-002**: Online (8s ago) ✅
- **BUS-003**: Offline (25s ago) ❌
- **CAR-004**: Online (2s ago) ✅
- **TRUCK-005**: Offline (45s ago) ❌

### Test Scenarios
1. Click vehicle → verify highlight and map center
2. Wait 10+ seconds → verify Online→Offline transition
3. Drag map and zoom → verify smooth interactions
4. Resize window → verify responsive layout

## 📈 Future Enhancements

- [ ] Export GPS data to CSV/PDF
- [ ] Historical route playback
- [ ] Geofencing and alerts
- [ ] Multi-user authentication
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard

## 🎓 Perfect For

✓ Final-year engineering projects  
✓ IoT portfolio demonstrations  
✓ Real-world React applications  
✓ Fleet management systems  
✓ GPS tracking implementations

---

**Professional-grade Fleet Management Dashboard** | Built with React 19 & Vite
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

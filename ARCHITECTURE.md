# Architecture Documentation - Fleet GPS Tracking System

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Fleet GPS Dashboard                      │
│                    (React + Vite + TypeScript)              │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Frontend Layer                            │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Sidebar    │  │   MapView    │  │ VehicleInfo  │     │
│  │  Component   │  │  Component   │  │  Component   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│           ↓              ↓                   ↓             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         App.tsx (State Manager)                      │  │
│  │  - vehicles state                                    │  │
│  │  - selectedVehicle state                             │  │
│  │  - Orchestrates component communication              │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│              Data Service Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │        GPSDataService                                │   │
│  │  - Data abstraction                                  │   │
│  │  - Backend integration (pluggable)                   │   │
│  │  - Status calculation                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│              Backend Options                                │
├─────────────────────────────────────────────────────────────┤
│  • REST API        • Firebase    • MQTT    • WebSocket      │
└─────────────────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────┐
│              Data Sources                                   │
├─────────────────────────────────────────────────────────────┤
│  • ESP32 Devices   • PostgreSQL  • MongoDB  • Cloud DB      │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Component Hierarchy

```
App (State Manager)
├── Sidebar (Vehicle List)
│   └── VehicleItem (Individual Vehicle)
│       ├── StatusIndicator
│       ├── VehicleInfo
│       └── SelectionIndicator
├── MapView (Interactive Map)
│   ├── Canvas Element
│   ├── MapControls (Zoom +/-)
│   └── MapLegend
└── VehicleDetails (Info Panel)
    ├── VehicleTitle
    ├── DetailRows
    │   ├── Vehicle ID
    │   ├── Latitude
    │   ├── Longitude
    │   ├── GPS Status
    │   └── Last Update
    └── StatusBadge
```

## 🔄 Data Flow

### 1. Initial Load
```
useEffect (App.tsx)
    ↓
GPSDataService.fetchVehicles()
    ↓
setVehicles (React state)
    ↓
Re-render (Sidebar + MapView)
```

### 2. Real-time Updates
```
5-second interval
    ↓
Update vehicle positions (GPS drift)
    ↓
Update timestamps
    ↓
setVehicles (state update)
    ↓
Sidebar highlights update
    ↓
MapView markers move
```

### 3. Vehicle Selection
```
User clicks vehicle (Sidebar)
    ↓
onSelectVehicle callback
    ↓
setSelectedVehicle
    ↓
MapView centers on vehicle
    ↓
VehicleDetails panel updates
```

## 🎯 State Management

### App.tsx State
```typescript
interface AppState {
  vehicles: Vehicle[];           // All fleet vehicles
  selectedVehicle: Vehicle | null; // Currently selected
}
```

### Vehicle Object
```typescript
interface Vehicle {
  vehicle_id: string;            // Unique identifier
  vehicle_name: string;          // Display name
  latitude: number;              // GPS latitude
  longitude: number;             // GPS longitude
  timestamp: Date;               // Last update
  gpsStatus: 'Online' | 'Offline'; // Computed status
  status: 'active' | 'inactive'; // Operational status
}
```

## 🎨 Styling Architecture

### CSS Organization
```
Global Styles (index.css)
├── CSS Variables
├── Typography
├── Reset Styles
└── Scrollbar Styling

Component Styles
├── App.css (Layout)
├── Sidebar.css (Vehicle List)
└── MapView.css (Map Controls)
```

### CSS Variables
```css
:root {
  --color-primary: #667eea;      /* Main accent */
  --color-secondary: #764ba2;    /* Secondary */
  --color-accent: #4ecdc4;       /* Teal */
  --color-danger: #ff6b35;       /* Orange */
  --color-dark: #1e3c72;         /* Navy */
}
```

## 📊 Data Service Architecture

### Current Implementation (Mock)
```javascript
export const mockVehicles = [...]    // Static mock data
export const getGPSStatus()          // Status calculation
export const simulateGPSUpdate()     // Update simulation
export class GPSDataService {}       // Abstraction layer
```

### Pluggable Pattern
```javascript
// Switch implementations by changing:
export const dataService = 
  process.env.USE_MOCK_DATA 
    ? MockGPSDataService 
    : RealGPSDataService;
```

## 🔌 Integration Points

### Easy to Replace
1. **Data Source**: Change `GPSDataService` methods
2. **Map Implementation**: Replace Canvas with Leaflet/Mapbox
3. **Authentication**: Add JWT/OAuth in API calls
4. **Storage**: Add localStorage caching
5. **Analytics**: Integrate Sentry/Google Analytics

### Example: Replace with Leaflet
```javascript
// Current (Canvas)
<MapView selectedVehicle={selectedVehicle} />

// Alternative (Leaflet)
<LeafletMapView selectedVehicle={selectedVehicle} />
```

## 🚀 Performance Optimizations

### 1. React Optimization
```javascript
// useCallback for memoization
const handleSelectVehicle = useCallback((vehicleId) => {
  setSelectedVehicle(...);
}, [vehicles]);

// useMemo for expensive computations
const vehiclesWithStatus = useMemo(() => 
  vehicles.map(v => ({
    ...v,
    gpsStatus: getGPSStatus(v.timestamp)
  })), [vehicles]
);
```

### 2. Canvas Rendering
- Only redraw changed elements
- Use offscreen canvas for complex graphics
- Throttle update cycles

### 3. Network Optimization
- Batch API requests
- Implement request debouncing
- Cache vehicle data locally
- Compress API responses (gzip)

## 🔐 Security Layers

### Frontend Security
```javascript
// 1. Input validation
if (!isValidCoordinate(latitude)) throw new Error();

// 2. Environment variables
const API_URL = import.meta.env.VITE_API_URL;

// 3. HTTPS only
if (window.location.protocol !== 'https:') {
  redirect to https;
}
```

### Backend Security (Recommended)
```javascript
// 1. Rate limiting
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// 2. CORS
app.use(cors({ origin: 'https://yourdomain.com' }));

// 3. Input validation
const { error, value } = schema.validate(req.body);

// 4. Authentication
app.use(authenticate);

// 5. Logging
logger.info('Vehicle updated', { vehicleId, user });
```

## 📈 Scalability Considerations

### For 1000+ Vehicles
1. **Virtual Scrolling** in Sidebar
2. **Clustering** on map
3. **Pagination** for vehicle list
4. **IndexedDB** for offline storage
5. **Web Workers** for data processing

### Database Optimization
```sql
-- Indexes for performance
CREATE INDEX idx_vehicle_id ON vehicles(vehicle_id);
CREATE INDEX idx_timestamp ON vehicles(timestamp);
CREATE INDEX idx_gps_status ON vehicles(status);

-- Partitioning by date
PARTITION BY RANGE (YEAR(timestamp));
```

## 🧪 Testing Strategy

### Unit Tests
```javascript
test('getGPSStatus returns Online for recent updates', () => {
  const now = new Date();
  const result = getGPSStatus(now);
  expect(result).toBe('Online');
});
```

### Integration Tests
```javascript
test('Selecting vehicle centers map', async () => {
  render(<App />);
  const vehicle = screen.getByText('TRUCK-001');
  fireEvent.click(vehicle);
  expect(canvas).toHaveMapCenter(vehicle.coordinates);
});
```

### E2E Tests (Cypress/Playwright)
```javascript
describe('Fleet GPS Dashboard', () => {
  it('should track vehicle selection', () => {
    cy.visit('http://localhost:5173');
    cy.contains('TRUCK-001').click();
    cy.get('.map-canvas').should('be.visible');
  });
});
```

## 🚀 Deployment Architecture

### Local Development
```
npm run dev  →  Vite Dev Server (localhost:5173)
```

### Production Build
```
npm run build  →  Optimized static files
dist/          →  Ready for CDN/Server
```

### Deployment Options
```
Vercel       →  Serverless + CDN (Recommended)
AWS Amplify  →  Full AWS integration
Docker       →  Container deployment
VPS          →  Traditional server
```

## 📊 Monitoring & Observability

### Frontend Monitoring
```javascript
// Performance
const perfObserver = new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(`${entry.name}: ${entry.duration}ms`);
  });
});

// Error tracking
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error);
});
```

### Backend Monitoring
```javascript
// API response times
const start = Date.now();
const response = await fetch(apiUrl);
const duration = Date.now() - start;
logger.info('API call', { duration, endpoint: apiUrl });
```

## 🎓 Development Workflow

### 1. Feature Development
```
Feature branch  →  Local testing  →  PR  →  Code review  →  Merge
```

### 2. Testing
```
Unit tests  →  Integration tests  →  E2E tests  →  Manual QA
```

### 3. Deployment
```
Build  →  Test build  →  Deploy staging  →  Deploy production
```

## 📚 Design Patterns Used

### 1. Service Pattern (Data Abstraction)
- `GPSDataService` abstracts backend implementation

### 2. Component Pattern (React)
- Reusable UI components (Sidebar, MapView)

### 3. State Management Pattern
- Centralized state in App.tsx
- Props drilling for child components

### 4. Observer Pattern (useEffect)
- Subscribe to data updates
- Cleanup on unmount

### 5. Factory Pattern (Conditional Rendering)
- Different components based on state

## 🔧 Configuration Management

### Environment Variables
```
.env.development
  VITE_API_URL=http://localhost:3000
  VITE_LOG_LEVEL=debug

.env.production
  VITE_API_URL=https://api.example.com
  VITE_LOG_LEVEL=error
```

### Feature Flags
```javascript
const FEATURES = {
  ENABLE_HISTORY: import.meta.env.VITE_ENABLE_HISTORY === 'true',
  ENABLE_ALERTS: import.meta.env.VITE_ENABLE_ALERTS === 'true',
  ENABLE_EXPORT: import.meta.env.VITE_ENABLE_EXPORT === 'true',
};
```

---

**Version:** 1.0.0  
**Last Updated:** February 2, 2026

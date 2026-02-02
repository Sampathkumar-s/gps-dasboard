import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import MapView from './MapView';
import { mockVehicles, getGPSStatus, simulateGPSUpdate } from './data/gpsData';
import './App.css';

/**
 * Main Fleet GPS Dashboard Application
 * 
 * State Management:
 * - vehicles: Array of all vehicle data
 * - selectedVehicle: Currently selected vehicle
 * 
 * This component orchestrates the sidebar and map view,
 * managing real-time GPS data from ESP32 devices
 */
function App() {
  // State management
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  /**
   * Initialize vehicle data on component mount
   * Simulates receiving data from ESP32 devices
   */
  useEffect(() => {
    // Load initial vehicle data
    setVehicles(mockVehicles);
    setSelectedVehicle(mockVehicles[0]); // Select first vehicle by default

    // Simulate real-time GPS updates (every 5 seconds)
    // In production, replace with actual WebSocket or Firebase listener
    const updateInterval = setInterval(() => {
      setVehicles((prevVehicles) =>
        prevVehicles.map((vehicle) => ({
          ...vehicle,
          // Simulate slight GPS drift (realistic for real-world devices)
          latitude: vehicle.latitude + (Math.random() - 0.5) * 0.0005,
          longitude: vehicle.longitude + (Math.random() - 0.5) * 0.0005,
          timestamp: new Date(), // Update timestamp for status calculation
        }))
      );
    }, 5000);

    return () => clearInterval(updateInterval);
  }, []);

  /**
   * Handle vehicle selection from sidebar
   * Updates selected vehicle and triggers map center
   */
  const handleSelectVehicle = (vehicleId) => {
    const vehicle = vehicles.find((v) => v.vehicle_id === vehicleId);
    if (vehicle) {
      setSelectedVehicle(vehicle);
    }
  };

  /**
   * Enrich vehicle data with computed GPS status
   */
  const vehiclesWithStatus = vehicles.map((vehicle) => ({
    ...vehicle,
    gpsStatus: getGPSStatus(vehicle.timestamp),
  }));

  return (
    <div className="app-container">
      {/* Left Sidebar: Vehicle List */}
      <Sidebar
        vehicles={vehiclesWithStatus}
        selectedVehicle={selectedVehicle}
        onSelectVehicle={handleSelectVehicle}
      />

      {/* Right Content Area: Map and Details */}
      <div className="main-content">
        {/* Map View */}
        <MapView selectedVehicle={selectedVehicle} vehicles={vehiclesWithStatus} />

        {/* Vehicle Details Panel */}
        {selectedVehicle && (
          <div className="vehicle-details">
            <h2 className="details-title">{selectedVehicle.vehicle_name}</h2>
            <div className="detail-row">
              <span className="detail-label">Vehicle ID:</span>
              <span className="detail-value">{selectedVehicle.vehicle_id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Latitude:</span>
              <span className="detail-value">
                {selectedVehicle.latitude.toFixed(6)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Longitude:</span>
              <span className="detail-value">
                {selectedVehicle.longitude.toFixed(6)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">GPS Status:</span>
              <span
                className={`detail-value status-badge ${
                  selectedVehicle.gpsStatus === 'Online' ? 'online' : 'offline'
                }`}
              >
                ● {selectedVehicle.gpsStatus}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last Update:</span>
              <span className="detail-value">
                {Math.round((new Date() - selectedVehicle.timestamp) / 1000)}s ago
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

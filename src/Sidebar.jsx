import React from 'react';
import './Sidebar.css';

/**
 * Sidebar Component
 * 
 * Displays a list of all vehicles in the fleet
 * - Shows vehicle name and GPS status
 * - Highlights currently selected vehicle
 * - Click to select a vehicle (triggers map update)
 * 
 * Props:
 * - vehicles: Array of vehicle objects with GPS data
 * - selectedVehicle: Currently selected vehicle object
 * - onSelectVehicle: Callback function when vehicle is clicked
 */
function Sidebar({ vehicles, selectedVehicle, onSelectVehicle }) {
  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <h1 className="sidebar-title">Fleet GPS</h1>
        <p className="sidebar-subtitle">Tracking Dashboard</p>
      </div>

      {/* Vehicle Count */}
      <div className="vehicle-count">
        <span>{vehicles.length} Vehicles</span>
        <span className="online-count">
          {vehicles.filter((v) => v.gpsStatus === 'Online').length} Online
        </span>
      </div>

      {/* Vehicle List */}
      <div className="vehicle-list">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.vehicle_id}
            className={`vehicle-item ${
              selectedVehicle?.vehicle_id === vehicle.vehicle_id ? 'selected' : ''
            }`}
            onClick={() => onSelectVehicle(vehicle.vehicle_id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onSelectVehicle(vehicle.vehicle_id);
              }
            }}
          >
            {/* Vehicle Icon and Status */}
            <div className="vehicle-icon-container">
              <div
                className={`status-indicator ${
                  vehicle.gpsStatus === 'Online' ? 'online' : 'offline'
                }`}
              />
              <span className="vehicle-icon">🚗</span>
            </div>

            {/* Vehicle Information */}
            <div className="vehicle-info">
              <h3 className="vehicle-name">{vehicle.vehicle_name}</h3>
              <p className="vehicle-id">{vehicle.vehicle_id}</p>
              <div className="vehicle-meta">
                <span
                  className={`status-badge ${
                    vehicle.gpsStatus === 'Online' ? 'online' : 'offline'
                  }`}
                >
                  ● {vehicle.gpsStatus}
                </span>
                <span className="last-update">
                  {Math.round((new Date() - vehicle.timestamp) / 1000)}s ago
                </span>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedVehicle?.vehicle_id === vehicle.vehicle_id && (
              <div className="selection-indicator">
                <span>▶</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <p className="footer-text">
          Real-time GPS tracking from ESP32 devices
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;

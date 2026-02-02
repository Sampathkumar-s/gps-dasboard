import React, { useEffect, useRef } from 'react';
import './MapView.css';

/**
 * MapView Component
 * 
 * Displays an interactive map using HTML Canvas with OpenStreetMap-style rendering
 * - Centers on selected vehicle
 * - Shows marker for selected vehicle
 * - Displays all vehicles as small dots
 * - Supports zoom and pan functionality
 * 
 * Props:
 * - selectedVehicle: Currently selected vehicle object
 * - vehicles: Array of all vehicles
 */
function MapView({ selectedVehicle, vehicles }) {
  const canvasRef = useRef(null);
  const mapStateRef = useRef({
    centerLat: 51.5074,
    centerLon: -0.1278,
    zoom: 13,
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  /**
   * Convert latitude/longitude to canvas pixel coordinates
   * Uses Web Mercator projection approximation
   */
  const latlonToPixel = (lat, lon, centerLat, centerLon, width, height, zoom) => {
    const scale = Math.pow(2, zoom) * 256 / (2 * Math.PI);

    // Convert to mercator
    const x = (lon - centerLon) * scale;
    const y =
      (Math.log(Math.tan(Math.PI / 4 + (centerLat * Math.PI) / 180 / 2)) -
        Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 180 / 2))) *
      scale;

    return {
      x: width / 2 + x,
      y: height / 2 - y,
    };
  };

  /**
   * Draw the map and all vehicles
   */
  const drawMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { centerLat, centerLon, zoom } = mapStateRef.current;
    const { width, height } = canvas;

    // Clear canvas with light background
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#d0e0e8';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw all vehicles as small circles
    vehicles.forEach((vehicle) => {
      const { x, y } = latlonToPixel(
        vehicle.latitude,
        vehicle.longitude,
        centerLat,
        centerLon,
        width,
        height,
        zoom
      );

      // Draw vehicle marker
      ctx.fillStyle =
        vehicle.gpsStatus === 'Online'
          ? vehicle === selectedVehicle
            ? '#ff6b35'
            : '#4ecdc4'
          : '#cccccc';
      ctx.beginPath();
      ctx.arc(
        x,
        y,
        vehicle === selectedVehicle ? 12 : 6,
        0,
        2 * Math.PI
      );
      ctx.fill();

      // Draw GPS status indicator
      if (vehicle.gpsStatus === 'Online') {
        ctx.strokeStyle = vehicle === selectedVehicle ? '#ffa500' : '#4ecdc4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(
          x,
          y,
          vehicle === selectedVehicle ? 18 : 10,
          0,
          2 * Math.PI
        );
        ctx.stroke();
      }
    });

    // Draw selected vehicle info
    if (selectedVehicle) {
      const { x, y } = latlonToPixel(
        selectedVehicle.latitude,
        selectedVehicle.longitude,
        centerLat,
        centerLon,
        width,
        height,
        zoom
      );

      // Draw label background
      const label = selectedVehicle.vehicle_name;
      ctx.font = 'bold 12px Arial';
      const metrics = ctx.measureText(label);
      const labelWidth = metrics.width + 10;
      const labelHeight = 20;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(x - labelWidth / 2, y - 35, labelWidth, labelHeight);

      // Draw label text
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x, y - 25);
    }

    // Draw zoom level and coordinates info
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Zoom: ${zoom}`, 10, 20);
    ctx.fillText(`Center: ${centerLat.toFixed(4)}, ${centerLon.toFixed(4)}`, 10, 35);
  };

  /**
   * Handle canvas mouse events for panning
   */
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    mapStateRef.current.isDragging = true;
    mapStateRef.current.startX = e.clientX - rect.left;
    mapStateRef.current.startY = e.clientY - rect.top;
  };

  const handleMouseMove = (e) => {
    if (!mapStateRef.current.isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    const deltaX = currentX - mapStateRef.current.startX;
    const deltaY = currentY - mapStateRef.current.startY;

    // Convert pixel movement to lat/lon change
    const scale = Math.pow(2, mapStateRef.current.zoom) * 256 / (2 * Math.PI);
    const latDelta = (-deltaY / scale) * (180 / Math.PI);
    const lonDelta = (-deltaX / scale) * (1 / Math.cos((mapStateRef.current.centerLat * Math.PI) / 180));

    mapStateRef.current.centerLat += latDelta;
    mapStateRef.current.centerLon += lonDelta;

    mapStateRef.current.startX = currentX;
    mapStateRef.current.startY = currentY;

    drawMap();
  };

  const handleMouseUp = () => {
    mapStateRef.current.isDragging = false;
  };

  /**
   * Handle mouse wheel for zooming
   */
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -1 : 1;
    mapStateRef.current.zoom = Math.max(
      5,
      Math.min(18, mapStateRef.current.zoom + zoomDelta)
    );
    drawMap();
  };

  /**
   * Update map center when selected vehicle changes
   */
  useEffect(() => {
    if (selectedVehicle) {
      mapStateRef.current.centerLat = selectedVehicle.latitude;
      mapStateRef.current.centerLon = selectedVehicle.longitude;
      drawMap();
    }
  }, [selectedVehicle]);

  /**
   * Redraw map when vehicles update
   */
  useEffect(() => {
    drawMap();
  }, [vehicles]);

  /**
   * Set up canvas and event listeners
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    drawMap();

    // Add event listeners
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div className="map-view">
      <canvas
        ref={canvasRef}
        className="map-canvas"
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* Map Controls */}
      <div className="map-controls">
        <button
          className="control-button zoom-in"
          onClick={() => {
            mapStateRef.current.zoom = Math.min(18, mapStateRef.current.zoom + 1);
            drawMap();
          }}
        >
          +
        </button>
        <button
          className="control-button zoom-out"
          onClick={() => {
            mapStateRef.current.zoom = Math.max(5, mapStateRef.current.zoom - 1);
            drawMap();
          }}
        >
          −
        </button>
      </div>

      {/* Map Legend */}
      <div className="map-legend">
        <div className="legend-item">
          <span className="legend-marker selected">●</span>
          <span>Selected Vehicle</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker online">●</span>
          <span>Online Vehicle</span>
        </div>
        <div className="legend-item">
          <span className="legend-marker offline">●</span>
          <span>Offline Vehicle</span>
        </div>
      </div>
    </div>
  );
}

export default MapView;

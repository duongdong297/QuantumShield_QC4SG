import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const hotspots = [
  { id: 1, name: "District 3 - Urban", risk: 88, color: "#ef4444", coords: [21.0000, 105.8200] as [number, number] },
  { id: 2, name: "District 1 - Central", risk: 65, color: "#f97316", coords: [21.0285, 105.8542] as [number, number] },
  { id: 3, name: "District 5 - Suburb", risk: 42, color: "#eab308", coords: [21.0500, 105.8800] as [number, number] }
];

const RiskMap: React.FC = () => {
  return (
    <div style={{
      height: '400px',
      width: '100%',
      borderRadius: '12px',
      zIndex: 0,
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <MapContainer 
        center={[21.0285, 105.8542]} 
        zoom={12} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {hotspots.map(spot => (
          <CircleMarker
            key={spot.id}
            center={spot.coords}
            pathOptions={{ fillColor: spot.color, color: spot.color, fillOpacity: 0.6 }}
            radius={spot.risk / 3}
          >
            <Popup>
              <strong>{spot.name}</strong><br/>
              Risk Level: {spot.risk}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RiskMap;

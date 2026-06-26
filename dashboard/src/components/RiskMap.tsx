import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface HotspotProps {
  id: number;
  name: string;
  risk: number;
  color: string;
  coords: [number, number];
}

interface RiskMapProps {
  data: HotspotProps[];
}

const RiskMap: React.FC<RiskMapProps> = ({ data }) => {
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
        {(data || []).map(spot => (
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

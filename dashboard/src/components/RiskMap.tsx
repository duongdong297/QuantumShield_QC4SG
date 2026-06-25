import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface Hotspot {
  lat: number;
  lng: number;
  region: string;
  riskScore: number;
}

const RiskMap: React.FC = () => {
  const [hotspots, setHotspots] = useState<any[]>([]);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/hotspots');
        const data: Hotspot[] = await response.json();
        
        const mappedData = data.map((item, index) => {
          let color = "#eab308"; // Vàng cho trường hợp còn lại
          if (item.riskScore > 80) color = "#ef4444"; // Đỏ
          else if (item.riskScore > 60) color = "#f97316"; // Cam

          return {
            id: index + 1,
            name: item.region,
            risk: item.riskScore,
            color: color,
            coords: [item.lat, item.lng] as [number, number]
          };
        });
        
        setHotspots(mappedData);
      } catch (error) {
        console.error("Error fetching hotspots:", error);
      }
    };
    fetchHotspots();
  }, []);

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

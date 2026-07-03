import React, { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
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
  onProvinceClick: (provinceName: string) => void;
}

// Component để set zoom và fit bounds sau khi GeoJSON load
const FitToBounds: React.FC<{ geoData: any }> = ({ geoData }) => {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (geoData && !fitted.current) {
      try {
        const layer = L.geoJSON(geoData);
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30] });
          fitted.current = true;
        }
      } catch (e) {
        console.warn("Could not fit bounds:", e);
      }
    }
  }, [geoData, map]);

  return null;
};

const RiskMap: React.FC<RiskMapProps> = ({ data, onProvinceClick }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Tải dữ liệu ranh giới địa lý (GeoJSON) của Việt Nam
  useEffect(() => {
    fetch('/vietnam.json')
      .then(res => {
        if (!res.ok) throw new Error('Cannot fetch vietnam.json');
        return res.json();
      })
      .then(json => {
        console.log("GeoJSON Data Loaded Successfully:", json);
        setGeoData(json);
      })
      .catch(err => console.error('Error loading GeoJSON:', err));
  }, []);

  // Hàm tô màu tùy chỉnh cho từng tỉnh dựa trên hotspots và hover
  const styleProvince = (feature: any) => {
    const provName = feature.properties?.Name || feature.properties?.name || '';
    
    const isHotspot = (data || []).some(spot => 
      spot.name.toLowerCase().includes(provName.toLowerCase()) || 
      provName.toLowerCase().includes(spot.name.toLowerCase())
    );

    const isHovered = hoveredProvince?.toLowerCase() === provName.toLowerCase();

    if (isHovered) {
      return {
        fillColor: '#3b82f6',
        weight: 3,
        opacity: 1,
        color: '#1e40af',
        fillOpacity: 0.6
      };
    }

    return {
      fillColor: isHotspot ? '#ef4444' : '#cbd5e1',
      weight: isHovered ? 3 : 1.5,
      opacity: 1,
      color: '#ffffff',
      fillOpacity: isHotspot ? 0.7 : 0.4
    };
  };

  // Hàm gắn sự kiện và Tooltip cho từng tỉnh
  const onEachProvince = (feature: any, layer: any) => {
    const provName = feature.properties?.Name || feature.properties?.name || 'Unknown Province';

    // Thêm Tooltip dính theo con trỏ chuột
    layer.bindTooltip(`
      <div style="font-family: Inter, sans-serif; text-align: center; min-width: 140px;">
        <strong style="font-size: 1.05rem; color: #1e293b; display: block;">${provName}</strong>
        <span style="font-size: 0.8rem; color: #3b82f6; display: block; margin-top: 4px;">
          🖱️ Click to view weather & analytics
        </span>
      </div>
    `, { sticky: true });

    // Highlight on hover
    layer.on('mouseover', () => {
      setHoveredProvince(provName);
      layer.setStyle({
        fillColor: '#3b82f6',
        weight: 3,
        color: '#1e40af',
        fillOpacity: 0.6
      });
      layer.bringToFront();
    });

    layer.on('mouseout', () => {
      setHoveredProvince(null);
      // Reset style - reapply the base style
      geoJsonLayerRef.current?.resetStyle(layer);
    });

    // Bắt sự kiện Click để mở AI Analytics Drawer
    layer.on('click', () => {
      onProvinceClick(provName);
    });
  };

  const onEachFeatureRef = useCallback((feature: any, layer: any) => {
    onEachProvince(feature, layer);
  }, [data, onProvinceClick, hoveredProvince]);

  // Reset hovered when data changes
  useEffect(() => {
    setHoveredProvince(null);
  }, [data]);

  return (
    <div style={{
      height: '400px',
      width: '100%',
      borderRadius: '12px',
      zIndex: 0,
      overflow: 'hidden',
      border: '1px solid rgba(255, 255, 255, 0.6)',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)',
      position: 'relative'
    }}>
      <MapContainer 
        center={[16.0, 106.0]}
        zoom={5.5}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {geoData && <FitToBounds geoData={geoData} />}
        
        {/* Render Lớp GeoJSON khi dữ liệu đã tải xong */}
        {geoData && (
          <GeoJSON 
            key={JSON.stringify(data)} 
            data={geoData} 
            style={styleProvince} 
            onEachFeature={onEachFeatureRef}
            ref={geoJsonLayerRef as any}
          />
        )}

        {/* Render Lớp CircleMarker hiển thị chính xác tâm dịch đè lên GeoJSON */}
        {(data || []).map(spot => {
          if (!spot.coords || spot.coords.length < 2 || spot.coords[0] === 0) return null;
          
          const riskColor = spot.risk > 80 ? '#ef4444' : spot.risk > 60 ? '#f97316' : '#eab308';
          
          return (
            <CircleMarker
              key={`marker-${spot.id}`}
              center={spot.coords}
              pathOptions={{ color: riskColor, fillColor: riskColor, fillOpacity: 0.8, weight: 2 }}
              radius={Math.max(8, Math.min(20, spot.risk / 5))}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                <div style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>🚨 {spot.name}</div>
                  <div style={{ color: riskColor, fontWeight: 700, fontSize: '0.85rem', marginTop: '2px' }}>
                    Risk Score: {spot.risk}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
      
      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: '12px',
        left: '12px',
        backgroundColor: 'rgba(255,255,255,0.95)',
        padding: '8px 12px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        fontSize: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ fontWeight: 600, color: '#475569', marginBottom: '2px', fontSize: '0.8rem' }}>Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ color: '#334155' }}>High Risk (>80)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#f97316', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ color: '#334155' }}>Medium Risk (60-80)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '12px', height: '12px', backgroundColor: '#eab308', borderRadius: '50%', display: 'inline-block' }}></span>
          <span style={{ color: '#334155' }}>{'Low Risk (<60)'}</span>
        </div>
      </div>
    </div>
  );
};

export default RiskMap;

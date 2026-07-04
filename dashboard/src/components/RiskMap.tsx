import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet';
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
  height?: string;
}

const RiskMap: React.FC<RiskMapProps> = ({ data, onProvinceClick, height = '400px' }) => {
  const [geoData, setGeoData] = useState<any>(null);

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

  // Hàm tô màu tùy chỉnh cho từng tỉnh
  const styleProvince = (feature: any) => {
    const provName = feature.properties?.Name || feature.properties?.name || '';
    
    // Kiểm tra xem tỉnh này có đang nằm trong danh sách điểm nóng (hotspots) không.
    const isHotspot = (data || []).some(spot => 
      spot.name.toLowerCase().includes(provName.toLowerCase()) || 
      provName.toLowerCase().includes(spot.name.toLowerCase())
    );

    return {
      fillColor: isHotspot ? '#ef4444' : '#cbd5e1', // Light theme standard: red for hotspots, light slate for others
      weight: 1.5,
      opacity: 1,
      color: '#ffffff', // Clean white borders
      fillOpacity: isHotspot ? 0.7 : 0.4
    };
  };

  // Hàm gắn sự kiện và Tooltip cho từng tỉnh
  const onEachProvince = (feature: any, layer: any) => {
    const provName = feature.properties?.Name || feature.properties?.name || 'Unknown Province';
    
    // Tìm kiếm thông tin risk score từ dữ liệu
    const hotspotInfo = (data || []).find(spot => 
      spot.name.toLowerCase().includes(provName.toLowerCase()) || 
      provName.toLowerCase().includes(spot.name.toLowerCase())
    );

    const riskScore = hotspotInfo ? hotspotInfo.risk : 0;
    const color = hotspotInfo ? hotspotInfo.color : '#64748b';
    const status = riskScore > 80 ? 'CRITICAL' : riskScore > 60 ? 'WARNING' : 'SAFE';

    // Thêm Tooltip dính theo con trỏ chuột với dữ liệu động
    layer.bindTooltip(`
      <div style="font-family: Inter, sans-serif; text-align: left; padding: 4px;">
        <strong style="font-size: 1.1rem; color: #1e293b; display: block; margin-bottom: 4px;">${provName}</strong>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 2px;">
           <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">Risk Score:</span>
           <span style="font-size: 0.9rem; color: ${color}; font-weight: 800;">${riskScore.toFixed(1)}/100</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px;">
           <span style="font-size: 0.8rem; color: #64748b; font-weight: 600;">Status:</span>
           <span style="font-size: 0.75rem; color: #fff; background: ${color}; padding: 2px 6px; border-radius: 4px; font-weight: 700;">${status}</span>
        </div>
        <div style="margin-top: 8px; font-size: 0.75rem; color: #5e72e4; font-weight: 700; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 6px;">
          (Click for AI Analysis)
        </div>
      </div>
    `, { sticky: true, opacity: 0.95 });

    // Bắt sự kiện Click để mở AI Analytics Drawer
    layer.on('click', () => {
      onProvinceClick(provName);
    });
  };

  return (
    <div style={{
      height: height,
      width: '100%',
      borderRadius: '12px',
      zIndex: 0,
      overflow: 'hidden',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <MapContainer 
        center={[16.0, 106.0]} // Tâm giữa Việt Nam
        zoom={5.5} // Zoom Level nhìn được toàn quốc
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Render Lớp GeoJSON khi dữ liệu đã tải xong */}
        {geoData && (
          <GeoJSON 
            key={JSON.stringify(data)} 
            data={geoData} 
            style={styleProvince} 
            onEachFeature={onEachProvince} 
          />
        )}

        {/* Render Lớp CircleMarker hiển thị chính xác tâm dịch đè lên GeoJSON */}
        {(data || []).map(spot => {
          // Bỏ qua nếu tọa độ không hợp lệ
          if (!spot.coords || spot.coords.length < 2 || spot.coords[0] === 0) return null;
          
          return (
            <CircleMarker
              key={`marker-${spot.id}`}
              center={spot.coords}
              pathOptions={{ color: 'red', fillColor: '#ef4444', fillOpacity: 0.8, weight: 2 }}
              radius={12}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                <div style={{ fontFamily: 'Inter, sans-serif', textAlign: 'center', minWidth: '100px' }}>
                  <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '0.95rem' }}>🚨 {spot.name}</div>
                  <div style={{ color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', marginTop: '2px' }}>
                    Risk Score: {spot.risk}
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default RiskMap;

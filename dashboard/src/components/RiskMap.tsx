import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import toast from 'react-hot-toast';
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
      fillColor: isHotspot ? '#ef4444' : '#cbd5e1',
      weight: 1.5,
      opacity: 1,
      color: '#ffffff', // Viền trắng phân cách các tỉnh
      fillOpacity: isHotspot ? 0.7 : 0.4
    };
  };

  // Hàm gắn sự kiện và Tooltip cho từng tỉnh
  const onEachProvince = (feature: any, layer: any) => {
    const provName = feature.properties?.Name || feature.properties?.name || 'Unknown Province';

    // Thêm Tooltip dính theo con trỏ chuột
    layer.bindTooltip(`
      <div style="font-family: Inter, sans-serif; text-align: center;">
        <strong style="font-size: 1.05rem; color: #1e293b;">${provName}</strong><br/>
        <span style="font-size: 0.85rem; color: #64748b;">Click to analyze</span>
      </div>
    `, { sticky: true });

    // Bắt sự kiện Click để tạo tương tác với người dùng
    layer.on('click', () => {
      toast(`Fetching prediction data for ${provName}...`, {
        icon: '📡',
        style: {
          borderRadius: '10px',
          background: '#1e293b',
          color: '#fff',
        },
      });
    });
  };

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
        center={[16.0, 106.0]} // Tâm giữa Việt Nam
        zoom={5.5} // Zoom Level nhìn được toàn quốc
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">Carto</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Render Lớp GeoJSON khi dữ liệu đã tải xong. 
            Cực kỳ quan trọng: Dùng JSON.stringify(data) làm key để ép react-leaflet 
            phải re-render và tô lại màu mỗi khi danh sách điểm dịch (data) thay đổi. */}
        {geoData && (
          <GeoJSON 
            key={JSON.stringify(data)} 
            data={geoData} 
            style={styleProvince} 
            onEachFeature={onEachProvince} 
          />
        )}
      </MapContainer>
    </div>
  );
};

export default RiskMap;

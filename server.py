"""
QuantumShield Server - All-in-one Python server
Run: python server.py
Then open: http://localhost:8080
"""

import json
import csv
import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path
import io

PORT = 8080
BASE_DIR = Path(__file__).parent

def load_weather_data():
    data = {}
    filepath = BASE_DIR / "data" / "processed" / "weather_clean.csv"
    if not filepath.exists():
        print(f"WARNING: Weather file not found at {filepath}")
        return data
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            prov = row["province"].strip()
            if prov not in data:
                data[prov] = []
            data[prov].append({
                "year_month": row["year_month"].strip(),
                "temperature": float(row["temperature"]),
                "humidity": float(row["humidity"]),
                "rainfall": float(row["rainfall"]),
            })
    return data

def load_location_data():
    data = {}
    filepath = BASE_DIR / "raw_data" / "centroid.csv"
    if not filepath.exists():
        print(f"WARNING: Location file not found at {filepath}")
        return data
    with open(filepath, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            prov = row["province"].strip()
            data[prov] = {"lat": float(row["lat"]), "lon": float(row["lon"])}
    return data

def load_geo_json():
    filepath = BASE_DIR / "dashboard" / "public" / "vietnam.json"
    if not filepath.exists():
        print(f"WARNING: GeoJSON file not found at {filepath}")
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

WEATHER_DATA = load_weather_data()
LOCATION_DATA = load_location_data()
GEOJSON_DATA = load_geo_json()

print(f"Loaded {len(WEATHER_DATA)} provinces weather data")
print(f"Loaded {len(LOCATION_DATA)} provinces location data")
print(f"GeoJSON loaded: {GEOJSON_DATA is not None}")

# Read HTML from separate file
HTML_CONTENT = None

class QuantumShieldHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)
        
        if path == "/" or path == "/index.html":
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(HTML_CONTENT.encode("utf-8"))
            
        elif path == "/api/weather":
            self.handle_weather(params)
        elif path == "/api/location":
            self.handle_location(params)
        elif path == "/api/geojson":
            self.handle_geojson()
        elif path == "/api/provinces":
            self.handle_provinces()
        else:
            self.send_error(404, "Not found")
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    
    def send_error(self, code, message):
        self.send_json({"error": message}, code)
    
    def handle_weather(self, params):
        province = params.get("province", [None])[0]
        if not province:
            self.send_error(400, "Missing province parameter")
            return
        
        records = None
        matched_province = None
        for p, recs in WEATHER_DATA.items():
            if p.lower() == province.lower():
                records = recs
                matched_province = p
                break
        
        if not records:
            self.send_error(404, "Province '%s' not found" % province)
            return
        
        latest = max(records, key=lambda r: r["year_month"])
        self.send_json({
            "province": matched_province,
            "temperature": latest["temperature"],
            "humidity": latest["humidity"],
            "rainfall": latest["rainfall"],
        })
    
    def handle_location(self, params):
        province = params.get("province", [None])[0]
        if not province:
            self.send_error(400, "Missing province parameter")
            return
        
        for p, loc in LOCATION_DATA.items():
            if p.lower() == province.lower():
                self.send_json({
                    "province": p,
                    "lat": loc["lat"],
                    "lon": loc["lon"],
                })
                return
        
        self.send_error(404, "Province '%s' not found" % province)
    
    def handle_geojson(self):
        if GEOJSON_DATA:
            self.send_json(GEOJSON_DATA)
        else:
            self.send_error(500, "GeoJSON data not loaded")
    
    def handle_provinces(self):
        provinces = sorted(WEATHER_DATA.keys())
        self.send_json(provinces)
    
    def log_message(self, format, *args):
        print("[%s] %s %s %s" % (self.log_date_time_string(), args[0], args[1], args[2]))


# Use standalone HTML - do NOT load the React/Vite index.html which needs Node.js
HTML_CONTENT = """<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuantumShield - Ban do thoi tiet Viet Nam</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',sans-serif; background:#f0f4f8; color:#1e293b; }
        .header { background:linear-gradient(135deg,#1e293b,#3b82f6); color:white; padding:20px 30px; display:flex; justify-content:space-between; align-items:center; }
        .header h1 { font-size:1.5rem; }
        .header p { font-size:0.85rem; opacity:0.8; margin-top:4px; }
        .main { display:flex; gap:20px; padding:20px; max-width:1400px; margin:0 auto; flex-wrap:wrap; }
        .map-wrap { flex:1; min-width:300px; background:white; border-radius:16px; padding:20px; box-shadow:0 4px 20px rgba(0,0,0,0.06); }
        #map { height:500px; border-radius:12px; }
        .sidebar { width:380px; display:flex; flex-direction:column; gap:20px; }
        .card { background:white; border-radius:16px; padding:20px; box-shadow:0 4px 20px rgba(0,0,0,0.06); }
        .card h3 { margin-bottom:12px; font-size:1rem; }
        select { width:100%; padding:12px 16px; border:2px solid #e2e8f0; border-radius:10px; font-size:1rem; font-weight:600; background:#f8fafc; cursor:pointer; }
        .grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-top:10px; }
        .item { background:#f8fafc; border-radius:10px; padding:14px; text-align:center; border:1px solid #e2e8f0; }
        .item .icon { font-size:1.5rem; }
        .item .label { font-size:0.75rem; color:#64748b; }
        .item .value { font-size:1.2rem; font-weight:700; margin-top:2px; }
        .loading { color:#94a3b8; font-weight:400; }
        .error { color:#ef4444; font-weight:500; }
        .msg { padding:12px 16px; border-radius:10px; font-weight:500; display:none; margin-bottom:10px; }
        .msg.show { display:block; }
        .msg.loading { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
        .msg.ok { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
        .msg.fail { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
        .legend { display:flex; gap:15px; margin-top:10px; flex-wrap:wrap; font-size:0.8rem; }
        .dot { width:12px; height:12px; border-radius:50%; display:inline-block; }
        @media(max-width:768px){ .sidebar{width:100%;} }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>QuantumShield: Ban do thoi tiet Viet Nam</h1>
            <p>Click vao tinh tren ban do de xem thoi tiet</p>
        </div>
    </div>
    <div class="main">
        <div class="map-wrap">
            <h3>Ban do tuong tac Viet Nam</h3>
            <div id="map"></div>
            <div class="legend">
                <span><span class="dot" style="background:#cbd5e1;"></span> Tinh</span>
                <span><span class="dot" style="background:#3b82f6;"></span> Dang chon</span>
            </div>
        </div>
        <div class="sidebar">
            <div class="card">
                <h3>Chon tinh thanh</h3>
                <select id="sel"><option value="">-- Chon tinh --</option></select>
                <div id="msg" class="msg"></div>
            </div>
            <div class="card" id="weatherCard" style="display:none;">
                <h3>Thong tin thoi tiet</h3>
                <div id="provName" style="font-size:1.3rem;font-weight:800;margin-bottom:10px;"></div>
                <div class="grid">
                    <div class="item"><div class="icon">Nhiet do</div><div class="label">Nhiet do</div><div class="value" id="temp">--</div></div>
                    <div class="item"><div class="icon">Do am</div><div class="label">Do am</div><div class="value" id="hum">--</div></div>
                    <div class="item"><div class="icon">Luong mua</div><div class="label">Luong mua</div><div class="value" id="rain">--</div></div>
                    <div class="item"><div class="icon">Toa do</div><div class="label">Toa do</div><div class="value" id="coord">--</div></div>
                </div>
            </div>
            <div class="card">
                <h3>Huong dan</h3>
                <p>Click vao tinh tren ban do hoac chon tu danh sach de xem thoi tiet</p>
            </div>
        </div>
    </div>
    <script>
        var map = L.map('map').setView([16.0, 106.0], 5.5);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {maxZoom:19}).addTo(map);
        var geoLayer, selectedLayer, allProvs = [];
        fetch('/api/geojson').then(function(r){return r.json()}).then(function(g){
            geoLayer = L.geoJSON(g, {
                style: function(){return {fillColor:'#cbd5e1',weight:1.5,color:'#ffffff',fillOpacity:0.5}},
                onEachFeature: function(f,l){
                    var name = f.properties.name || 'Unknown';
                    allProvs.push(name);
                    l.bindTooltip('<b>'+name+'</b><br><span style="font-size:11px;color:#3b82f6;">Click</span>',{sticky:true});
                    l.on('mouseover', function(){if(selectedLayer!==l) l.setStyle({fillColor:'#93c5fd',fillOpacity:0.6,weight:2.5,color:'#3b82f6'});});
                    l.on('mouseout', function(){if(selectedLayer!==l) geoLayer.resetStyle(l);});
                    l.on('click', function(){selectProvince(name,l);});
                }
            }).addTo(map);
            var b = geoLayer.getBounds();
            if(b.isValid()) map.fitBounds(b,{padding:[30,30]});
            var sel = document.getElementById('sel');
            allProvs.sort().forEach(function(n){var o=document.createElement('option');o.value=n;o.textContent=n;sel.appendChild(o);});
        });
        function selectProvince(name, layer){
            if(selectedLayer){geoLayer.resetStyle(selectedLayer);}
            if(layer){selectedLayer=layer;layer.setStyle({fillColor:'#3b82f6',fillOpacity:0.6,weight:3,color:'#1e40af'});layer.bringToFront();}
            document.getElementById('sel').value=name;
            document.getElementById('weatherCard').style.display='block';
            document.getElementById('provName').textContent=name;
            document.getElementById('temp').textContent='Dang tai...';document.getElementById('temp').className='value loading';
            document.getElementById('hum').textContent='Dang tai...';document.getElementById('hum').className='value loading';
            document.getElementById('rain').textContent='Dang tai...';document.getElementById('rain').className='value loading';
            document.getElementById('coord').textContent='Dang tai...';document.getElementById('coord').className='value loading';
            var msg=document.getElementById('msg');msg.className='msg show loading';msg.textContent='Dang tai du lieu...';
            fetch('/api/weather?province='+encodeURIComponent(name)).then(function(r){if(!r.ok)throw Error('Khong co du lieu');return r.json()}).then(function(d){
                document.getElementById('temp').textContent=d.temperature.toFixed(1)+' C';document.getElementById('temp').className='value';
                document.getElementById('hum').textContent=d.humidity.toFixed(1)+'%';document.getElementById('hum').className='value';
                document.getElementById('rain').textContent=d.rainfall.toFixed(1)+' mm';document.getElementById('rain').className='value';
                msg.className='msg show ok';msg.textContent='Da tai du lieu!';
            }).catch(function(e){
                document.getElementById('temp').textContent='Khong co du lieu';document.getElementById('temp').className='value error';
                document.getElementById('hum').textContent='Khong co du lieu';document.getElementById('hum').className='value error';
                document.getElementById('rain').textContent='Khong co du lieu';document.getElementById('rain').className='value error';
                msg.className='msg show fail';msg.textContent=e.message;
            });
            fetch('/api/location?province='+encodeURIComponent(name)).then(function(r){if(!r.ok)throw Error('Khong co du lieu');return r.json()}).then(function(d){
                document.getElementById('coord').textContent=d.lat.toFixed(4)+', '+d.lon.toFixed(4);document.getElementById('coord').className='value';
            }).catch(function(e){
                document.getElementById('coord').textContent='Khong co du lieu';document.getElementById('coord').className='value error';
            });
        }
        document.getElementById('sel').addEventListener('change',function(){
            var name=this.value;
            if(!name){document.getElementById('weatherCard').style.display='none';document.getElementById('msg').className='msg';if(selectedLayer){geoLayer.resetStyle(selectedLayer);selectedLayer=null;}return;}
            var target=null;
            geoLayer.eachLayer(function(l){var n=l.feature.properties.name||'';if(n===name)target=l;});
            selectProvince(name,target);
        });
    </script>
</body>
</html>"""

if __name__ == "__main__":
    print("=" * 60)
    print("  QuantumShield Server - Ban do thoi tiet Viet Nam")
    print("=" * 60)
    print("\n  Server dang chay tai: http://localhost:%d" % PORT)
    print("  Mo trinh duyet va truy cap dia chi tren")
    print("\n  Cac API co san:")
    print("    - GET /api/weather?province=Ha Noi")
    print("    - GET /api/location?province=Ha Noi")
    print("    - GET /api/geojson")
    print("    - GET /api/provinces")
    print("\n  Nhan Ctrl+C de dung server")
    print("=" * 60)
    
    server = HTTPServer(("0.0.0.0", PORT), QuantumShieldHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server da dung. Tam biet!")
        server.server_close()
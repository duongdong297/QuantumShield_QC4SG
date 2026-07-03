"""
QuantumShield Server - All-in-one Python server
Run: python server.py
Then open: http://localhost:8080
Click tinh -> cap nhat data.json -> hien thi nguy co sot xuat huyet
"""

import json
import csv
import os
import sys
import random
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from pathlib import Path

PORT = 8080
BASE_DIR = Path(__file__).parent

# --- Data Loading ---

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

def load_dengue_data():
    """Load artifacts/data.json for dengue risk prediction"""
    filepath = BASE_DIR / "artifacts" / "data.json"
    if not filepath.exists():
        print(f"WARNING: Dengue data file not found at {filepath}")
        return None
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

def save_dengue_data(data):
    """Save updated dengue data back to data.json"""
    filepath = BASE_DIR / "artifacts" / "data.json"
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("  -> data.json updated!")

# Name mapping
PROVINCE_NAME_MAP = {
    "Ho Chi Minh": "TP Hồ Chí Minh",
    "Hanoi": "Hà Nội",
    "Da Nang": "Đà Nẵng",
    "Ha Noi": "Hà Nội",
    "Can Tho": "Cần Thơ",
    "Hai Phong": "Hải Phòng",
    "Hue": "Thừa Thiên Huế",
    "Da Lat": "Lâm Đồng",
    "Nha Trang": "Khánh Hòa",
    "Vung Tau": "Bà Rịa - Vũng Tàu",
}

WEATHER_DATA = load_weather_data()
LOCATION_DATA = load_location_data()
GEOJSON_DATA = load_geo_json()
DENGUE_DATA = load_dengue_data()

print(f"Loaded {len(WEATHER_DATA)} provinces weather data")
print(f"Loaded {len(LOCATION_DATA)} provinces location data")
print(f"GeoJSON loaded: {GEOJSON_DATA is not None}")
print(f"Dengue risk data loaded: {DENGUE_DATA is not None}")

def get_province_weather(province_name):
    """Get latest weather for a province"""
    for p, recs in WEATHER_DATA.items():
        if p.lower() == province_name.lower():
            latest = max(recs, key=lambda r: r["year_month"])
            return latest
    return None

def get_province_location(province_name):
    """Get location for a province"""
    for p, loc in LOCATION_DATA.items():
        if p.lower() == province_name.lower():
            return loc
    return None

def generate_dengue_prediction(province_name):
    """Generate dengue risk prediction data for a province based on weather"""
    weather = get_province_weather(province_name)
    loc = get_province_location(province_name)
    
    if not weather or not loc:
        return None
    
    # Calculate risk score based on weather conditions (dengue thrives in warm, humid, rainy)
    temp = weather["temperature"]
    hum = weather["humidity"]
    rain = weather["rainfall"]
    
    # Simple risk model: higher temp + humidity + rainfall = higher risk
    temp_score = min(100, max(0, (temp - 20) * 5))
    hum_score = min(100, max(0, (hum - 60) * 3))
    rain_score = min(100, max(0, rain * 3))
    
    risk_score = int(min(99, (temp_score * 0.35 + hum_score * 0.35 + rain_score * 0.30) + random.randint(-5, 5)))
    risk_score = max(10, min(99, risk_score))
    
    # Generate alert level
    if risk_score >= 80:
        alert_message = f"Dengue risk is Critical Risk based on forecasting models for {province_name}."
        alert_level = "Critical"
    elif risk_score >= 60:
        alert_message = f"Dengue risk is High Risk in {province_name}. Monitoring recommended."
        alert_level = "High"
    elif risk_score >= 30:
        alert_message = f"Dengue risk is Moderate in {province_name}. Stay vigilant."
        alert_level = "Moderate"
    else:
        alert_message = f"Dengue risk is Low in {province_name}. Conditions are favorable."
        alert_level = "Low"
    
    # Generate forecast based on risk
    beds = int(risk_score * 0.5 + random.randint(-5, 10))
    kits = int(risk_score * 8 + random.randint(-20, 30))
    staffTeams = max(1, int(risk_score * 0.05 + random.randint(0, 2)))
    
    prediction = {
        "prediction_month": weather["year_month"],
        "alert": {
            "active": risk_score >= 50,
            "region": province_name,
            "probability": risk_score,
            "message": alert_message
        },
        "forecast": {
            "beds": max(0, beds),
            "kits": max(0, kits),
            "staffTeams": max(1, staffTeams)
        },
        "hotspots": [
            {
                "lat": loc["lat"],
                "lng": loc["lon"],
                "region": province_name,
                "riskScore": risk_score
            }
        ]
    }
    
    return prediction

# --- HTTP Handler ---

class QuantumShieldHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        params = parse_qs(parsed.query)
        
        if path == "/" or path == "/index.html":
            self.send_html(HTML_CONTENT)
        elif path == "/api/weather":
            self.handle_weather(params)
        elif path == "/api/location":
            self.handle_location(params)
        elif path == "/api/geojson":
            self.handle_geojson()
        elif path == "/api/provinces":
            self.handle_provinces()
        elif path == "/api/dengue-risk":
            self.handle_dengue_risk()
        else:
            self.send_error(404, "Not found")
    
    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        if path == "/api/select-province":
            self.handle_select_province()
        else:
            self.send_error(404, "Not found")
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def send_html(self, html, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(html.encode("utf-8"))
    
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
    
    def handle_select_province(self):
        """POST endpoint: update data.json with prediction for selected province"""
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            self.send_error(400, "Missing request body")
            return
        
        body = self.rfile.read(content_length)
        try:
            req = json.loads(body.decode("utf-8"))
        except:
            self.send_error(400, "Invalid JSON")
            return
        
        province = req.get("province", "")
        if not province:
            self.send_error(400, "Missing province")
            return
        
        # Generate prediction for this province
        prediction = generate_dengue_prediction(province)
        if not prediction:
            self.send_error(404, "Province '%s' not found" % province)
            return
        
        # Save to data.json
        global DENGUE_DATA
        DENGUE_DATA = prediction
        save_dengue_data(prediction)
        
        self.send_json({
            "status": "ok",
            "province": province,
            "prediction": prediction
        })
    
    def handle_dengue_risk(self):
        """Return current dengue risk data"""
        if not DENGUE_DATA:
            self.send_json({"hotspots": [], "alert": None, "forecast": None, "prediction_month": None})
            return
        
        hotspots = DENGUE_DATA.get("hotspots", [])
        mapped_hotspots = []
        for h in hotspots:
            mapped_hotspots.append({
                "lat": h.get("lat", 0),
                "lng": h.get("lng", 0),
                "region": h.get("region", ""),
                "riskScore": h.get("riskScore", 0),
            })
        
        self.send_json({
            "prediction_month": DENGUE_DATA.get("prediction_month"),
            "alert": DENGUE_DATA.get("alert"),
            "forecast": DENGUE_DATA.get("forecast"),
            "hotspots": mapped_hotspots,
        })
    
    def handle_weather(self, params):
        province = params.get("province", [None])[0]
        if not province:
            self.send_error(400, "Missing province parameter")
            return
        
        weather = get_province_weather(province)
        if not weather:
            self.send_error(404, "Province '%s' not found" % province)
            return
        
        self.send_json({
            "province": province,
            "temperature": weather["temperature"],
            "humidity": weather["humidity"],
            "rainfall": weather["rainfall"],
        })
    
    def handle_location(self, params):
        province = params.get("province", [None])[0]
        if not province:
            self.send_error(400, "Missing province parameter")
            return
        
        loc = get_province_location(province)
        if not loc:
            self.send_error(404, "Province '%s' not found" % province)
            return
        
        self.send_json({
            "province": province,
            "lat": loc["lat"],
            "lon": loc["lon"],
        })
    
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


# --- Self-contained HTML Frontend ---
HTML_CONTENT = """<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>QuantumShield - Du bao sot xuat huyet Viet Nam</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',sans-serif; background:#f0f4f8; color:#1e293b; }
        .header { background:linear-gradient(135deg,#1e293b,#3b82f6); color:white; padding:20px 30px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
        .header h1 { font-size:1.4rem; }
        .header p { font-size:0.85rem; opacity:0.8; margin-top:4px; }
        .alert-banner { background:linear-gradient(135deg,#ef4444,#f97316); padding:12px 20px; border-radius:10px; margin-bottom:15px; color:white; display:none; }
        .alert-banner.show { display:flex; align-items:center; gap:10px; }
        .main { display:flex; gap:20px; padding:20px; max-width:1400px; margin:0 auto; flex-wrap:wrap; }
        .map-wrap { flex:1; min-width:300px; background:white; border-radius:16px; padding:20px; box-shadow:0 4px 20px rgba(0,0,0,0.06); }
        #map { height:500px; border-radius:12px; }
        .sidebar { width:400px; display:flex; flex-direction:column; gap:15px; }
        .card { background:white; border-radius:16px; padding:20px; box-shadow:0 4px 20px rgba(0,0,0,0.06); }
        .card h3 { margin-bottom:12px; font-size:1rem; display:flex; align-items:center; gap:6px; }
        select { width:100%; padding:12px 16px; border:2px solid #e2e8f0; border-radius:10px; font-size:1rem; font-weight:600; background:#f8fafc; cursor:pointer; }
        .grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:10px; }
        .item { background:#f8fafc; border-radius:10px; padding:12px; text-align:center; border:1px solid #e2e8f0; }
        .item .icon { font-size:1.3rem; }
        .item .label { font-size:0.75rem; color:#64748b; }
        .item .value { font-size:1.1rem; font-weight:700; margin-top:2px; }
        .risk-high { color:#ef4444; }
        .risk-mid { color:#f97316; }
        .risk-low { color:#eab308; }
        .risk-none { color:#22c55e; }
        .loading { color:#94a3b8; font-weight:400; }
        .error { color:#ef4444; font-weight:500; }
        .msg { padding:12px 16px; border-radius:10px; font-weight:500; display:none; margin-bottom:10px; }
        .msg.show { display:block; }
        .msg.loading { background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; }
        .msg.ok { background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; }
        .msg.fail { background:#fef2f2; color:#dc2626; border:1px solid #fecaca; }
        .legend { display:flex; gap:12px; margin-top:10px; flex-wrap:wrap; font-size:0.8rem; }
        .dot { width:12px; height:12px; border-radius:50%; display:inline-block; }
        .forecast-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f1f5f9; }
        .forecast-row:last-child { border:none; }
        .badge { font-size:0.7rem; font-weight:700; text-transform:uppercase; padding:2px 6px; border-radius:4px; }
        .badge.critical { background:#fef2f2; color:#dc2626; }
        .badge.warning { background:#fffbeb; color:#d97706; }
        .badge.active { background:#eff6ff; color:#2563eb; }
        .progress-bar { width:100%; background:#f1f5f9; border-radius:999px; height:6px; overflow:hidden; margin-top:4px; }
        .progress-fill { height:100%; border-radius:999px; }
        @media(max-width:768px){ .sidebar{width:100%;} }
    </style>
</head>
<body>
    <div class="header">
        <div>
            <h1>QuantumShield: Giam sat sot xuat huyet Viet Nam</h1>
            <p>Click tinh de cap nhat du bao & xem thoi tiet</p>
        </div>
    </div>
    <div class="main">
        <div class="map-wrap">
            <h3>Ban do nguy co theo tinh</h3>
            <div id="map"></div>
            <div class="legend">
                <span><span class="dot" style="background:#ef4444;"></span> Nguy co cao</span>
                <span><span class="dot" style="background:#f97316;"></span> Nguy co trung binh</span>
                <span><span class="dot" style="background:#eab308;"></span> Nguy co thap</span>
                <span><span class="dot" style="background:#cbd5e1;"></span> An toan</span>
            </div>
        </div>
        <div class="sidebar">
            <div id="alertBanner" class="alert-banner">
                <span style="font-size:1.5rem;">&#x1F6A8;</span>
                <div>
                    <div id="alertTitle" style="font-weight:700;"></div>
                    <div id="alertMsg" style="font-size:0.9rem;opacity:0.9;"></div>
                </div>
            </div>
            <div class="card">
                <h3>Chon tinh thanh</h3>
                <select id="sel"><option value="">-- Chon tinh --</option></select>
                <div id="msg" class="msg"></div>
            </div>
            <div class="card" id="riskCard" style="display:none;">
                <h3>Thong tin du bao</h3>
                <div id="provName" style="font-size:1.3rem;font-weight:800;margin-bottom:8px;"></div>
                <!-- CANH BAO LON -->
                <div id="riskBadge" style="font-size:1rem;font-weight:700;margin-bottom:10px;"></div>
                <div id="alertMessageBox" style="display:none;padding:16px;border-radius:12px;margin-bottom:12px;font-weight:600;font-size:1rem;text-align:center;">
                    <div id="alertMessageText"></div>
                    <div id="alertProbability" style="font-size:1.4rem;font-weight:800;margin-top:6px;"></div>
                </div>
                <div id="updateInfo" style="font-size:0.8rem;color:#64748b;margin-bottom:8px;"></div>
                <div class="grid">
                    <div class="item"><div class="icon">Nhiet do</div><div class="label">Nhiet do</div><div class="value" id="temp">--</div></div>
                    <div class="item"><div class="icon">Do am</div><div class="label">Do am</div><div class="value" id="hum">--</div></div>
                    <div class="item"><div class="icon">Luong mua</div><div class="label">Luong mua</div><div class="value" id="rain">--</div></div>
                    <div class="item"><div class="icon">Toa do</div><div class="label">Toa do</div><div class="value" id="coord">--</div></div>
                </div>
            </div>
            <div class="card" id="forecastCard">
                <h3>Du bao nhu cau y te</h3>
                <div id="forecastData"></div>
            </div>
        </div>
    </div>
    <script>
        var map = L.map('map').setView([16.0, 106.0], 5.5);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {maxZoom:19}).addTo(map);
        var geoLayer, selectedLayer, allProvs = [], hotspotData = {};
        var riskColors = {'high':'#ef4444','mid':'#f97316','low':'#eab308','none':'#cbd5e1'};

        function updateHotspotData(callback){
            fetch('/api/dengue-risk').then(function(r){return r.json()}).then(function(d){
                hotspotData = {};
                if(d.hotspots){
                    d.hotspots.forEach(function(h){
                        hotspotData[h.region] = h.riskScore;
                    });
                }
                // Update alert banner
                if(d.alert && d.alert.active){
                    var b=document.getElementById('alertBanner');b.className='alert-banner show';
                    document.getElementById('alertTitle').textContent=d.alert.region+' - Nguy co: '+d.alert.probability+'%';
                    document.getElementById('alertMsg').textContent=d.alert.message;
                    // Show big alert message box
                    var amb=document.getElementById('alertMessageBox');
                    amb.style.display='block';
                    var prob=d.alert.probability;
                    if(prob>=80){amb.style.background='#fef2f2';amb.style.border='2px solid #ef4444';amb.style.color='#dc2626';}
                    else if(prob>=60){amb.style.background='#fffbeb';amb.style.border='2px solid #f97316';amb.style.color='#d97706';}
                    else if(prob>=30){amb.style.background='#fffbeb';amb.style.border='2px solid #eab308';amb.style.color='#a16207';}
                    else {amb.style.background='#f0fdf4';amb.style.border='2px solid #22c55e';amb.style.color='#16a34a';}
                    document.getElementById('alertMessageText').textContent = d.alert.message;
                    document.getElementById('alertProbability').textContent = 'Nguy co: '+prob+'% - '+d.alert.region;
                } else {
                    document.getElementById('alertBanner').className='alert-banner';
                    document.getElementById('alertMessageBox').style.display='none';
                }
                // Update forecast
                if(d.forecast){
                    var f=d.forecast;
                    var html='<div class="forecast-row"><span>Giuong benh</span><span><strong>'+f.beds+'</strong> <span class="badge critical">Critical</span></span></div><div class="progress-bar"><div class="progress-fill" style="width:85%;background:#ef4444;"></div></div>';
                    html+='<div class="forecast-row"><span>Bo test</span><span><strong>'+f.kits+'</strong> <span class="badge warning">Warning</span></span></div><div class="progress-bar"><div class="progress-fill" style="width:65%;background:#eab308;"></div></div>';
                    html+='<div class="forecast-row"><span>Nhan vien y te</span><span><strong>'+f.staffTeams+'</strong> <span class="badge active">Active</span></span></div><div class="progress-bar"><div class="progress-fill" style="width:40%;background:#3b82f6;"></div></div>';
                    document.getElementById('forecastData').innerHTML=html;
                }
                // Update map colors
                if(geoLayer){
                    geoLayer.eachLayer(function(l){
                        var name = l.feature.properties.name || '';
                        var risk = hotspotData[name];
                        var color = riskColors.none;
                        if(risk >= 80) color = riskColors.high;
                        else if(risk >= 60) color = riskColors.mid;
                        else if(risk >= 30) color = riskColors.low;
                        l.setStyle({fillColor:color,fillOpacity:risk?0.7:0.4});
                        var riskLabel = risk ? ('<br>Nguy co sot xuat huyet: '+risk+'%') : '';
                        l.unbindTooltip();
                        l.bindTooltip('<b>'+name+'</b>'+riskLabel+'<br><span style="font-size:11px;color:#3b82f6;">Click de xem chi tiet</span>',{sticky:true});
                    });
                }
                if(callback) callback();
            });
        }

        // Load initial data
        updateHotspotData();

        // Load GeoJSON
        fetch('/api/geojson').then(function(r){return r.json()}).then(function(g){
            geoLayer = L.geoJSON(g, {
                style: function(f){
                    var name = f.properties.name || '';
                    var risk = hotspotData[name];
                    var color = riskColors.none;
                    if(risk >= 80) color = riskColors.high;
                    else if(risk >= 60) color = riskColors.mid;
                    else if(risk >= 30) color = riskColors.low;
                    return {fillColor:color,weight:1.5,color:'#ffffff',fillOpacity:risk?0.7:0.4};
                },
                onEachFeature: function(f,l){
                    var name = f.properties.name || 'Unknown';
                    allProvs.push(name);
                    var risk = hotspotData[name];
                    var riskLabel = risk ? ('<br>Nguy co: '+risk+'%') : '';
                    l.bindTooltip('<b>'+name+'</b>'+riskLabel+'<br><span style="font-size:11px;color:#3b82f6;">Click de xem</span>',{sticky:true});
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

        function getRiskInfo(score){
            if(score >= 80) return {text:'Nguy co RAT CAO - Can canh giac!',cls:'risk-high',bg:'#fef2f2',border:'#fecaca'};
            if(score >= 60) return {text:'Nguy co CAO',cls:'risk-mid',bg:'#fffbeb',border:'#fed7aa'};
            if(score >= 30) return {text:'Nguy co TRUNG BINH',cls:'risk-low',bg:'#fffbeb',border:'#fde68a'};
            return {text:'An toan',cls:'risk-none',bg:'#f0fdf4',border:'#bbf7d0'};
        }

        function selectProvince(name, layer){
            if(selectedLayer){geoLayer.resetStyle(selectedLayer);}
            if(layer){selectedLayer=layer;layer.setStyle({fillColor:'#3b82f6',fillOpacity:0.6,weight:3,color:'#1e40af'});layer.bringToFront();}
            document.getElementById('sel').value=name;
            var card=document.getElementById('riskCard');card.style.display='block';
            document.getElementById('provName').textContent=name;
            document.getElementById('updateInfo').textContent='Dang cap nhat du bao cho tinh nay...';
            document.getElementById('riskBadge').innerHTML = '<span style="background:#eff6ff;border:1px solid #bfdbfe;padding:8px 12px;border-radius:8px;display:block;text-align:center;color:#1d4ed8;">Dang du bao...</span>';
            document.getElementById('temp').textContent='Dang tai...';document.getElementById('temp').className='value loading';
            document.getElementById('hum').textContent='Dang tai...';document.getElementById('hum').className='value loading';
            document.getElementById('rain').textContent='Dang tai...';document.getElementById('rain').className='value loading';
            document.getElementById('coord').textContent='Dang tai...';document.getElementById('coord').className='value loading';
            var msg=document.getElementById('msg');msg.className='msg show loading';msg.textContent='Dang cap nhat du bao cho '+name+'...';

            // STEP 1: POST to update data.json with new province
            fetch('/api/select-province', {
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({province:name})
            }).then(function(r){return r.json()}).then(function(resp){
                // STEP 2: Refresh map + sidebar with new data
                updateHotspotData(function(){
                    // Update risk badge
                    var risk = hotspotData[name];
                    var ri = getRiskInfo(risk);
                    document.getElementById('riskBadge').innerHTML = '<span style="background:'+ri.bg+';border:1px solid '+ri.border+';padding:8px 12px;border-radius:8px;display:block;text-align:center;" class="'+ri.cls+'">'+ri.text+'</span>';
                    document.getElementById('updateInfo').textContent = 'Cap nhat: '+resp.prediction.prediction_month;
                    msg.className='msg show ok';msg.textContent='Da cap nhat du bao!';
                });
            }).catch(function(e){
                msg.className='msg show fail';msg.textContent='Loi cap nhat du bao';
            });

            // STEP 3: Get weather + location
            fetch('/api/weather?province='+encodeURIComponent(name)).then(function(r){if(!r.ok)throw Error('Khong co du lieu');return r.json()}).then(function(d){
                document.getElementById('temp').textContent=d.temperature.toFixed(1)+' C';document.getElementById('temp').className='value';
                document.getElementById('hum').textContent=d.humidity.toFixed(1)+'%';document.getElementById('hum').className='value';
                document.getElementById('rain').textContent=d.rainfall.toFixed(1)+' mm';document.getElementById('rain').className='value';
            }).catch(function(e){
                document.getElementById('temp').textContent='Khong co du lieu';document.getElementById('temp').className='value error';
                document.getElementById('hum').textContent='Khong co du lieu';document.getElementById('hum').className='value error';
                document.getElementById('rain').textContent='Khong co du lieu';document.getElementById('rain').className='value error';
            });
            fetch('/api/location?province='+encodeURIComponent(name)).then(function(r){if(!r.ok)throw Error('Khong co du lieu');return r.json()}).then(function(d){
                document.getElementById('coord').textContent=d.lat.toFixed(4)+', '+d.lon.toFixed(4);document.getElementById('coord').className='value';
            }).catch(function(e){
                document.getElementById('coord').textContent='Khong co du lieu';document.getElementById('coord').className='value error';
            });
        }
        document.getElementById('sel').addEventListener('change',function(){
            var name=this.value;
            if(!name){document.getElementById('riskCard').style.display='none';document.getElementById('msg').className='msg';if(selectedLayer){geoLayer.resetStyle(selectedLayer);selectedLayer=null;}return;}
            var target=null;
            geoLayer.eachLayer(function(l){var n=l.feature.properties.name||'';if(n===name)target=l;});
            selectProvince(name,target);
        });
    </script>
</body>
</html>"""

if __name__ == "__main__":
    print("=" * 60)
    print("  QuantumShield - Giam sat sot xuat huyet Viet Nam")
    print("=" * 60)
    print("\n  Server dang chay tai: http://localhost:%d" % PORT)
    print("  Mo trinh duyet va truy cap dia chi tren")
    print("\n  Cac API co san:")
    print("    - GET /api/weather?province=Ha Noi")
    print("    - GET /api/location?province=Ha Noi")
    print("    - GET /api/dengue-risk")
    print("    - GET /api/geojson")
    print("    - GET /api/provinces")
    print("    - POST /api/select-province {\"province\":\"...\"}")
    print("\n  Nhan Ctrl+C de dung server")
    print("=" * 60)
    
    server = HTTPServer(("0.0.0.0", PORT), QuantumShieldHandler)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Server da dung. Tam biet!")
        server.server_close()
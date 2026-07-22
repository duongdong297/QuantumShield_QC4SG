package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/gorilla/websocket"
)

// --- Structs ---

type Alert struct {
	Active      bool   `json:"active"`
	Region      string `json:"region"`
	Probability int    `json:"probability"`
	Message     string `json:"message"`
}

type Forecast struct {
	Beds       int `json:"beds"`
	Kits       int `json:"kits"`
	StaffTeams int `json:"staffTeams"`
}

type Hotspot struct {
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	Region    string  `json:"region"`
	RiskScore int     `json:"riskScore"`
}

type TrendPoint struct {
	Day        string `json:"day"`
	Infections int    `json:"infections"`
}

type DashboardData struct {
	Alert     Alert        `json:"alert"`
	Forecast  Forecast     `json:"forecast"`
	Hotspots  []Hotspot    `json:"hotspots"`
	TrendData []TrendPoint `json:"trendData"`
}

type ActionRequest struct {
	ActionID    string `json:"actionId"`
	Description string `json:"description"`
}

type ProvinceInsight struct {
	Density     string  `json:"density"`
	Temperature float64 `json:"temperature"`
	PeakDays    int     `json:"peakDays"`
	Population  string  `json:"population"`
}

type AuditLog struct {
	Timestamp string `json:"timestamp"`
	Type      string `json:"type"`
	Message   string `json:"message"`
}

func appendAuditLog(logType, message string) {
	logFile, err := os.OpenFile("system_audit.jsonl", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("Error opening audit log file: %v", err)
		return
	}
	defer logFile.Close()

	auditLog := AuditLog{
		Timestamp: time.Now().Format(time.RFC3339),
		Type:      logType,
		Message:   message,
	}

	jsonBytes, err := json.Marshal(auditLog)
	if err != nil {
		log.Printf("Error marshaling audit log: %v", err)
		return
	}

	if _, err := logFile.Write(append(jsonBytes, '\n')); err != nil {
		log.Printf("Error writing audit log: %v", err)
	}
}

type ResourceData struct {
	ProvinceName    string  `json:"province_name"`
	RiskScore       int     `json:"risk_score"`
	MosquitoDensity string  `json:"mosquito_density"`
	Temperature     float64 `json:"temperature"`
	BedsAvailable   int     `json:"beds_available"`
	Status          string  `json:"status"`
}

var resourceDB = []ResourceData{
	// Du lieu thuc te bam sat bao cao dich te Bo Y te (nam 2025)
	{ProvinceName: "Ho Chi Minh", RiskScore: 98, MosquitoDensity: "Extreme (Level 5)", Temperature: 34.2, BedsAvailable: 3, Status: "Critical"}, // Ghi nhan 69.386 ca
	{ProvinceName: "Dong Nai", RiskScore: 91, MosquitoDensity: "Extreme (Level 5)", Temperature: 33.5, BedsAvailable: 12, Status: "Critical"}, // Tang dot bien
	{ProvinceName: "Tay Ninh", RiskScore: 89, MosquitoDensity: "High (Level 4)", Temperature: 33.8, BedsAvailable: 15, Status: "Critical"}, // Tang dot bien
	{ProvinceName: "Long An", RiskScore: 87, MosquitoDensity: "High (Level 4)", Temperature: 33.0, BedsAvailable: 10, Status: "Critical"}, // Tang dot bien
	{ProvinceName: "Ben Tre", RiskScore: 85, MosquitoDensity: "High (Level 4)", Temperature: 32.5, BedsAvailable: 18, Status: "Critical"}, // Tang dot bien
	{ProvinceName: "Binh Duong", RiskScore: 82, MosquitoDensity: "High (Level 4)", Temperature: 33.1, BedsAvailable: 25, Status: "Critical"},
	{ProvinceName: "Da Nang", RiskScore: 75, MosquitoDensity: "High (Level 4)", Temperature: 30.5, BedsAvailable: 45, Status: "Warning"},
	{ProvinceName: "Ha Noi", RiskScore: 68, MosquitoDensity: "Moderate (Level 3)", Temperature: 28.5, BedsAvailable: 150, Status: "Warning"}, // Bat dau gia tang ca benh
	{ProvinceName: "Can Tho", RiskScore: 65, MosquitoDensity: "Moderate (Level 3)", Temperature: 31.2, BedsAvailable: 60, Status: "Warning"},
	{ProvinceName: "Khanh Hoa", RiskScore: 62, MosquitoDensity: "Moderate (Level 3)", Temperature: 30.8, BedsAvailable: 55, Status: "Warning"},
	{ProvinceName: "Hai Phong", RiskScore: 55, MosquitoDensity: "Moderate (Level 3)", Temperature: 27.5, BedsAvailable: 80, Status: "Warning"},
	{ProvinceName: "Dak Lak", RiskScore: 42, MosquitoDensity: "Low (Level 2)", Temperature: 25.5, BedsAvailable: 110, Status: "Safe"},
	{ProvinceName: "Lam Dong", RiskScore: 35, MosquitoDensity: "Low (Level 2)", Temperature: 23.5, BedsAvailable: 130, Status: "Safe"},
	{ProvinceName: "Thanh Hoa", RiskScore: 30, MosquitoDensity: "Low (Level 2)", Temperature: 27.0, BedsAvailable: 95, Status: "Safe"},
	{ProvinceName: "Quang Ninh", RiskScore: 25, MosquitoDensity: "Low (Level 2)", Temperature: 26.5, BedsAvailable: 140, Status: "Safe"},
}

// --- Epidemiological Knowledge Base ---
// Du lieu dich te hoc thuc te cho cac tinh thanh trong diem Viet Nam.
// Nguon tham khao: Vien Pasteur TP.HCM, Cuc Y te Du phong (Bo Y te),
// WHO Dengue Situation Reports - Western Pacific Region.

var provinceDB = map[string]ProvinceInsight{
	// TP.HCM - Tam dich sot xuat huyet lon nhat ca nuoc.
	// Khi hau nhiet doi gio mua, nong am quanh nam. Mat do dan so cuc cao (~4,400 nguoi/km²).
	"Ho Chi Minh": {
		Density:     "Extreme (Level 5)",
		Temperature: 32.5,
		PeakDays:    5,
		Population:  "9.3M",
	},
	// Ha Noi - Dich theo mua (dinh thang 9-11), khi hau can nhiet doi am.
	// Mat do muoi tang manh sau mua mua nhung mua dong lanh han che vector.
	"Ha Noi": {
		Density:     "Moderate (Level 3)",
		Temperature: 28.0,
		PeakDays:    14,
		Population:  "8.5M",
	},
	// Da Nang - Khi hau nhiet doi, mua lon thang 9-12. Do thi hoa nhanh,
	// nhieu cong trinh xay dung tao o nuoc dong. Nguy co cao hon trung binh.
	"Da Nang": {
		Density:     "High (Level 4)",
		Temperature: 30.5,
		PeakDays:    10,
		Population:  "1.2M",
	},
	// Dong Nai - Vung cong nghiep trong diem phia Nam, nhieu khu nha tro
	// cong nhan mat do cao, dieu kien ve sinh han che. Rui ro bung phat nhanh.
	"Dong Nai": {
		Density:     "High (Level 4)",
		Temperature: 31.5,
		PeakDays:    7,
		Population:  "3.2M",
	},
	// Binh Duong - Tuong tu Dong Nai, KCN mat do cao. Dan so lao dong nhap cu lon,
	// kho kiem soat o dich trong khu luu tru tam.
	"Binh Duong": {
		Density:     "High (Level 4)",
		Temperature: 31.8,
		PeakDays:    7,
		Population:  "2.6M",
	},
	// Khanh Hoa (Nha Trang) - Ven bien Nam Trung Bo, nong am.
	// Diem du lich quoc te → nguy co nhap khau chung virus Dengue moi.
	"Khanh Hoa": {
		Density:     "High (Level 4)",
		Temperature: 30.8,
		PeakDays:    9,
		Population:  "1.2M",
	},
	// Can Tho - Trung tam DBSCL, he thong kenh rach day dac tao moi truong
	// ly tuong cho Aedes aegypti sinh san. Dinh dich ngan nhung bung phat manh.
	"Can Tho": {
		Density:     "High (Level 4)",
		Temperature: 31.2,
		PeakDays:    8,
		Population:  "1.3M",
	},
}

// --- WebSocket Upgrader ---

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Bypass CORS de Frontend goi sang thoai mai
	},
}

// --- Middleware ---

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Bat request OPTIONS (Preflight)
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	}
}

// --- Handlers ---

func handleAction(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ActionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid JSON body", http.StatusBadRequest)
		return
	}

	// Ghi log qua helper
	appendAuditLog("HUMAN_ACTION", "Executed action: "+req.ActionID)

	// Tra ket qua JSON ve cho Frontend
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "success",
		"message": "Command received by Edge Node",
	})
}

func handleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Error upgrading connection: %v", err)
		return
	}
	defer conn.Close()

	log.Println("Client connected via WebSocket")

	// Vi Go server chay trong thu muc "backend", ta lui ra 1 cap ".." va truy cap vao "artifacts/data.json"
	dataPath := filepath.Join("..", "artifacts", "data.json")

	for {
		// Doc noi dung file
		fileBytes, err := os.ReadFile(dataPath)
		if err != nil {
			log.Printf("Error reading data file: %v (Retrying in 3s...)", err)
			time.Sleep(3 * time.Second)
			continue
		}

		// Map du lieu vao Struct
		var data DashboardData
		if err := json.Unmarshal(fileBytes, &data); err != nil {
			log.Printf("Error parsing JSON: %v (File might be incomplete/locked. Retrying in 3s...)", err)
			time.Sleep(3 * time.Second)
			continue
		}

		// Ban du lieu ve Frontend
		if err := conn.WriteJSON(data); err != nil {
			log.Printf("Error writing JSON to websocket: %v", err)
			break
		}

		time.Sleep(3 * time.Second)
	}

	log.Println("Client disconnected")
}

// --- Coordinates DB for Vietnam Provinces ---
var provinceCoords = map[string][2]float64{
	"An Giang":          {10.5256, 105.1258},
	"Ba Ria - Vung Tau": {10.5113, 107.1685},
	"Bac Giang":         {21.2822, 106.2008},
	"Bac Kan":           {22.2570, 105.8208},
	"Bac Lieu":          {9.2942, 105.7278},
	"Bac Ninh":          {21.1861, 106.0763},
	"Ben Tre":           {10.2435, 106.3758},
	"Binh Dinh":         {13.9852, 109.0258},
	"Binh Duong":        {11.1601, 106.6601},
	"Binh Phuoc":        {11.7501, 106.9001},
	"Binh Thuan":        {11.0833, 108.1667},
	"Ca Mau":            {9.1764, 104.9889},
	"Can Tho":           {10.0333, 105.7833},
	"Cao Bang":          {22.6667, 105.9167},
	"Da Nang":           {16.0667, 108.2333},
	"Dak Lak":           {12.6667, 108.0333},
	"Dak Nong":          {12.1167, 107.6833},
	"Dien Bien":         {21.3833, 103.0167},
	"Dong Nai":          {11.0000, 107.1667},
	"Dong Thap":         {10.4500, 105.6333},
	"Gia Lai":           {13.9833, 108.0000},
	"Ha Giang":          {22.8000, 104.9833},
	"Ha Nam":            {20.5333, 105.9167},
	"Ha Noi":            {21.0285, 105.8542},
	"Ha Tinh":           {18.3333, 105.9000},
	"Hai Duong":         {20.9333, 106.3167},
	"Hai Phong":         {20.8500, 106.6833},
	"Hau Giang":         {9.7833, 105.4667},
	"Hoa Binh":          {20.6833, 105.3333},
	"Hung Yen":          {20.6500, 106.0500},
	"Khanh Hoa":         {12.2500, 109.1667},
	"Kien Giang":        {9.8833, 105.1167},
	"Kon Tum":           {14.3500, 107.9833},
	"Lai Chau":          {22.3833, 103.4667},
	"Lam Dong":          {11.9333, 108.4500},
	"Lang Son":          {21.8500, 106.7500},
	"Lao Cai":           {22.4833, 103.9667},
	"Long An":           {10.5333, 106.4000},
	"Nam Dinh":          {20.4167, 106.1667},
	"Nghe An":           {19.1667, 104.8333},
	"Ninh Binh":         {20.2500, 105.9667},
	"Ninh Thuan":        {11.5667, 108.9833},
	"Phu Tho":           {21.3167, 105.2000},
	"Phu Yen":           {13.0833, 109.0833},
	"Quang Binh":        {17.4833, 106.6000},
	"Quang Nam":         {15.5500, 107.9833},
	"Quang Ngai":        {15.1167, 108.8000},
	"Quang Ninh":        {21.0000, 107.3333},
	"Quang Tri":         {16.7500, 107.1667},
	"Soc Trang":         {9.6000, 105.9667},
	"Son La":            {21.3333, 103.9000},
	"Tay Ninh":          {11.3167, 106.1000},
	"Thai Binh":         {20.4500, 106.3333},
	"Thai Nguyen":       {21.5833, 105.8500},
	"Thanh Hoa":         {19.8000, 105.7833},
	"Thua Thien Hue":    {16.4500, 107.5833},
	"Hue":               {16.4500, 107.5833},
	"Tien Giang":        {10.3500, 106.3500},
	"TP Ho Chi Minh":    {10.7626, 106.6601},
	"Ho Chi Minh":       {10.7626, 106.6601},
	"Tra Vinh":          {9.9333, 106.3333},
	"Tuyen Quang":       {21.8167, 105.2167},
	"Vinh Long":         {10.2500, 105.9667},
	"Vinh Phuc":         {21.3000, 105.6000},
	"Yen Bai":           {21.7000, 104.8667},
}

// getRealtimeTemp goi Open-Meteo API de lay nhiet do hien tai.
func getRealtimeTemp(lat, lng float64) (float64, error) {
	url := fmt.Sprintf("https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f&current=temperature_2m", lat, lng)
	
	client := http.Client{
		Timeout: 4 * time.Second,
	}
	resp, err := client.Get(url)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("Open-Meteo returned status %d", resp.StatusCode)
	}

	var result struct {
		Current struct {
			Temp float64 `json:"temperature_2m"`
		} `json:"current"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return 0, err
	}

	return result.Current.Temp, nil
}

func handleInsight(w http.ResponseWriter, r *http.Request) {
	province := strings.TrimSpace(r.URL.Query().Get("province"))
	if province == "" {
		http.Error(w, `{"error":"Missing required query parameter: province"}`, http.StatusBadRequest)
		return
	}

	var insight ProvinceInsight
	var foundInDB bool

	// 1. Tra cuu chinh xac trong Knowledge Base
	if baseInsight, found := provinceDB[province]; found {
		insight = baseInsight
		foundInDB = true
	}

	// 2. Regional Fallback — phan loai theo dac diem dia ly vung mien neu khong co trong DB
	if !foundInDB {
		switch {
		case containsAny(province, "Bac", "Thai", "Lang", "Cao Bang", "Ha Giang", "Lao Cai", "Son La", "Lai Chau", "Dien Bien", "Yen Bai"):
			insight = ProvinceInsight{
				Density:     "Low (Level 2)",
				Temperature: 23.5,
				PeakDays:    21,
				Population:  "~800K",
			}
		case containsAny(province, "Hai Phong", "Hai Duong", "Hung Yen", "Nam Dinh", "Ninh Binh", "Vinh Phuc"):
			insight = ProvinceInsight{
				Density:     "Moderate (Level 3)",
				Temperature: 27.5,
				PeakDays:    16,
				Population:  "~1.8M",
			}
		case containsAny(province, "Hue", "Thua Thien", "Quang Nam", "Quang Ngai", "Binh Dinh", "Phu Yen", "Ninh Thuan", "Binh Thuan"):
			insight = ProvinceInsight{
				Density:     "Moderate-High (Level 3-4)",
				Temperature: 30.0,
				PeakDays:    12,
				Population:  "~1.5M",
			}
		case containsAny(province, "Dak Lak", "Dak Nong", "Gia Lai", "Kon Tum", "Lam Dong"):
			insight = ProvinceInsight{
				Density:     "Moderate (Level 3)",
				Temperature: 25.5,
				PeakDays:    15,
				Population:  "~1.2M",
			}
		case containsAny(province, "Ca Mau", "Kien Giang", "Dong Thap", "An Giang", "Tien Giang", "Ben Tre", "Vinh Long", "Tra Vinh", "Soc Trang", "Bac Lieu", "Long An", "Hau Giang"):
			insight = ProvinceInsight{
				Density:     "High (Level 4)",
				Temperature: 31.0,
				PeakDays:    9,
				Population:  "~1.7M",
			}
		case containsAny(province, "Tay Ninh", "Ba Ria", "Vung Tau", "Binh Phuoc"):
			insight = ProvinceInsight{
				Density:     "High (Level 4)",
				Temperature: 31.2,
				PeakDays:    8,
				Population:  "~1.4M",
			}
		default:
			insight = ProvinceInsight{
				Density:     "Moderate (Level 3)",
				Temperature: 29.5,
				PeakDays:    14,
				Population:  "~1.0M",
			}
		}
	}

	// 3. Cap nhat nhiet do Real-time tu API Open-Meteo
	var coords [2]float64
	var foundCoords bool

	// Tim toa do tuong doi cua tinh
	for name, c := range provinceCoords {
		if strings.Contains(strings.ToLower(province), strings.ToLower(name)) || strings.Contains(strings.ToLower(name), strings.ToLower(province)) {
			coords = c
			foundCoords = true
			break
		}
	}

	if foundCoords {
		realTemp, err := getRealtimeTemp(coords[0], coords[1])
		if err == nil {
			log.Printf("Real-time weather fetched for %s: %.1f°C", province, realTemp)
			insight.Temperature = realTemp
		} else {
			log.Printf("Failed to fetch real-time weather for %s (using baseline %.1f°C): %v", province, insight.Temperature, err)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(insight)
}

// containsAny kiem tra xem chuoi s co chua bat ky substring nao trong danh sach hay khong.
func containsAny(s string, substrs ...string) bool {
	for _, sub := range substrs {
		if strings.Contains(s, sub) {
			return true
		}
	}
	return false
}

func handleUAVRecon(w http.ResponseWriter, r *http.Request) {
	dataPath := filepath.Join("..", "artifacts", "data.json")
	fileBytes, err := os.ReadFile(dataPath)
	if err != nil {
		http.Error(w, "Cannot read data", http.StatusInternalServerError)
		return
	}

	var data DashboardData
	if err := json.Unmarshal(fileBytes, &data); err != nil {
		http.Error(w, "Cannot parse data", http.StatusInternalServerError)
		return
	}

	if len(data.Hotspots) == 0 {
		http.Error(w, "No hotspots found", http.StatusBadRequest)
		return
	}

	// Tang dot bien RiskScore cua mot hotspot ngau nhien de gia lap "phat hien moi"
	targetIndex := time.Now().UnixNano() % int64(len(data.Hotspots))
	targetProvince := data.Hotspots[targetIndex].Region
	
	// Tang diem rui ro len ngau nhien tu 15 den 30 diem
	bump := int(time.Now().UnixNano() % 16) + 15 
	data.Hotspots[targetIndex].RiskScore += bump
	if data.Hotspots[targetIndex].RiskScore > 100 {
		data.Hotspots[targetIndex].RiskScore = 100
	}

	// Ghi lai file de WebSocket tu dong broadcast thay doi
	newBytes, _ := json.MarshalIndent(data, "", "  ")
	os.WriteFile(dataPath, newBytes, 0644)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
		"target_province": targetProvince,
	})
}

func handleResources(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Copy resourceDB to avoid concurrent modification issues
	allProvinces := make([]ResourceData, len(resourceDB))
	copy(allProvinces, resourceDB)

	// Sap xep giam dan theo RiskScore
	sort.Slice(allProvinces, func(i, j int) bool {
		return allProvinces[i].RiskScore > allProvinces[j].RiskScore
	})

	// Lay 5 phan tu dau tien lam TopProvinces
	limit := 5
	if len(allProvinces) < limit {
		limit = len(allProvinces)
	}
	topProvinces := allProvinces[:limit]

	response := map[string]interface{}{
		"top_provinces": topProvinces,
		"all_provinces": allProvinces,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleGetLogs(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	file, err := os.Open("system_audit.jsonl")
	if err != nil {
		// If file doesn't exist, return empty array
		if os.IsNotExist(err) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte("[]"))
			return
		}
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	defer file.Close()

	var logs []AuditLog
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := scanner.Text()
		if strings.TrimSpace(line) == "" {
			continue
		}
		var logEntry AuditLog
		if err := json.Unmarshal([]byte(line), &logEntry); err == nil {
			logs = append(logs, logEntry)
		}
	}

	if err := scanner.Err(); err != nil {
		log.Printf("Error scanning audit logs: %v", err)
	}

	// Reverse slice to have latest logs first
	reversedLogs := make([]AuditLog, len(logs))
	for i, j := 0, len(logs)-1; j >= 0; i, j = i+1, j-1 {
		reversedLogs[i] = logs[j]
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(reversedLogs)
}

// handleOptimize triggers the Layer 3 Python script.
func handleOptimize(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodOptions {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	cmd := exec.Command("python3", "08_quantum_allocation.py")
	cmd.Dir = ".."
	out, err := cmd.CombinedOutput()
	if err != nil {
		log.Printf("Error running quantum allocation: %v\nOutput: %s", err, string(out))
		http.Error(w, "Failed to execute quantum allocation", http.StatusInternalServerError)
		return
	}

	appendAuditLog("SYSTEM", "Quantum allocation executed successfully")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Quantum allocation executed",
	})
}

// handleAllocation reads the output of Layer 3 and returns it.
func handleAllocation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodOptions {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	data, err := os.ReadFile("../artifacts/allocation_output.json")
	if err != nil {
		log.Printf("Error reading allocation output: %v", err)
		http.Error(w, "Allocation output not found", http.StatusNotFound)
		return
	}

	var result map[string]interface{}
	if err := json.Unmarshal(data, &result); err != nil {
		log.Printf("Error parsing allocation output: %v", err)
		http.Error(w, "Invalid allocation output format", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func handleForecast(w http.ResponseWriter, r *http.Request) {
	region := r.URL.Query().Get("region")
	if region == "" {
		region = "Ho Chi Minh"
	}

	log.Printf("Running python ML script for region: %s", region)
	cmd := exec.Command("python", "09_dengue_forecasting.py", region)
	cmd.Dir = ".."
	err := cmd.Run()
	if err != nil {
		log.Printf("Error running forecasting script: %v", err)
		http.Error(w, "Failed to run forecasting model", http.StatusInternalServerError)
		return
	}

	forecastPath := filepath.Join("..", "artifacts", "long_term_forecast.json")
	data, err := os.ReadFile(forecastPath)
	if err != nil {
		log.Printf("Error reading forecast output: %v", err)
		http.Error(w, "Forecast output not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func handleDispatchOrders(w http.ResponseWriter, r *http.Request) {
	ordersPath := filepath.Join("..", "artifacts", "dispatch_orders.json")
	data, err := os.ReadFile(ordersPath)
	if err != nil {
		log.Printf("Error reading dispatch orders: %v", err)
		http.Error(w, "Dispatch orders not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

// --- Main ---

func main() {
	// Ghi log khoi dong he thong
	appendAuditLog("SYSTEM", "Edge Server initialized and loading database")
	appendAuditLog("SYSTEM", "QuantumShield Command Center operational on port 8080")

	mux := http.NewServeMux()

	// Dang ky REST API nhan lenh dieu khien voi middleware CORS
	mux.HandleFunc("/api/action", enableCORS(handleAction))
	mux.HandleFunc("/api/insight", enableCORS(handleInsight))
	mux.HandleFunc("/api/uav-recon", enableCORS(handleUAVRecon))
	mux.HandleFunc("/api/resources", enableCORS(handleResources))
	mux.HandleFunc("/api/logs", enableCORS(handleGetLogs))
	mux.HandleFunc("/api/optimize", enableCORS(handleOptimize))
	mux.HandleFunc("/api/allocation", enableCORS(handleAllocation))
	mux.HandleFunc("/api/forecast", enableCORS(handleForecast))
	mux.HandleFunc("/api/dispatch-orders", enableCORS(handleDispatchOrders))
	
	// Dang ky WebSocket
	mux.HandleFunc("/ws", handleWebSocket)

	// Serve static files for the React frontend
	fs := http.FileServer(http.Dir("../dashboard/dist"))
	mux.Handle("/", fs)

	port := ":8080"
	log.Printf("Server is starting and listening on port %s...", port)
	
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

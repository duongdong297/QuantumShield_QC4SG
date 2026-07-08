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
	// Dữ liệu thực tế bám sát báo cáo dịch tễ Bộ Y tế (năm 2025)
	{ProvinceName: "Hồ Chí Minh", RiskScore: 98, MosquitoDensity: "Extreme (Level 5)", Temperature: 34.2, BedsAvailable: 3, Status: "Critical"}, // Ghi nhận 69.386 ca
	{ProvinceName: "Đồng Nai", RiskScore: 91, MosquitoDensity: "Extreme (Level 5)", Temperature: 33.5, BedsAvailable: 12, Status: "Critical"}, // Tăng đột biến
	{ProvinceName: "Tây Ninh", RiskScore: 89, MosquitoDensity: "High (Level 4)", Temperature: 33.8, BedsAvailable: 15, Status: "Critical"}, // Tăng đột biến
	{ProvinceName: "Long An", RiskScore: 87, MosquitoDensity: "High (Level 4)", Temperature: 33.0, BedsAvailable: 10, Status: "Critical"}, // Tăng đột biến
	{ProvinceName: "Bến Tre", RiskScore: 85, MosquitoDensity: "High (Level 4)", Temperature: 32.5, BedsAvailable: 18, Status: "Critical"}, // Tăng đột biến
	{ProvinceName: "Bình Dương", RiskScore: 82, MosquitoDensity: "High (Level 4)", Temperature: 33.1, BedsAvailable: 25, Status: "Critical"},
	{ProvinceName: "Đà Nẵng", RiskScore: 75, MosquitoDensity: "High (Level 4)", Temperature: 30.5, BedsAvailable: 45, Status: "Warning"},
	{ProvinceName: "Hà Nội", RiskScore: 68, MosquitoDensity: "Moderate (Level 3)", Temperature: 28.5, BedsAvailable: 150, Status: "Warning"}, // Bắt đầu gia tăng ca bệnh
	{ProvinceName: "Cần Thơ", RiskScore: 65, MosquitoDensity: "Moderate (Level 3)", Temperature: 31.2, BedsAvailable: 60, Status: "Warning"},
	{ProvinceName: "Khánh Hòa", RiskScore: 62, MosquitoDensity: "Moderate (Level 3)", Temperature: 30.8, BedsAvailable: 55, Status: "Warning"},
	{ProvinceName: "Hải Phòng", RiskScore: 55, MosquitoDensity: "Moderate (Level 3)", Temperature: 27.5, BedsAvailable: 80, Status: "Warning"},
	{ProvinceName: "Đắk Lắk", RiskScore: 42, MosquitoDensity: "Low (Level 2)", Temperature: 25.5, BedsAvailable: 110, Status: "Safe"},
	{ProvinceName: "Lâm Đồng", RiskScore: 35, MosquitoDensity: "Low (Level 2)", Temperature: 23.5, BedsAvailable: 130, Status: "Safe"},
	{ProvinceName: "Thanh Hóa", RiskScore: 30, MosquitoDensity: "Low (Level 2)", Temperature: 27.0, BedsAvailable: 95, Status: "Safe"},
	{ProvinceName: "Quảng Ninh", RiskScore: 25, MosquitoDensity: "Low (Level 2)", Temperature: 26.5, BedsAvailable: 140, Status: "Safe"},
}

// --- Epidemiological Knowledge Base ---
// Dữ liệu dịch tễ học thực tế cho các tỉnh thành trọng điểm Việt Nam.
// Nguồn tham khảo: Viện Pasteur TP.HCM, Cục Y tế Dự phòng (Bộ Y tế),
// WHO Dengue Situation Reports - Western Pacific Region.

var provinceDB = map[string]ProvinceInsight{
	// TP.HCM - Tâm dịch sốt xuất huyết lớn nhất cả nước.
	// Khí hậu nhiệt đới gió mùa, nóng ẩm quanh năm. Mật độ dân số cực cao (~4,400 người/km²).
	"Hồ Chí Minh": {
		Density:     "Extreme (Level 5)",
		Temperature: 32.5,
		PeakDays:    5,
		Population:  "9.3M",
	},
	// Hà Nội - Dịch theo mùa (đỉnh tháng 9-11), khí hậu cận nhiệt đới ẩm.
	// Mật độ muỗi tăng mạnh sau mùa mưa nhưng mùa đông lạnh hạn chế vector.
	"Hà Nội": {
		Density:     "Moderate (Level 3)",
		Temperature: 28.0,
		PeakDays:    14,
		Population:  "8.5M",
	},
	// Đà Nẵng - Khí hậu nhiệt đới, mưa lớn tháng 9-12. Đô thị hóa nhanh,
	// nhiều công trình xây dựng tạo ổ nước đọng. Nguy cơ cao hơn trung bình.
	"Đà Nẵng": {
		Density:     "High (Level 4)",
		Temperature: 30.5,
		PeakDays:    10,
		Population:  "1.2M",
	},
	// Đồng Nai - Vùng công nghiệp trọng điểm phía Nam, nhiều khu nhà trọ
	// công nhân mật độ cao, điều kiện vệ sinh hạn chế. Rủi ro bùng phát nhanh.
	"Đồng Nai": {
		Density:     "High (Level 4)",
		Temperature: 31.5,
		PeakDays:    7,
		Population:  "3.2M",
	},
	// Bình Dương - Tương tự Đồng Nai, KCN mật độ cao. Dân số lao động nhập cư lớn,
	// khó kiểm soát ổ dịch trong khu lưu trú tạm.
	"Bình Dương": {
		Density:     "High (Level 4)",
		Temperature: 31.8,
		PeakDays:    7,
		Population:  "2.6M",
	},
	// Khánh Hòa (Nha Trang) - Ven biển Nam Trung Bộ, nóng ẩm.
	// Điểm du lịch quốc tế → nguy cơ nhập khẩu chủng virus Dengue mới.
	"Khánh Hòa": {
		Density:     "High (Level 4)",
		Temperature: 30.8,
		PeakDays:    9,
		Population:  "1.2M",
	},
	// Cần Thơ - Trung tâm ĐBSCL, hệ thống kênh rạch dày đặc tạo môi trường
	// lý tưởng cho Aedes aegypti sinh sản. Đỉnh dịch ngắn nhưng bùng phát mạnh.
	"Cần Thơ": {
		Density:     "High (Level 4)",
		Temperature: 31.2,
		PeakDays:    8,
		Population:  "1.3M",
	},
}

// --- WebSocket Upgrader ---

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Bypass CORS để Frontend gọi sang thoải mái
	},
}

// --- Middleware ---

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Bắt request OPTIONS (Preflight)
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

	// Trả kết quả JSON về cho Frontend
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

	// Vì Go server chạy trong thư mục "backend", ta lùi ra 1 cấp ".." và truy cập vào "artifacts/data.json"
	dataPath := filepath.Join("..", "artifacts", "data.json")

	for {
		// Đọc nội dung file
		fileBytes, err := os.ReadFile(dataPath)
		if err != nil {
			log.Printf("Error reading data file: %v (Retrying in 3s...)", err)
			time.Sleep(3 * time.Second)
			continue
		}

		// Map dữ liệu vào Struct
		var data DashboardData
		if err := json.Unmarshal(fileBytes, &data); err != nil {
			log.Printf("Error parsing JSON: %v (File might be incomplete/locked. Retrying in 3s...)", err)
			time.Sleep(3 * time.Second)
			continue
		}

		// Bắn dữ liệu về Frontend
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
	"Bà Rịa - Vũng Tàu": {10.5113, 107.1685},
	"Bắc Giang":         {21.2822, 106.2008},
	"Bắc Kạn":           {22.2570, 105.8208},
	"Bạc Liêu":          {9.2942, 105.7278},
	"Bắc Ninh":          {21.1861, 106.0763},
	"Bến Tre":           {10.2435, 106.3758},
	"Bình Định":         {13.9852, 109.0258},
	"Bình Dương":        {11.1601, 106.6601},
	"Bình Phước":        {11.7501, 106.9001},
	"Bình Thuận":        {11.0833, 108.1667},
	"Cà Mau":            {9.1764, 104.9889},
	"Cần Thơ":           {10.0333, 105.7833},
	"Cao Bằng":          {22.6667, 105.9167},
	"Đà Nẵng":           {16.0667, 108.2333},
	"Đắk Lắk":           {12.6667, 108.0333},
	"Đắk Nông":          {12.1167, 107.6833},
	"Đăk Nông":          {12.1167, 107.6833},
	"Điện Biên":         {21.3833, 103.0167},
	"Đồng Nai":          {11.0000, 107.1667},
	"Đồng Tháp":         {10.4500, 105.6333},
	"Gia Lai":           {13.9833, 108.0000},
	"Hà Giang":          {22.8000, 104.9833},
	"Hà Nam":            {20.5333, 105.9167},
	"Hà Nội":            {21.0285, 105.8542},
	"Hà Tĩnh":           {18.3333, 105.9000},
	"Hải Dương":         {20.9333, 106.3167},
	"Hải Phòng":         {20.8500, 106.6833},
	"Hậu Giang":         {9.7833, 105.4667},
	"Hòa Bình":          {20.6833, 105.3333},
	"Hưng Yên":          {20.6500, 106.0500},
	"Khánh Hòa":         {12.2500, 109.1667},
	"Kiên Giang":        {9.8833, 105.1167},
	"Kon Tum":           {14.3500, 107.9833},
	"Lai Châu":          {22.3833, 103.4667},
	"Lâm Đồng":          {11.9333, 108.4500},
	"Lạng Sơn":          {21.8500, 106.7500},
	"Lào Cai":           {22.4833, 103.9667},
	"Long An":           {10.5333, 106.4000},
	"Nam Định":          {20.4167, 106.1667},
	"Nghệ An":           {19.1667, 104.8333},
	"Ninh Bình":         {20.2500, 105.9667},
	"Ninh Thuận":        {11.5667, 108.9833},
	"Phú Thọ":           {21.3167, 105.2000},
	"Phú Yên":           {13.0833, 109.0833},
	"Quảng Bình":        {17.4833, 106.6000},
	"Quảng Nam":         {15.5500, 107.9833},
	"Quảng Ngãi":        {15.1167, 108.8000},
	"Quảng Ninh":        {21.0000, 107.3333},
	"Quảng Trị":         {16.7500, 107.1667},
	"Sóc Trăng":         {9.6000, 105.9667},
	"Sơn La":            {21.3333, 103.9000},
	"Tây Ninh":          {11.3167, 106.1000},
	"Thái Bình":         {20.4500, 106.3333},
	"Thái Nguyên":       {21.5833, 105.8500},
	"Thanh Hóa":         {19.8000, 105.7833},
	"Thừa Thiên Huế":    {16.4500, 107.5833},
	"Huế":               {16.4500, 107.5833},
	"Tiền Giang":        {10.3500, 106.3500},
	"TP Hồ Chí Minh":    {10.7626, 106.6601},
	"Hồ Chí Minh":       {10.7626, 106.6601},
	"Trà Vinh":          {9.9333, 106.3333},
	"Tuyên Quang":       {21.8167, 105.2167},
	"Vĩnh Long":         {10.2500, 105.9667},
	"Vĩnh Phúc":         {21.3000, 105.6000},
	"Yên Bái":           {21.7000, 104.8667},
}

// getRealtimeTemp gọi Open-Meteo API để lấy nhiệt độ hiện tại.
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

	// 1. Tra cứu chính xác trong Knowledge Base
	if baseInsight, found := provinceDB[province]; found {
		insight = baseInsight
		foundInDB = true
	}

	// 2. Regional Fallback — phân loại theo đặc điểm địa lý vùng miền nếu không có trong DB
	if !foundInDB {
		switch {
		case containsAny(province, "Bắc", "Thái", "Lạng", "Cao Bằng", "Hà Giang", "Lào Cai", "Sơn La", "Lai Châu", "Điện Biên", "Yên Bái"):
			insight = ProvinceInsight{
				Density:     "Low (Level 2)",
				Temperature: 23.5,
				PeakDays:    21,
				Population:  "~800K",
			}
		case containsAny(province, "Hải Phòng", "Hải Dương", "Hưng Yên", "Nam Định", "Ninh Bình", "Vĩnh Phúc"):
			insight = ProvinceInsight{
				Density:     "Moderate (Level 3)",
				Temperature: 27.5,
				PeakDays:    16,
				Population:  "~1.8M",
			}
		case containsAny(province, "Huế", "Thừa Thiên", "Quảng Nam", "Quảng Ngãi", "Bình Định", "Phú Yên", "Ninh Thuận", "Bình Thuận"):
			insight = ProvinceInsight{
				Density:     "Moderate-High (Level 3-4)",
				Temperature: 30.0,
				PeakDays:    12,
				Population:  "~1.5M",
			}
		case containsAny(province, "Đắk Lắk", "Đắk Nông", "Gia Lai", "Kon Tum", "Lâm Đồng"):
			insight = ProvinceInsight{
				Density:     "Moderate (Level 3)",
				Temperature: 25.5,
				PeakDays:    15,
				Population:  "~1.2M",
			}
		case containsAny(province, "Cà Mau", "Kiên Giang", "Đồng Tháp", "An Giang", "Tiền Giang", "Bến Tre", "Vĩnh Long", "Trà Vinh", "Sóc Trăng", "Bạc Liêu", "Long An", "Hậu Giang"):
			insight = ProvinceInsight{
				Density:     "High (Level 4)",
				Temperature: 31.0,
				PeakDays:    9,
				Population:  "~1.7M",
			}
		case containsAny(province, "Tây Ninh", "Bà Rịa", "Vũng Tàu", "Bình Phước"):
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

	// 3. Cập nhật nhiệt độ Real-time từ API Open-Meteo
	var coords [2]float64
	var foundCoords bool

	// Tìm tọa độ tương đối của tỉnh
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

// containsAny kiểm tra xem chuỗi s có chứa bất kỳ substring nào trong danh sách hay không.
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

	// Tăng đột biến RiskScore của một hotspot ngẫu nhiên để giả lập "phát hiện mới"
	targetIndex := time.Now().UnixNano() % int64(len(data.Hotspots))
	targetProvince := data.Hotspots[targetIndex].Region
	
	// Tăng điểm rủi ro lên ngẫu nhiên từ 15 đến 30 điểm
	bump := int(time.Now().UnixNano() % 16) + 15 
	data.Hotspots[targetIndex].RiskScore += bump
	if data.Hotspots[targetIndex].RiskScore > 100 {
		data.Hotspots[targetIndex].RiskScore = 100
	}

	// Ghi lại file để WebSocket tự động broadcast thay đổi
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

	// Sắp xếp giảm dần theo RiskScore
	sort.Slice(allProvinces, func(i, j int) bool {
		return allProvinces[i].RiskScore > allProvinces[j].RiskScore
	})

	// Lấy 5 phần tử đầu tiên làm TopProvinces
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

	cmd := exec.Command("python", "08_quantum_allocation.py")
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

// --- Main ---

func main() {
	// Ghi log khởi động hệ thống
	appendAuditLog("SYSTEM", "Edge Server initialized and loading database")
	appendAuditLog("SYSTEM", "QuantumShield Command Center operational on port 8080")

	mux := http.NewServeMux()

	// Đăng ký REST API nhận lệnh điều khiển với middleware CORS
	mux.HandleFunc("/api/action", enableCORS(handleAction))
	mux.HandleFunc("/api/insight", enableCORS(handleInsight))
	mux.HandleFunc("/api/uav-recon", enableCORS(handleUAVRecon))
	mux.HandleFunc("/api/resources", enableCORS(handleResources))
	mux.HandleFunc("/api/logs", enableCORS(handleGetLogs))
	mux.HandleFunc("/api/optimize", enableCORS(handleOptimize))
	mux.HandleFunc("/api/allocation", enableCORS(handleAllocation))
	
	// Đăng ký WebSocket
	mux.HandleFunc("/ws", handleWebSocket)

	port := ":8080"
	log.Printf("Server is starting and listening on port %s...", port)
	
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

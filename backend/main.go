package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
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
type WeatherData struct {
	Province    string  `json:"province"`
	Temperature float64 `json:"temperature"`
	Humidity    float64 `json:"humidity"`
	Rainfall    float64 `json:"rainfall"`
}

type LocationData struct {
	Province string  `json:"province"`
	Lat      float64 `json:"lat"`
	Lon      float64 `json:"lon"`
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

	// Mở (hoặc tạo mới) file system_audit.log ở chế độ ghi tiếp (append)
	logFile, err := os.OpenFile("system_audit.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		log.Printf("Error opening audit log file: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	defer logFile.Close()

	// Ghi log với timestamp
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logEntry := fmt.Sprintf("[%s] ACTION EXECUTED: %s\n", timestamp, req.Description)
	if _, err := logFile.WriteString(logEntry); err != nil {
		log.Printf("Error writing to audit log: %v", err)
	}

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
func handleWeather(w http.ResponseWriter, r *http.Request) {
	province := r.URL.Query().Get("province")
	if province == "" {
		http.Error(w, "Missing province parameter", http.StatusBadRequest)
		return
	}

	// Đọc file weather_clean.csv
	// Đường dẫn: ../data/processed/weather_clean.csv (vì backend chạy trong thư mục backend/)
	filePath := filepath.Join("..", "data", "processed", "weather_clean.csv")
	fileBytes, err := os.ReadFile(filePath)
	if err != nil {
		http.Error(w, "Cannot read weather data", http.StatusInternalServerError)
		return
	}

	// Parse CSV thủ công
	lines := strings.Split(string(fileBytes), "\n")
	var latest WeatherData
	var latestYearMonth string
	found := false

	for i := 1; i < len(lines); i++ { // i=1 để bỏ qua header
		line := strings.TrimSpace(lines[i])
		if line == "" {
			continue
		}
		parts := strings.Split(line, ",")
		if len(parts) < 5 {
			continue
		}
		// parts[0] = province, parts[1] = year_month, parts[2] = temperature, parts[3] = humidity, parts[4] = rainfall
		if strings.EqualFold(strings.TrimSpace(parts[0]), province) {
			yearMonth := strings.TrimSpace(parts[1])
			// Chỉ lấy bản ghi có year_month lớn nhất (mới nhất)
			if yearMonth > latestYearMonth {
				temp, _ := strconv.ParseFloat(strings.TrimSpace(parts[2]), 64)
				hum, _ := strconv.ParseFloat(strings.TrimSpace(parts[3]), 64)
				rain, _ := strconv.ParseFloat(strings.TrimSpace(parts[4]), 64)
				latest = WeatherData{
					Province:    province,
					Temperature: temp,
					Humidity:    hum,
					Rainfall:    rain,
				}
				latestYearMonth = yearMonth
				found = true
			}
		}
	}

	if !found {
		http.Error(w, "Province not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(latest)
}

func handleLocation(w http.ResponseWriter, r *http.Request) {
	province := r.URL.Query().Get("province")
	if province == "" {
		http.Error(w, "Missing province parameter", http.StatusBadRequest)
		return
	}

	// Đọc file centroid.csv
	filePath := filepath.Join("..", "raw_data", "centroid.csv")
	fileBytes, err := os.ReadFile(filePath)
	if err != nil {
		http.Error(w, "Cannot read location data", http.StatusInternalServerError)
		return
	}

	lines := strings.Split(string(fileBytes), "\n")
	var loc LocationData
	found := false

	for i := 1; i < len(lines); i++ {
		line := strings.TrimSpace(lines[i])
		if line == "" {
			continue
		}
		parts := strings.Split(line, ",")
		if len(parts) < 3 {
			continue
		}
		// parts[0] = province, parts[1] = lat, parts[2] = lon
		if strings.EqualFold(strings.TrimSpace(parts[0]), province) {
			lat, _ := strconv.ParseFloat(strings.TrimSpace(parts[1]), 64)
			lon, _ := strconv.ParseFloat(strings.TrimSpace(parts[2]), 64)
			loc = LocationData{
				Province: province,
				Lat:      lat,
				Lon:      lon,
			}
			found = true
			break
		}
	}

	if !found {
		http.Error(w, "Province not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(loc)
}
// --- Main ---

func main() {
	mux := http.NewServeMux()

	// Đăng ký REST API nhận lệnh điều khiển với middleware CORS
	mux.HandleFunc("/api/action", enableCORS(handleAction))
	
	// Đăng ký WebSocket
	mux.HandleFunc("/ws", handleWebSocket)

	mux.HandleFunc("/api/weather", enableCORS(handleWeather))
	mux.HandleFunc("/api/location", enableCORS(handleLocation))
	port := ":8080"
	log.Printf("Server is starting and listening on port %s...", port)
	
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

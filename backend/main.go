package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	"os"
	"path/filepath"
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

func handleInsight(w http.ResponseWriter, r *http.Request) {
	province := r.URL.Query().Get("province")
	if province == "" {
		http.Error(w, "Missing province parameter", http.StatusBadRequest)
		return
	}

	// Dùng độ dài tên tỉnh làm seed để sinh dữ liệu khác nhau nhưng nhất quán
	seed := int64(len(province))
	for _, c := range province {
		seed += int64(c)
	}
	rng := rand.New(rand.NewSource(seed))

	// Nhiệt độ dao động 27.0 - 35.0°C tuỳ tỉnh
	temperature := 27.0 + rng.Float64()*8.0
	temperature = math.Round(temperature*10) / 10

	// Đỉnh dịch dao động 7 - 21 ngày
	peakDays := 7 + rng.Intn(15)

	// Mật độ muỗi dựa vào nhiệt độ
	var density string
	switch {
	case temperature >= 33:
		density = "Critical (Level 5)"
	case temperature >= 31:
		density = "High (Level 4)"
	case temperature >= 29:
		density = "Moderate (Level 3)"
	default:
		density = "Low (Level 2)"
	}

	// Dân số nguy cơ dao động 200K - 3.5M
	popRaw := 200 + rng.Intn(3300)
	var population string
	if popRaw >= 1000 {
		population = fmt.Sprintf("%.1fM", float64(popRaw)/1000.0)
	} else {
		population = fmt.Sprintf("%dK", popRaw)
	}

	insight := ProvinceInsight{
		Density:     density,
		Temperature: temperature,
		PeakDays:    peakDays,
		Population:  population,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(insight)
}

// --- Main ---

func main() {
	mux := http.NewServeMux()

	// Đăng ký REST API nhận lệnh điều khiển với middleware CORS
	mux.HandleFunc("/api/action", enableCORS(handleAction))
	mux.HandleFunc("/api/insight", enableCORS(handleInsight))
	
	// Đăng ký WebSocket
	mux.HandleFunc("/ws", handleWebSocket)

	port := ":8080"
	log.Printf("Server is starting and listening on port %s...", port)
	
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

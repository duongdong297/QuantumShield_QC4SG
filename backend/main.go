package main

import (
	"encoding/json"
	"log"
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

// --- WebSocket Upgrader ---

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Bypass CORS để Frontend gọi sang thoải mái
	},
}

// --- Handlers ---

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
			// Lỗi đọc file (có thể do team AI chưa sinh xong hoặc đang ghi đè lock file)
			log.Printf("Error reading data file: %v (Retrying in 3s...)", err)
			time.Sleep(3 * time.Second)
			continue
		}

		// Map dữ liệu vào Struct
		var data DashboardData
		if err := json.Unmarshal(fileBytes, &data); err != nil {
			// Lỗi Parse (có thể do file JSON đang được ghi dở nên bị lỗi cú pháp)
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

// --- Main ---

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("/ws", handleWebSocket)

	port := ":8080"
	log.Printf("WebSocket Server is starting and listening on port %s...", port)
	
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

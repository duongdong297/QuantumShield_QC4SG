package main

import (
	"log"
	"math/rand"
	"net/http"
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

	// Tạo một instance random cục bộ
	rng := rand.New(rand.NewSource(time.Now().UnixNano()))

	// Khởi tạo mảng TrendData cơ bản cho 7 ngày
	days := []string{"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"}
	trendData := make([]TrendPoint, len(days))
	for i, day := range days {
		trendData[i] = TrendPoint{
			Day:        day,
			Infections: 50 + rng.Intn(101), // Cơ bản khoảng 50 - 150
		}
	}

	for {
		// Sinh dữ liệu động (+- biên độ nhỏ) cho các thẻ cơ bản
		beds := 100 + rng.Intn(31)        // 100-130
		kits := 450 + rng.Intn(101)       // 450-550
		staffTeams := 2 + rng.Intn(4)     // 2-5
		prob := 80 + rng.Intn(15)         // 80-94

		hotspot1Risk := 83 + rng.Intn(11) // 83-93 (dao động quanh 88)
		hotspot2Risk := 60 + rng.Intn(11) // 60-70 (dao động quanh 65)
		hotspot3Risk := 37 + rng.Intn(11) // 37-47 (dao động quanh 42)

		// Cập nhật ngẫu nhiên số liệu TrendData để tạo hiệu ứng đồ thị uốn lượn
		for i := range trendData {
			// Random dao động từ -15 đến +15
			change := -15 + rng.Intn(31)
			trendData[i].Infections += change
			
			// Đảm bảo không bị âm
			if trendData[i].Infections < 0 {
				trendData[i].Infections = 0
			}
		}

		data := DashboardData{
			Alert: Alert{
				Active:      true,
				Region:      "District 3 - Urban",
				Probability: prob,
				Message:     "Dengue outbreak probability exceeded threshold...",
			},
			Forecast: Forecast{
				Beds:       beds,
				Kits:       kits,
				StaffTeams: staffTeams,
			},
			Hotspots: []Hotspot{
				{Lat: 21.0000, Lng: 105.8200, Region: "District 3 - Urban", RiskScore: hotspot1Risk},
				{Lat: 21.0285, Lng: 105.8542, Region: "District 1 - Central", RiskScore: hotspot2Risk},
				{Lat: 21.0500, Lng: 105.8800, Region: "District 5 - Suburb", RiskScore: hotspot3Risk},
			},
			TrendData: trendData,
		}

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

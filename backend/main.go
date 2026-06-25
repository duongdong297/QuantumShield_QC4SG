package main

import (
	"encoding/json"
	"log"
	"net/http"
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

// --- Middleware ---

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Thêm header Access-Control-Allow-Origin để cho phép mọi domain (Front-end) truy cập
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Content-Type", "application/json")
		
		// Handle preflight request
		if r.Method == "OPTIONS" {
			w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			w.WriteHeader(http.StatusOK)
			return
		}
		
		next.ServeHTTP(w, r)
	}
}

// --- Handlers ---

func handleAlert(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	data := Alert{
		Active:      true,
		Region:      "District 3 - Urban",
		Probability: 88,
		Message:     "Dengue outbreak probability exceeded threshold...",
	}

	// Trả JSON và bắt lỗi
	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding alert data: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func handleForecast(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	data := Forecast{
		Beds:       120,
		Kits:       500,
		StaffTeams: 3,
	}

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding forecast data: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

func handleHotspots(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	data := []Hotspot{
		{Lat: 21.0000, Lng: 105.8200, Region: "District 3 - Urban", RiskScore: 88},
		{Lat: 21.0285, Lng: 105.8542, Region: "District 1 - Central", RiskScore: 65},
		{Lat: 21.0500, Lng: 105.8800, Region: "District 5 - Suburb", RiskScore: 42},
	}

	if err := json.NewEncoder(w).Encode(data); err != nil {
		log.Printf("Error encoding hotspots data: %v", err)
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
	}
}

// --- Main ---

func main() {
	mux := http.NewServeMux()

	// Gắn các Route với Middleware CORS
	mux.HandleFunc("/api/alert", enableCORS(handleAlert))
	mux.HandleFunc("/api/forecast", enableCORS(handleForecast))
	mux.HandleFunc("/api/hotspots", enableCORS(handleHotspots))

	port := ":8080"
	log.Printf("Server is starting and successfully listening on port %s...", port)
	
	// Khởi chạy HTTP server
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

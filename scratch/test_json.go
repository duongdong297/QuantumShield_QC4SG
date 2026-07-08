package main

import (
	"encoding/json"
	"fmt"
	"os"
)

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

func main() {
	fileBytes, err := os.ReadFile(`d:\Project\QuantumShield\artifacts\data.json`)
	if err != nil {
		fmt.Println("Error reading file:", err)
		return
	}

	var data DashboardData
	if err := json.Unmarshal(fileBytes, &data); err != nil {
		fmt.Println("Error unmarshaling:", err)
		return
	}

	out, _ := json.MarshalIndent(data, "", "  ")
	fmt.Println(string(out))
}

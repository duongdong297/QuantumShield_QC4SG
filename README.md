# QuantumShield Health 🛡️
**AI-Powered Dengue Early Warning & Quantum Resource Allocation Platform**

## 1. Introduction
Dengue fever remains one of the most serious public health challenges across Southeast Asia, particularly in Vietnam, where seasonal outbreaks place significant pressure on hospitals, healthcare workers, and local public health agencies.

Despite advances in surveillance systems, public health responses are often reactive rather than proactive. Authorities typically respond after case numbers have already increased, leading to delayed interventions, overloaded hospitals, shortages of medical resources, and preventable infections. At the same time, healthcare resources such as hospital beds, diagnostic kits, medical personnel, and vector-control teams are limited and must be allocated carefully.

**QuantumShield Health** is a hybrid AI-Quantum public health platform designed to help authorities predict dengue outbreaks before they occur and optimize healthcare resource deployment to maximize outbreak containment while minimizing operational costs.

## 2. The Problem: Rising Dengue Burden in Vietnam
Vietnam experiences recurring dengue outbreaks every year, especially during rainy seasons. Key challenges include:
- Rapid outbreak escalation in urban and semi-urban areas.
- Limited visibility into future disease hotspots.
- Delayed intervention and response planning.
- Uneven healthcare capacity across provinces.
- Resource shortages during peak outbreaks.

Decision makers must determine: *Which district receives additional resources? How many? When? How should transportation costs be minimized?* This creates a large-scale combinatorial optimization problem that is extremely difficult to solve using traditional planning methods.

---

## 3. Our Solution & Current Implementation

QuantumShield Health consists of three integrated intelligence layers. **Currently, the prototype version of the project (this repository) has fully implemented Layer 1 and Layer 2, and is professionally containerized using Docker.**

### 🧠 Layer 1: AI Dengue Forecasting Engine
The forecasting engine predicts outbreak risks using multiple data sources (Epidemiological, Environmental, Geographic, and Mobility Indicators).
- **Code Implementation:** Built with Python (Pandas, Scikit-Learn) within AI scripts. The models process the data and output predictive results to a centralized file at `artifacts/data.json`.
- **Output:** 7-to-14-day outbreak risk forecasts for monitored regions.

### 📊 Layer 2: Public Health Risk Intelligence Dashboard
Predictions are transformed into actionable insights through a real-time Web dashboard seamlessly connected via WebSockets.
- **Code Implementation:**
  - **Backend (Edge Node):** Written in Golang, providing a lightweight WebSocket connection to push real-time data and a REST API to receive allocation commands.
  - **Frontend:** Built with React.js (Vite), Framer Motion, Recharts, and React-Leaflet (GeoJSON). Designed with a premium Dark Mode aesthetic.
- **Features in Prototype (Organized in 4 Navigation Modules):**
  - **1. Dashboard:** Central hub with real-time KPI metrics, Healthcare Demand Forecasting, a 7-Day Outbreak Trend chart, and Quantum-Optimized Actions for immediate resource dispatch.
  - **2. Outbreak Maps:** Interactive GIS map of all 63 provinces in Vietnam with a Live Threat Feed overlay and simulated UAV drone deployment capabilities.
  - **3. Resource Tables:** Detailed tabular view of epidemiological metrics (Risk Score, Mosquito Density, Temperature) and a Donut Chart for quick status distribution.
  - **4. Audit Logs:** A dedicated terminal-like UI directly within the web app to view system and human actions in real-time, backed by actual File I/O on the backend, with CSV export functionality.

### ⚛️ Layer 3: Quantum Resource Allocation Engine (Future Phase)
This layer determines how limited healthcare resources should be deployed based on optimization objectives (Minimize infections, Maximize coverage, Minimize costs). Formulated as a Quadratic Unconstrained Binary Optimization (QUBO) problem, we plan to apply QAOA (Quantum Approximate Optimization Algorithm) and D-Wave Hybrid Solvers to explore high-quality resource allocation strategies beyond classical OR-Tools/MILP limits.

---

## 4. Vision & Development Roadmap
QuantumShield Health aims to become Southeast Asia's intelligent public health operating system, expanding beyond Dengue to HFMD, Influenza, Malaria, and emerging infectious diseases.

- **Phase 1-2 (Months 1-6):** MVP Validation, Pilot Preparation, and Operational Decision Support.
- **Phase 3-4 (Months 7-18):** Provincial Pilot Deployment and Multi-Disease Expansion.
- **Phase 5-6 (Months 19-24):** Regional Scaling, Advanced Quantum Optimization, and ASEAN Expansion.

---

## 💻 Deployment & Experience Guide

The project is fully configured with a Microservices architecture and is 100% automated using Docker.

### Step 1: Start the System
Ensure **Docker Desktop** is installed and running on your machine. Open a Terminal (Git Bash/PowerShell) at the root directory of the project (`d:\Project\QuantumShield`) and run the following command:
```bash
docker-compose up -d --build
```
*(The system will automatically download the required environments, compile Go, build the static React package, and spin up all services seamlessly in the background).*

### Step 2: Access the Dashboard
Open your web browser and navigate to:
👉 **[http://localhost:3000](http://localhost:3000)**

### Step 3: Test Scenarios
To fully experience the architecture we have built, please explore our 4 core navigation modules:
1. **Dashboard (Real-time Streaming):** Observe the `7-Day Outbreak Trend` chart and the `Demand Forecasting` metrics. The UI updates smoothly in real-time via WebSocket data pushed from the Golang Backend. Click `Execute Action` under Quantum-Optimized Actions to dispatch resources.
2. **Outbreak Maps (Geospatial Intelligence):** Navigate to this tab to explore the interactive GIS map. Watch the `Live Threat Feed` update dynamically, and click `Deploy UAV` to simulate aerial reconnaissance.
3. **Resource Tables (Data Analysis):** Switch here to view a comprehensive breakdown of provincial risk scores, mosquito densities, and available beds, powered directly by our Golang In-memory database.
4. **Audit Logs (System Monitoring):** Open the Audit Logs tab to see a stunning Terminal UI. You will instantly see your previous "Execute Action" commands logged here with exact timestamps. Click `Export Logs (CSV)` to download a native report generated directly from the backend's File I/O system.

### 🛑 Stop the System
When you are done, you can stop the containers and free up memory by running:
```bash
docker-compose down
```

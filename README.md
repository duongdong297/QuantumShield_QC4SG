# QuantumShield Health
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

### Layer 1: AI Dengue Forecasting Engine
The forecasting engine predicts outbreak risks using multiple data sources (Epidemiological, Environmental, Geographic, and Mobility Indicators).
- **Code Implementation:** Built with Python (Pandas, Scikit-Learn) within AI scripts. The models process the data and output predictive results to a centralized file at `artifacts/data.json`.
- **Output:** 7-to-14-day outbreak risk forecasts for monitored regions.

### Layer 2: Public Health Risk Intelligence Dashboard
Predictions are transformed into actionable insights through a real-time Web dashboard.
- **Code Implementation:**
  - **Backend (Edge Node):** Written in Golang, providing a lightweight WebSocket connection to push real-time data and a REST API to receive allocation commands.
  - **Frontend:** Built with React.js (Vite), Framer Motion, Recharts, and React-Leaflet (GeoJSON).
- **Features in Prototype:**
  - **Risk Heatmaps:** Interactive map of all 63 provinces in Vietnam. Risk areas are automatically color-coded (red/orange) based on alert levels.
  - **Healthcare Demand Forecasting:** Real-time predictions of the required Hospital Beds, Testing Kits, and Medical Staff.
  - **AI Analytics Drawer:** A smart sliding drawer (opens from the right upon clicking the map) displaying deep insights: Aedes mosquito density, average temperature, and estimated peak outbreak time.
  - **Local Interventions (Command Execution):** Allows operators to issue resource allocation commands directly from the UI. The commands are sent to the Backend and securely logged in `backend/system_audit.log`.

### Layer 3: Quantum Resource Allocation Engine (Future Phase)
This layer determines how limited healthcare resources should be deployed based on optimization objectives (Minimize infections, Maximize coverage, Minimize costs). Formulated as a Quadratic Unconstrained Binary Optimization (QUBO) problem, we plan to apply QAOA (Quantum Approximate Optimization Algorithm) and D-Wave Hybrid Solvers to explore high-quality resource allocation strategies beyond classical OR-Tools/MILP limits.

---

## 4. Vision & Development Roadmap
QuantumShield Health aims to become Southeast Asia's intelligent public health operating system, expanding beyond Dengue to HFMD, Influenza, Malaria, and emerging infectious diseases.

- **Phase 1-2 (Months 1-6):** MVP Validation, Pilot Preparation, and Operational Decision Support.
- **Phase 3-4 (Months 7-18):** Provincial Pilot Deployment and Multi-Disease Expansion.
- **Phase 5-6 (Months 19-24):** Regional Scaling, Advanced Quantum Optimization, and ASEAN Expansion.

---

## Deployment & Experience Guide

The project is fully configured with a Microservices architecture and is 100% automated using Docker.

### Step 1: Start the System
Ensure **Docker Desktop** is installed and running on your machine. Open a Terminal (Git Bash/PowerShell) at the root directory of the project (`d:\Project\QuantumShield`) and run the following command:
```bash
docker-compose up -d --build
```
*(The system will automatically download the required environments, compile Go, build the static React package, and spin up all services seamlessly in the background).*

### Step 2: Access the Dashboard
Open your web browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

### Step 3: Test Scenarios
To fully experience the architecture we have built:
1. **Real-time Streaming Data:** Observe the `7-Day Outbreak Trend` chart and the `Demand Forecasting` table. You will see the chart lines fluctuate and the numbers update smoothly every 3 seconds due to the WebSocket data stream continuously pushed from the Golang Backend.
2. **Explore the GIS Map:** Hover over the provinces or red dots on the map to view the static Tooltip labels. The GeoJSON map automatically changes colors depending on the hotspot list.
3. **In-depth Analysis (AI Analytics Drawer):** **Click** directly on a disease hotspot or any Province on the map. An analysis drawer (`Locality Analysis`) will slide out smoothly from the right edge, containing AI predictions (e.g., Mosquito Density Level 4, Peak Time).
4. **Issue an Allocation Command:** Right inside the newly opened drawer, scroll down to *Local Interventions* and click the `Execute Local Action` button. A success notification (green Toast) will appear.
5. **Verify Edge Node Audit Log:** Open the `backend/system_audit.log` file in your Code Editor. You will see that the Golang Backend has accurately received your resource allocation command and logged it with an exact real-time timestamp!

### Stop the System
When you are done, you can stop the containers and free up memory by running:
```bash
docker-compose down
```

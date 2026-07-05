# QuantumShield Health: Frontend Architecture & Design Documentation

This document provides a comprehensive overview of the Frontend architecture, UI/UX design philosophy, and data flow mechanisms that power the **QuantumShield Command Center**.

---

## 1. Architecture Overview

### 🛠️ Technology Stack
The frontend is engineered for high performance, modularity, and real-time responsiveness using modern web technologies:
- **Core Framework:** React 18 & Vite (for blazing-fast HMR and optimized production builds).
- **Styling:** Tailwind CSS (utility-first CSS framework for rapid and consistent UI development).
- **Data Visualization:** Recharts (composable charting library for rendering statistical trends).
- **Geospatial Mapping:** React-Leaflet (rendering interactive GIS maps with GeoJSON data overlays).

### 🎨 UI/UX Design Principles
To simulate a highly realistic, military-grade medical response system, the UI was designed with the following principles:
- **Professional Dark Mode:** The interface utilizes deep, neutral color palettes (e.g., Midnight Navy and Soft Slate) to reduce eye strain during prolonged monitoring while ensuring critical alert colors (Neon Red, Warning Orange) stand out immediately.
- **Glassmorphism Elements:** Translucent panels and frosted glass effects are used on modal drawers and hovering elements to create a sense of depth and hierarchy, embodying a state-of-the-art Command Center aesthetic.

---

## 2. Data Flow & API Integration

### 🔗 Single Source of Truth
The QuantumShield frontend strictly adheres to a **Single Source of Truth** paradigm. Absolutely no epidemiological metrics or system logs are hardcoded (mocked) on the client side. All data is fetched dynamically from the Golang Edge Node (Backend) running on **Port 8080**. This ensures that operators are always looking at real, actionable, and mathematically processed data.

### 🔌 Core API Endpoints
The frontend consumes the following RESTful APIs and WebSocket streams:
- `GET /api/insight`: Fetches aggregated predictive insights and specific locality analytics for the Dashboard map.
- `GET /api/resources`: Retrieves the deeply sorted and calculated resource allocation matrices (Risk Scores, beds, mosquito density).
- `GET /api/logs`: Fetches the entire historical audit trail directly from the backend's persistent physical storage (`system_audit.jsonl`).
- `POST /api/action`: Sends resource allocation dispatch commands from the UI to the backend for execution and logging.
- `WS ws://localhost:8080/ws`: The core persistent tunnel pushing real-time KPI metrics and threat feeds.

---

## 3. Navigation Modules Breakdown

The user interface is segmented into four primary operational views, accessible via the main sidebar. Below is an in-depth breakdown of the UI components, interactions, and data architecture for each module.

### 🌐 3.1. Dashboard (Central Hub)
**Purpose:** The nerve center of the application, designed to give commanders an instant, 10,000-foot view of the national epidemiological state.

- **Key UI Components:**
  - **KPI Header Row:** Four critical metric cards displaying dynamic data (Coverage Percentage, Total Hotspots, Active Bed Demand, and Current Allocation Rate). These numbers pulse smoothly upon receiving WebSocket updates to indicate live data.
  - **7-Day Outbreak Trend (Area Chart):** A visually striking Recharts area chart rendered on a Dark Navy background (`#172b4d`). The line glows to represent predicted dengue cases from Monday to Sunday, providing a seamless visual forecast.
  - **Quantum-Optimized Actions Panel:** A dedicated intervention zone listing AI-recommended actions. Operators can instantly click `Execute Action`, which triggers a `POST /api/action` request to the backend.
- **Interactive Map & AI Analytics Drawer:**
  - Embedded directly into the dashboard is a **Geospatial RiskMap** utilizing GeoJSON boundaries.
  - **Interaction:** Clicking on any of the 63 provinces triggers a sleek, Glassmorphism-styled **"AI Analytics Drawer"** to slide in from the right edge of the screen (powered by Framer Motion).
  - **Drawer Content:** Displays deep localized metrics (Aedes Mosquito Density Level, Temperature, Peak Time) fetched via `GET /api/insight`, allowing commanders to analyze a hotspot without leaving the main dashboard.
- **Data Architecture:** Driven by `GET /api/insight` on mount, supplemented by real-time `ws://localhost:8080/ws` payloads.

### 🗺️ 3.2. Outbreak Maps (Geospatial Spread Intelligence)
**Purpose:** A dedicated, full-screen geospatial environment optimized for tracking the physical spread of the virus across geographic boundaries.

- **Key UI Components:**
  - **Full-Screen GIS Interface:** Utilizes React-Leaflet to project a highly detailed map of Vietnam. Regions are shaded automatically (from safe green to critical red) based on dynamic Risk Scores calculated by the backend.
  - **Predictive Timeline Slider:** An interactive slider that allows the operator to visualize the simulated spread of the outbreak over upcoming weeks based on AI models. As the user drags the slider, the map updates its color overlays.
  - **Live Threat Feed Overlay:** A translucent floating panel on the right side of the map. It acts as a real-time ticker displaying critical events (e.g., "New dengue cluster reported in Ho Chi Minh City"). Each event is color-coded by severity.
  - **'Deploy UAV' Simulation:** A high-tech intervention button. Clicking it initiates a UI simulation of drone aerial reconnaissance over a selected hotspot, complete with scanning animations and status updates.
- **Data Architecture:** The core geospatial boundaries are static GeoJSON (for rendering speed), while the severity weights and threat events are streamed dynamically via WebSocket.

### 📊 3.3. Resource Tables (Data Analytics)
**Purpose:** A heavy data-analytics view designed for logistics coordinators to assess provincial resource capabilities and deficits.

- **Key UI Components:**
  - **Status Distribution (Donut Chart):** Located at the top, a Recharts-powered Donut Chart provides a quick visual breakdown of the proportion of provinces in `Critical`, `Warning`, and `Safe` states.
  - **Top 5 Critical Provinces (Bar Chart):** A horizontal bar chart instantly highlighting the regions with the highest risk scores that require immediate medical resource allocation.
  - **Comprehensive Data Grid:** The lower half of the screen is dominated by a detailed, sortable table. It lists every province alongside its specific metrics: Risk Score (0-100), Mosquito Density Level, Ambient Temperature (°C), Beds Available, and a stylized Status Badge.
- **Data Architecture:** The frontend calls `GET /api/resources`. The Golang backend handles all the heavy computational lifting—sorting the array of 63 provinces by Risk Score descending—so the React frontend only needs to render the pre-processed payload.

### 🛡️ 3.4. Audit Logs (System Monitoring)
**Purpose:** A cybersecurity-style terminal interface designed for System Administrators to maintain absolute accountability and a tamper-proof trail of all platform operations.

- **Key UI Components:**
  - **Terminal Monitor Interface:** Styled to look like a hacker/sysadmin console (black background, monospace font). The log terminal automatically scrolls to the newest entry as events occur.
  - **Color-Coded Event Tagging:**
    - `[AI_ALERT]` (Neon Red): Machine learning anomaly detections.
    - `[HUMAN_ACTION]` (Emerald Green): Dispatch commands issued by commanders (e.g., clicking "Execute Action").
    - `[SYSTEM]` (Slate Gray): Backend initialization and database loading events.
  - **CSV Export Engine:** A critical enterprise feature. Clicking the "Export Logs (CSV)" button triggers an internal script that parses the JSON log data, formats it into a CSV blob, and initiates a native browser download without requiring an additional server trip.
- **Data Architecture:** To ensure absolute data integrity (bypassing potentially delayed WebSockets), this module explicitly calls `GET /api/logs`. The backend reads the historical data directly from the physical `system_audit.jsonl` file via File I/O operations and serves it to the frontend.

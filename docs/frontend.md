# QuantumShield Command Center: Frontend Architecture & UI/UX Documentation

This document provides a comprehensive, in-depth overview of the Frontend architecture, the UI/UX design philosophy, data flow mechanisms, and a detailed breakdown of all navigation modules that power the **QuantumShield Command Center**.

---

## 1. Architecture & Design Philosophy

### 🛠️ Technology Stack
The frontend is engineered for high performance, modularity, and real-time responsiveness to handle epidemiological and quantum computing data:
- **Core Framework:** React 18 & Vite (for blazing-fast Hot Module Replacement and highly optimized production builds).
- **Styling:** Tailwind CSS / Inline Styles (for rapid, component-scoped styling and consistent design language).
- **Data Visualization:** Recharts (composable charting library for rendering statistical trends and resource distribution).
- **Geospatial Mapping:** React-Leaflet (rendering interactive GIS maps with GeoJSON data overlays for epidemiological tracking).
- **Animations:** Framer Motion (for fluid micro-interactions, modal pop-ins, and layout transitions).

### 🎨 UI/UX Design Principles
Designed to simulate a highly realistic, military-grade medical response system ("Command Center"), the UI adheres to the following principles:
- **Professional Dark Mode:** The interface utilizes deep, neutral color palettes (Midnight Navy, Slate) to reduce eye strain during 24/7 monitoring, ensuring that critical alert colors (Neon Red for CRITICAL, Warning Orange for HIGH RISK) stand out immediately.
- **Glassmorphism & Depth:** Translucent panels, blurred backdrops (backdrop-filter), and layered shadows are used on modal drawers and floating cards to establish a sense of depth, hierarchy, and a premium "state-of-the-art" aesthetic.
- **Dynamic Interactivity:** Every interactive element features hover states, active transitions, and clear visual feedback, minimizing cognitive load for emergency operators.

---

## 2. Unified Pipeline & Data Flow

### 🔗 Single Source of Truth
The QuantumShield frontend strictly adheres to a **Single Source of Truth** paradigm. All epidemiological metrics, predictive forecasts, and AI recommendations are dynamically fetched from the Golang Edge Node / Python Quantum Pipeline running on the backend. This guarantees that operators are making decisions based on live, mathematically processed data.

### 🔌 Data Flow Mechanisms
- `GET /api/allocation`: Fetches the entire Quantum Computing allocation output, which includes simulated risk scores, coverage percentages, and AI-generated action recommendations.
- `GET /api/insight`: Fetches aggregated predictive insights and specific locality analytics for map-based interactions.
- `GET /api/resources`: Retrieves sorted resource matrices (Risk Scores, beds, mosquito density).
- `GET /api/logs`: Fetches the entire historical audit trail from persistent storage.
- `POST /api/action`: Sends resource allocation dispatch commands (when clicking "Execute") from the UI to the backend for auditing and execution.

---

## 3. Navigation Modules Breakdown

The user interface is segmented into **five primary operational views**, accessible via the main sidebar. Each tab represents a crucial step in the decision-making pipeline.

### 🌐 3.1. Dashboard (Central Hub)
**Purpose:** The nerve center of the application, designed to give commanders an instant, 10,000-foot macro view of the national epidemiological state.

- **KPI Header Row (Summary Cards):** Critical metric cards displaying dynamic data such as "Coverage Percentage", "Total Hotspots", "Active Bed Demand", and "Current Allocation Rate". These numbers react to the AI allocation pipeline.
- **Quantum Analytics Panel:** A dedicated module displaying the mathematical efficiency of the Quantum Algorithm vs Classical Baselines (e.g., "+X% Risk Coverage Improvement") alongside interactive sensitivity analysis bars.
- **Action Panel (Quick Execution):** A list of top priority regions requiring immediate attention. Operators can instantly click `Execute`, triggering a `POST /api/action` request and displaying a success toast notification.
- **7-Day Outbreak Trend (Area Chart):** A striking Recharts area chart rendered on a Dark Navy background, visualizing predicted dengue cases from Monday to Sunday.

### 🗺️ 3.2. Outbreak Maps (Geospatial Spread Intelligence)
**Purpose:** A dedicated geospatial environment optimized for tracking the physical spread of the virus across geographic boundaries.

- **Full-Screen GIS Interface:** Utilizes React-Leaflet to project a highly detailed map of Vietnam. Regions are color-coded automatically based on dynamic Risk Scores calculated by the backend.
- **Interactive Region Selection:** Clicking on any province immediately updates the global state and triggers a localized data card showing specific metrics for that province.
- **Predictive Timeline Slider:** An interactive slider that allows the operator to visualize the simulated spread of the outbreak over upcoming weeks.
- **Live Threat Feed Overlay:** A translucent floating panel acting as a real-time ticker, displaying critical events (e.g., "New dengue cluster reported").
- **'Deploy UAV' Simulation:** A high-tech intervention button initiating a UI simulation of drone aerial reconnaissance over a selected hotspot.

### 🧠 3.3. Decision Protocol (AI Pipeline & Recommendations)
**Purpose:** A completely transparent view into the "Brain" of the QuantumShield system. This module visualizes the unified pipeline from Data -> Risk Assessment -> Actionable Recommendations.

- **Trigger Thresholds (Luật kích hoạt dịch):** Displays the rigid Decision Protocol used by the AI. It outlines four distinct tiers of risk:
  - **CRITICAL (Rate > 50):** Activate emergency response; deploy staff teams immediately.
  - **HIGH RISK (Rate > 25):** Prepare medical resources; pre-position supplies.
  - **MEDIUM RISK (Rate > 10):** Increase surveillance; early testing.
  - **LOW RISK (Rate < 10):** Routine monitoring.
- **Actionable Recommendations Table:** A dynamic, scrollable list populated directly from the backend's Quantum Pipeline (`allocationData.recommendations`). It maps every evaluated province to its calculated Incidence Rate, assigns it a tier (color-coded), and provides the specific text directive for medical staff.
- **Execution Workflow:** Each recommendation includes an `Execute` button, allowing operators to directly approve and dispatch the AI's suggested action from this screen.

### 📊 3.4. Resource Tables (Data Analytics)
**Purpose:** A heavy data-analytics view designed for logistics coordinators to assess provincial resource capabilities and deficits at a granular level.

- **Status Distribution (Donut Chart):** A Recharts-powered Donut Chart providing a visual breakdown of the proportion of provinces in `Critical`, `Warning`, and `Safe` states.
- **Top 5 Critical Provinces (Bar Chart):** A horizontal bar chart instantly highlighting the regions with the highest risk scores that require immediate medical resource allocation.
- **Comprehensive Data Grid:** A detailed, sortable table listing every province alongside its specific metrics: Risk Score (0-100), Mosquito Density Level, Ambient Temperature (°C), Beds Available, and a stylized Status Badge.

### 🛡️ 3.5. Audit Logs (System Monitoring)
**Purpose:** A cybersecurity-style terminal interface designed for System Administrators to maintain absolute accountability and a tamper-proof trail of all platform operations.

- **Terminal Monitor Interface:** Styled to emulate a hacker/sysadmin console (black background, monospace font). The log terminal automatically scrolls to the newest entry as events occur.
- **Color-Coded Event Tagging:**
  - `[AI_ALERT]` (Neon Red): Machine learning anomaly detections.
  - `[HUMAN_ACTION]` (Emerald Green): Dispatch commands issued by commanders.
  - `[SYSTEM]` (Slate Gray): Backend initialization and database loading events.
- **CSV Export Engine:** An enterprise feature allowing operators to export logs. Clicking the "Export Logs (CSV)" button triggers an internal script that parses the JSON log data into a CSV blob and initiates a native browser download.

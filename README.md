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

QuantumShield Health consists of three integrated intelligence layers. **Hiện tại, phiên bản prototype của dự án (repository này) đã triển khai hoàn thiện Layer 1 và Layer 2, được đóng gói chuyên nghiệp bằng Docker.**

### 🧠 Layer 1: AI Dengue Forecasting Engine
The forecasting engine predicts outbreak risks using multiple data sources (Epidemiological, Environmental, Geographic, and Mobility Indicators).
- **Code Implementation:** Xây dựng bằng Python (Pandas, Scikit-Learn) trong các script AI. Các mô hình sẽ xử lý dữ liệu và xuất kết quả dự báo ra tập tin tập trung tại `artifacts/data.json`.
- **Output:** Dự báo 7-14 ngày về rủi ro dịch bệnh cho các khu vực giám sát.

### 📊 Layer 2: Public Health Risk Intelligence Dashboard
Predictions are transformed into actionable insights thông qua giao diện Web thời gian thực.
- **Code Implementation:**
  - **Backend (Edge Node):** Viết bằng Golang, cung cấp kết nối WebSocket siêu nhẹ đẩy dữ liệu thời gian thực và REST API nhận lệnh điều phối.
  - **Frontend:** Xây dựng bằng React.js (Vite), Framer Motion, Recharts và React-Leaflet (GeoJSON).
- **Features in Prototype:**
  - **Risk Heatmaps:** Bản đồ tương tác 63 tỉnh thành Việt Nam. Các khu vực rủi ro được tự động nhuộm màu cảnh báo (đỏ/cam).
  - **Healthcare Demand Forecasting:** Dự đoán số lượng Giường bệnh, Kit xét nghiệm và Nhân lực y tế cần thiết theo thời gian thực.
  - **AI Analytics Drawer:** Ngăn kéo thông minh (trượt từ phải sang khi click vào bản đồ) hiển thị Insights chuyên sâu: Mật độ muỗi vằn, nhiệt độ, thời gian đạt đỉnh dịch.
  - **Local Interventions (Command Execution):** Cho phép người điều hành phát lệnh phân bổ nguồn lực trực tiếp tại giao diện. Lệnh sẽ được gửi về Backend và lưu trữ bảo mật tại file `backend/system_audit.log`.

### ⚛️ Layer 3: Quantum Resource Allocation Engine (Future Phase)
This layer determines how limited healthcare resources should be deployed based on optimization objectives (Minimize infections, Maximize coverage, Minimize costs). Formulated as a Quadratic Unconstrained Binary Optimization (QUBO) problem, we plan to apply QAOA (Quantum Approximate Optimization Algorithm) and D-Wave Hybrid Solvers to explore high-quality resource allocation strategies beyond classical OR-Tools/MILP limits.

---

## 4. Vision & Development Roadmap
QuantumShield Health aims to become Southeast Asia's intelligent public health operating system, expanding beyond Dengue to HFMD, Influenza, Malaria, and emerging infectious diseases.

- **Phase 1-2 (Months 1-6):** MVP Validation, Pilot Preparation, and Operational Decision Support.
- **Phase 3-4 (Months 7-18):** Provincial Pilot Deployment and Multi-Disease Expansion.
- **Phase 5-6 (Months 19-24):** Regional Scaling, Advanced Quantum Optimization, and ASEAN Expansion.

---

## 💻 Hướng Dẫn Khởi Chạy & Trải Nghiệm Hệ Thống

Dự án đã được thiết lập kiến trúc Microservices và đóng gói Docker tự động 100%.

### Bước 1: Khởi động hệ thống
Đảm bảo máy tính của bạn đã bật **Docker Desktop**. Mở Terminal (Git Bash/PowerShell) tại thư mục gốc của dự án (`d:\Project\QuantumShield`) và chạy lệnh:
```bash
docker-compose up -d --build
```
*(Hệ thống sẽ tự tải các file môi trường, biên dịch Go, build gói React tĩnh, và chạy tất cả dịch vụ lên nền tảng Docker ngầm).*

### Bước 2: Truy cập Dashboard
Mở trình duyệt web của bạn và truy cập vào địa chỉ:
👉 **[http://localhost:3000](http://localhost:3000)**

### Bước 3: Kịch bản Trải nghiệm (Test Scenarios)
Để cảm nhận trọn vẹn kiến trúc mà dự án đã code:
1. **Dữ liệu Thời gian thực (Real-time Streaming):** Quan sát biểu đồ `7-Day Outbreak Trend` và bảng `Demand Forecasting`. Bạn sẽ thấy biểu đồ uốn lượn và các con số tự động biến động mỗi 3 giây nhờ luồng dữ liệu WebSocket truyền liên tục từ Golang Backend.
2. **Khám phá Bản đồ GIS:** Rê chuột vào các tỉnh/chấm đỏ trên bản đồ để xem nhãn Tooltip tĩnh. Bản đồ GeoJSON sẽ tự động thay đổi màu sắc phụ thuộc vào danh sách điểm nóng.
3. **Phân tích Chuyên sâu (AI Analytics Drawer):** **Click** trực tiếp vào một điểm dịch hoặc Tỉnh bất kỳ trên bản đồ. Một ngăn kéo phân tích (Locality Analysis) sẽ trượt mượt mà ra từ cạnh phải, chứa dữ liệu dự đoán AI (Mật độ muỗi vằn mức 4, Thời gian đạt đỉnh...).
4. **Phát lệnh Điều phối:** Ngay trong ngăn kéo vừa mở, cuộn xuống mục *Local Interventions* và nhấn nút `Execute Local Action`. Một thông báo thành công (Toast xanh lá) sẽ xuất hiện.
5. **Kiểm tra Edge Node Audit Log:** Mở file `backend/system_audit.log` trong thư mục code. Bạn sẽ thấy Backend Golang đã tiếp nhận chính xác mệnh lệnh điều phối nguồn lực của bạn và ghi lại kèm Mốc thời gian thực chuẩn xác!

### 🛑 Dừng Hệ Thống
Khi không sử dụng nữa, bạn có thể tắt các container đi bằng lệnh:
```bash
docker-compose down
```

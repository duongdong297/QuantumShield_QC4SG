# QuantumShield - Data Integration Contract

## Giới thiệu
Tài liệu này quy định cấu trúc chuẩn của file `data.json` mà Team AI (Python) cần tạo ra sau khi thực thi các mô hình dự đoán. File JSON này sẽ đóng vai trò là cầu nối giao tiếp tĩnh (Contract), được Team Backend (Go) đọc và phục vụ dữ liệu trực tiếp cho hệ thống Frontend.

## Cấu trúc JSON chi tiết
Dưới đây là cấu trúc bắt buộc của file `data.json`. Dữ liệu được chia thành 3 phần chính:

```json
{
  "alert": {
    "active": true,
    "region": "District 3 - Urban",
    "probability": 88,
    "message": "Dengue outbreak probability exceeded threshold..."
  },
  "forecast": {
    "beds": 120,
    "kits": 500,
    "staffTeams": 3
  },
  "hotspots": [
    {
      "lat": 21.0000,
      "lng": 105.8200,
      "region": "District 3 - Urban",
      "riskScore": 88
    },
    {
      "lat": 21.0285,
      "lng": 105.8542,
      "region": "District 1 - Central",
      "riskScore": 65
    },
    {
      "lat": 21.0500,
      "lng": 105.8800,
      "region": "District 5 - Suburb",
      "riskScore": 42
    }
  ]
}
```

### Chi tiết các thuộc tính:
*   **alert** (Object):
    *   `active` (boolean): Trạng thái cảnh báo.
    *   `region` (string): Khu vực bị ảnh hưởng chính.
    *   `probability` (number): Xác suất bùng phát dịch.
    *   `message` (string): Lời cảnh báo chi tiết.
*   **forecast** (Object):
    *   `beds` (number): Dự báo số giường bệnh bổ sung.
    *   `kits` (number): Dự báo số kit test cần thiết.
    *   `staffTeams` (number): Số lượng đội y tế lưu động cần phân bổ.
*   **hotspots** (Array): Danh sách các điểm nóng nguy cơ cao.
    *   `lat` (number): Vĩ độ.
    *   `lng` (number): Kinh độ.
    *   `region` (string): Tên địa bàn/khu vực.
    *   `riskScore` (number): Chỉ số rủi ro (0-100).

## Next Steps
> **Lưu ý quan trọng:** Trong tương lai, file này sẽ được thay thế bằng kiến trúc **gRPC** hoặc **Kafka stream** để đạt tốc độ realtime thực sự giữa các microservices.

# Course Registration System (CRS) - Fullstack Portal

Chào mừng bạn đến với hệ thống Đăng ký Học phần (CRS)! 🚀
Đây là giải pháp toàn diện giúp sinh viên đăng ký môn học và phòng đào tạo quản lý chương trình học một cách hiệu quả, bảo mật và hiện đại.

---

## 🌟 Tính năng nổi bật (Update)

Hệ thống vừa được nâng cấp với các tính năng vượt trội:

### 🔐 Quản trị & Bảo mật
*   **Quản lý Tài khoản Nội bộ (Mới):** Quản trị viên (Admin) có thể tạo, quản lý và xóa tài khoản cho cán bộ phòng đào tạo trực tiếp trên giao diện (Frontend), thay vì thao tác qua cơ sở dữ liệu.
*   **Bảo mật Hardened:** Toàn bộ thông tin nhạy cảm (JWT Secret, DB Config) đã được chuyển vào biến môi trường `.env`.
*   **Phân quyền (RBAC):** Hệ thống phân quyền chặt chẽ giữa Admin, Academic Office và Student ở cả cấp độ API và Giao diện.

### ⚡ Hiệu năng & Trải nghiệm (UX)
*   **Debounce Search (Mới):** Tính năng tìm kiếm thông minh tại tất cả các module. Hệ thống tự động tối ưu hóa lượt gọi API, chỉ thực hiện tìm kiếm khi người dùng ngừng gõ, giúp ứng dụng chạy cực mượt.
*   **Bộ lọc nâng cao:** Lọc môn học theo học kỳ, cấp độ (Đại học/Sau đại học), và trạng thái đăng ký.
*   **Giao diện Hiện đại:** Xây dựng trên nền tảng React + Bootstrap 5 với phong cách thiết kế chuyên nghiệp, hỗ trợ responsive hoàn hảo.

---

## 🛠️ Công nghệ sử dụng

*   **Frontend:** React, Axios, Bootstrap 5, FontAwesome, React Router.
*   **Backend:** Node.js (Express), JSON Web Token (JWT).
*   **Database:** PostgreSQL.
*   **Gateway:** Kong API Gateway (Dockerized).
*   **DevOps:** Docker, Docker Compose.

---

## 🚀 Hướng dẫn chạy hệ thống

### 1. Yêu cầu hệ thống
*   **Docker Desktop** (Đã bao gồm Docker Compose).

### 2. Cài đặt & Khởi chạy
1.  **Clone dự án:**
    ```bash
    git clone https://github.com/cauchunhovuive/Systems-Analysis-and-Design.git
    cd Systems-Analysis-and-Design
    ```

2.  **Cấu hình biến môi trường:**
    Tạo file `.env` tại thư mục gốc với nội dung:
    ```env
    POSTGRES_USER=admin
    POSTGRES_PASSWORD=password123
    POSTGRES_DB=crs_db
    DB_USER=admin
    DB_PASSWORD=password123
    DB_HOST=postgres-db
    DB_PORT=5432
    DB_NAME=crs_db
    JWT_SECRET=your-super-secret-key-12345
    ```

3.  **Khởi động bằng Docker:**
    ```bash
    docker-compose up --build
    ```
    Hệ thống sẽ tự động khởi tạo Database, Backend và Frontend.

### 3. Truy cập
*   **Frontend (Portal):** `http://localhost:5173`
*   **Backend API:** `http://localhost:3000/api`

> **Lưu ý:** Phần cấu hình `Kong Gateway` trong `docker-compose.yml` đang được comment lại. Nếu bạn muốn bật Kong, hãy mở lại các service `kong-gateway`, `kong-configurator`, `kong-db` và đảm bảo thêm biến môi trường cho Kong.

---

## 🔑 Tài khoản thử nghiệm (Default Data)

Hệ thống được tự động tạo sẵn các tài khoản mẫu để kiểm thử:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `superadmin@mail.com` | `password123` |
| **Student** | `a@mail.com` | `password123` |

> **Lưu ý:** Admin có thể tạo thêm tài khoản **Academic Office** hoặc **Student** mới thông qua trang **Quản lý Tài khoản** trên Dashboard.

---

## 📖 Cấu trúc thư mục chính

*   `services/frontend`: Mã nguồn React (Giao diện người dùng).
*   `services/backend-app`: Mã nguồn Node.js Express (Xử lý logic & API).
*   `db-init/init.sql`: Script khởi tạo cấu trúc database và dữ liệu mẫu.
*   `kong/`: Cấu hình cho API Gateway.

---

## 📈 Quy trình nghiệp vụ cốt lõi

1.  **Admin:** Đăng nhập -> Quản lý tài khoản cán bộ -> Theo dõi tổng quan hệ thống.
2.  **Academic Office:** Quản lý danh mục môn học -> Duyệt/Từ chối đăng ký của sinh viên -> Xuất báo cáo CSV.
3.  **Student:** Đăng ký tài khoản -> Tìm kiếm môn học -> Đăng ký học phần (Hệ thống tự động kiểm tra trùng lịch và sĩ số) -> Xem thời khóa biểu cá nhân.

---
*Phát triển bởi nhóm phân tích thiết kế hệ thống - 2026*

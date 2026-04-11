# 🎓 Course Registration System (CRS)

Một hệ thống đăng ký học phần trực tuyến toàn diện dành cho sinh viên đại học. Dự án được xây dựng theo kiến trúc Microservices thu nhỏ, sử dụng **Kong API Gateway**, bảo mật bằng **JWT**, và được đóng gói hoàn toàn bằng **Docker**.

## ✨ Các tính năng nổi bật (Killer Features)

- **🛡️ API Gateway (Kong):** Toàn bộ traffic từ Frontend đều đi qua Kong (Port 8000) để routing vào Backend nội bộ, đảm bảo tính bảo mật và chuẩn kiến trúc hệ thống.
- **🚦 Hệ thống Waitlist (Hàng chờ tự động):** Khi lớp đầy, sinh viên đăng ký sẽ tự động được đưa vào trạng thái `PENDING`. Khi có người hủy môn, hệ thống tự động đôn người chờ sớm nhất lên `SUCCESS` thông qua Database Transaction.
- **🔒 Chống Race Condition:** Sử dụng kỹ thuật Pessimistic Locking (`SELECT ... FOR UPDATE`) trong PostgreSQL để đảm bảo không bao giờ xảy ra tình trạng đăng ký vượt quá sĩ số (Capacity) khi có hàng ngàn request cùng lúc.
- **📅 Interactive Timetable:** Thời khóa biểu trực quan dạng lưới (Grid). Tự động tính toán vị trí và chiều cao của môn học dựa trên giờ bắt đầu và kết thúc. Hỗ trợ xem chi tiết bằng Modal Popup.
- **🔍 Real-time Search:** Tìm kiếm môn học theo tên, mã môn hoặc giảng viên với kỹ thuật Debounce tối ưu hiệu năng.

---

## 💻 Công nghệ sử dụng (Tech Stack)

- **Frontend:** ReactJS (Vite), Bootstrap 5, React-Hot-Toast, Axios.
- **Backend:** Node.js, Express.js, JWT (JSON Web Token), Bcryptjs.
- **Database:** PostgreSQL.
- **Infrastructure:** Docker, Docker Compose, Kong API Gateway.

---

## 🛠 Yêu cầu hệ thống (Prerequisites)

Vì toàn bộ dự án đã được container hóa, bạn **KHÔNG CẦN** cài đặt Node.js, React hay PostgreSQL trên máy tính. Bạn chỉ cần cài đặt duy nhất:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Đảm bảo Docker đang chạy ngầm).
- Git (để clone project).

---

## 🚀 Hướng dẫn cài đặt và chạy dự án (Getting Started)

Chỉ với 3 bước đơn giản, hệ thống sẽ khởi chạy hoàn hảo trên máy của bạn:

### Bước 1: Clone mã nguồn
Mở Terminal/Command Prompt và chạy lệnh:
```bash
git clone https://github.com/buidwcmah21/CRS.git
cd CRS
```

### Bước 2: Cấu hình biến môi trường (.env)
Tạo một file có tên là `.env` tại thư mục gốc của dự án (ngang hàng với file `docker-compose.yml`) và dán nội dung sau vào:

```env
# Database Config
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres-db
DB_PORT=5432
DB_NAME=crs_db

# Backend Config
PORT=3000
JWT_SECRET=crs_secret_key_2024_thanh_cong_mvp
FRONTEND_ORIGIN=http://localhost:5173
```

### Bước 3: Khởi chạy hệ thống bằng Docker
Chạy lệnh sau để Docker tự động tải các image, cài đặt thư viện và khởi động toàn bộ hệ thống:
```bash
docker-compose up -d --build
```
*(Quá trình này có thể mất 1-3 phút cho lần chạy đầu tiên).*

---

## 🌐 Truy cập ứng dụng

Sau khi lệnh trên chạy xong (các container đều báo `Started` hoặc `Healthy`), bạn có thể truy cập:

- **Giao diện người dùng (Frontend):** [http://localhost:5173](http://localhost:5173)
- **API Gateway (Kong):** `http://localhost:8000/api`

### 🔑 Tài khoản Test mặc định
Hệ thống đã được nạp sẵn dữ liệu mẫu (Seed data). Bạn có thể sử dụng các tài khoản sau để đăng nhập ngay lập tức:

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@gmail.com` | `123456` |
| **Phòng Đào tạo** | `office@gmail.com` | `123456` |
| **Sinh viên** | `student@gmail.com` | `123456` |

*(Hoặc bạn có thể tự bấm vào nút "Register a new student account" trên giao diện để tạo tài khoản mới).*

---

## 🧪 Hướng dẫn Test luồng Waitlist (Dành cho Giảng viên chấm bài)

Để kiểm chứng tính năng Hàng chờ tự động, thầy/cô có thể thực hiện kịch bản sau:

1. Đăng nhập bằng tài khoản `student@gmail.com`.
2. Vào tab **All Courses**, tìm môn **Database Systems** (Môn này được cấu hình sĩ số tối đa chỉ có **2** người).
3. Bấm **Register**. Hệ thống sẽ hiện thông báo màu vàng: *"Lớp đã đầy, bạn đã được đưa vào hàng chờ"*.
4. Vào tab **My Enrollments**, môn học sẽ hiện trạng thái **PENDING** (Màu vàng).
5. Mở một trình duyệt ẩn danh khác, đăng nhập bằng `admin@gmail.com` (tài khoản này đã đăng ký sẵn môn đó từ trước).
6. Vào **My Enrollments** của Admin, bấm nút **Drop** để hủy môn Database Systems.
7. Quay lại màn hình của `student@gmail.com`, đợi 5 giây (hệ thống tự động làm mới) hoặc F5. Trạng thái môn học sẽ tự động nhảy từ **PENDING** sang **SUCCESS** (Màu xanh).
8. Vào tab **My Timetable**, môn học vừa được đôn lên SUCCESS sẽ tự động xuất hiện trên lịch học.

---

## 🛑 Xử lý sự cố thường gặp (Troubleshooting)

**1. Lỗi trùng cổng (Port is already allocated):**
- Nếu máy bạn đã cài sẵn PostgreSQL nội bộ, cổng 5432 có thể bị trùng. Dự án đã được cấu hình map ra cổng **5433** trên máy host (`5433:5432`) trong file `docker-compose.yml` để tránh lỗi này.

**2. Muốn reset lại toàn bộ dữ liệu (Clean Database):**
Nếu bạn muốn xóa sạch dữ liệu đã test để hệ thống chạy lại file `init.sql` từ đầu, hãy chạy lệnh:
```bash
docker-compose down -v
docker-compose up -d --build
```

---

*Dự án được phát triển bởi Bùi Đức Mạnh.*
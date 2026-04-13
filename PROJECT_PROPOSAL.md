# Project Proposal — Course Registration System (CRS)

## 📋 THÔNG TIN NHÓM

### Thành viên
- **Thành viên 1:** Bùi Đức Mạnh - 23001025
- **Thành viên 2:** Nguyễn Di Phi - 23001305
- **Thành viên 3:** Hồ Long Giang - 23694641
- **Thành viên 4:** Nguyễn Tuấn Phát - 22000625

### Repository
🔗 **Git Repository:** (https://github.com/cauchunhovuive/Systems-Analysis-and-Design)

> **⚠️ Lưu ý:** Repository được tạo một lần duy nhất. Các thay đổi về link repo sẽ bị trừ điểm.

---

## 🎓 MÔ TẢ DỰ ÁN

### Ý tưởng

**Course Registration System (CRS)** là hệ thống đăng ký học phần trực tuyến toàn diện dành cho sinh viên đại học. Hệ thống cho phép:
- 📚 Sinh viên xem danh sách môn học hiện có
- ✍️ Đăng ký học phần với kiểm tra tự động (trùng lịch, sĩ số, ...)
- 📅 Theo dõi lịch học cá nhân dạng **timetable grid** (lưới tuần)
- 🔄 Quản lý **hàng chờ tự động** khi lớp học đã đầy

### Lý do chọn project

✅ **Bài toán thực tế** — Sát với nghiệp vụ của các trường đại học Việt Nam

✅ **Độ phức tạp vừa phải** — Đủ để áp dụng:
- Kiến trúc **Microservices** (Frontend, Backend, Gateway)
- **API Gateway (Kong)** để quản lý tập trung traffic
- Xử lý **đồng thời** (concurrent requests) với PostgreSQL Transaction
- **JWT authentication** + Role-based access control

✅ **Nhiều kỹ thuật quan trọng:**
- Database Transaction (ACID properties)
- Pessimistic Locking (`SELECT ... FOR UPDATE`)
- Real-time data synchronization (Waitlist)
- RESTful API design

### Điểm khác biệt

| Tính năng | CRS | Hệ thống thông thường |
|-----------|-----|----------------------|
| **API Gateway** | ✅ Kong 3.4 (DB-less mode) | ❌ Direct call từ Frontend |
| **Waitlist tự động** | ✅ Transaction-based | ❌ Thủ công từ Admin |
| **Race Condition** | ✅ Pessimistic Locking | ❌ Có rủi ro |
| **Timetable view** | ✅ Grid layout (lưới tuần) | ❌ Danh sách thuần túy |
| **Container hóa** | ✅ Docker Compose (1 lệnh) | ❌ Setup thủ công |

---

## 🏗️ PHÂN TÍCH & THIẾT KẾ

### 1. Kiến trúc hệ thống

**Kiến trúc Monorepo** — 1 repository chứa toàn bộ services:

```
CRS/
├── docker-compose.yml              # Orchestration
├── .env                            # Biến môi trường
│
├── db-init/
│   └── init.sql                    # Schema + Seed data
│
├── kong/
│   ├── kong.yml                    # Kong routing config
│   └── configure-kong.sh           # Setup script
│
└── services/
    ├── backend-app/                # Node.js REST API
    │   ├── src/
    │   │   ├── config/db.js        # PostgreSQL connection
    │   │   ├── controllers/        # Request handlers
    │   │   ├── services/           # Business logic
    │   │   ├── repositories/       # Database queries
    │   │   ├── routes/             # API endpoints
    │   │   ├── middleware/         # Auth, role check
    │   │   └── app.js              # Express setup
    │   └── Dockerfile
    │
    └── frontend/                   # React SPA
        ├── src/
        │   ├── pages/              # Route pages
        │   ├── components/         # Reusable UI
        │   ├── AuthProvider.jsx    # Auth state
        │   ├── Routes.jsx          # Route config
        │   └── App.jsx
        └── Dockerfile
```

**Luồng request:**

```
┌─────────────────────────┐
│   React Browser (Port 5173)
└────────────┬────────────┘
             │ (all requests)
             ▼
┌─────────────────────────┐
│  Kong API Gateway (8000) │ ← JWT Validation, Routing
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│  Express Backend (3000)  │ ← Business logic
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│   PostgreSQL (5432)      │ ← Data storage
└─────────────────────────┘
```

**Tech Stack:**

| Lớp | Công nghệ | Phiên bản | Vai trò |
|-----|-----------|----------|--------|
| **Frontend** | React 18 | 18.2.0 | SPA, UI components |
| | Vite | 5.2.0 | Build tool, dev server |
| | TanStack Query | 5.28.14 | Data fetching, caching |
| | Bootstrap 5 | 5.3.3 | CSS framework |
| | React Router | 6.22.3 | Client-side routing |
| **Backend** | Node.js | 18+ | Runtime |
| | Express.js | 4.19.2 | REST API framework |
| | jsonwebtoken | 9.0.2 | JWT token generation |
| | bcryptjs | 2.4.3 | Password hashing |
| | pg (node-postgres) | 8.11.5 | PostgreSQL driver |
| **Database** | PostgreSQL | 16-alpine | Data storage |
| **Gateway** | Kong | 3.4 | API routing + JWT validation |
| **Container** | Docker | Latest | Application containerization |
| **Orchestration** | Docker Compose | 3.8 | Multi-container management |

---

### 2. Database Schema (ERD)

**Bảng `users`** — Thông tin người dùng

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|----------|-------|
| `id` | SERIAL | PRIMARY KEY | ID tự tăng |
| `email` | VARCHAR(50) | NOT NULL, UNIQUE | Email đăng nhập |
| `password_hash` | VARCHAR(255) | NOT NULL | Mật khẩu bcrypt (14 rounds) |
| `full_name` | VARCHAR(50) | NOT NULL | Họ và tên |
| `role` | user_role | NOT NULL | STUDENT / ACADEMIC_OFFICE / ADMIN |
| `address` | VARCHAR(100) | | Địa chỉ (tuỳ chọn) |
| `phone` | VARCHAR(10) | | Số điện thoại (tuỳ chọn) |
| `dob` | DATE | | Ngày sinh (tuỳ chọn) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Thời gian tạo |

**Bảng `courses`** — Thông tin môn học

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|----------|-------|
| `id` | SERIAL | PRIMARY KEY | ID tự tăng |
| `course_code` | VARCHAR(10) | NOT NULL | Mã môn (VD: CO3001) |
| `course_name` | VARCHAR(50) | NOT NULL | Tên môn học |
| `group_code` | VARCHAR(10) | NOT NULL | Mã nhóm lớp (VD: CC01) |
| `semester` | semester_enum | NOT NULL | HK1 / HK2 / HK3 |
| `academic_year` | VARCHAR(10) | NOT NULL | Năm học (VD: 2023-2024) |
| `description` | TEXT | | Mô tả chi tiết |
| `capacity` | INTEGER | NOT NULL | Sĩ số tối đa |
| `lecturer_name` | VARCHAR(50) | NOT NULL | Tên giảng viên |
| `day_of_week` | day_of_week_enum | NOT NULL | Thứ học (MONDAY-SUNDAY) |
| `start_time` | TIME | NOT NULL | Giờ bắt đầu (VD: 07:00:00) |
| `end_time` | TIME | NOT NULL | Giờ kết thúc (VD: 09:00:00) |
| `level` | level_enum | NOT NULL | Undergraduate / Graduate |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Thời gian tạo |
| **UNIQUE** | `(course_code, group_code, semester, academic_year)` | | Không trùng lặp |

**Bảng `enrollments`** — Đăng ký học phần

| Cột | Kiểu | Ràng buộc | Mô tả |
|-----|------|----------|-------|
| `id` | SERIAL | PRIMARY KEY | ID tự tăng |
| `student_id` | INTEGER | FK → users.id ON DELETE CASCADE | Sinh viên |
| `course_id` | INTEGER | FK → courses.id ON DELETE CASCADE | Môn học |
| `status` | status_enum | NOT NULL | SUCCESS / PENDING / FAILED |
| `enrollment_date` | TIMESTAMPTZ | DEFAULT NOW() | Thời gian đăng ký |
| **UNIQUE** | `(student_id, course_id)` | | 1 sinh viên = 1 lần/môn |

**Các ENUM type:**

```sql
user_role:         STUDENT | ACADEMIC_OFFICE | ADMIN
day_of_week_enum:  MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY
status_enum:       SUCCESS | PENDING | FAILED
level_enum:        Undergraduate | Graduate
semester_enum:     HK1 | HK2 | HK3
```

**Logic Waitlist (Transaction-based):**

```sql
-- Khi enrollment được tạo:
1. Lock row trong bảng courses (SELECT ... FOR UPDATE)
2. Đếm số người đã SUCCESS
3. Nếu count < capacity → status = 'SUCCESS'
4. Nếu count >= capacity → status = 'PENDING'

-- Khi enrollment bị xóa (DROP):
1. Lock lại courses
2. Nếu người bị xóa có status = 'SUCCESS' → tìm người PENDING sớm nhất
3. Update người đó sang SUCCESS (1 transaction)
```

---

### 3. API Endpoints

**Base URL:** `http://localhost:8000/api` (thông qua Kong Gateway)

**Xác thực:** Các endpoint 🔒 yêu cầu header `Authorization: Bearer <JWT_TOKEN>`

#### 🔐 Authentication

| Method | Endpoint | Auth | Mô tả | Request | Response |
|--------|----------|------|-------|---------|----------|
| POST | `/auth/login` | ❌ | Đăng nhập | `{ email, password }` | `{ token, user }` |
| POST | `/auth/register` | 🔒 Admin | Tạo tài khoản | `{ email, password, full_name, role }` | `{ user }` |
| GET | `/auth/user` | 🔒 Any | Lấy user hiện tại | — | `{ id, email, full_name, role }` |

#### 📚 Courses

| Method | Endpoint | Auth | Mô tả | Ghi chú |
|--------|----------|------|-------|---------|
| GET | `/courses` | 🔒 Any | Danh sách tất cả môn | Support filter: `?semester=HK1&day=MONDAY` |
| GET | `/courses/:id` | 🔒 Any | Chi tiết 1 môn | Includes `current_enrolled`, `capacity` |
| POST | `/courses` | 🔒 Academic Office | Tạo môn mới | Body: `{ course_code, course_name, ... }` |
| PUT | `/courses/:id` | 🔒 Academic Office | Cập nhật môn | Cho phép edit mọi field |
| DELETE | `/courses/:id` | 🔒 Academic Office | Xóa môn | Xóa kèm toàn bộ enrollments |

#### ✍️ Enrollments

| Method | Endpoint | Auth | Mô tả | Ghi chú |
|--------|----------|------|-------|---------|
| POST | `/enrollments` | 🔒 Student | Đăng ký môn | Body: `{ course_id }` → status tự động SUCCESS/PENDING |
| GET | `/enrollments/me` | 🔒 Student | Môn của tôi | Include `course_code`, `start_time`, `end_time`, `status` |
| DELETE | `/enrollments/:courseId` | 🔒 Student | Hủy đăng ký | Trigger waitlist auto-promotion |

#### 📊 Admin

| Method | Endpoint | Auth | Mô tả | Response |
|--------|----------|------|-------|----------|
| GET | `/admin/stats` | 🔒 Admin | Thống kê hệ thống | `{ total_students, total_courses, fill_rates }` |

---

### 4. Business Logic (Nghiệp vụ)

#### 4.1 Quản lý tài khoản

✅ **Đăng nhập (Login)**
- Nhập email + password
- Hash password bằng bcryptjs, so sánh với password_hash
- Nếu match → Issue JWT token (expiresIn: 24h)
- JWT payload: `{ id, role, email }`

✅ **Tạo tài khoản (Create User)**
- Chỉ Admin được quyền
- Mật khẩu được hash trước khi lưu vào DB (bcrypt rounds: 10)
- Assign role: STUDENT / ACADEMIC_OFFICE / ADMIN

✅ **Phân quyền (Role-based Access Control)**
- **ADMIN:** Tạo user, xem stats
- **ACADEMIC_OFFICE:** CRUD courses
- **STUDENT:** Register/Drop courses, xem timetable

---

#### 4.2 Quản lý môn học

✅ **Tạo môn học (Create Course)**
- Chỉ ACADEMIC_OFFICE
- Dữ liệu: `course_code`, `course_name`, `group_code`, `semester`, `academic_year`, `capacity`, `lecturer_name`, `day_of_week`, `start_time`, `end_time`, `level`
- Ràng buộc UNIQUE: `(course_code, group_code, semester, academic_year)`

✅ **Cập nhật / Xóa môn**
- Chỉ ACADEMIC_OFFICE
- Xóa môn → Cascade delete tất cả enrollments

---

#### 4.3 Đăng ký học phần (Enrollment Logic)

**Kiểm tra tuần tự:**

```javascript
1. ❓ Môn học tồn tại?
   → Nếu không → Error: 'Course not found'

2. ❓ Đã đăng ký chưa?
   → Nếu có → Error: 'Already registered'

3. ❓ Trùng lịch?
   → So sánh với tất cả môn đã đăng ký (status = SUCCESS)
   → Kiểm tra: day_of_week, start_time < end_time?
   → Nếu trùng → Error: 'Schedule conflict'

4. ❓ Lớp còn chỗ?
   → Transaction: Lock course, đếm SUCCESS count
   → Nếu count < capacity → status = SUCCESS
   → Nếu count >= capacity → status = PENDING (Waitlist)
```

**Ví dụ:**

```
Course: Web Programming, Capacity = 2

👤 Student 1 → count=0 → SUCCESS ✅
👤 Student 2 → count=1 → SUCCESS ✅
👤 Student 3 → count=2 → PENDING (Waitlist) ⏳
👤 Student 4 → count=2 → PENDING (Waitlist) ⏳

→ Student 1 hủy (DROP)
→ Hệ thống tự động: Student 3 → SUCCESS ✅
→ Lịch học của Student 3 tự động cập nhật
```

---

#### 4.4 Hệ thống Waitlist (Tự động)

**Trigger trên DELETE:**

```sql
-- Khi delete enrollment
1. Check nếu status = 'SUCCESS'
   → Tìm PENDING người sớm nhất (ORDER BY enrollment_date ASC)
   → UPDATE status = 'SUCCESS'
2. Commit transaction
```

**Ưu điểm:**
- ✅ Tự động, không thủ công
- ✅ Đảm bảo FIFO (First In First Out) theo `enrollment_date`
- ✅ Atomic transaction → không xảy ra inconsistency

---

### 5. Frontend Features

#### Pages

| Page | Route | Phạm vi | Mô tả |
|------|-------|---------|-------|
| **Login** | `/` | Public | Form đăng nhập email + password |
| **Register** | `/register` | Public | Tạo tài khoản sinh viên mới |
| **All Courses** | `/courses` | 🔒 Any | Danh sách tất cả môn, search/filter |
| **My Enrollments** | `/enrollments` | 🔒 Student | Danh sách môn đã đăng ký (SUCCESS + PENDING) |
| **My Timetable** | `/timetable` | 🔒 Student | Lịch học dạng grid (lưới tuần) |
| **Course Detail** | `/courses/:id` | 🔒 Any | Chi tiết 1 môn (Modal popup) |
| **Manage Courses** | `/admin/courses` | 🔒 Academic Office | CRUD môn học |
| **Dashboard** | `/admin/dashboard` | 🔒 Admin | Thống kê, biểu đồ |

#### Key Features

✨ **Interactive Timetable**
- Hiển thị lưới 7 cột (Thứ 2-7 + CN) × 12 hàng (giờ 7-19)
- Tính toán tự động: `top = (start_hour - 7) * 60px`, `height = (end_hour - start_hour) * 60px`
- Click vào ô → Modal chi tiết môn học

✨ **Real-time Search**
- Debounce 300ms để tối ưu API calls
- Tìm theo: tên môn, mã môn, giảng viên
- Filter theo: semester, day_of_week, level

✨ **Toast Notifications**
- Đăng ký thành công → Toast xanh (Enrollment SUCCESS)
- Lớp đầy → Toast vàng (Waitlist PENDING)
- Lỗi → Toast đỏ

✨ **AuthProvider**
- Quản lý trạng thái đăng nhập globally
- Lưu JWT token vào localStorage
- Provide user info qua context

---

## 📊 KẾ HOẠCH THỰC HIỆN

### Phase 1: MVP (Deadline: 12/04/2026)

**Status:** ✅ HOÀN THÀNH

#### Tính năng bắt buộc

| # | Tính năng | Trạng thái |
|---|-----------|-----------|
| 1 | **Authentication** — Đăng nhập JWT + phân quyền 3 roles | ✅ Done |
| 2 | **CRUD Courses** — Academic Office quản lý môn học | ✅ Done |
| 3 | **Enrollment Logic** — Đăng ký với kiểm tra trùng lịch + sĩ số | ✅ Done |
| 4 | **Waitlist System** — Auto-promotion khi có người DROP | ✅ Done |
| 5 | **Timetable View** — Lưới tuần hiển thị lịch học | ✅ Done |
| 6 | **Hủy đăng ký** — Drop course + trigger waitlist | ✅ Done |

#### Test Cases MVP (Kết quả kiểm thử)

| Test Case | Kết quả mong đợi | Thực tế | Status |
|-----------|------------------|--------|--------|
| Đăng nhập sai mật khẩu | 401 Unauthorized | Trả về 401, Toast lỗi rõ ràng | ✅ |
| Đăng ký môn còn chỗ | SUCCESS, xuất hiện Timetable | Status SUCCESS, lịch cập nhật | ✅ |
| Đăng ký môn đã đầy | PENDING, "hàng chờ" | Status PENDING, Toast vàng | ✅ |
| Trùng lịch 2 môn | Reject, lỗi conflict | Error message chi tiết | ✅ |
| Hủy môn có người chờ | Người đầu → SUCCESS auto | Transaction xử lý, lịch update | ✅ |
| API không token | 401 Unauthorized | Kong JWT validation | ✅ |
| Student tạo course | 403 Forbidden | Role middleware block | ✅ |
| Race condition 1000 req | Sĩ số không lố | `SELECT ... FOR UPDATE` lock | ✅ |
| Timetable rendering | Lưới chính xác, không overlap | Tính toán top/height đúng | ✅ |

---

### Phase 2: Beta (Deadline: 10/05/2026)

**Status:** 🚧 IN PROGRESS

#### Tính năng bổ sung

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | **Admin Dashboard** | Biểu đồ thống kê (Charts), tỉ lệ lấp đầy |
| 2 | **Advanced Filtering** | Filter môn theo semester, day_of_week, level |
| 3 | **User Management** | Admin xem/sửa danh sách users, thay đổi role |
| 4 | **Responsive Mobile** | Layout tương thích điện thoại |
| 5 | **Input Validation** | Joi/Zod validation backend |
| 6 | **Error Handling** | Custom error messages, error boundary |
| 7 | **Loading States** | Skeleton, spinner khi loading |
| 8 | **API Documentation** | Swagger/OpenAPI spec |
| 9 | **Database Indexing** | Tối ưu query performance |
| 10 | **Caching Strategy** | TanStack Query cache configuration |

#### Kế hoạch kiểm thử Beta

- Unit tests (backend) — Jest + Supertest
- Integration tests — API endpoints
- Manual testing — Full user scenarios
- Performance testing — Load testing với 1000+ concurrent users
- Security testing — SQL injection, XSS, CSRF

---

## ⚙️ SETUP & DEPLOYMENT

### Yêu cầu hệ thống

**Bắt buộc:**
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)
- Git

**Không cần cài đặt:** Node.js, PostgreSQL, React, v.v. (đã containerized)

### Cài đặt nhanh (3 bước)

```bash
# 1. Clone repo
git clone https://github.com/buidwcmah21/CRS.git
cd CRS

# 2. Tạo .env (nếu chưa có)
cat > .env << EOF
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=postgres-db
DB_PORT=5432
DB_NAME=crs_db
PORT=3000
JWT_SECRET=crs_secret_key_2024_thanh_cong_mvp
FRONTEND_ORIGIN=http://localhost:5173
EOF

# 3. Khởi chạy
docker-compose up -d --build
```

### Truy cập

```
Frontend: http://localhost:5173
Backend:  http://localhost:3000
Kong API: http://localhost:8000/api
Database: localhost:5433 (user: postgres, pwd: postgres)
```

### Tài khoản mặc định

| Vai trò | Email | Mật khẩu |
|---------|-------|----------|
| Admin | `admin@gmail.com` | `123456` |
| Academic Office | `office@gmail.com` | `123456` |
| Student | `student@gmail.com` | `123456` |

---

## 🧪 TEST CASE WAITLIST

**Mục đích:** Kiểm chứng tính năng hàng chờ tự động

**Các bước:**

1. **Đăng nhập** với `student@gmail.com` / `123456`
2. **Tìm môn Database Systems** (Capacity = 2)
3. **Bấm Register** → Toast vàng "Lớp đầy, hàng chờ"
4. **Tab My Enrollments** → Status = PENDING (vàng)
5. **Mở tab ẩn danh khác** → Đăng nhập `admin@gmail.com`
6. **My Enrollments** → Bấm **Drop** trên Database Systems
7. **Quay lại tab cũ** → Đợi 5s hoặc F5
8. **Status tự động thay đổi** PENDING → SUCCESS (xanh)
9. **Tab My Timetable** → Môn học tự động xuất hiện trên lịch

---

## 🛑 TROUBLESHOOTING

### ❌ Port 5432 already in use

**Nguyên nhân:** PostgreSQL cài sẵn trên máy

**Giải pháp:** Dự án đã map sang port **5433**
```bash
docker-compose up -d --build
psql -h localhost -p 5433 -U postgres -d crs_db
```

### ❌ Container không khởi động

**Giải pháp:** Xem logs
```bash
docker-compose logs -f backend-app
docker-compose logs -f postgres-db
docker-compose logs -f kong
```

### ❌ Reset database

```bash
docker-compose down -v
docker-compose up -d --build
# Database sẽ tự động init lại từ init.sql
```

---

## 📚 CÔNG NGHỆ & KIẾN THỨC ÁP DỤNG

### Backend (Node.js)

- ✅ RESTful API Design
- ✅ Middleware pattern (Auth, Role-based)
- ✅ Database transactions (ACID)
- ✅ Password hashing (bcryptjs)
- ✅ JWT token generation & validation
- ✅ Error handling & validation

### Database (PostgreSQL)

- ✅ ENUM types
- ✅ Foreign keys + CASCADE delete
- ✅ Pessimistic locking (`SELECT ... FOR UPDATE`)
- ✅ Database transactions
- ✅ Triggers (waitlist logic)
- ✅ UNIQUE constraints

### Frontend (React)

- ✅ Component-based architecture
- ✅ Hooks (useState, useEffect, useContext)
- ✅ TanStack Query (data fetching)
- ✅ React Router (routing)
- ✅ AuthProvider (state management)
- ✅ Bootstrap responsive grid
- ✅ Debounce optimization

### DevOps (Docker)

- ✅ Dockerfile best practices
- ✅ Docker Compose orchestration
- ✅ Multi-service networking
- ✅ Volume management
- ✅ Health checks

### API Gateway (Kong)

- ✅ Declarative configuration (YAML)
- ✅ Service routing
- ✅ JWT authentication plugin
- ✅ CORS handling

---

## 📝 LƯU Ý QUAN TRỌNG

1. **Git Repository:** Chỉ tạo 1 lần duy nhất → Không được đổi link
2. **Biến môi trường:** JWT_SECRET phải từ `.env`, không hardcode
3. **Database migrations:** Tất cả schema changes để trong `init.sql`
4. **API versioning:** Nếu thay đổi API → Cần update Kong config
5. **Testing:** Test API bằng Postman/cURL trước khi demo
6. **Docker image:** Rebuild trước khi push: `docker-compose up -d --build`

---

## ❓ CÂU HỎI THƯỜNG GẶP

**Q: Có cần deploy lên cloud (AWS, Heroku) không?**

A: Không. MVP chỉ cần chạy local bằng Docker.

---

**Q: Cần viết automated tests (Jest, Supertest) không?**

A: Beta version sẽ thêm. MVP tập trung vào functionality.

---

**Q: Báo cáo cuối kỳ cần gì?**

A: Document + Code + Demo hoạt động.

---

## 👨‍💻 PHÁT TRIỂN BỞI

**Lead Developer:** Bùi Đức Mạnh

**Repository:** [https://github.com/buidwcmah21/CRS.git](https://github.com/buidwcmah21/CRS.git)

**Đã cập nhật:** 12/04/2026

---

### ✨ **Chúc bạn thành công!** 🚀

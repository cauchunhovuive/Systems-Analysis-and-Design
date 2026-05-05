import { useState } from "react";
import { useAuth } from "../AuthProvider";
import { useNavigate } from "react-router-dom";
import crsLogo from '../assets/CRS.png';

const dummyNews = [
  { id: 1, date: "16", month: "Tháng 04", title: "HƯỚNG DẪN SỬ DỤNG TÍNH NĂNG HÀNG CHỜ (WAITLIST) MỚI", desc: "Hệ thống đã cập nhật các quy định mới nhất về việc xếp hàng chờ khi lớp học đầy...", isNew: true },
  { id: 2, date: "12", month: "Tháng 04", title: "THÔNG BÁO: Cập nhật danh mục môn học cho Học kỳ hè 2024", desc: "Hệ thống đã cập nhật các quy định mới nhất về việc xếp hàng chờ khi lớp học đầy...", isNew: false },
  { id: 3, date: "05", month: "Tháng 04", title: "LỊCH BẢO TRÌ HỆ THỐNG ĐĂNG KÝ TÍN CHỈ ĐỊNH KỲ", desc: "Hệ thống đã cập nhật các quy định mới nhất về việc xếp hàng chờ khi lớp học đầy...", isNew: false },
  { id: 4, date: "28", month: "Tháng 03", title: "QUY ĐỊNH MỚI VỀ VIỆC HỦY ĐĂNG KÝ HỌC PHẦN TRỰC TUYẾN", desc: "Hệ thống đã cập nhật các quy định mới nhất về việc xếp hàng chờ khi lớp học đầy...", isNew: true },
];

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogIn({ email, password });
  };

  return (
    <div className="min-vh-100 bg-white d-flex flex-column" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="py-4 bg-white">
        <div className="container" style={{ maxWidth: '1100px' }}>
          <div className="d-flex align-items-center gap-3">
             {/* Fallback in case CRS.png doesn't exist yet */}
             <div className="bg-primary text-white d-flex flex-column align-items-center justify-content-center rounded px-2 py-1" style={{ width: '60px', height: '60px' }}>
                <i className="bi bi-stack fs-3 mb-0" style={{lineHeight: 1}}></i>
                <small className="fw-bold" style={{fontSize: '0.65rem'}}>CRS</small>
             </div>
             <div className="d-flex flex-column text-start" style={{borderLeft: '2px solid #e5e7eb', paddingLeft: '15px'}}>
               <span className="fw-bold fs-4 text-primary" style={{lineHeight: '1.2', color: '#0d6efd'}}>COURSE REGISTRATION</span>
               <span className="fw-semibold text-secondary" style={{fontSize: '1rem', letterSpacing: '0.5px'}}>MANAGEMENT SYSTEM</span>
             </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container flex-grow-1 py-5" style={{ maxWidth: '1100px' }}>
        <div className="row w-100 mx-0">
          
          {/* Left Column: News */}
          <div className="col-lg-7 p-0 pe-lg-5 d-none d-lg-block">
            <div className="h-100 d-flex flex-column">
              <div className="d-flex border-bottom mb-4 pb-2">
                <div className="pe-4 fw-bold text-primary" style={{ borderBottom: '3px solid #0d6efd', paddingBottom: '10px', marginBottom: '-13px', cursor: 'pointer' }}>
                  THÔNG BÁO HỆ THỐNG
                </div>
                <div className="px-4 fw-bold text-secondary" style={{ paddingBottom: '10px', cursor: 'pointer' }}>
                  HƯỚNG DẪN ĐĂNG KÝ
                </div>
              </div>
              
              <div className="flex-grow-1">
                {dummyNews.map(news => (
                  <div key={news.id} className="d-flex mb-4 pb-2 align-items-start">
                    {/* Date Box */}
                    <div className="text-center me-4 border rounded" style={{ minWidth: '70px', backgroundColor: '#f8f9fa' }}>
                      <div className="text-secondary py-1 small" style={{fontSize: '0.75rem'}}>{news.month}</div>
                      <div className="border-top py-1 fs-4 fw-bold text-primary bg-white rounded-bottom">{news.date}</div>
                    </div>
                    {/* Content */}
                    <div>
                      <h6 className="fw-bold text-dark mb-1 d-flex align-items-center" style={{fontSize: '0.95rem'}}>
                        {news.title}
                        {news.isNew && <span className="badge bg-danger ms-2 rounded-1 px-2 py-1" style={{fontSize: '0.65rem'}}>NEW</span>}
                      </h6>
                      <p className="text-secondary mb-0" style={{fontSize: '0.85rem'}}>{news.desc}</p>
                    </div>
                  </div>
                ))}
                <div className="text-end mt-4 pt-3 border-top">
                  <span className="text-primary fw-bold" style={{cursor: 'pointer', fontSize: '0.9rem'}}>XEM TẤT CẢ THÔNG BÁO</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Login Form */}
          <div className="col-lg-5 p-0 d-flex flex-column justify-content-start">
            
            {/* Login Card */}
            <div className="bg-white p-4 p-md-5 rounded shadow-sm border" style={{boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.05)'}}>
              <div className="text-center mb-4">
                <h5 className="fw-bold text-dark mb-1" style={{fontSize: '1.25rem'}}>CRS STUDENT PORTAL</h5>
                <p className="text-secondary small mb-0">Vui lòng đăng nhập để tiếp tục</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary mb-1">TÀI KHOẢN / MSSV</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Nhập email hoặc mã số"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{padding: '0.6rem 0.75rem', fontSize: '0.9rem'}}
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary mb-1">MẬT KHẨU</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{padding: '0.6rem 0.75rem', fontSize: '0.9rem'}}
                  />
                </div>

                <div className="mb-4 d-flex gap-2 align-items-center">
                  <input type="text" className="form-control w-50" placeholder="Mã bảo vệ" style={{padding: '0.6rem 0.75rem', fontSize: '0.9rem'}} />
                  <div className="border rounded w-50 text-center text-decoration-line-through text-dark fw-bold" style={{padding: '0.6rem', letterSpacing: '4px', backgroundColor: '#f8f9fa', fontStyle: 'italic'}}>
                    cy1ttz
                  </div>
                </div>

                <button
                  className="btn btn-primary w-100 fw-bold py-2 mb-3"
                  type="submit"
                  style={{ backgroundColor: '#0d6efd', border: 'none', borderRadius: '4px' }}
                >
                  ĐĂNG NHẬP HỆ THỐNG
                </button>
              </form>
              
              <div className="text-center mt-2">
                <span className="small text-secondary">Chưa có tài khoản? </span>
                <span 
                  className="small text-primary fw-bold"
                  style={{cursor: 'pointer'}}
                  onClick={() => navigate('/register')}
                >
                  Đăng ký ngay
                </span>
              </div>
            </div>

            {/* Support Info */}
            <div className="text-center mt-4 p-3 border rounded bg-light">
              <span className="small text-secondary">Hỗ trợ kỹ thuật: </span>
              <span className="small text-dark fw-bold">support@crs-system.edu</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
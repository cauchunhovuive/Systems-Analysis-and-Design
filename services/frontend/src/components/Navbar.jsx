import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthProvider';
import { useState } from 'react';

const NavBar = ({ state }) => {
  const location = useLocation();
  const { handleLogout, user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!state) return null;

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'ACADEMIC_OFFICE';

  const getClass = (paths) => {
    // Exact match for home, or starts with for subpages (e.g., /courses/1)
    const isActive = paths.some(path => {
      if (path === "/") return location.pathname === "/";
      return location.pathname.startsWith(path);
    });

    return isActive
      ? 'nav-link text-primary fw-bold border-bottom border-primary border-3 pb-2 px-1'
      : 'nav-link text-secondary fw-semibold pb-2 px-1'
  };

  return (
    <nav className="navbar navbar-expand-lg bg-white border-bottom shadow-sm sticky-top py-2" style={{ fontFamily: "'Inter', sans-serif", zIndex: 1000 }}>
      <div className="container" style={{ maxWidth: '1200px' }}>
        {/* Brand / Logo */}
        <Link className="navbar-brand d-flex align-items-center gap-2" to="/">
            <div className="bg-primary text-white d-flex flex-column align-items-center justify-content-center rounded px-1" style={{ width: '40px', height: '40px' }}>
                <i className="bi bi-stack fs-5 mb-0" style={{lineHeight: 1}}></i>
            </div>
            <div className="d-flex flex-column text-start d-none d-sm-flex">
               <span className="fw-bold text-primary" style={{lineHeight: '1.2', fontSize: '1.1rem'}}>CRS PORTAL</span>
            </div>
        </Link>

        {/* Hamburger for mobile */}
        <button className="navbar-toggler border-0 shadow-none" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Links & Icons */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-2 gap-lg-4 mt-3 mt-lg-0 align-items-lg-end" style={{ height: '100%', paddingTop: '10px' }}>
            {isAdmin ? (
              // Menu cho Admin / Academic Office
              <>
                <li className="nav-item">
                  <Link to="/admin" className={getClass(["/admin"])}>📊 Quản trị</Link>
                </li>
              </>
            ) : (
              // Menu cho Sinh viên
              <>
                <li className="nav-item">
                  <Link to="/" className={getClass(["/"])}>Bảng điều khiển</Link>
                </li>
                <li className="nav-item">
                  <Link to="/courses" className={getClass(["/courses", "/enrollments"])}>Học phần</Link>
                </li>
                <li className="nav-item">
                  <Link to="/timetable" className={getClass(["/timetable"])}>Thời khóa biểu</Link>
                </li>
              </>
            )}
          </ul>
          
          <div className="d-flex align-items-center gap-4 mt-3 mt-lg-0 justify-content-center">
            <div className="position-relative" style={{cursor: 'pointer'}}>
              <i className="bi bi-bell fs-5 text-secondary hover-text-primary transition-all"></i>
              <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
                <span className="visually-hidden">New alerts</span>
              </span>
            </div>
            <i className="bi bi-chat-dots fs-5 text-secondary hover-text-primary transition-all" style={{cursor: 'pointer'}}></i>
            
            <div className="dropdown">
              <div 
                className="d-flex align-items-center gap-2" 
                role="button" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
                style={{cursor: 'pointer'}}
              >
                <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border" style={{width: '38px', height: '38px'}}>
                   <i className="bi bi-person-fill text-primary fs-5"></i>
                </div>
                <i className="bi bi-chevron-down text-secondary small"></i>
              </div>
              <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${dropdownOpen ? 'show' : ''}`} style={{ position: 'absolute' }}>
                <li><h6 className="dropdown-header">Tài khoản của tôi</h6></li>
                <li>
                  <Link className="dropdown-item d-flex align-items-center gap-2 fw-semibold" to="/profile" onClick={() => setDropdownOpen(false)}>
                    <i className="bi bi-person-badge"></i> Hồ sơ cá nhân
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-danger fw-semibold d-flex align-items-center gap-2" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right"></i> Đăng xuất
                </button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
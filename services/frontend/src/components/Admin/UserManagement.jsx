import { useState, useEffect } from 'react';
import { apiClient } from '../../config/api';
import useDebounce from '../../hooks/useDebounce';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserPlus, faTrash, faSearch, faUserShield, faSchool } from '@fortawesome/free-solid-svg-icons';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Create User Form State
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'ACADEMIC_OFFICE' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/users', {
        params: { search: debouncedSearch, page, limit: 10 }
      });
      setUsers(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, page]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await apiClient.post('/auth/register', formData);
      setShowModal(false);
      setFormData({ fullName: '', email: '', password: '', role: 'ACADEMIC_OFFICE' });
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await apiClient.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Xóa thất bại');
    }
  };

  return (
    <div className="container-fluid p-0" style={{fontFamily: "'Inter', sans-serif"}}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Quản lý Tài khoản Nội bộ</h4>
          <p className="text-secondary small mb-0">Quản lý tài khoản Admin và Cán bộ phòng đào tạo</p>
        </div>
        <button className="btn btn-primary px-4 rounded-pill shadow-sm" onClick={() => setShowModal(true)}>
          <FontAwesomeIcon icon={faUserPlus} className="me-2" /> Tạo tài khoản
        </button>
      </div>

      <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <div className="card-header bg-white py-3 border-0">
          <div className="input-group bg-light rounded-pill px-3 py-1 border" style={{maxWidth: '400px'}}>
            <span className="input-group-text bg-transparent border-0 text-muted">
              <FontAwesomeIcon icon={faSearch} />
            </span>
            <input 
              type="text" 
              className="form-control bg-transparent border-0 shadow-none" 
              placeholder="Tìm theo tên hoặc email..." 
              value={search}
              onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            />
          </div>
        </div>
        
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="bg-light text-secondary small text-uppercase fw-bold">
                <tr>
                  <th className="px-4 py-3">Họ và tên</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Vai trò</th>
                  <th className="py-3">Ngày tạo</th>
                  <th className="px-4 py-3 text-end">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary border-2"></div></td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="5" className="text-center py-5 text-muted">Không tìm thấy tài khoản nào</td></tr>
                ) : users.map(user => (
                  <tr key={user.id}>
                    <td className="px-4 py-3">
                      <div className="d-flex align-items-center">
                        <div className={`rounded-circle bg-light d-flex align-items-center justify-content-center me-3`} style={{width: 35, height: 35}}>
                          <FontAwesomeIcon icon={user.role === 'ADMIN' ? faUserShield : faSchool} className="text-primary small" />
                        </div>
                        <span className="fw-semibold">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-secondary">{user.email}</td>
                    <td className="py-3">
                      <span className={`badge ${user.role === 'ADMIN' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} rounded-pill px-3`}>
                        {user.role === 'ADMIN' ? 'Admin' : 'Academic Office'}
                      </span>
                    </td>
                    <td className="py-3 text-muted small">{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                    <td className="px-4 py-3 text-end">
                      <button className="btn btn-outline-danger btn-sm rounded-circle" style={{width: 32, height: 32, padding: 0}} onClick={() => handleDelete(user.id)}>
                        <FontAwesomeIcon icon={faTrash} style={{fontSize: '0.8rem'}} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center gap-2 mb-4">
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</button>
          <span className="align-self-center text-secondary small">Trang {page} / {totalPages}</span>
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{zIndex: 1050}}></div>
          <div className="modal fade show d-block" style={{zIndex: 1060}} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header border-0 pb-0">
                  <h5 className="fw-bold px-2 pt-2">Tạo tài khoản mới</h5>
                  <button type="button" className="btn-close me-2 mt-2" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleCreate}>
                  <div className="modal-body p-4">
                    {error && <div className="alert alert-danger py-2 small">{error}</div>}
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Họ và tên</label>
                      <input type="text" className="form-control rounded-3" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Nhập tên cán bộ" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Email</label>
                      <input type="email" className="form-control rounded-3" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@university.edu" />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Mật khẩu</label>
                      <input type="password" className="form-control rounded-3" required minLength={6} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Tối thiểu 6 ký tự" />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small fw-bold text-secondary">Vai trò</label>
                      <select className="form-select rounded-3" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                        <option value="ACADEMIC_OFFICE">Academic Office (Cán bộ PĐT)</option>
                        <option value="ADMIN">System Admin (Quản trị hệ thống)</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer border-0 p-4 pt-0">
                    <button type="button" className="btn btn-light px-4 rounded-pill" onClick={() => setShowModal(false)}>Hủy</button>
                    <button type="submit" className="btn btn-primary px-4 rounded-pill shadow-sm" disabled={submitting}>
                      {submitting ? 'Đang tạo...' : 'Xác nhận tạo'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

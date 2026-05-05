// src/components/Admin/StudentManagement.jsx
import { useEffect, useState } from 'react';
import { apiClient } from '../../config/api';
import useDebounce from '../../hooks/useDebounce';

const STATUS_COLOR = { SUCCESS: '#22c55e', PENDING: '#f59e0b', FAILED: '#ef4444' };
const STATUS_LABEL = { SUCCESS: 'Đã duyệt', PENDING: 'Chờ duyệt', FAILED: 'Từ chối' };

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);
  const [detail, setDetail] = useState(null);      // student được chọn xem chi tiết
  const [enrollments, setEnrollments] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/students', { params: { search: debouncedSearch, page, limit: 10 } });
      setStudents(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
      setTotal(res.data.pagination.total || 0);
    } catch { showToast('Không thể tải danh sách sinh viên', 'danger'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, [debouncedSearch, page]);

  const handleViewDetail = async (s) => {
    setDetail(s);
    setLoadingDetail(true);
    try {
      const res = await apiClient.get(`/admin/students/${s.id}/enrollments`);
      setEnrollments(res.data.data || []);
    } catch { setEnrollments([]); }
    finally { setLoadingDetail(false); }
  };

  const handleDelete = async (s) => {
    if (!window.confirm(`Xóa sinh viên "${s.full_name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await apiClient.delete(`/admin/students/${s.id}`);
      showToast('Đã xóa sinh viên');
      if (detail?.id === s.id) setDetail(null);
      fetchStudents();
    } catch (err) { showToast(err.response?.data?.message || 'Xóa thất bại', 'danger'); }
  };

  const handleExport = async () => {
    try {
      const res = await apiClient.get('/admin/reports/students/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { showToast('Xuất file thất bại', 'danger'); }
  };

  return (
    <div>
      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible`} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          {toast.msg}
          <button className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-header bg-white border-0 pt-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0">👥 Quản lý Sinh viên</h5>
              <small className="text-muted">Tổng cộng {total} sinh viên</small>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>📥 Xuất CSV</button>
          </div>
          <div className="mt-2">
            <input className="form-control form-control-sm" style={{ maxWidth: 350 }}
              placeholder="🔍 Tìm theo tên hoặc email..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : students.length === 0 ? (
            <div className="text-center py-5 text-muted">Không tìm thấy sinh viên nào</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 small align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Họ tên</th>
                    <th>Email</th>
                    <th>Điện thoại</th>
                    <th>Ngày tạo TK</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(s => (
                    <tr key={s.id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: 32, height: 32, fontSize: '0.8rem', flexShrink: 0 }}>
                            {s.full_name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-semibold">{s.full_name}</span>
                        </div>
                      </td>
                      <td className="text-muted">{s.email}</td>
                      <td className="text-muted">{s.phone || '—'}</td>
                      <td className="text-muted">{new Date(s.created_at).toLocaleDateString('vi-VN')}</td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleViewDetail(s)}>👁️ Chi tiết</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(s)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center px-3 py-2 border-top">
              <small className="text-muted">Trang {page} / {totalPages}</small>
              <div className="d-flex gap-1">
                <button className="btn btn-sm btn-outline-secondary" disabled={page===1} onClick={() => setPage(p=>p-1)}>‹ Trước</button>
                <button className="btn btn-sm btn-outline-secondary" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Sau ›</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">👤 Chi tiết sinh viên</h5>
                <button className="btn-close" onClick={() => setDetail(null)} />
              </div>
              <div className="modal-body">
                {/* Info */}
                <div className="row g-3 mb-4">
                  {[
                    ['Họ tên', detail.full_name],
                    ['Email', detail.email],
                    ['Điện thoại', detail.phone || '—'],
                    ['Ngày sinh', detail.dob ? new Date(detail.dob).toLocaleDateString('vi-VN') : '—'],
                    ['Địa chỉ', detail.address || '—'],
                    ['Ngày tạo TK', new Date(detail.created_at).toLocaleDateString('vi-VN')],
                  ].map(([label, value]) => (
                    <div key={label} className="col-md-6">
                      <div className="text-muted small">{label}</div>
                      <div className="fw-semibold">{value}</div>
                    </div>
                  ))}
                </div>

                <hr />
                <h6 className="fw-bold mb-3">📋 Lịch sử đăng ký học phần</h6>

                {loadingDetail ? (
                  <div className="text-center py-3"><div className="spinner-border spinner-border-sm text-primary" /></div>
                ) : enrollments.length === 0 ? (
                  <p className="text-muted small">Chưa có đăng ký học phần nào</p>
                ) : (
                  <table className="table table-sm small">
                    <thead className="table-light">
                      <tr><th>Mã môn</th><th>Tên môn</th><th>Nhóm</th><th className="text-center">Trạng thái</th><th>Ngày đăng ký</th></tr>
                    </thead>
                    <tbody>
                      {enrollments.map((e, i) => (
                        <tr key={i}>
                          <td className="fw-bold text-primary">{e.course_code}</td>
                          <td>{e.course_name}</td>
                          <td>{e.group_code}</td>
                          <td className="text-center">
                            <span className="badge rounded-pill" style={{ background: STATUS_COLOR[e.status]||'#94a3b8', color:'white' }}>
                              {STATUS_LABEL[e.status]||e.status}
                            </span>
                          </td>
                          <td className="text-muted">{new Date(e.enrollment_date).toLocaleDateString('vi-VN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light" onClick={() => setDetail(null)}>Đóng</button>
                <button className="btn btn-outline-danger" onClick={() => { handleDelete(detail); setDetail(null); }}>🗑️ Xóa sinh viên</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

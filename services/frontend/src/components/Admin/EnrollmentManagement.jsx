// src/components/Admin/EnrollmentManagement.jsx
import { useEffect, useState } from 'react';
import { apiClient } from '../../config/api';
import useDebounce from '../../hooks/useDebounce';

const STATUS_COLOR = { SUCCESS: '#22c55e', PENDING: '#f59e0b', FAILED: '#ef4444' };
const STATUS_LABEL = { SUCCESS: 'Đã duyệt', PENDING: 'Chờ duyệt', FAILED: 'Từ chối' };
const STATUS_BG = { SUCCESS: 'success', PENDING: 'warning', FAILED: 'danger' };

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/enrollments', {
        params: { status: filterStatus, search: debouncedSearch, page, limit: 10 }
      });
      setEnrollments(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
      setTotal(res.data.pagination.total || 0);
    } catch { showToast('Không thể tải danh sách đăng ký', 'danger'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEnrollments(); }, [filterStatus, debouncedSearch, page]);

  const handleApprove = async (id) => {
    try {
      await apiClient.put(`/admin/enrollments/${id}/approve`, {});
      showToast('Đã duyệt đăng ký thành công!');
      fetchEnrollments();
    } catch (err) { showToast(err.response?.data?.message || 'Có lỗi xảy ra', 'danger'); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Bạn chắc chắn muốn từ chối đăng ký này?')) return;
    try {
      await apiClient.put(`/admin/enrollments/${id}/reject`, {});
      showToast('Đã từ chối đăng ký');
      fetchEnrollments();
    } catch (err) { showToast(err.response?.data?.message || 'Có lỗi xảy ra', 'danger'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Xóa đăng ký này vĩnh viễn?')) return;
    try {
      await apiClient.delete(`/admin/enrollments/${id}`);
      showToast('Đã xóa đăng ký');
      fetchEnrollments();
    } catch (err) { showToast(err.response?.data?.message || 'Xóa thất bại', 'danger'); }
  };

  const handleExport = async () => {
    try {
      const res = await apiClient.get('/admin/reports/enrollments/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'enrollments.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { showToast('Xuất file thất bại', 'danger'); }
  };

  const pendingCount = enrollments.filter(e => e.status === 'PENDING').length;

  return (
    <div>
      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible`} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          {toast.msg}
          <button className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      {/* Pending Alert */}
      {filterStatus !== 'SUCCESS' && pendingCount > 0 && (
        <div className="alert alert-warning d-flex align-items-center gap-2 mb-3" style={{ borderRadius: 10 }}>
          <span style={{ fontSize: '1.3rem' }}>⚠️</span>
          <div>
            <strong>{pendingCount} đăng ký đang chờ duyệt</strong> trong trang này.{' '}
            <button className="btn btn-sm btn-warning ms-2" onClick={() => setFilterStatus('PENDING')}>
              Xem đăng ký chờ duyệt
            </button>
          </div>
        </div>
      )}

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-header bg-white border-0 pt-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-0">✍️ Quản lý Đăng ký</h5>
              <small className="text-muted">Tổng cộng {total} đăng ký</small>
            </div>
            <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>📥 Xuất CSV</button>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mt-3">
            {/* Search */}
            <div style={{ maxWidth: 350, flex: 1 }}>
              <input className="form-control form-control-sm"
                placeholder="🔍 Tìm tên SV, email hoặc môn học..."
                value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            {/* Filter Tabs */}
            <div className="d-flex gap-2 flex-wrap">
              {[['', 'Tất cả'], ['PENDING', '⏳ Chờ duyệt'], ['SUCCESS', '✅ Đã duyệt'], ['FAILED', '❌ Từ chối']].map(([val, label]) => (
                <button key={val} onClick={() => { setFilterStatus(val); setPage(1); }}
                  className={`btn btn-sm ${filterStatus === val ? 'btn-primary' : 'btn-outline-secondary'}`}
                  style={{ borderRadius: 20 }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : enrollments.length === 0 ? (
            <div className="text-center py-5 text-muted">Không có đăng ký nào</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 small align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Sinh viên</th>
                    <th>Email</th>
                    <th>Môn học</th>
                    <th>Nhóm</th>
                    <th className="text-center">Trạng thái</th>
                    <th>Ngày đăng ký</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map(e => (
                    <tr key={e.id} style={e.status==='PENDING' ? {background:'#fffbeb'} : {}}>
                      <td className="ps-3 fw-semibold">{e.student_name}</td>
                      <td className="text-muted">{e.student_email}</td>
                      <td>
                        <div className="fw-semibold">{e.course_name}</div>
                        <small className="text-muted">{e.course_code}</small>
                      </td>
                      <td><span className="badge bg-light text-dark border">{e.group_code}</span></td>
                      <td className="text-center">
                        <span className={`badge bg-${STATUS_BG[e.status]} rounded-pill`}>
                          {STATUS_LABEL[e.status] || e.status}
                        </span>
                      </td>
                      <td className="text-muted">{new Date(e.enrollment_date).toLocaleDateString('vi-VN')}</td>
                      <td className="text-center">
                        {e.status === 'PENDING' && (
                          <>
                            <button className="btn btn-sm btn-success me-1" onClick={() => handleApprove(e.id)} title="Duyệt">✓</button>
                            <button className="btn btn-sm btn-warning me-1" onClick={() => handleReject(e.id)} title="Từ chối">✕</button>
                          </>
                        )}
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(e.id)} title="Xóa">🗑️</button>
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
    </div>
  );
}

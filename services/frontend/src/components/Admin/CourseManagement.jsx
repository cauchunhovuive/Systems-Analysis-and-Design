// src/components/Admin/CourseManagement.jsx
import { useEffect, useState } from 'react';
import { apiClient } from '../../config/api';
import useDebounce from '../../hooks/useDebounce';

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const DAY_VI = { MONDAY:'Thứ Hai', TUESDAY:'Thứ Ba', WEDNESDAY:'Thứ Tư', THURSDAY:'Thứ Năm', FRIDAY:'Thứ Sáu', SATURDAY:'Thứ Bảy', SUNDAY:'Chủ Nhật' };
const EMPTY_FORM = { course_code:'', course_name:'', group_code:'', capacity:'', lecturer_name:'', day_of_week:'', start_time:'', end_time:'', level:'', semester:'HK2 2025-2026', description:'' };

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null); // null = tạo mới
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/courses', {
        params: { search: debouncedSearch, level, page, limit: 10 }
      });
      setCourses(res.data.data);
      setTotalPages(res.data.pagination.totalPages || 1);
    } catch {
      showToast('Không thể tải danh sách môn học', 'danger');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCourses(); }, [debouncedSearch, level, page]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (c) => {
    setEditing(c);
    setForm({ course_code: c.course_code, course_name: c.course_name, group_code: c.group_code, capacity: c.capacity, lecturer_name: c.lecturer_name, day_of_week: c.day_of_week, start_time: c.start_time?.slice(0,5)||'', end_time: c.end_time?.slice(0,5)||'', level: c.level, semester: c.semester || 'HK2 2025-2026', description: c.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await apiClient.put(`/admin/courses/${editing.id}`, form);
        showToast('Cập nhật môn học thành công!');
      } else {
        await apiClient.post('/admin/courses', form);
        showToast('Tạo môn học thành công!');
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra', 'danger');
    } finally { setSaving(false); }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Bạn chắc chắn muốn xóa môn học "${c.course_name} - ${c.group_code}"?`)) return;
    try {
      await apiClient.delete(`/admin/courses/${c.id}`);
      showToast('Đã xóa môn học');
      fetchCourses();
    } catch (err) {
      showToast(err.response?.data?.message || 'Xóa thất bại', 'danger');
    }
  };

  const handleExport = async () => {
    try {
      const res = await apiClient.get('/admin/reports/courses/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'courses.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { showToast('Xuất file thất bại', 'danger'); }
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`alert alert-${toast.type} alert-dismissible`} style={{ position: 'sticky', top: 0, zIndex: 100 }}>
          {toast.msg}
          <button className="btn-close" onClick={() => setToast(null)} />
        </div>
      )}

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-header bg-white border-0 pt-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h5 className="fw-bold mb-0">📚 Quản lý Môn học</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" onClick={handleExport}>📥 Xuất CSV</button>
              <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Thêm môn học</button>
            </div>
          </div>

          {/* Filters */}
          <div className="row g-2 mt-2">
            <div className="col-md-6">
              <input className="form-control form-control-sm" placeholder="🔍 Tìm theo mã, tên, nhóm..." value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <div className="col-md-3">
              <select className="form-select form-select-sm" value={level} onChange={e => { setLevel(e.target.value); setPage(1); }}>
                <option value="">Tất cả cấp học</option>
                <option value="Undergraduate">Đại học</option>
                <option value="Graduate">Sau đại học</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : courses.length === 0 ? (
            <div className="text-center py-5 text-muted">Không tìm thấy môn học nào</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Mã môn</th>
                    <th>Tên môn học</th>
                    <th>Nhóm</th>
                    <th>Học kỳ</th>
                    <th>Giảng viên</th>
                    <th className="text-center">Sĩ số</th>
                    <th>Lịch học</th>
                    <th>Cấp</th>
                    <th className="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map(c => (
                    <tr key={c.id}>
                      <td className="ps-3 fw-bold text-primary">{c.course_code}</td>
                      <td>{c.course_name}</td>
                      <td><span className="badge bg-light text-dark border">{c.group_code}</span></td>
                      <td>{c.semester || 'Chưa có'}</td>
                      <td>{c.lecturer_name?.trim()}</td>
                      <td className="text-center">{c.capacity}</td>
                      <td className="text-nowrap">
                        <span className="text-muted">{DAY_VI[c.day_of_week] || c.day_of_week}</span><br />
                        <small>{c.start_time?.slice(0,5)} – {c.end_time?.slice(0,5)}</small>
                      </td>
                      <td>
                        <span className={`badge ${c.level === 'Graduate' ? 'bg-warning text-dark' : 'bg-info text-white'}`}>
                          {c.level === 'Graduate' ? 'Sau ĐH' : 'Đại học'}
                        </span>
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => openEdit(c)}>✏️</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
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

      {/* Modal Form */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-scrollable">
            <div className="modal-content" style={{ borderRadius: 12 }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold">{editing ? '✏️ Sửa môn học' : '+ Thêm môn học mới'}</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit} id="courseForm">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Mã môn *</label>
                      <input className="form-control" value={form.course_code} onChange={e=>setForm({...form,course_code:e.target.value})} required />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label fw-semibold small">Tên môn học *</label>
                      <input className="form-control" value={form.course_name} onChange={e=>setForm({...form,course_name:e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Mã nhóm *</label>
                      <input className="form-control" value={form.group_code} onChange={e=>setForm({...form,group_code:e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Sĩ số *</label>
                      <input className="form-control" type="number" min="1" value={form.capacity} onChange={e=>setForm({...form,capacity:e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Cấp học *</label>
                      <select className="form-select" value={form.level} onChange={e=>setForm({...form,level:e.target.value})} required>
                        <option value="">Chọn cấp...</option>
                        <option value="Undergraduate">Đại học</option>
                        <option value="Graduate">Sau đại học</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Học kỳ *</label>
                      <select className="form-select" value={form.semester} onChange={e=>setForm({...form,semester:e.target.value})} required>
                        <option value="">Chọn học kỳ...</option>
                        <option value="HK1 2024-2025">HK1 2024-2025</option>
                        <option value="HK2 2024-2025">HK2 2024-2025</option>
                        <option value="HK1 2025-2026">HK1 2025-2026</option>
                        <option value="HK2 2025-2026">HK2 2025-2026</option>
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Giảng viên *</label>
                      <input className="form-control" value={form.lecturer_name} onChange={e=>setForm({...form,lecturer_name:e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Thứ *</label>
                      <select className="form-select" value={form.day_of_week} onChange={e=>setForm({...form,day_of_week:e.target.value})} required>
                        <option value="">Chọn thứ...</option>
                        {DAYS.map(d=><option key={d} value={d}>{DAY_VI[d]}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Giờ bắt đầu *</label>
                      <input className="form-control" type="time" value={form.start_time} onChange={e=>setForm({...form,start_time:e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold small">Giờ kết thúc *</label>
                      <input className="form-control" type="time" value={form.end_time} onChange={e=>setForm({...form,end_time:e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-semibold small">Mô tả</label>
                      <textarea className="form-control" rows="2" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer border-0">
                <button className="btn btn-light" onClick={() => setShowModal(false)}>Hủy</button>
                <button className="btn btn-primary" form="courseForm" type="submit" disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm me-1" /> : null}
                  {editing ? 'Cập nhật' : 'Tạo môn học'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

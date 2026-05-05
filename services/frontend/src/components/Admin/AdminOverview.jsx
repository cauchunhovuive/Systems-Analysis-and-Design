// src/components/Admin/AdminOverview.jsx
import { useEffect, useState } from 'react';
import { apiClient } from '../../config/api';

const StatCard = ({ icon, label, value, color }) => (
  <div className="col-6 col-lg-3">
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, borderTop: `4px solid ${color}` }}>
      <div className="card-body text-center py-4">
        <div style={{ fontSize: '2.2rem' }}>{icon}</div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
        <div className="text-muted small fw-semibold">{label}</div>
      </div>
    </div>
  </div>
);

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiClient.get('/admin/dashboard')
      .then(r => setData(r.data.data))
      .catch(() => setError('Không thể tải dữ liệu dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center py-5">
      <div className="spinner-border text-primary" />
      <p className="mt-2 text-muted">Đang tải...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger">{error}</div>;

  const { stats, charts, recentActivity } = data;
  const statusColors = { SUCCESS: '#22c55e', PENDING: '#f59e0b', FAILED: '#ef4444' };
  const statusLabels = { SUCCESS: 'Đã duyệt', PENDING: 'Đang chờ', FAILED: 'Từ chối' };

  return (
    <div>
      {/* Stat Cards */}
      <div className="row g-3 mb-4">
        <StatCard icon="👥" label="Sinh viên" value={stats.totalStudents} color="#3b82f6" />
        <StatCard icon="📚" label="Môn học" value={stats.totalCourses} color="#22c55e" />
        <StatCard icon="✍️" label="Đăng ký" value={stats.totalEnrollments} color="#8b5cf6" />
        <StatCard icon="⏳" label="Chờ duyệt" value={stats.pendingEnrollments} color="#f59e0b" />
      </div>

      <div className="row g-3 mb-4">
        {/* Enrollment Status */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold mb-0">📈 Trạng thái đăng ký</h6>
            </div>
            <div className="card-body">
              {charts.enrollmentsByStatus.map(item => {
                const pct = stats.totalEnrollments ? Math.round(item.count / stats.totalEnrollments * 100) : 0;
                const color = statusColors[item.status] || '#94a3b8';
                return (
                  <div key={item.status} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span className="small fw-semibold" style={{ color }}>{statusLabels[item.status] || item.status}</span>
                      <span className="small text-muted">{item.count} ({pct}%)</span>
                    </div>
                    <div className="progress" style={{ height: 8, borderRadius: 4 }}>
                      <div className="progress-bar" style={{ width: `${pct}%`, background: color, borderRadius: 4 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Courses */}
        <div className="col-md-6">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-header bg-white border-0 pt-3 pb-0">
              <h6 className="fw-bold mb-0">🏆 Môn học đăng ký nhiều nhất</h6>
            </div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0 small">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Môn học</th>
                    <th className="text-center">Đăng ký</th>
                  </tr>
                </thead>
                <tbody>
                  {charts.topCourses?.map((c, i) => (
                    <tr key={i}>
                      <td className="ps-3">
                        <div className="fw-semibold">{c.course_name}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{c.course_code}</div>
                      </td>
                      <td className="text-center">
                        <span className="badge bg-primary rounded-pill">{c.enrolled}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-header bg-white border-0 pt-3 pb-0">
          <h6 className="fw-bold mb-0">🕐 Đăng ký gần đây</h6>
        </div>
        <div className="card-body p-0">
          <table className="table table-hover mb-0 small">
            <thead className="table-light">
              <tr>
                <th className="ps-3">Sinh viên</th>
                <th>Môn học</th>
                <th className="text-center">Trạng thái</th>
                <th>Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((a, i) => (
                <tr key={i}>
                  <td className="ps-3 fw-semibold">{a.student_name}</td>
                  <td>{a.course_name}</td>
                  <td className="text-center">
                    <span className="badge rounded-pill" style={{
                      background: statusColors[a.status] || '#94a3b8', color: 'white'
                    }}>
                      {statusLabels[a.status] || a.status}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(a.enrollment_date).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

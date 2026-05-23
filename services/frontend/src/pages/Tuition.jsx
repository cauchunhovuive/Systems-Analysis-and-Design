import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../config/api";
import { useAuth } from "../AuthProvider";

const PRICE_PER_CREDIT = 800_000; // 800,000 VNĐ / tín chỉ

const fmt = (n) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const getEnrollments = async () => {
  const res = await apiClient.get("/enrollments");
  return (res.data || []).filter((e) => e.status === "SUCCESS");
};

export default function Tuition() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!localStorage.getItem("token") || !isAuthenticated) navigate("/login");
  }, [navigate, isAuthenticated]);

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["enrollments"],
    queryFn: getEnrollments,
    enabled: isAuthenticated,
  });

  // Tính học phí
  const totalCredits = enrollments.reduce((s, e) => s + (e.credit || 0), 0);
  const totalFee = totalCredits * PRICE_PER_CREDIT;

  const bbtRows = enrollments.filter((e) => e.course_type?.trim() === "Bắt buộc");
  const tcRows  = enrollments.filter((e) => e.course_type?.trim() !== "Bắt buộc");

  const bbtCredits = bbtRows.reduce((s, e) => s + (e.credit || 0), 0);
  const tcCredits  = tcRows.reduce((s, e)  => s + (e.credit || 0), 0);

  if (isLoading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ marginTop: "60px", maxWidth: "960px" }}>
      {/* Header */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-light border" onClick={() => navigate("/")}>
          <i className="bi bi-arrow-left me-1" />
          Quay lại
        </button>
        <div>
          <h4 className="mb-0 fw-bold" style={{ color: "var(--color-primary)" }}>
            <i className="bi bi-wallet2 me-2" />
            Tra cứu học phí
          </h4>
          <p className="text-muted small mb-0">HK2 (2025-2026) · 800.000 ₫ / tín chỉ</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="portal-card text-center py-4">
            <p className="text-muted small fw-bold text-uppercase mb-2">Tổng tín chỉ</p>
            <h2 className="fw-bold mb-0" style={{ color: "var(--color-primary)" }}>
              {totalCredits}
            </h2>
            <p className="text-muted small mb-0">tín chỉ đã đăng ký</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="portal-card text-center py-4" style={{ borderLeft: "4px solid #3b82f6" }}>
            <p className="text-muted small fw-bold text-uppercase mb-2">Bắt buộc</p>
            <h2 className="fw-bold mb-0 text-primary">{bbtCredits}</h2>
            <p className="text-muted small mb-0">{fmt(bbtCredits * PRICE_PER_CREDIT)}</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="portal-card text-center py-4" style={{ borderLeft: "4px solid #f59e0b" }}>
            <p className="text-muted small fw-bold text-uppercase mb-2">Tự chọn</p>
            <h2 className="fw-bold mb-0" style={{ color: "#f59e0b" }}>{tcCredits}</h2>
            <p className="text-muted small mb-0">{fmt(tcCredits * PRICE_PER_CREDIT)}</p>
          </div>
        </div>
      </div>

      {/* Total fee banner */}
      <div
        className="rounded-4 p-4 mb-4 d-flex justify-content-between align-items-center"
        style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)", color: "#fff" }}
      >
        <div>
          <p className="mb-1 fw-bold opacity-75 small text-uppercase">Tổng học phí phải nộp</p>
          <h2 className="mb-0 fw-bold" style={{ fontSize: "2rem", letterSpacing: "-0.5px" }}>
            {fmt(totalFee)}
          </h2>
        </div>
        <i className="bi bi-receipt" style={{ fontSize: "3rem", opacity: 0.3 }} />
      </div>

      {/* Detail table */}
      {enrollments.length === 0 ? (
        <div className="portal-card text-center py-5 text-muted">
          <i className="bi bi-folder-x fs-1 mb-3 d-block text-secondary" />
          <p className="fw-semibold">Bạn chưa đăng ký học phần nào</p>
          <button className="btn btn-primary mt-2 px-4" onClick={() => navigate("/courses")}>
            Đăng ký ngay
          </button>
        </div>
      ) : (
        <div className="portal-card">
          <h6 className="fw-bold mb-3 border-bottom pb-3">Chi tiết từng học phần</h6>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="text-muted small text-uppercase">Mã MH</th>
                  <th className="text-muted small text-uppercase">Tên môn học</th>
                  <th className="text-muted small text-uppercase text-center">Loại</th>
                  <th className="text-muted small text-uppercase text-center">Tín chỉ</th>
                  <th className="text-muted small text-uppercase text-end">Học phí</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => (
                  <tr key={e.id}>
                    <td className="text-primary fw-bold" style={{ fontSize: "0.9rem" }}>
                      {e.course_code}
                    </td>
                    <td className="fw-semibold text-dark">{e.course_name}</td>
                    <td className="text-center">
                      <span
                        className="badge rounded-pill px-3"
                        style={{
                          backgroundColor:
                            e.course_type?.trim() === "Bắt buộc" ? "#eff6ff" : "#fffbeb",
                          color:
                            e.course_type?.trim() === "Bắt buộc" ? "#3b82f6" : "#f59e0b",
                          border: `1px solid ${e.course_type?.trim() === "Bắt buộc" ? "#bfdbfe" : "#fde68a"}`,
                        }}
                      >
                        {e.course_type || "Bắt buộc"}
                      </span>
                    </td>
                    <td className="text-center fw-bold">{e.credit}</td>
                    <td className="text-end fw-bold" style={{ color: "var(--color-primary)" }}>
                      {fmt((e.credit || 0) * PRICE_PER_CREDIT)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light">
                <tr>
                  <td colSpan={3} className="fw-bold text-uppercase small text-muted">
                    Tổng cộng
                  </td>
                  <td className="text-center fw-bold">{totalCredits}</td>
                  <td className="text-end fw-bold fs-6" style={{ color: "var(--color-primary)" }}>
                    {fmt(totalFee)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Note */}
      <p className="text-muted small mt-4 text-center">
        * Học phí được tính theo đơn giá <strong>800.000 ₫ / tín chỉ</strong>.
        Vui lòng liên hệ phòng tài vụ để biết thêm chi tiết.
      </p>
    </div>
  );
}
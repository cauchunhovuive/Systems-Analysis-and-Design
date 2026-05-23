import { useState } from 'react';

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'success',
    icon: '✅',
    title: 'Đăng ký học phần thành công',
    body: 'Bạn đã đăng ký thành công môn Software Engineering (CO3001) - 3 tín chỉ.',
    time: '5 phút trước',
    read: false,
  },
];

export default function Notifications() {
  const [open, setOpen]         = useState(false);
  const [notes, setNotes]       = useState(MOCK_NOTIFICATIONS);

  const unread = notes.filter(n => !n.read).length;

  const markAll = () => setNotes(ns => ns.map(n => ({ ...n, read: true })));
  const markOne = (id) => setNotes(ns => ns.map(n => n.id === id ? { ...n, read: true } : n));

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          position: 'relative', padding: '6px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        title="Thông báo"
      >
        <i className="bi bi-bell-fill" style={{ fontSize: '1.3rem', color: unread ? '#f59e0b' : '#6b7280' }} />
        {unread > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2,
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', width: 16, height: 16,
            fontSize: 10, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid #fff',
          }}>
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 999 }}
          />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 8px)',
            width: 340, background: '#fff',
            borderRadius: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.13)',
            border: '1px solid #e5e7eb', zIndex: 1000,
            overflow: 'hidden',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '14px 16px', borderBottom: '1px solid #f3f4f6',
            }}>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#111' }}>
                Thông báo {unread > 0 && <span style={{ color: '#f59e0b' }}>({unread})</span>}
              </span>
              {unread > 0 && (
                <button
                  onClick={markAll}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.8rem', fontWeight: 600 }}
                >
                  Đánh dấu tất cả đã đọc
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ maxHeight: 360, overflowY: 'auto' }}>
              {notes.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>Không có thông báo nào</p>
                </div>
              ) : notes.map(n => (
                <div
                  key={n.id}
                  onClick={() => markOne(n.id)}
                  style={{
                    display: 'flex', gap: 12, padding: '12px 16px',
                    background: n.read ? '#fff' : '#eff6ff',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer', transition: 'background 0.15s',
                  }}
                >
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: n.read ? '#f3f4f6' : '#dbeafe',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: n.read ? 500 : 700, fontSize: '0.875rem', color: '#111' }}>
                      {n.title}
                    </p>
                    <p style={{ margin: '2px 0 4px', fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.4 }}>
                      {n.body}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>{n.time}</span>
                  </div>
                  {!n.read && (
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: '#3b82f6', flexShrink: 0, marginTop: 6,
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
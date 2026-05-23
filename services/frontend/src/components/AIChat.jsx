import { useState, useRef, useEffect } from 'react';

const SYSTEM_PROMPT = `Bạn là trợ lý AI của hệ thống CRS (Course Registration System) - hệ thống đăng ký học phần đại học. 
Bạn hỗ trợ sinh viên về: đăng ký học phần, tra cứu lịch học, học phí, tiến độ học tập, và các vấn đề liên quan đến học vụ.
Trả lời ngắn gọn, thân thiện, bằng tiếng Việt. Nếu không biết, hướng dẫn liên hệ phòng đào tạo.`;

export default function AIChat() {
  const [open, setOpen]       = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Xin chào! Mình là trợ lý AI của CRS. Mình có thể giúp gì cho bạn về đăng ký học phần, lịch học, học phí...? 😊' }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef             = useRef(null);
  const inputRef              = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || 'Xin lỗi, mình không thể trả lời lúc này.';
      setMessages(ms => [...ms, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(ms => [...ms, { role: 'assistant', content: '❌ Lỗi kết nối. Vui lòng thử lại.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      {/* Chat button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '6px', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Trợ lý AI"
      >
        <i className="bi bi-chat-dots-fill" style={{ fontSize: '1.3rem', color: open ? 'var(--color-primary)' : '#6b7280' }} />
      </button>

      {/* Modal */}
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 1000 }}
          />
          <div style={{
            position: 'fixed',
            bottom: 80, right: 24,
            width: 380, height: 520,
            background: '#fff', borderRadius: 18,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            zIndex: 1001, display: 'flex', flexDirection: 'column',
            overflow: 'hidden', border: '1px solid #e5e7eb',
          }}>
            {/* Header */}
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #1d4ed8 100%)',
              padding: '14px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18,
                }}>🤖</div>
                <div>
                  <p style={{ margin: 0, color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Trợ lý CRS AI</p>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem' }}>
                    {loading ? 'Đang trả lời...' : 'Online'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: 18, lineHeight: 1 }}
              >×</button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {messages.map((m, i) => (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}>
                  {m.role === 'assistant' && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: '#eff6ff', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 14, marginRight: 6, flexShrink: 0, alignSelf: 'flex-end',
                    }}>🤖</div>
                  )}
                  <div style={{
                    maxWidth: '75%',
                    background: m.role === 'user' ? 'var(--color-primary)' : '#f3f4f6',
                    color: m.role === 'user' ? '#fff' : '#111',
                    borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    padding: '9px 13px',
                    fontSize: '0.875rem', lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: '#eff6ff', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 14,
                  }}>🤖</div>
                  <div style={{
                    background: '#f3f4f6', borderRadius: '16px 16px 16px 4px',
                    padding: '9px 14px', display: 'flex', gap: 4, alignItems: 'center',
                  }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{
                        width: 7, height: 7, borderRadius: '50%', background: '#9ca3af',
                        animation: 'bounce 1.2s infinite',
                        animationDelay: `${i * 0.2}s`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div style={{ padding: '0 14px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['Học phí của tôi?', 'Tiến độ học tập?', 'Cách đăng ký học phần?'].map(s => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); inputRef.current?.focus(); }}
                    style={{
                      background: '#eff6ff', border: '1px solid #bfdbfe',
                      borderRadius: 20, padding: '4px 10px',
                      fontSize: '0.75rem', color: 'var(--color-primary)',
                      cursor: 'pointer', fontWeight: 500,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '10px 12px', borderTop: '1px solid #f3f4f6',
              display: 'flex', gap: 8, alignItems: 'flex-end',
            }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Nhập câu hỏi... (Enter để gửi)"
                rows={1}
                style={{
                  flex: 1, border: '1.5px solid #e5e7eb', borderRadius: 10,
                  padding: '8px 12px', fontSize: '0.875rem', resize: 'none',
                  outline: 'none', fontFamily: 'inherit', lineHeight: 1.5,
                  maxHeight: 80, overflowY: 'auto',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--color-primary)'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: (!input.trim() || loading) ? '#e5e7eb' : 'var(--color-primary)',
                  border: 'none', cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 16, transition: 'background 0.2s', flexShrink: 0,
                }}
              >
                <i className="bi bi-send-fill" />
              </button>
            </div>
          </div>

          <style>{`
            @keyframes bounce {
              0%, 60%, 100% { transform: translateY(0); }
              30% { transform: translateY(-6px); }
            }
          `}</style>
        </>
      )}
    </>
  );
}
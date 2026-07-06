import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ShieldCheck, ArrowLeft, Bot, Phone, Mail, Clock, HelpCircle, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const feedEndRef = useRef(null);

  const quickQuestions = [
    { q: 'Refund status for failed checkout?', a: 'UPI checkout failures are auto-refunded to the source account within 2-3 business days. If not resolved, email transaction details to support.campuslunch@gmail.com.' },
    { q: 'How do I cancel my active tiffin?', a: 'According to campus kitchen policy, orders cannot be cancelled once food preparation starts. For emergencies, please call the kitchen chef directly.' },
<<<<<<< HEAD
    { q: 'How to register as a new chef vendor?', a: 'Go to /register?role=vendor to submit your FSSAI certificate. Our compliance team will review and approve your kitchen dashboard setup within 24 hours.' },
    { q: 'Change my dietary preference details?', a: 'Tap your Profile on the student bottom nav, select Edit Profile, choose your diet preference (Jain, Veg, or Non-Veg) and click Save Changes.' }
=======
    { q: 'How to register as a new chef vendor?', a: 'Go to /register?role=vendor to submit your kitchen registration. Our compliance team will review and approve your kitchen dashboard setup within 24 hours.' }
>>>>>>> backend-only
  ];

  const role = localStorage.getItem('role') || 'student';
  const ticketId = role === 'vendor' ? 'TK-8815' : 'TK-8821';
  const chatKey = `support_chat_messages_${ticketId}`;

  // Scroll to bottom helper
  const scrollToBottom = (behavior = 'smooth') => {
    feedEndRef.current?.scrollIntoView({ behavior });
  };

  // Initialize and poll localStorage messages
  useEffect(() => {
    // Purge cached dummy chats containing mock text to force clean initialization
    const cachedVal = localStorage.getItem(chatKey);
    if (cachedVal && (cachedVal.includes("completely crushed") || cachedVal.includes("Spice Garden, our admin team is reviewing"))) {
      localStorage.removeItem(chatKey);
    }

    const saved = localStorage.getItem(chatKey);
    if (!saved) {
      const initial = role === 'vendor' ? [
        { id: 1, sender: "admin", text: "Hello! Welcome to Campus Lunch Kitchen Support. How can we assist you with your orders or kitchen status today?", time: "07:15 AM" }
      ] : [
        { id: 1, sender: "admin", text: "Hi there! Welcome to Campus Lunch Live Support. 👋 How can we help you today?", time: "10:30 AM" }
      ];
      localStorage.setItem(chatKey, JSON.stringify(initial));
      setMessages(initial);
    } else {
      setMessages(JSON.parse(saved));
    }

    // Initial scroll
    setTimeout(() => scrollToBottom('auto'), 150);

    // Set up polling interval to check for admin replies and ticket status
    const interval = setInterval(() => {
      // Check if ticket status is closed
      const statusKey = `ticket_status_${ticketId}`;
      if (localStorage.getItem(statusKey) === 'closed') {
        localStorage.removeItem(statusKey);
        
        const initial = role === 'vendor' ? [
          { id: 1, sender: "admin", text: "Hello! Welcome to Campus Lunch Kitchen Support. How can we assist you with your orders or kitchen status today?", time: "07:15 AM" }
        ] : [
          { id: 1, sender: "admin", text: "Hi there! Welcome to Campus Lunch Live Support. 👋 How can we help you today?", time: "10:30 AM" }
        ];
        localStorage.setItem(chatKey, JSON.stringify(initial));
        setMessages(initial);
        alert("This support ticket session has been resolved and closed by the Administrator. The chat history has been refreshed.");
        setTimeout(() => scrollToBottom('auto'), 150);
        return;
      }

      const current = localStorage.getItem(chatKey);
      if (current) {
        const parsed = JSON.parse(current);
        setMessages(prev => {
          if (prev.length !== parsed.length || (prev.length > 0 && prev[prev.length - 1].id !== parsed[parsed.length - 1].id)) {
            setTimeout(() => scrollToBottom('smooth'), 100);
            return parsed;
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chatKey, role, ticketId]);

  const handleSendMessage = (text) => {
    if (!text.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentSaved = localStorage.getItem(chatKey);
    const list = currentSaved ? JSON.parse(currentSaved) : [];
    const updated = [...list, userMsg];
    localStorage.setItem(chatKey, JSON.stringify(updated));
    setMessages(updated);
    setInputVal('');

    setTimeout(() => scrollToBottom('smooth'), 50);

    // Dynamic Bot Reply
    const matched = quickQuestions.find(item => item.q.toLowerCase() === text.toLowerCase());
    if (matched) {
      setIsTyping(true);
      setTimeout(() => {
        const botReply = {
          id: Date.now() + 1,
          sender: 'admin',
          text: matched.a,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const latestSaved = localStorage.getItem(chatKey);
        const latestList = latestSaved ? JSON.parse(latestSaved) : [];
        const finalUpdated = [...latestList, botReply];
        localStorage.setItem(chatKey, JSON.stringify(finalUpdated));
        setMessages(finalUpdated);
        setIsTyping(false);
        setTimeout(() => scrollToBottom('smooth'), 100);
      }, 1200);
    } else {
      // Default Bot typing acknowledgment for other questions
      setIsTyping(true);
      setTimeout(() => {
        const botReply = {
          id: Date.now() + 1,
          sender: 'admin',
          text: "Thanks for writing in! Your query has been logged under support ID " + ticketId + ". A member of our support crew is connecting shortly.",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        const latestSaved = localStorage.getItem(chatKey);
        const latestList = latestSaved ? JSON.parse(latestSaved) : [];
        const finalUpdated = [...latestList, botReply];
        localStorage.setItem(chatKey, JSON.stringify(finalUpdated));
        setMessages(finalUpdated);
        setIsTyping(false);
        setTimeout(() => scrollToBottom('smooth'), 100);
      }, 1500);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 16px', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Dynamic responsive CSS style rules injected */}
      <style>{`
        .support-layout {
          display: grid;
          grid-template-columns: 1fr;
          background-color: #ffffff; 
          border-radius: 24px; 
          border: 1px solid rgba(0,0,0,0.06); 
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06); 
          overflow: hidden;
          height: 700px;
        }
        .support-sidebar-panel {
          display: none;
          background-color: #f8fafc;
          border-right: 1px solid #e2e8f0;
          padding: 24px;
          flex-direction: column;
          gap: 20px;
        }
        @media (min-width: 800px) {
          .support-layout {
            grid-template-columns: 340px 1fr;
            height: 760px;
          }
          .support-sidebar-panel {
            display: flex;
          }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .msg-bubble-animation {
          animation: slideInMsg 0.25s ease-out forwards;
        }
        @keyframes slideInMsg {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Back button */}
      <button 
        onClick={() => {
          const userRole = localStorage.getItem('role');
          if (userRole === 'student') navigate('/student');
          else if (userRole === 'vendor') navigate('/vendor-dashboard');
          else if (userRole === 'admin') navigate('/admin');
          else navigate('/');
        }}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px', 
          border: 'none', 
          background: 'transparent', 
          color: '#855300', 
          fontWeight: 800, 
          fontSize: '0.82rem', 
          cursor: 'pointer',
          marginBottom: '14px',
          padding: '4px 8px',
          borderRadius: '8px',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(133, 83, 0, 0.05)'}
        onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <ArrowLeft size={16} />
        Exit to Dashboard
      </button>

      {/* Main Support Grid */}
      <div className="support-layout">
        
        {/* LEFT COLUMN: Sidebar (Desktop only) */}
        <div className="support-sidebar-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 900, backgroundColor: '#fef3c7', color: '#855300', padding: '4px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>TICKET ID</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#334155' }}>{ticketId}</span>
          </div>

          <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px' }}>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.9rem', fontWeight: 800, color: '#0f172a' }}>Live Support Hub</h4>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#64748b', lineHeight: '1.4' }}>Campus Lunch is committed to fast, clean, and warm food delivery services.</p>
          </div>

          {/* Quick Info Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Clock size={16} style={{ color: '#855300', marginTop: '2px' }} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1e293b', display: 'block' }}>Operational Hours</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>09:00 AM - 10:00 PM</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Phone size={16} style={{ color: '#855300', marginTop: '2px' }} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1e293b', display: 'block' }}>Hotline Assistance</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>+91 98765 01234</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <Mail size={16} style={{ color: '#855300', marginTop: '2px' }} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: '#1e293b', display: 'block' }}>Email Support</span>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>help.tiffin@campus.edu</span>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div style={{ marginTop: 'auto', padding: '12px', borderRadius: '12px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#059669', animation: 'pulse 1.5s infinite' }}></div>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#047857' }}>Support Crew Online</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Chat Window */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
          
          {/* Header Panel */}
          <div style={{ 
            background: 'linear-gradient(135deg, #855300 0%, #a16207 100%)', 
            padding: '16px 20px', 
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 4px 12px rgba(133, 83, 0, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900 }}>Campus Lunch Assistant</h3>
                <p style={{ margin: 0, fontSize: '0.7rem', color: '#fef3c7', fontWeight: 600 }}>Active helpdesk session</p>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '0.66rem', 
              color: '#ffffff', 
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontWeight: 800
            }}>
              <ShieldCheck size={12} />
              ENCRYPTED
            </div>
          </div>

          {/* Messages Feed View */}
          <div className="custom-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.map(msg => {
              const isAdmin = msg.sender === 'admin';
              return (
                <div 
                  key={msg.id} 
                  className="msg-bubble-animation"
                  style={{ 
                    display: 'flex', 
                    justifyContent: isAdmin ? 'flex-start' : 'flex-end', 
                    alignItems: 'flex-start',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '75%' }}>
                    <div style={{ 
                      padding: '12px 16px', 
                      borderRadius: isAdmin ? '4px 16px 16px 16px' : '16px 4px 16px 16px', 
                      backgroundColor: isAdmin ? '#ffffff' : '#855300',
                      color: isAdmin ? '#1e293b' : '#ffffff',
                      border: isAdmin ? '1px solid rgba(0,0,0,0.05)' : 'none',
                      fontSize: '0.82rem',
                      lineHeight: '1.45',
                      fontWeight: 500,
                      boxShadow: isAdmin ? '0 2px 8px rgba(0,0,0,0.02)' : '0 4px 12px rgba(133, 83, 0, 0.1)',
                      textAlign: 'left',
                      whiteSpace: 'pre-line'
                    }}>
                      {msg.text}
                    </div>
                    <span style={{ fontSize: '0.6rem', color: '#94a3b8', textAlign: isAdmin ? 'left' : 'right', alignSelf: isAdmin ? 'flex-start' : 'flex-end', padding: '0 4px' }}>{msg.time}</span>
                  </div>
                </div>
              );
            })}

            {/* Simulated Live Typing Indicator */}
            {isTyping && (
              <div className="msg-bubble-animation" style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <div style={{ 
                    padding: '12px 18px', 
                    borderRadius: '4px 16px 16px 16px', 
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}>
                    <Loader2 size={14} className="animate-spin" style={{ color: '#855300' }} />
                    <span style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>Support is typing...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={feedEndRef} />
          </div>

          {/* Quick Questions Grid */}
          <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px', backgroundColor: '#ffffff' }}>
            <span style={{ fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px', textAlign: 'left', letterSpacing: '0.5px' }}>
              Common Support Queries
            </span>
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', whiteSpace: 'nowrap' }} className="custom-scrollbar">
              {quickQuestions.map((item, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleSendMessage(item.q)}
                  style={{ 
                    padding: '8px 14px', 
                    borderRadius: '20px', 
                    backgroundColor: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    fontSize: '0.74rem', 
                    color: '#475569', 
                    fontWeight: 700, 
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#fef3c7';
                    e.target.style.borderColor = '#f59e0b';
                    e.target.style.color = '#855300';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#f8fafc';
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.color = '#475569';
                  }}
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>

          {/* Message Input Box Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (inputVal.trim()) {
                handleSendMessage(inputVal);
              }
            }}
            style={{ 
              borderTop: '1px solid #e2e8f0', 
              padding: '14px 18px', 
              display: 'flex', 
              gap: '12px', 
              alignItems: 'center', 
              backgroundColor: '#ffffff' 
            }}
          >
            <input 
              type="text"
              placeholder="Type your query and press Enter..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              style={{ 
                flex: 1, 
                border: 'none', 
                outline: 'none', 
                fontSize: '0.84rem', 
                color: '#1e293b',
                fontWeight: 500
              }}
            />
            <button 
              type="submit" 
              disabled={!inputVal.trim()}
              style={{ 
                backgroundColor: inputVal.trim() ? '#855300' : '#cbd5e1', 
                border: 'none', 
                color: '#ffffff', 
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                cursor: inputVal.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
            >
              <Send size={16} />
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};

export default SupportChat;

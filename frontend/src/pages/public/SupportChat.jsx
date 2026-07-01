import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, ShieldCheck, ArrowLeft, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const feedEndRef = useRef(null);

  const quickQuestions = [
    { q: 'Where is my refund for a failed UPI checkout?', a: 'UPI failures are auto-refunded to the source account within 2-3 business days. If you do not see it, please send the transaction ID to support.campuslunch@gmail.com.' },
    { q: 'How do I cancel my tiffin subscription order?', a: 'Under academic guidelines, orders cannot be cancelled once preparation begins. For special cases, you must contact your assigned vendor directly.' },
    { q: 'How do I register as a home kitchen vendor?', a: 'Go to the Join as Vendor page (or /register?role=vendor), submit your FSSAI registration details and kitchen photos. Our admin team will approve it within 24 hours!' },
    { q: 'How do I update my delivery room address?', a: 'Go to the Student Dashboard tab, tap the profile icon on the top right, update your hostel name/room number and click save!' }
  ];

  const role = localStorage.getItem('role');
  const ticketId = role === 'vendor' ? 'TK-8815' : 'TK-8821';
  const chatKey = `support_chat_messages_${ticketId}`;

  // Initialize and poll localStorage messages
  useEffect(() => {
    const saved = localStorage.getItem(chatKey);
    if (!saved) {
      const initial = role === 'vendor' ? [
        { id: 1, sender: "user", text: "I cannot login to the vendor partner app. It says FSSAI credential verification pending.", time: "07:15 AM" },
        { id: 2, sender: "admin", text: "Hello Spice Garden, our admin team is reviewing your FSSAI documents. We will approve it shortly.", time: "07:30 AM" }
      ] : [
        { id: 1, sender: "admin", text: "Hi there! Welcome to Campus Lunch Live Support. 👋 How can we help you today?", time: "10:30 AM" },
        { id: 2, sender: "user", text: "Hi support, I just received my order (#99212) from 'The Curry Pot' but the dal container was completely crushed. Half of it is in the bag. Can I get a refund or a replacement? I'm quite hungry!", time: "10:42 AM" },
        { id: 3, sender: "admin", text: "I'm so sorry to hear that, John! That's definitely not the experience we want for you. I've already reached out to the dispatch team. Would you prefer a fresh replacement or a full refund to your wallet?", time: "10:48 AM" }
      ];
      localStorage.setItem(chatKey, JSON.stringify(initial));
      setMessages(initial);
    } else {
      setMessages(JSON.parse(saved));
    }

    // Set up polling interval to check for admin replies
    const interval = setInterval(() => {
      const current = localStorage.getItem(chatKey);
      if (current) {
        const parsed = JSON.parse(current);
        setMessages(prev => {
          if (prev.length !== parsed.length || (prev.length > 0 && prev[prev.length - 1].id !== parsed[parsed.length - 1].id)) {
            return parsed;
          }
          return prev;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [chatKey, role]);

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

    // Smooth scroll to the bottom only when the user sends a message
    setTimeout(() => {
      feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div style={{ maxWidth: '600px', margin: '30px auto', padding: '0 16px', fontFamily: 'Outfit, sans-serif' }}>
      
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
          color: '#64748b', 
          fontWeight: 700, 
          fontSize: '0.88rem', 
          cursor: 'pointer',
          marginBottom: '16px' 
        }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Chat Pane */}
      <div style={{ 
        backgroundColor: '#ffffff', 
        borderRadius: '24px', 
        border: '1px solid rgba(0,0,0,0.06)', 
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.04)', 
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: '560px'
      }}>
        
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #0b1c30 0%, #1e293b 100%)', 
          padding: '16px 20px', 
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              backgroundColor: 'rgba(255,255,255,0.08)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#f59e0b',
              position: 'relative'
            }}>
              <MessageSquare size={22} />
              <span style={{ 
                position: 'absolute', 
                bottom: '1px', 
                right: '1px', 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: '#10b981', 
                border: '2px solid #0f172a' 
              }}></span>
            </div>
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Campus Lunch Support</h3>
              <p style={{ margin: 0, fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>Typically replies in 1 minute</p>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '4px', 
            fontSize: '0.7rem', 
            color: '#10b981', 
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            padding: '4px 8px',
            borderRadius: '20px',
            fontWeight: 800
          }}>
            <ShieldCheck size={12} />
            SECURE
          </div>
        </div>

        {/* Messages Feed */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map(msg => {
            const isAdmin = msg.sender === 'admin';
            return (
              <div 
                key={msg.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: isAdmin ? 'flex-start' : 'flex-end', 
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                {isAdmin && (
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    backgroundColor: '#e2e8f0', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#475569',
                    fontSize: '0.8rem',
                    flexShrink: 0
                  }}>
                    👨‍💼
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '75%' }}>
                  <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: isAdmin ? '4px 16px 16px 16px' : '16px 4px 16px 16px', 
                    backgroundColor: isAdmin ? '#ffffff' : '#f59e0b',
                    color: isAdmin ? '#1e293b' : '#0f172a',
                    border: isAdmin ? '1px solid rgba(0,0,0,0.04)' : 'none',
                    fontSize: '0.85rem',
                    lineHeight: '1.4',
                    fontWeight: isAdmin ? 500 : 600,
                    boxShadow: isAdmin ? '0 2px 4px rgba(0,0,0,0.01)' : 'none',
                    textAlign: 'left'
                  }}>
                    {msg.text}
                  </div>
                  <span style={{ fontSize: '0.62rem', color: '#94a3b8', textAlign: isAdmin ? 'left' : 'right', alignSelf: isAdmin ? 'flex-start' : 'flex-end' }}>{msg.time}</span>
                </div>
              </div>
            );
          })}
          <div ref={feedEndRef} />
        </div>

        {/* Quick Questions Grid */}
        <div style={{ borderTop: '1px solid #e2e8f0', padding: '12px 16px', backgroundColor: '#ffffff' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', color: '#94a3b8', display: 'block', marginBottom: '8px', textAlign: 'left' }}>
            Quick Help Topics
          </span>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', whiteSpace: 'nowrap' }}>
            {quickQuestions.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => handleSendMessage(item.q)}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '20px', 
                  backgroundColor: '#f1f5f9', 
                  border: '1px solid rgba(0,0,0,0.02)', 
                  fontSize: '0.75rem', 
                  color: '#334155', 
                  fontWeight: 600, 
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  outline: 'none'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#f1f5f9'}
              >
                {item.q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputVal);
          }}
          style={{ 
            borderTop: '1px solid #e2e8f0', 
            padding: '12px 16px', 
            display: 'flex', 
            gap: '10px', 
            alignItems: 'center', 
            backgroundColor: '#ffffff' 
          }}
        >
          <input 
            type="text"
            placeholder="Type your message here..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{ 
              flex: 1, 
              border: 'none', 
              outline: 'none', 
              fontSize: '0.85rem', 
              color: '#334155' 
            }}
          />
          <button 
            type="submit" 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: '#f59e0b', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px'
            }}
          >
            <Send size={18} />
          </button>
        </form>

      </div>
    </div>
  );
};

export default SupportChat;

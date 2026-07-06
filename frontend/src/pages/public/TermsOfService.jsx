import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Clock, 
  Utensils, 
  CreditCard,
  ChevronRight
} from 'lucide-react';

const TermsOfService = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('rules');

  const sections = [
    { id: 'rules', title: '1. General Rules', icon: <FileText size={18} /> },
    { id: 'orders', title: '2. Delivery Cutoffs', icon: <Clock size={18} /> },
    { id: 'kitchens', title: '3. Vendor Hygiene', icon: <Utensils size={18} /> },
    { id: 'payments', title: '4. UPI Payments', icon: <CreditCard size={18} /> }
  ];

  const handleScrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* Top Premium Cover Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0b1c30 0%, #1e293b 100%)',
        padding: '50px 20px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative circle layouts */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.08)', filter: 'blur(30px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-40px', left: '10%', width: '150px', height: '150px', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.06)', filter: 'blur(20px)' }}></div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'left' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginBottom: '28px'
            }}
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
          
          <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '2px', color: '#f59e0b', fontWeight: 800, display: 'block', marginBottom: '8px' }}>
            Legal Guidelines
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Terms of Service</h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#94a3b8' }}>
            Last Updated: June 2026 • Review compliance guidelines, subscription limits, and payment processing rules.
          </p>
        </div>
      </div>

      {/* Core Grid Wrapper */}
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '30px' }}>
          
          {/* Left Column: Sticky Sidebar Selector */}
          <div className="terms-sidebar-col" style={{ gridColumn: 'span 4', position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '20px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', textAlign: 'left' }}>
                Guidelines
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sections.map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => handleScrollTo(sec.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      border: 'none',
                      backgroundColor: activeSection === sec.id ? 'rgba(11, 28, 48, 0.05)' : 'transparent',
                      color: activeSection === sec.id ? '#0b1c30' : '#64748b',
                      fontSize: '0.88rem',
                      fontWeight: activeSection === sec.id ? 800 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ color: activeSection === sec.id ? '#f59e0b' : '#94a3b8' }}>
                      {sec.icon}
                    </span>
                    <span>{sec.title.split('. ')[1]}</span>
                    {activeSection === sec.id && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Terms Sections */}
          <div className="terms-content-col" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            
            {/* Sec 1 */}
            <div id="rules" style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(11, 28, 48, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b1c30' }}>
                  <FileText size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', margin: 0 }}>1. General Rules</h2>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                By accessing Campus Lunch, you agree to comply with our academic guidelines, order schedules, and delivery protocols.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Account Limits</strong>: Each subscriber is allowed a single active account mapped to a verified university email.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Service Eligibility</strong>: Active subscriptions are restricted to students, kitchen partners, and authorized campus staff.</span>
                </div>
              </div>
            </div>

            {/* Sec 2 */}
            <div id="orders" style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <Clock size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', margin: 0 }}>2. Ordering & Delivery Cutoffs</h2>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Tiffins must be ordered before the cutoff slots. Deliveries are made to specified drop zones at each hostel building.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Cutoff Timings</strong>: Breakfast orders lock at 8:00 AM, Lunch at 11:30 AM, and Dinner at 6:30 PM.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Refund Thresholds</strong>: Once prep begins, orders are locked and refunds are only processed for delivery errors.</span>
                </div>
              </div>
            </div>

            {/* Sec 3 */}
            <div id="kitchens" style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Utensils size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', margin: 0 }}>3. Vendor hygiene responsibilities</h2>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Kitchen partners must adhere strictly to food safety regulations and portion sizing parameters set by the campus administration.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Licensing</strong>: Home kitchen operations must submit valid identity and business registration details prior to activation.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Package Integrity</strong>: Meals must be packed in spill-proof containers to avoid damage during transit.</span>
                </div>
              </div>
            </div>

            {/* Sec 4 */}
            <div id="payments" style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                  <CreditCard size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', margin: 0 }}>4. Online Payments</h2>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                All digital order checkouts must be paid in full using linked UPI apps. Double-check transaction amounts before authentication.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Processing</strong>: UPI checkouts are routed securely. Refunds are settled in 2-3 business days.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Failures</strong>: Failed checkouts are auto-credited back to the source bank account.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Styled mobile rules overrides */}
      <style>{`
        @media (max-width: 768px) {
          .terms-sidebar-col {
            display: none !important;
          }
          .terms-content-col {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TermsOfService;

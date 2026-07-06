import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Shield, 
  Database, 
  Lock, 
  Eye, 
  FileText,
  ChevronRight
} from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('collect');

  const sections = [
    { id: 'collect', title: '1. Data Collection', icon: <Database size={18} /> },
    { id: 'use', title: '2. Usage Policies', icon: <Eye size={18} /> },
    { id: 'security', title: '3. Data Security', icon: <Lock size={18} /> },
    { id: 'disclosure', title: '4. Third-Parties', icon: <Shield size={18} /> }
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
        {/* Subtle decorative circles */}
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
            Privacy Center
          </span>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Privacy Policy</h1>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem', color: '#94a3b8' }}>
            Last Updated: June 2026 • Discover how Campus Lunch gathers, secures, and handles user account information.
          </p>
        </div>
      </div>

      {/* Main Core Layout */}
      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '30px' }}>
          
          {/* Left Column: Sticky Table of Contents (Desktop Only) */}
          <div className="policy-sidebar-col" style={{ gridColumn: 'span 4', position: 'sticky', top: '100px', height: 'fit-content' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '20px'
            }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: '#64748b', letterSpacing: '1px', textAlign: 'left' }}>
                Table of Contents
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

          {/* Right Column: Policy Section Blocks */}
          <div className="policy-content-col" style={{ gridColumn: 'span 8', display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
            
            {/* Sec 1 */}
            <div id="collect" style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(11, 28, 48, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0b1c30' }}>
                  <Database size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', margin: 0 }}>1. Information We Collect</h2>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                To facilitate the delivery of healthy home-cooked tiffins, we gather critical profile parameters when you open an account.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Account Profile Fields</strong>: Full Name, contact email, primary phone number, hostel block, and room address coordinates.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Transaction Summaries</strong>: Order histories, selected meals, subscription durations, and verified UPI transaction IDs.</span>
                </div>
              </div>
            </div>

            {/* Sec 2 */}
            <div id="use" style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(245, 158, 11, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <Eye size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', margin: 0 }}>2. How We Use Your Data</h2>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Your data is strictly utilized to operate local tiffin hub infrastructure. We never engage in commercial data broker transfers or lease your profile coordinates.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Kitchen Deliveries</strong>: Sharing delivery names and hostel coordinates with rider agents to complete shipments.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Infrastructure Support</strong>: Tracking error telemetry, payment logs, and support chat records to process ticket refunds.</span>
                </div>
              </div>
            </div>

            {/* Sec 3 */}
            <div id="security" style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(16, 185, 129, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                  <Lock size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', margin: 0 }}>3. Data Security Policies</h2>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                Customer details are encrypted and transmitted directly through Unified Payments Interface (UPI) banking applications.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Cryptographic Safeguards</strong>: Secure Socket Layers (SSL/TLS) for network traffic.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Isolated Sessions</strong>: Client credentials cache stores are cleared automatically upon logout actions.</span>
                </div>
              </div>
            </div>

            {/* Sec 4 */}
            <div id="disclosure" style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              border: '1px solid rgba(0,0,0,0.04)',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.02)',
              padding: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6366f1' }}>
                  <Shield size={20} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', margin: 0 }}>4. Third-Party Disclosures</h2>
              </div>
              <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                We share only minimum transactional identifiers with verified delivery riders and active home kitchens to enable accurate logistics fulfillment.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Rider Logs</strong>: Sharing recipient name, active hostel drop zone, and mobile coordinate values.</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '0.85rem', color: '#334155' }}>
                  <span style={{ color: '#f59e0b', fontWeight: 800 }}>•</span>
                  <span><strong>Kitchen Portal</strong>: Portion choices and customized subscription schedules.</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Styled mobile rules overrides */}
      <style>{`
        @media (max-width: 768px) {
          .policy-sidebar-col {
            display: none !important;
          }
          .policy-content-col {
            grid-column: span 12 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default PrivacyPolicy;

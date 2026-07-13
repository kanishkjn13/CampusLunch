import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Utensils, MapPin, Clock, Star, ChefHat, Smartphone, Smile, Calendar, Sprout, ShieldCheck } from 'lucide-react';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import logo from '@/assets/logos/logo.png';

const Landing = () => {
  const navigate = useNavigate();
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [activeFeature, setActiveFeature] = useState('safety');
  const timelineRef = useRef(null);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'student') {
      navigate('/student', { replace: true });
    } else if (role === 'vendor') {
      navigate('/vendor-dashboard', { replace: true });
    } else if (role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      
      const rect = timelineRef.current.getBoundingClientRect();
      const elementTop = rect.top;
      
      const startPos = window.innerHeight * 0.70;
      const endPos = window.innerHeight * 0.30;
      const totalSpan = startPos - endPos;
      
      if (elementTop > startPos) {
        setTimelineProgress(0);
      } else if (elementTop < endPos) {
        setTimelineProgress(100);
      } else {
        const pct = ((startPos - elementTop) / totalSpan) * 100;
        setTimelineProgress(Math.min(100, Math.max(0, pct)));
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page-wrapper">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg-container">
          <div className="hero-overlay-gradient"></div>
          <div className="hero-bg-image"></div>
        </div>
        
        {/* Brand logo and name on hero image for mobile viewports */}
        <div className="mobile-brand-header">
          <img src={logo} alt="CampusLunch Logo" className="mobile-brand-logo" />
          <span className="mobile-brand-title-text">Campus Lunch</span>
        </div>

        <div className="container hero-content">
          <div className="hero-logo-container">
            <img src={logo} alt="CampusLunch Logo" className="hero-logo-main" />
          </div>
          <h1 className="hero-title">
            Homemade Tiffins <br />
            for Students
          </h1>
          <p className="hero-subtitle">
            Affordable, nutritious, and straight from the best home-chefs to your campus.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary hero-cta-btn hero-cta-link">
              Register as Student
            </Link>
            <Link to="/register?role=vendor" className="btn btn-secondary hero-sec-btn hero-sec-link">
              Join as Vendor
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="how-it-works-glow-1"></div>
        <div className="how-it-works-glow-2"></div>
        <div className="container">
          <div className="text-center mb-12 section-header">
            <h2>How it Works</h2>
            <div className="section-header-underline"></div>
          </div>

          <div ref={timelineRef} className="step-cards-container">
            {/* Desktop timeline line (Horizontal) */}
            <div className="step-timeline-line-wrapper desktop-only">
              <div className="step-timeline-line-base"></div>
              <div className="step-timeline-line-active" style={{ clipPath: `inset(0 ${100 - timelineProgress}% 0 0)` }}></div>
            </div>

            {/* Mobile timeline line (Vertical) */}
            <div className="step-timeline-line-wrapper mobile-only">
              <div className="step-timeline-line-base"></div>
              <div className="step-timeline-line-active" style={{ clipPath: `inset(0 0 ${100 - timelineProgress}% 0)` }}></div>
            </div>

            <StepCard
              number="1"
              icon={<Utensils size={24} />}
              title="Select Your Tiffin"
              description="Browse local home-chefs and choose from various home-cooked options."
              active={timelineProgress > 0}
            />
            <StepCard
              number="2"
              icon={<Calendar size={24} />}
              title="Subscribe Easily"
              description="Choose a weekly or monthly plan that fits your college schedule and budget."
              active={timelineProgress >= 50}
            />
            <StepCard
              number="3"
              icon={<MapPin size={24} />}
              title="Enjoy at Campus"
              description="Hot, delicious meals delivered right to your doorstep or campus pickup point."
              active={timelineProgress >= 95}
            />
          </div>
        </div>
      </section>

      {/* Interactive Value Explorer Section */}
      {(() => {
        const featuresData = {
          safety: {
            title: "Safe & Hygienic",
            subtitle: "Highest standards of kitchen cleanliness",
            description: "Our partner home chefs undergo strict hygiene audits and temperature checks daily.",
            color: "#059669",
            bgColor: "rgba(16, 185, 129, 0.05)",
            badgeColor: "#10b981",
            icon: <ShieldCheck size={28} />,
            points: [
              "Verified clean home kitchens",
              "Mandatory daily kitchen sanitization",
              "Temperature-monitored contactless prep"
            ],
            interactiveNode: (
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.15)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Hygiene Scorecard</span>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669', margin: '4px 0' }}>98 / 100</div>
                <span style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>Grade A • Clean Kitchen Certificate</span>
              </div>
            )
          },
          fresh: {
            title: "Fresh Every Day",
            subtitle: "Made fresh, delivered hot",
            description: "No frozen meals, no reheated leftovers. Your food is prepared fresh right before delivery.",
            color: "#b45309",
            bgColor: "rgba(245, 158, 11, 0.05)",
            badgeColor: "#f59e0b",
            icon: <Sprout size={28} />,
            points: [
              "Sourced locally, prepared fresh daily",
              "Zero artificial food preservatives",
              "Delivered warm in insulated boxes"
            ],
            interactiveNode: (
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.15)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Farm-to-Tiffin</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#b45309', margin: '4px 0' }}>&lt; 3 Hours</div>
                <span style={{ fontSize: '0.78rem', color: '#78350f', fontWeight: 600 }}>From Stove Cooked to Campus Delivery</span>
              </div>
            )
          },
          flexibility: {
            title: "Flexible Plans",
            subtitle: "Tailored to your student schedule",
            description: "College life is unpredictable. Pause, resume, or cancel your tiffin plan easily.",
            color: "#2563eb",
            bgColor: "rgba(59, 130, 246, 0.05)",
            badgeColor: "#3b82f6",
            icon: <Clock size={28} />,
            points: [
              "1-tap skip button for exams/holidays",
              "Pause and resume subscription anytime",
              "Flexible payment options (UPI, Cards)"
            ],
            interactiveNode: (
              <div style={{ padding: '16px', borderRadius: '16px', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subscription Mode</span>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: '#2563eb', color: '#ffffff' }}>Active</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.8)', color: '#64748b', border: '1px solid rgba(0,0,0,0.1)' }}>Skip Tomorrow</span>
                </div>
              </div>
            )
          }
        };

        const activeData = featuresData[activeFeature];

        return (
          <section className="features-section-wrapper" style={{ padding: '48px 16px', backgroundColor: '#f8fafc', borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
            <div className="container" style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center' }}>
              
              <div style={{ marginBottom: '28px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#b45309', textTransform: 'uppercase', letterSpacing: '1.5px', display: 'block', marginBottom: '6px' }}>Our Value Pillars</span>
                <h2 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0b1c30', margin: 0 }}>Why Students Choose Us</h2>
              </div>

              {/* Pill Switcher */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '14px', marginBottom: '24px' }}>
                {Object.keys(featuresData).map((key) => {
                  const item = featuresData[key];
                  const isActive = activeFeature === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveFeature(key)}
                      style={{
                        flex: 1,
                        padding: '10px 4px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        borderRadius: '10px',
                        border: 'none',
                        backgroundColor: isActive ? '#ffffff' : 'transparent',
                        color: isActive ? item.color : '#64748b',
                        boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.25s ease'
                      }}
                    >
                      {item.title}
                    </button>
                  );
                })}
              </div>

              {/* Feature Card Detail */}
              <div 
                key={activeFeature}
                className="interactive-feature-card"
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '24px',
                  padding: '24px',
                  border: '1px solid rgba(0, 0, 0, 0.04)',
                  boxShadow: '0 12px 32px rgba(11, 28, 48, 0.04)',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  animation: 'fadeInUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '14px',
                    backgroundColor: activeData.bgColor,
                    color: activeData.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {activeData.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0b1c30', margin: 0 }}>{activeData.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, margin: '2px 0 0' }}>{activeData.subtitle}</p>
                  </div>
                </div>

                <p style={{ fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.5' }}>
                  {activeData.description}
                </p>

                {/* Points List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {activeData.points.map((pt, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ color: activeData.color, fontWeight: 900, fontSize: '0.9rem' }}>✓</span>
                      <span style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* Interactive Node Block */}
                {activeData.interactiveNode}
              </div>

            </div>
          </section>
        );
      })()}


      {/* Call to Action Section */}
      <section className="cta-section-wrapper">
        <div className="container cta-container">
          <div className="cta-card">
            <div className="cta-blur-sphere"></div>
            <div className="cta-card-content">
              <h2 className="cta-title">Ready to eat better?</h2>
              <p className="cta-subtext">Join 2,000+ students already saving time and eating healthy with Campus Lunch.</p>
              <Link to="/register">
                <Button className="cta-primary-btn">Get Started Now</Button>
              </Link>
              <p className="cta-small-text">Free cancellation for the first 3 days.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const StepCard = ({ number, icon, title, description, active }) => (
  <div className={`step-card ${active ? 'active' : ''}`}>
    <div className="step-card-glow"></div>
    <div className="step-number-watermark">0{number}</div>
    <div className="step-number-badge">Step 0{number}</div>
    <div className="step-icon-wrapper">
      {icon}
    </div>
    <div className="step-card-content">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  </div>
);

export default Landing;

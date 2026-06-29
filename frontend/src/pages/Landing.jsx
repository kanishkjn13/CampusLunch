import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, MapPin, Clock, Star, ChefHat, Smartphone, Smile, Calendar, Sprout, ShieldCheck } from 'lucide-react';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import logo from '../assets/logo.png';

const Landing = () => {
  const [timelineProgress, setTimelineProgress] = useState(0);
  const timelineRef = useRef(null);

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
          <span className="mobile-brand-title-text">CampusLunch</span>
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
            <Link to="/register" className="hero-cta-link">
              <Button className="hero-cta-btn">
                Register as Student
              </Button>
            </Link>
            <Link to="/register?role=vendor" className="hero-sec-link">
              <Button variant="secondary" className="hero-sec-btn">
                Join as Vendor
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid: Value Pillars */}
      <section className="features-section">
        <div className="container features-grid">
          <div className="feature-card feature-card-2">
            <div className="feature-header-row flex justify-between items-center w-full">
              <div className="feature-icon-wrapper-circle">
                <ShieldCheck size={24} />
              </div>
              <span className="feature-badge">TOP CHOICE</span>
            </div>
            <div className="feature-card-content">
              <h3>Safe & Hygienic</h3>
            </div>
          </div>

          <div className="feature-card feature-card-1">
            <div className="feature-icon-wrapper-circle">
              <Sprout size={24} />
            </div>
            <div className="feature-card-content">
              <h3>Fresh Every Day</h3>
            </div>
          </div>
          
          <div className="feature-card feature-card-3">
            <div className="feature-icon-wrapper-circle">
              <Clock size={24} />
            </div>
            <div className="feature-card-content">
              <h3>Flexible Plans</h3>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
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
              description="Browse local home-chefs and choose from various dietary preferences (Veg, Non-Veg, Vegan)."
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


      {/* Call to Action Section */}
      <section className="cta-section-wrapper">
        <div className="container cta-container">
          <div className="cta-card">
            <div className="cta-blur-sphere"></div>
            <div className="cta-card-content">
              <h2 className="cta-title">Ready to eat better?</h2>
              <p className="cta-subtext">Join 2,000+ students already saving time and eating healthy with CampusLunch.</p>
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

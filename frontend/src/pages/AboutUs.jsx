import React from 'react';
import founderKanishk from '../assets/founder_kanishk.png';
import founderAarav from '../assets/founder_aarav.png';
import founderAnanya from '../assets/founder_ananya.png';

const AboutUs = () => {
  return (
    <div className="about-page-wrapper animate-fade-in" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="container">
        <div className="text-center mb-12 section-header">
          <h2>About Us</h2>
          <div className="section-header-underline"></div>
        </div>
        
        <div className="about-grid">
          <div className="about-text-content">
            <h3>Our Mission</h3>
            <p>
              At CampusLunch, we bridge the gap between busy college students and verified local home-chefs. 
              Our mission is to ensure that every student has access to healthy, affordable, and nutritious 
              home-cooked meals while empowering local culinary micro-entrepreneurs to thrive.
            </p>
            <p>
              Born out of our own college struggles to find fresh food that doesn't break the bank, 
              CampusLunch provides a seamless subscription experience, enabling flex plans, transparent rating 
              standards, and hygienic delivery straight to your campus.
            </p>
          </div>
          
          <div className="about-stats-summary">
            <div className="about-stat-box">
              <span className="stat-number">2k+</span>
              <span className="stat-desc">Active Students</span>
            </div>
            <div className="about-stat-box">
              <span className="stat-number">45+</span>
              <span className="stat-desc">Kitchen Partners</span>
            </div>
            <div className="about-stat-box">
              <span className="stat-number">10k+</span>
              <span className="stat-desc">Meals Served</span>
            </div>
          </div>
        </div>
        
        <h3 className="founders-title text-center" style={{ marginTop: '64px' }}>Meet Our Founders</h3>
        
        <div className="founders-grid">
          <div className="founder-card">
            <div className="founder-image-wrapper">
              <img src={founderKanishk} alt="Kanishk Jain" className="founder-img" />
            </div>
            <h4>Kanishk Jain</h4>
            <p className="founder-role">Co-Founder & CEO</p>
            <p className="founder-bio">Driven by a passion to solve daily student struggles through technology and community-led commerce.</p>
          </div>
          
          <div className="founder-card">
            <div className="founder-image-wrapper">
              <img src={founderAarav} alt="Aarav Mehta" className="founder-img" />
            </div>
            <h4>Aarav Mehta</h4>
            <p className="founder-role">Co-Founder & CTO</p>
            <p className="founder-bio">Building scalable tech infrastructure and real-time order matching that fuels the CampusLunch network.</p>
          </div>
          
          <div className="founder-card">
            <div className="founder-image-wrapper">
              <img src={founderAnanya} alt="Ananya Sharma" className="founder-img" />
            </div>
            <h4>Ananya Sharma</h4>
            <p className="founder-role">Co-Founder & COO</p>
            <p className="founder-bio">Streamlining logistics and onboarding verified home kitchen partners to ensure the highest safety standards.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

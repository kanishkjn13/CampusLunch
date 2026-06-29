import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Mail, Globe, Share2, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) return null;

  return (
    <footer className="site-footer">
      {/* Desktop/Laptop View of the Footer */}
      <div className="footer-desktop-view">
        <div className="container footer-grid-container">
          {/* Brand & Newsletter Column */}
          <div className="footer-brand-column">
            <h3 className="footer-logo-desktop">CampusLunch</h3>
            <p className="footer-slogan-desktop">
              Empowering local home chefs to provide students with healthy, delicious, and affordable home-cooked tiffins.
            </p>
            <div className="footer-newsletter">
              <h4>Stay updated on menus</h4>
              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="newsletter-input" 
                  required 
                />
                <button type="submit" className="newsletter-btn">Subscribe</button>
              </form>
            </div>
          </div>

          {/* Links Column 1: Explore */}
          <div className="footer-links-column">
            <h4>Explore</h4>
            <ul>
              <li><Link to="/">How It Works</Link></li>
              <li><Link to="/register?role=vendor">Join as Vendor</Link></li>
              <li><Link to="/register">Register as Student</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>

          {/* Links Column 2: Support */}
          <div className="footer-links-column">
            <h4>Support</h4>
            <ul>
              <li><Link to="/faq">Help Center & FAQ</Link></li>
              <li><a href="#">Safety & Hygiene</a></li>
              <li><a href="#">Delivery Locations</a></li>
              <li><a href="mailto:support@campuslunch.com">Contact Support</a></li>
            </ul>
          </div>

          {/* Links Column 3: Company */}
          <div className="footer-links-column">
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><a href="#">Our Vision</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Press Kit</a></li>
            </ul>
          </div>

          {/* Links Column 4: Contact & Socials */}
          <div className="footer-links-column footer-contact-column">
            <h4>Contact Us</h4>
            <ul className="contact-info-list">
              <li>
                <Mail size={16} />
                <a href="mailto:support@campuslunch.com">support@campuslunch.com</a>
              </li>
              <li>
                <Phone size={16} />
                <a href="tel:+1234567890">+1 (234) 567-890</a>
              </li>
              <li>
                <MapPin size={16} />
                <span>Campus Hub, Block A</span>
              </li>
            </ul>
            <div className="footer-social-icons">
              <a href="#" className="social-icon-btn-desktop" title="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </a>
              <a href="#" className="social-icon-btn-desktop" title="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="social-icon-btn-desktop" title="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>
        </div>

        <div className="container footer-bottom-bar-desktop">
          <span className="copyright-text-desktop">&copy; {new Date().getFullYear()} CampusLunch. All rights reserved.</span>
          <div className="footer-bottom-links-desktop">
            <a href="#">Privacy Policy</a>
            <span className="separator-desktop">&bull;</span>
            <a href="#">Terms of Service</a>
            <span className="separator-desktop">&bull;</span>
            <a href="#">Cookie Settings</a>
          </div>
        </div>
      </div>

      {/* Mobile View of the Footer (Original Layout) */}
      <div className="footer-mobile-view">
        <div className="container footer-content-wrapper">
          <div className="footer-brand-section">
            <h3 className="footer-logo">CampusLunch</h3>
            <p className="footer-slogan">Empowering home chefs, nourishing students.</p>
          </div>
          
          <div className="footer-social-icons">
            <a href="#" className="social-icon-btn" title="Website"><Globe size={20} /></a>
            <a href="#" className="social-icon-btn" title="Share"><Share2 size={20} /></a>
            <a href="mailto:support@campuslunch.com" className="social-icon-btn" title="Email"><Mail size={20} /></a>
          </div>
        </div>
        
        <div className="container footer-bottom-bar">
          <span className="copyright-text">&copy; {new Date().getFullYear()} CampusLunch.</span>
          <div className="footer-bottom-links">
            <Link to="/about">About Us</Link>
            <span className="separator">&bull;</span>
            <Link to="/faq">FAQ</Link>
            <span className="separator">&bull;</span>
            <a href="#">Privacy</a>
            <span className="separator">&bull;</span>
            <a href="#">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

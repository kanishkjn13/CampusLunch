import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const initialRole = queryParams.get('role') || 'student';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [license, setLicense] = useState('');
  const [formStep, setFormStep] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selfie, setSelfie] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 400, height: 400, facingMode: 'user' } 
      });
      setStream(mediaStream);
      setCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      setError('Could not access camera. Please allow camera permissions.');
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth || 400;
      canvas.height = video.videoHeight || 400;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setSelfie(dataUrl);
      
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
    setCameraActive(false);
  };

  useEffect(() => {
    // If role changes, stop camera streams & reset step
    if (role !== 'vendor') {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setStream(null);
      setCameraActive(false);
      setFormStep(1);
    }
  }, [role]);

  // Automatically request camera access on Step 2
  useEffect(() => {
    if (role === 'vendor' && formStep === 2) {
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [formStep, role]);

  useEffect(() => {
    // Scroll to top
    window.scrollTo(0, 0);

    const originalBg = document.body.style.backgroundColor;
    const originalMinHeight = document.body.style.minHeight;
    const originalColor = document.body.style.color;
    const originalPadding = document.body.style.paddingBottom;

    document.body.style.backgroundColor = '#FAFAFA';
    document.body.style.color = '#0b1c30';
    document.body.style.minHeight = '100dvh';
    document.body.style.paddingBottom = '0px';

    const htmlEl = document.documentElement;
    const hadLightClass = htmlEl.classList.contains('light');
    if (!hadLightClass) htmlEl.classList.add('light');

    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.color = originalColor;
      document.body.style.minHeight = originalMinHeight;
      document.body.style.paddingBottom = originalPadding;
      if (!hadLightClass) htmlEl.classList.remove('light');
    };
  }, []);

  const handleRegister = (e) => {
    if (e) e.preventDefault();
    setError('');

    // Form Validations (Step 1 validations)
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (phone.length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (role === 'vendor' && license.trim() && license.trim().length !== 14) {
      setError('FSSAI License number must be exactly 14 digits');
      return;
    }

    // Step splitting!
    if (role === 'vendor' && formStep === 1) {
      // Direct vendor to Step 2: selfie capture
      setFormStep(2);
      window.scrollTo(0, 0);
      return;
    }

    // Step 2 validations (vendor only)
    if (role === 'vendor' && !selfie) {
      setError('A live profile selfie is compulsory for vendor registration.');
      return;
    }

    setLoading(true);

    // Mock API Registration
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem('role', role);
      if (role === 'student') {
        navigate('/student');
      } else {
        localStorage.setItem('vendor_selfie', selfie); // Store the captured selfie
        localStorage.setItem('vendor_name', name);
        localStorage.setItem('vendor_phone', phone);
        localStorage.setItem('vendor_email', email);
        localStorage.setItem('vendor_license', license || '12345678901234');
        navigate('/vendor-dashboard');
      }
    }, 1200);
  };

  return (
    <div className="auth-page-container">
      {/* Left Cover Panel - Hidden on Mobile, Visible on Desktop */}
      <div className="auth-left-panel">
        <div className="auth-left-bg"></div>
        <div className="auth-left-overlay"></div>
        <div className="auth-left-content">
          <Link to="/" className="auth-left-logo flex items-center gap-2 mb-4">
            <img src={logo} alt="CampusLunch Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
            <span className="font-bold text-white tracking-tight logo-text" style={{ fontSize: '24px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>CampusLunch</span>
          </Link>
          <h2 className="font-display-lg text-display-lg font-bold text-white mb-md" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)' }}>
            Expand Your Campus Reach
          </h2>
          <p className="font-body-lg text-body-lg text-white/90 max-w-sm mb-lg" style={{ lineHeight: '1.6' }}>
            Join CampusLunch as a student to order high-quality home tiffins, or onboard your kitchen to manage recurring subscriber orders.
          </p>
          <div className="text-white/60 text-sm mt-auto">
            &copy; {new Date().getFullYear()} CampusLunch. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-right-panel">
        {/* Mobile Header Banner - Only Visible on Mobile */}
        <header className="auth-mobile-header">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ 
                backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDIQnaDIuISxKIwxYb_SVVTYxxB6VRh9Pkr57eC_K1b0CSsOovgzNc09z1OEY_paSUDUb1u3FeQjUP2VW7KqeFGp8uGR_zDP3huegCdENCZVtCBblMQEd9_HILxjtuu8CSblcrSt9zczRSGgCIb5FqKWSlBVb1t_H8t7axwsuiHz23dFheULYBlOG7NG4k5nHBy1Zn8OfRCP4QtA4fDWZ-4eWzPNKv6Qf7CH9Bj9oxvVblHvPQfQE2D1B8LjWDvZSgFdy6aMUVnPsk')" 
              }}
            ></div>
            <div 
              className="absolute inset-0" 
              style={{ 
                background: 'linear-gradient(to top, #FAFAFA 0%, rgba(250, 250, 250, 0.85) 30%, rgba(250, 250, 250, 0.4) 65%, transparent 100%)' 
              }}
            ></div>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="bg-white p-2 rounded-2xl shadow-lg mb-sm active:scale-95 transition-transform cursor-pointer flex items-center justify-center" style={{ width: '64px', height: '64px' }}>
              <img src={logo} alt="CampusLunch Logo" style={{ height: '48px', width: 'auto', objectFit: 'contain' }} />
            </div>
            <h1 
              className="font-headline-lg-mobile text-headline-lg-mobile tracking-tight font-bold"
              style={{ 
                color: '#ffffff', 
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9)' 
              }}
            >
              CampusLunch
            </h1>
            <p 
              className="font-body-md text-body-md max-w-[280px] mt-xs font-semibold"
              style={{ 
                color: '#ffffff', 
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.9)' 
              }}
            >
              Fresh, home-cooked meals delivered to your campus doorstep.
            </p>
          </div>
        </header>

        {/* Form Canvas Wrapper */}
        <div className="auth-form-canvas" style={{ paddingTop: '20px', paddingBottom: '100px' }}>
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 w-full max-w-md">
            
            {role === 'vendor' && formStep === 2 ? (
              // Step 2: Camera Selfie Capture View (Standalone circular layout)
              <div className="space-y-md animate-fade-in text-center">
                <div className="mb-4">
                  <h3 className="font-title-lg text-title-lg text-on-surface" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Verify Your Identity</h3>
                  <p className="text-sm text-secondary mt-1">Please take a live selfie photo to complete your vendor profile.</p>
                </div>

                {error && (
                  <div 
                    className="mb-md p-sm text-center font-body-md text-body-md font-bold rounded-xl"
                    style={{ 
                      background: 'rgba(255, 77, 77, 0.12)', 
                      color: '#ba1a1a', 
                      border: '1px solid rgba(255, 77, 77, 0.2)' 
                    }}
                  >
                    {error}
                  </div>
                )}

                <div className="selfie-camera-box" style={{ margin: '20px auto 0', maxWidth: '240px', height: '240px', borderRadius: '50%' }}>
                  {/* Live Camera Feed */}
                  {cameraActive && (
                    <div className="selfie-feed-container" style={{ borderRadius: '50%', overflow: 'hidden' }}>
                      <video ref={videoRef} autoPlay playsInline className="selfie-video-stream" style={{ borderRadius: '50%' }}></video>
                      <div className="selfie-guide-circle" style={{ width: '180px', height: '180px' }}></div>
                    </div>
                  )}

                  {/* Captured Selfie Preview */}
                  {!cameraActive && selfie && (
                    <div className="selfie-preview-container" style={{ borderRadius: '50%', overflow: 'hidden' }}>
                      <img src={selfie} alt="Captured Selfie" className="selfie-captured-img" style={{ borderRadius: '50%', width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  )}

                  {/* Empty placeholder state */}
                  {!cameraActive && !selfie && (
                    <div className="selfie-empty-placeholder">
                      <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40">photo_camera</span>
                      <p className="text-xs text-secondary mt-2">No photo captured yet</p>
                    </div>
                  )}
                </div>

                {/* Actions Row */}
                <div className="flex gap-2 justify-center mt-6" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
                  {!cameraActive && !selfie && (
                    <button 
                      type="button" 
                      className="selfie-btn-primary"
                      onClick={startCamera}
                      style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '6px' }}>photo_camera</span>
                      <span>Open Camera</span>
                    </button>
                  )}

                  {cameraActive && (
                    <>
                      <button 
                        type="button" 
                        className="selfie-btn-success"
                        onClick={captureSelfie}
                        style={{ padding: '12px 24px', fontSize: '0.95rem' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '6px' }}>add_a_photo</span>
                        <span>Capture Selfie</span>
                      </button>
                      <button 
                        type="button" 
                        className="selfie-btn-danger"
                        onClick={stopCamera}
                        style={{ padding: '12px 20px', fontSize: '0.95rem' }}
                      >
                        <span>Cancel</span>
                      </button>
                    </>
                  )}

                  {!cameraActive && selfie && (
                    <button 
                      type="button" 
                      className="selfie-btn-secondary"
                      onClick={startCamera}
                      style={{ padding: '12px 20px', fontSize: '0.95rem' }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px', marginRight: '6px' }}>cached</span>
                      <span>Retake Selfie</span>
                    </button>
                  )}
                </div>

                <div className="pt-6 flex flex-col gap-3" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', marginTop: '30px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <button 
                    type="button" 
                    onClick={() => handleRegister()} 
                    disabled={loading || !selfie}
                    className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold shadow-sm hover:bg-primary-hover transition-all duration-300 flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: '#f59e0b',
                      color: '#0f172a',
                      opacity: (!selfie || loading) ? 0.6 : 1,
                      cursor: (!selfie || loading) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Completing Account Setup...' : 'Complete Registration'}
                  </button>

                  <button 
                    type="button"
                    className="text-secondary text-sm hover:underline"
                    onClick={() => {
                      stopCamera();
                      setFormStep(1);
                    }}
                    disabled={loading}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
                  >
                    Back to Form
                  </button>
                </div>

                {/* Hidden drawing canvas */}
                <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
              </div>
            ) : (
              // Step 1: Standard Registration Form
              <>
                {/* Back to Home Button - Laptop/Desktop Only */}
                <div className="hidden md:block mb-6">
                  <Link 
                    to="/" 
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-on-surface-variant hover:text-primary transition-all active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Back to Home
                  </Link>
                </div>
                
                {/* Segmented Control for Role */}
                <div className={`role-toggle-container ${role === 'vendor' ? 'vendor-active' : ''}`}>
                  <div className="role-toggle-slider"></div>
                  {['student', 'vendor'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`role-toggle-btn ${role === r ? 'active' : ''}`}
                      onClick={() => {
                        setRole(r);
                        setError('');
                      }}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {error && (
                  <div 
                    className="mb-md p-sm text-center font-body-md text-body-md font-bold rounded-xl"
                    style={{ 
                      background: 'rgba(255, 77, 77, 0.12)', 
                      color: '#ba1a1a', 
                      border: '1px solid rgba(255, 77, 77, 0.2)' 
                    }}
                  >
                    {error}
                  </div>
                )}

                <form className="space-y-md" onSubmit={handleRegister}>
                  {/* Name Input */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-xs" htmlFor="name">
                      {role === 'student' ? 'Full Name' : 'Vendor Name'}
                    </label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">person</span>
                      <input 
                        className="w-full h-12 pl-[42px] pr-[16px] rounded-xl border border-outline-variant bg-surface-bright outline-none font-body-md text-body-md auth-input" 
                        id="name" 
                        placeholder={role === 'student' ? 'John Doe' : 'e.g. Sharma Tiffin Center'}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* FSSAI License (vendor only) */}
                  {role === 'vendor' && (
                    <div className="space-y-xs">
                      <label className="font-label-md text-label-md text-on-surface-variant ml-xs" htmlFor="license">FSSAI License No. (Optional)</label>
                      <div className="auth-input-wrapper">
                        <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">receipt_long</span>
                        <input 
                          className="w-full h-12 pl-[42px] pr-[16px] rounded-xl border border-outline-variant bg-surface-bright outline-none font-body-md text-body-md auth-input" 
                          id="license" 
                          placeholder="e.g. 12345678901234" 
                          type="text"
                          value={license}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 14) setLicense(val);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Phone Input */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-xs" htmlFor="phone">Phone Number</label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">call</span>
                      <input 
                        className="w-full h-12 pl-[42px] pr-[16px] rounded-xl border border-outline-variant bg-surface-bright outline-none font-body-md text-body-md auth-input" 
                        id="phone" 
                        placeholder="e.g. 9876543210" 
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          if (val.length <= 10) setPhone(val);
                        }}
                        required
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-xs" htmlFor="email">Email Address</label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                      <input 
                        className="w-full h-12 pl-[42px] pr-[16px] rounded-xl border border-outline-variant bg-surface-bright outline-none font-body-md text-body-md auth-input" 
                        id="email" 
                        placeholder="student@gmail.com" 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-xs" htmlFor="password">Password</label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">lock</span>
                      <input 
                        className="w-full h-12 pl-[42px] pr-[42px] rounded-xl border border-outline-variant bg-surface-bright outline-none font-body-md text-body-md auth-input" 
                        id="password" 
                        placeholder="Create a password" 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button 
                        className="text-on-surface-variant hover:text-primary transition-colors" 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          position: 'absolute', 
                          right: '16px', 
                          top: '50%', 
                          transform: 'translateY(-50%)', 
                          background: 'none', 
                          border: 'none', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          cursor: 'pointer', 
                          padding: 0,
                          width: '24px',
                          height: '24px'
                        }}
                      >
                        <span 
                          className="material-symbols-outlined text-[20px]"
                          style={{ display: 'block', lineHeight: '1', width: '20px', height: '20px' }}
                        >
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Terms checkbox */}
                  <div className="mt-sm mb-sm flex items-start gap-sm ml-xs">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      required 
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary mt-[2px]" 
                    /> 
                    <label htmlFor="terms" className="font-body-md text-body-md text-on-surface-variant leading-tight cursor-pointer">
                      I agree to the <a href="#" className="text-primary font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-primary font-bold hover:underline">Privacy Policy</a>.
                    </label>
                  </div>

                  {/* Primary Action */}
                  <button 
                    className="w-full h-12 bg-primary text-on-primary font-headline-sm text-headline-sm rounded-xl shadow-sm active:scale-[0.98] transition-all hover:bg-on-primary-fixed-variant mt-sm flex items-center justify-center font-bold" 
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      `Sign Up as ${role === 'student' ? 'Student' : 'Vendor'}`
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="flex items-center my-lg">
                  <div className="flex-grow h-px bg-outline-variant/50"></div>
                  <span className="px-md font-label-md text-label-md text-on-surface-variant">OR CONTINUE WITH</span>
                  <div className="flex-grow h-px bg-outline-variant/50"></div>
                </div>

                {/* Social Logins */}
                <div className="grid grid-cols-2 gap-md">
                  <button 
                    className="flex items-center justify-center h-12 border border-outline-variant rounded-xl bg-surface-bright hover:bg-surface-container-low transition-colors active:scale-95"
                    type="button"
                    onClick={() => alert('Google Social Sign Up mock clicked!')}
                  >
                    <svg className="w-5 h-5 mr-sm" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span className="font-label-md text-label-md font-bold">Google</span>
                  </button>
                  <button 
                    className="flex items-center justify-center h-12 border border-outline-variant rounded-xl bg-surface-bright hover:bg-surface-container-low transition-colors active:scale-95"
                    type="button"
                    onClick={() => alert('Apple Social Sign Up mock clicked!')}
                  >
                    <svg className="w-5 h-5 mr-sm fill-current text-on-background" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.82M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.21.67-2.93 1.49-.62.69-1.16 1.84-1.01 2.96 1.12.09 2.27-.58 2.95-1.39z"/>
                    </svg>
                    <span className="font-label-md text-label-md font-bold">Apple</span>
                  </button>
                </div>

                {/* Footer Link */}
                <div className="text-center mt-xl">
                  <span className="font-body-md text-body-md text-on-surface-variant">Already have an account? </span>
                  <Link to="/login" className="text-primary font-bold hover:underline font-body-md text-body-md" style={{ color: '#f59e0b' }}>Sign In</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full pointer-events-none opacity-40 h-32 overflow-hidden auth-decorative-elements md:hidden">
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Register;

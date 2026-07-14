import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import logo from '@/assets/logos/logo.png';
import {
  studentRegister,
  vendorRegister,
  sendOTP,
  verifyOTP,
} from "@/Services/authService";

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formStep, setFormStep] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);

  const otpRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    setOtp(otpValues.join(''));
  }, [otpValues]);

  useEffect(() => {
    if (showOtpModal) {
      const timer = setTimeout(() => {
        if (otpRefs[0].current) {
          otpRefs[0].current.focus();
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showOtpModal]);

  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, '');
    if (!cleanVal) {
      const newValues = [...otpValues];
      newValues[index] = '';
      setOtpValues(newValues);
      return;
    }

    const digit = cleanVal.slice(-1);
    const newValues = [...otpValues];
    newValues[index] = digit;
    setOtpValues(newValues);

    if (index < 5 && digit) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        otpRefs[index - 1].current.focus();
        const newValues = [...otpValues];
        newValues[index - 1] = '';
        setOtpValues(newValues);
      } else {
        const newValues = [...otpValues];
        newValues[index] = '';
        setOtpValues(newValues);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    const digits = pastedText.replace(/\D/g, '').slice(0, 6).split('');

    if (digits.length > 0) {
      const newValues = [...otpValues];
      for (let i = 0; i < 6; i++) {
        newValues[i] = digits[i] || '';
      }
      setOtpValues(newValues);

      const nextFocusIndex = Math.min(digits.length, 5);
      if (otpRefs[nextFocusIndex]?.current) {
        otpRefs[nextFocusIndex].current.focus();
      }
    }
  };

  const handleSendOTP = async () => {
    if (!email) {
      setOtpError("Email address is required.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setOtpError("Please enter a valid email address.");
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await sendOTP(email);
      setOtpSent(true);
      setOtpValues(['', '', '', '', '', '']);
      setShowOtpModal(true);
      setCooldown(30);
      setOtpSuccess("Verification OTP sent to your email!");
    } catch (err) {
      setOtpError(err.response?.data?.detail || "Failed to send OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const code = otpValues.join('');
    if (code.length !== 6) {
      setOtpError("Please enter the 6-digit OTP code.");
      return;
    }

    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await verifyOTP(email, code);
      setEmailVerified(true);
      setOtpSuccess("Email verified successfully!");
      setTimeout(() => {
        setShowOtpModal(false);
      }, 1500);
    } catch (err) {
      setOtpError(err.response?.data?.detail || "Invalid or expired OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      await sendOTP(email);
      setCooldown(30);
      setOtpValues(['', '', '', '', '', '']);
      if (otpRefs[0].current) {
        otpRefs[0].current.focus();
      }
      setOtpSuccess("New verification OTP sent to your email!");
    } catch (err) {
      setOtpError(err.response?.data?.detail || "Failed to resend OTP. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };



  const handleGoogleRegister = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      navigate('/auth/google/callback', {
        state: { access_token: tokenResponse.access_token }
      });
    },
    onError: () => setError("Google Sign Up failed. Please try again.")
  });



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
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      if (user.role === "student") {
        navigate("/student", { replace: true });
      } else if (user.role === "vendor") {
        navigate("/vendor-dashboard", { replace: true });
      } else if (user.role === "admin") {
        navigate("/admin", { replace: true });
      }
    }

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
  }, [navigate]);

  const handleRegister = async (e) => {
    if (e) e.preventDefault();

    setError("");

    // Frontend Validations
    if (!name.trim()) {
      setError(role === "student" ? "Full name is required." : "Vendor name is required.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
      setError("Enter a valid 10 digit phone number containing only numbers.");
      return;
    }

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordStrengthRegex.test(password)) {
      setError("Password must be at least 8 characters long, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptTerms) {
      setError("Please accept Terms & Conditions.");
      return;
    }

    // Vendor-only Validation
    // if (role === "vendor" && !selfie) {
    //   setError("A live profile selfie is compulsory for vendor registration.");
    //   return;
    // }

    try {
      setLoading(true);

      const payload = {
        full_name: name,
        email,
        phone,
        password,
        confirm_password: confirmPassword,
        accept_terms: acceptTerms,
      };

      if (role === "vendor") {
        payload.fssai_license = "";
        await vendorRegister(payload);
      } else {
        await studentRegister(payload);
      }

      navigate("/login", {
        replace: true,
        state: {
          message:
            role === "student"
              ? "Registration successful! Please login."
              : "Vendor registered successfully. Please login.",
        },
      });

    } catch (err) {
      if (err.response?.data) {
        const errors = err.response.data;

        const firstError = Object.values(errors)[0];

        if (Array.isArray(firstError)) {
          setError(firstError[0]);
        } else {
          setError(firstError);
        }
      } else {
        setError(
          role === "student"
            ? "Registration failed."
            : "Vendor registration failed."
        );
      }
    } finally {
      setLoading(false);
    }
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
            <span className="font-bold text-white tracking-tight logo-text" style={{ fontSize: '24px', fontFamily: "'Be Vietnam Pro', sans-serif" }}>Campus Lunch</span>
          </Link>
          <h2 className="font-display-lg text-display-lg font-bold text-white mb-md" style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)' }}>
            Expand Your Campus Reach
          </h2>
          <p className="font-body-lg text-body-lg text-white/90 max-w-sm mb-lg" style={{ lineHeight: '1.6' }}>
            Join Campus Lunch as a student to order high-quality home tiffins, or onboard your kitchen to manage recurring subscriber orders.
          </p>
          <div className="text-white/60 text-sm mt-auto">
            &copy; {new Date().getFullYear()} Campus Lunch. All rights reserved.
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
                color: '#0b1c30'
              }}
            >
              Campus Lunch
            </h1>
            <p
              className="font-body-md text-body-md max-w-[280px] mt-xs font-semibold"
              style={{
                color: '#475569'
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
                        placeholder={role === 'student' ? 'e.g. Aarav Patel' : 'e.g. Sharma Tiffin Center'}
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>


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
                    <label
                      className="font-label-md text-label-md text-on-surface-variant ml-xs"
                      htmlFor="email"
                    >
                      Email Address
                    </label>

                    <div className="auth-input-wrapper relative">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                        mail
                      </span>

                      <input
                        className="w-full h-12 pl-[42px] rounded-xl border border-outline-variant bg-surface-bright outline-none font-body-md text-body-md auth-input"
                        style={{
                          paddingRight: emailVerified
                            ? '100px'
                            : otpSent
                              ? '160px'
                              : '80px'
                        }}
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (otpSent) setOtpSent(false);
                          setOtpSuccess('');
                          setOtpError('');
                        }}
                        disabled={emailVerified}
                        required
                      />

                      {/* Verified Badge / Verification Button Inside Input Box */}
                      {emailVerified ? (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-status-success font-semibold text-[13px]" style={{ color: '#16a34a' }}>
                          <span className="material-symbols-outlined text-[18px]">check_circle</span>
                          <span>Verified</span>
                          <button
                            type="button"
                            onClick={() => {
                              setEmailVerified(false);
                              setOtpSent(false);
                              setOtp('');
                              setOtpSuccess('');
                              setOtpError('');
                              setOtpValues(['', '', '', '', '', '']);
                            }}
                            className="text-primary hover:underline font-bold text-[12px] ml-1"
                            style={{ color: '#855300' }}
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <>
                          {!otpSent ? (
                            <button
                              type="button"
                              onClick={handleSendOTP}
                              disabled={!email || otpLoading}
                              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 h-8 text-[11px] rounded-lg active:scale-95 transition-all font-bold flex items-center justify-center disabled:opacity-50"
                              style={{ backgroundColor: '#0b1c30', color: '#ffffff' }}
                            >
                              {otpLoading ? (
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                              ) : (
                                "Verify"
                              )}
                            </button>
                          ) : (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setShowOtpModal(true)}
                                className="px-2.5 h-8 text-[11px] rounded-lg active:scale-95 transition-all font-bold flex items-center justify-center"
                                style={{ backgroundColor: '#855300', color: '#ffffff' }}
                              >
                                Enter Code
                              </button>
                              <button
                                type="button"
                                onClick={handleResendOTP}
                                disabled={cooldown > 0 || otpLoading}
                                className="font-bold text-[11px] hover:underline disabled:opacity-40"
                                style={{ color: cooldown > 0 ? '#94a3b8' : '#855300' }}
                              >
                                {cooldown > 0 ? `${cooldown}s` : "Resend"}
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {otpError && !showOtpModal && (
                      <div className="text-status-error font-body-sm text-[12px] mt-xs ml-xs" style={{ color: '#ba1a1a' }}>
                        {otpError}
                      </div>
                    )}
                    {otpSuccess && !showOtpModal && (
                      <div className="text-status-success font-body-sm text-[12px] mt-xs ml-xs" style={{ color: '#16a34a' }}>
                        {otpSuccess}
                      </div>
                    )}
                  </div>

                  {/* Password Input */}
                  <div className="space-y-xs">
                    <label
                      className="font-label-md text-label-md text-on-surface-variant ml-xs"
                      htmlFor="password"
                    >
                      Password
                    </label>

                    <div className="auth-input-wrapper relative">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                        lock
                      </span>

                      <input
                        className="w-full h-12 pl-[42px] pr-[42px] rounded-xl border border-outline-variant bg-surface-bright outline-none font-body-md text-body-md auth-input"
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined">
                          {showPassword ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-xs">
                    <label
                      className="font-label-md text-label-md text-on-surface-variant ml-xs"
                      htmlFor="confirmPassword"
                    >
                      Confirm Password
                    </label>

                    <div className="auth-input-wrapper relative">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                        lock
                      </span>

                      <input
                        className="w-full h-12 pl-[42px] pr-[42px] rounded-xl border border-outline-variant bg-surface-bright outline-none font-body-md text-body-md auth-input"
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                      >
                        <span className="material-symbols-outlined">
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
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      required
                      className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary mt-[2px]"
                    />
                    <label htmlFor="terms" className="font-body-md text-body-md text-on-surface-variant leading-tight cursor-pointer">
                      I agree to the <a href="#" className="text-primary font-bold hover:underline">Terms of Service</a> and <a href="#" className="text-primary font-bold hover:underline">Privacy Policy</a>.
                    </label>
                  </div>

                  {/* Primary Action */}
                  <button
                    className="w-full h-12 bg-primary text-on-primary font-headline-sm text-headline-sm rounded-xl shadow-sm active:scale-[0.98] transition-all hover:bg-on-primary-fixed-variant mt-sm flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading || !emailVerified}
                    style={{
                      backgroundColor: '#f59e0b',
                      color: '#0f172a',
                      opacity: (!emailVerified || loading) ? 0.6 : 1,
                      cursor: (!emailVerified || loading) ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      `Sign Up as ${role === 'student' ? 'Student' : 'Vendor'}`
                    )}
                  </button>
                </form>



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



      {/* Verification Code Modal */}
      {showOtpModal && (
        <div className="custom-modal-overlay" style={{ zIndex: 10000 }}>
          <div className="custom-modal-card" style={{ maxWidth: '400px', padding: '28px', position: 'relative' }}>
            {/* Close Button */}
            <button
              type="button"
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => setShowOtpModal(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <span className="material-symbols-outlined style-icon" style={{ fontSize: '22px' }}>close</span>
            </button>

            {/* Lock/Security Icon */}
            <div className="custom-modal-icon-wrapper" style={{ backgroundColor: '#fffbeb', color: '#d97706', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justify: 'center', margin: '0 auto 16px auto' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>shield_person</span>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0b1c30', marginBottom: '8px' }}>
              Verify Your Email
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#534434', marginBottom: '24px', lineHeight: '1.5' }}>
              We've sent a 6-digit verification code to <br />
              <strong style={{ color: '#0b1c30' }}>{email}</strong>.
            </p>

            {/* 6 Digit Inputs */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
              {otpValues.map((value, idx) => (
                <input
                  key={idx}
                  ref={otpRefs[idx]}
                  type="text"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  onPaste={handlePaste}
                  style={{
                    width: '46px',
                    height: '52px',
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: value ? '#855300' : '#e2e8f0',
                    backgroundColor: '#ffffff',
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: '#0b1c30',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#855300';
                    e.target.style.boxShadow = '0 0 0 3px rgba(133, 83, 0, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = value ? '#855300' : '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              ))}
            </div>

            {/* OTP Status Messages */}
            {otpError && (
              <div
                className="mb-md p-xs text-center font-body-sm text-body-sm font-bold rounded-lg"
                style={{
                  background: 'rgba(186, 26, 26, 0.08)',
                  color: '#ba1a1a',
                  border: '1px solid rgba(186, 26, 26, 0.15)',
                  marginBottom: '16px',
                  padding: '8px'
                }}
              >
                {otpError}
              </div>
            )}
            {otpSuccess && (
              <div
                className="mb-md p-xs text-center font-body-sm text-body-sm font-bold rounded-lg"
                style={{
                  background: 'rgba(22, 163, 74, 0.08)',
                  color: '#16a34a',
                  border: '1px solid rgba(22, 163, 74, 0.15)',
                  marginBottom: '16px',
                  padding: '8px'
                }}
              >
                {otpSuccess}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={otpValues.join('').length !== 6 || otpLoading}
                className="w-full h-11 rounded-xl font-bold flex items-center justify-center active:scale-[0.98] transition-all disabled:opacity-50"
                style={{ backgroundColor: '#0b1c30', color: '#ffffff', fontSize: '0.9rem' }}
              >
                {otpLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                ) : (
                  "Confirm & Verify"
                )}
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <span style={{ fontSize: '0.8rem', color: '#7c6e60' }}>Didn't receive code?</span>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={cooldown > 0 || otpLoading}
                  style={{
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    color: cooldown > 0 ? '#94a3b8' : '#855300',
                    border: 'none',
                    background: 'none',
                    cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
                    padding: 0
                  }}
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 w-full pointer-events-none opacity-40 h-32 overflow-hidden auth-decorative-elements md:hidden">
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default Register;

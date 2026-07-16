import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import logo from '@/assets/logos/logo.png';
import { forgotPassword } from "@/services/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      switch (user.role) {
        case "student":
          navigate("/student", { replace: true });
          return;

        case "vendor":
          navigate("/vendor-dashboard", { replace: true });
          return;

        case "admin":
          navigate("/admin", { replace: true });
          return;

        default:
          break;
      }
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

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

  // Handle Resend Countdown timer
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email);

      setSuccess(true);
      setResendTimer(30);

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

        setError("Unable to send password reset link.");

      }

    } finally {

      setLoading(false);

    }
  };
  const handleResend = async () => {

    if (resendTimer > 0) return;

    setError("");

    try {

      setLoading(true);

      await forgotPassword(email);

      setResendTimer(30);

    } catch (err) {

      setError("Unable to resend reset link.");

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
            <span className="text-white font-bold" style={{ fontSize: '1.5rem', fontFamily: "'Be Vietnam Pro', sans-serif" }}>Campus Lunch</span>
          </Link>
          <div className="auth-left-tagline">
            <h2 className="text-3xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: "'Be Vietnam Pro', sans-serif" }}>
              Fresh, home-cooked meals <br /> delivered to your campus.
            </h2>
            <p className="text-white/80 text-base max-w-md">
              Forgot your credentials? Securely recover or update your password in just a couple steps to get back to ordering or managing kitchen tiffins.
            </p>
          </div>
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
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.9)'
              }}
            >
              Campus Lunch
            </h1>
            <p
              className="font-body-md text-body-md max-w-[280px] mt-xs font-semibold"
              style={{
                color: '#ffffff',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.9)'
              }}
            >
              Reset your account password quickly and securely.
            </p>
          </div>
        </header>

        {/* Form Canvas Wrapper */}
        <div className="auth-form-canvas" style={{ paddingTop: '20px', paddingBottom: '100px' }}>
          <div className="bg-surface-container-lowest rounded-xl p-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 w-full max-w-md">

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

            {success ? (
              // Success check inbox state view
              <div className="text-center space-y-md animate-fade-in">
                <div className="flex justify-center mb-md">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                    <span className="material-symbols-outlined text-[36px]">mail</span>
                  </div>
                </div>

                <h3 className="font-title-lg text-title-lg font-extrabold text-on-surface" style={{ fontSize: '1.4rem' }}>
                  Check Your Inbox
                </h3>

                <p className="font-body-md text-body-md text-secondary leading-relaxed px-sm">
                  We've sent a password reset link to:<br />
                  <strong className="text-on-surface mt-1 block break-all">{email}</strong>
                </p>

                <div className="pt-sm space-y-sm flex flex-col items-center">
                  <Link
                    to="/login"
                    className="w-full h-12 rounded-xl bg-primary text-on-primary font-bold shadow-sm hover:bg-primary-hover transition-all duration-300 flex items-center justify-center"
                    style={{ backgroundColor: '#f59e0b', color: '#0f172a' }}
                  >
                    Back to Sign In
                  </Link>

                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendTimer > 0 || loading}
                    className="text-sm font-bold hover:underline transition-all mt-md flex items-center gap-1"
                    style={{
                      color: resendTimer > 0 ? '#94a3b8' : '#f59e0b',
                      background: 'none',
                      border: 'none',
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <span className="material-symbols-outlined text-[18px]">replay</span>
                    {resendTimer > 0 ? `Resend link in ${resendTimer}s` : 'Resend password link'}
                  </button>
                </div>
              </div>
            ) : (
              // Request Form view
              <div className="space-y-md">
                <div className="mb-md">
                  <h3 className="font-title-lg text-title-lg font-extrabold text-on-surface" style={{ fontSize: '1.4rem' }}>
                    Forgot Password?
                  </h3>
                  <p className="font-body-md text-body-md text-secondary mt-1">
                    Enter your email to receive recovery instructions.
                  </p>
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

                <form className="space-y-md" onSubmit={handleSubmit}>
                  {/* Email Input */}
                  <div className="space-y-xs">
                    <label className="font-label-md text-label-md text-on-surface-variant ml-xs" htmlFor="email">Email Address</label>
                    <div className="auth-input-wrapper">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">mail</span>
                      <input
                        className="w-full h-12 pl-[42px] pr-[16px] rounded-xl border border-outline-variant bg-surface-bright outline-none font-body-md text-body-md auth-input"
                        id="email"
                        placeholder="e.g. user@gmail.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    className="w-full h-12 bg-primary text-on-primary font-headline-sm text-headline-sm rounded-xl shadow-sm active:scale-[0.98] transition-all hover:bg-on-primary-fixed-variant mt-md flex items-center justify-center font-bold"
                    type="submit"
                    disabled={loading}
                    style={{ backgroundColor: '#f59e0b', color: '#0f172a', marginTop: '24px' }}
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      'Send Reset Link'
                    )}
                  </button>
                </form>

                {/* Back to Sign In Link */}
                <div className="text-center mt-xl pt-md border-t border-outline-variant/30">
                  <span className="font-body-md text-body-md text-on-surface-variant">Remembered details? </span>
                  <Link to="/login" className="text-primary font-bold hover:underline font-body-md text-body-md" style={{ color: '#f59e0b' }}>Sign In</Link>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Decorative Micro-interaction elements - Hidden on Desktop */}
      <div className="fixed bottom-0 left-0 w-full pointer-events-none opacity-40 h-32 overflow-hidden auth-decorative-elements md:hidden">
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-16 w-80 h-80 bg-secondary-container/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default ForgotPassword;

import React, { useState, useEffect } from "react";
import { authAPI, setToken, setUser } from "./utils/api";

const BRAND = {
  primary: '#1e3a5f',
  accent: '#2a9d8f',
  secondary: '#264653',
  gradient: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 50%, #264653 100%)',
  gradientLight: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 100%)',
  gradientContractor: 'linear-gradient(135deg, #1e3a5f 0%, #2a9d8f 100%)',
  gradientClient: 'linear-gradient(135deg, #2a9d8f 0%, #1e3a5f 100%)',
  light: '#f8fafc',
  dark: '#0f172a',
  muted: '#64748b',
};

const icons = {
  مقاول: "🏗️",
  عميل: "💼",
  زائر: "👀"
};

export default function RoleLogin({ onLogin, onGuest, initialStep = 1, loading = false }) {
  const [step, setStep] = useState(initialStep);
  const [role, setRole] = useState("");
  const [form, setForm] = useState({ email: "", password: "", name: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const handleRoleChoice = (selectedRole) => {
    setRole(selectedRole);
    localStorage.setItem('selectedRole', selectedRole);
    setStep(2);
    setErrors({});
    setTouched({});
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "البريد الإلكتروني مطلوب";
    if (!emailRegex.test(email)) return "البريد الإلكتروني غير صحيح";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "كلمة المرور مطلوبة";
    if (password.length < 6) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل";
    return "";
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched({ ...touched, [name]: true });
    
    if (name === "email") {
      const error = validateEmail(value);
      if (error) setErrors({ ...errors, email: error });
    } else if (name === "password") {
      const error = validatePassword(value);
      if (error) setErrors({ ...errors, password: error });
    } else if (name === "confirmPassword" && isSignUp) {
      if (value !== form.password) {
        setErrors({ ...errors, confirmPassword: "كلمة المرور غير متطابقة" });
      }
    } else if (name === "name" && isSignUp) {
      if (!value.trim()) {
        setErrors({ ...errors, name: "الاسم مطلوب" });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSignUp) {
      const nameError = !form.name.trim() ? "الاسم مطلوب" : "";
      const emailError = validateEmail(form.email);
      const passwordError = validatePassword(form.password);
      const confirmError = form.password !== form.confirmPassword ? "كلمة المرور غير متطابقة" : "";
      
      const newErrors = {};
      if (nameError) newErrors.name = nameError;
      if (emailError) newErrors.email = emailError;
      if (passwordError) newErrors.password = passwordError;
      if (confirmError) newErrors.confirmPassword = confirmError;
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setTouched({ name: true, email: true, password: true, confirmPassword: true });
        return;
      }
      
      setIsLoading(true);
      try {
        const roleMapping = {
          'مقاول': 'contractor',
          'عميل': 'client'
        };
        
        const response = await authAPI.register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: roleMapping[role] || 'client'
        });
        
        // Save token and user
        setToken(response.token);
        setUser(response.user);
        
        alert(`✅ تم إنشاء الحساب بنجاح! مرحباً ${form.name}`);
        setIsSignUp(false);
        setForm({ ...form, name: "", confirmPassword: "" });
        
        // Auto login after registration
        if (onLogin) {
          onLogin(role, form.email, form.password);
        }
      } catch (error) {
        alert(`❌ ${error.message || 'حدث خطأ أثناء إنشاء الحساب'}`);
        setErrors({ submit: error.message || 'حدث خطأ أثناء إنشاء الحساب' });
      } finally {
        setIsLoading(false);
      }
      return;
    }
    
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    
    const newErrors = {};
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ email: true, password: true });
      return;
    }

    setIsLoading(true);
    try {
      const response = await authAPI.login(form.email, form.password);
      
      // Save token and user
      setToken(response.token);
      setUser(response.user);
      
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', form.email);
        localStorage.setItem('rememberedRole', role);
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.removeItem('rememberedRole');
      }

      if (onLogin) {
        onLogin(role, form.email, form.password);
      }
    } catch (error) {
      alert(`❌ ${error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة'}`);
      setErrors({ submit: error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedRole = localStorage.getItem('rememberedRole');
    if (rememberedEmail && rememberedRole && step === 1) {
      setForm(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
      if (rememberedRole) {
        setRole(rememberedRole);
      }
    }
  }, [step]);

  return (
    <div style={{ 
      animation: "fadeIn 0.6s", 
      fontFamily: 'Cairo, system-ui, Arial',
      width: '100%'
    }}>
      {/* Main Content Container */}
      <div style={{
        width: '100%',
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 32,
        padding: '48px 40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(20px)',
        border: '2px solid rgba(255, 255, 255, 0.4)'
      }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: none; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        .role-btn {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .role-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.8s, height 0.8s;
        }
        .role-btn:hover::before {
          width: 400px;
          height: 400px;
        }
        .role-btn:hover {
          transform: translateY(-6px) scale(1.05);
          box-shadow: 0 15px 40px rgba(0,0,0,0.25) !important;
        }
        .role-btn:active {
          transform: translateY(-2px) scale(1.02);
        }
        .input-field {
          transition: all 0.3s ease;
        }
        .input-field:focus {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(42, 157, 143, 0.2) !important;
        }
        .submit-btn {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .submit-btn::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255,255,255,0.3);
          transform: translate(-50%, -50%);
          transition: width 0.8s, height 0.8s;
        }
        .submit-btn:hover::before {
          width: 500px;
          height: 500px;
        }
        .submit-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(42, 157, 143, 0.5) !important;
        }
        .card-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      
      {step === 1 && (
        <div style={{ animation: "fadeIn 0.8s" }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="card-float" style={{
              width: 80,
              height: 80,
              borderRadius: 20,
              background: BRAND.gradientLight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              margin: '0 auto 24px',
              boxShadow: '0 10px 40px rgba(42, 157, 143, 0.3)'
            }}>
              🏗️
            </div>
            <div style={{ width: 60, height: 4, background: BRAND.gradientLight, margin: '0 auto 20px', borderRadius: 2 }} />
            <h2 style={{ 
              color: BRAND.primary, 
              fontWeight: 900, 
              fontSize: 32, 
              marginBottom: 12, 
              letterSpacing: '-1px',
              background: BRAND.gradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              المستقبل لإدارة المقاولات
            </h2>
            <p style={{ color: BRAND.muted, fontSize: 16, marginBottom: 32 }}>
              اختر نوع المستخدم للدخول
            </p>
          </div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 32, flexWrap: 'wrap' }}>
            {['مقاول', 'عميل'].map((choice, index) => (
              <button
                key={choice}
                onClick={() => handleRoleChoice(choice)}
                className="role-btn"
                style={{
                  background: choice === "مقاول" ? BRAND.gradientContractor : BRAND.gradientClient,
                  color: "#fff",
                  border: 0,
                  borderRadius: 20,
                  fontSize: 20,
                  padding: '28px 48px',
                  cursor: 'pointer',
                  minWidth: 180,
                  fontWeight: 700,
                  boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  animation: `slideUp 0.6s ease ${index * 0.1}s both`
                }}
              >
                <span style={{ fontSize: 36, animation: 'pulse 2s ease-in-out infinite' }}>{icons[choice]}</span>
                <span>{choice}</span>
              </button>
            ))}
          </div>
          {/* زر الزائر */}
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ 
                position: 'absolute', 
                inset: -2, 
                background: BRAND.light, 
                borderRadius: 16, 
                zIndex: 0,
                animation: 'pulse 3s ease-in-out infinite'
              }} />
              <button
                type="button"
                onClick={onGuest}
                className="role-btn"
                style={{
                  position: 'relative',
                  zIndex: 1,
                  background: "#fff",
                  color: BRAND.primary,
                  padding: "18px 56px",
                  fontSize: 16,
                  border: `2px solid ${BRAND.accent}40`,
                  borderRadius: 16,
                  cursor: "pointer",
                  fontWeight: 700,
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  margin: '0 auto',
                }}
              >
                <span style={{ fontSize: 24 }}>{icons["زائر"]}</span>
                <span>الدخول كزائر</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <form onSubmit={handleSubmit} style={{ animation: "slideIn 0.6s", marginTop: 8 }}>
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ width: 60, height: 4, background: BRAND.gradientLight, margin: '0 auto 20px', borderRadius: 2 }} />
            <div style={{ 
              fontSize: 48, 
              marginBottom: 12,
              animation: 'pulse 2s ease-in-out infinite'
            }}>
              {icons[role]}
            </div>
            <h2 style={{ 
              fontWeight: 900, 
              fontSize: 28, 
              color: BRAND.primary, 
              marginBottom: 8, 
              letterSpacing: '-0.5px' 
            }}>
              {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل دخول'} ({role})
            </h2>
            <p style={{ color: BRAND.muted, fontSize: 14 }}>
              {isSignUp ? 'أدخل بياناتك لإنشاء حساب جديد' : 'أدخل بياناتك للدخول'}
            </p>
          </div>

          {isSignUp && (
            <div style={{ marginBottom: 20, animation: "slideUp 0.4s" }}>
              <label htmlFor="name" style={{ display: "block", marginBottom: 8, color: BRAND.dark, fontWeight: 600, fontSize: 14 }}>
                الاسم الكامل *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  disabled={loading}
                  placeholder="أدخل اسمك الكامل"
                  onChange={handleInput}
                  value={form.name}
                  className="input-field"
                  style={{
                    width: "100%",
                    padding: 16,
                    paddingRight: form.name && !errors.name && touched.name ? '40px' : '16px',
                    borderRadius: 12,
                    border: `2px solid ${errors.name && touched.name ? '#ef4444' : '#e5e7eb'}`,
                    fontSize: 15,
                    background: BRAND.light,
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = errors.name ? '#ef4444' : BRAND.accent;
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                  }}
                  onBlur={e => {
                    handleBlur(e);
                    e.target.style.borderColor = errors.name && touched.name ? '#ef4444' : '#e5e7eb';
                    e.target.style.background = BRAND.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {form.name && !errors.name && touched.name && (
                  <div style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: BRAND.accent,
                    fontSize: 18
                  }}>✓</div>
                )}
              </div>
              {errors.name && touched.name && (
                <div style={{
                  color: '#ef4444',
                  fontSize: 13,
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>⚠️</span>
                  <span>{errors.name}</span>
                </div>
              )}
            </div>
          )}
          
          <div style={{ marginBottom: 20, animation: isSignUp ? "slideUp 0.5s" : "none" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: 8, color: BRAND.dark, fontWeight: 600, fontSize: 14 }}>
              البريد الإلكتروني *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={loading}
                placeholder="example@email.com"
                onChange={handleInput}
                value={form.email}
                className="input-field"
                style={{
                  width: "100%",
                  padding: 16,
                  paddingRight: form.email && !errors.email && touched.email ? '40px' : '16px',
                  borderRadius: 12,
                  border: `2px solid ${errors.email && touched.email ? '#ef4444' : '#e5e7eb'}`,
                  fontSize: 15,
                  background: BRAND.light,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = errors.email ? '#ef4444' : BRAND.accent;
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                }}
                onBlur={e => {
                  handleBlur(e);
                  e.target.style.borderColor = errors.email && touched.email ? '#ef4444' : '#e5e7eb';
                  e.target.style.background = BRAND.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {form.email && !errors.email && touched.email && (
                <div style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: BRAND.accent,
                  fontSize: 18
                }}>✓</div>
              )}
            </div>
            {errors.email && touched.email && (
              <div style={{
                color: '#ef4444',
                fontSize: 13,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>⚠️</span>
                <span>{errors.email}</span>
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: 20, animation: isSignUp ? "slideUp 0.6s" : "none" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <label htmlFor="password" style={{ color: BRAND.dark, fontWeight: 600, fontSize: 14 }}>
                كلمة المرور *
              </label>
              {!isSignUp && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: BRAND.accent,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => e.target.style.background = BRAND.light}
                  onMouseOut={e => e.target.style.background = 'transparent'}
                >
                  {showPassword ? '👁️ إخفاء' : '👁️ إظهار'}
                </button>
              )}
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                disabled={loading}
                placeholder="••••••••"
                onChange={handleInput}
                value={form.password}
                className="input-field"
                style={{
                  width: "100%",
                  padding: 16,
                  paddingLeft: form.password && !errors.password && touched.password ? '40px' : '16px',
                  borderRadius: 12,
                  border: `2px solid ${errors.password && touched.password ? '#ef4444' : '#e5e7eb'}`,
                  fontSize: 15,
                  background: BRAND.light,
                  outline: 'none',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s ease',
                }}
                onFocus={e => {
                  e.target.style.borderColor = errors.password ? '#ef4444' : BRAND.accent;
                  e.target.style.background = '#fff';
                  e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                }}
                onBlur={e => {
                  handleBlur(e);
                  e.target.style.borderColor = errors.password && touched.password ? '#ef4444' : '#e5e7eb';
                  e.target.style.background = BRAND.light;
                  e.target.style.boxShadow = 'none';
                }}
              />
              {form.password && !errors.password && touched.password && (
                <div style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: BRAND.accent,
                  fontSize: 18
                }}>✓</div>
              )}
            </div>
            {errors.password && touched.password && (
              <div style={{
                color: '#ef4444',
                fontSize: 13,
                marginTop: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>⚠️</span>
                <span>{errors.password}</span>
              </div>
            )}
            {form.password.length > 0 && form.password.length < 6 && (
              <div style={{
                color: '#f59e0b',
                fontSize: 12,
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                <span>📊</span>
                <span>{form.password.length}/6 أحرف</span>
              </div>
            )}
          </div>

          {isSignUp && (
            <div style={{ marginBottom: 20, animation: "slideUp 0.7s" }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label htmlFor="confirmPassword" style={{ color: BRAND.dark, fontWeight: 600, fontSize: 14 }}>
                  تأكيد كلمة المرور *
                </label>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: BRAND.accent,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: 6,
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={e => e.target.style.background = BRAND.light}
                  onMouseOut={e => e.target.style.background = 'transparent'}
                >
                  {showConfirmPassword ? '👁️ إخفاء' : '👁️ إظهار'}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={loading}
                  placeholder="أعد إدخال كلمة المرور"
                  onChange={handleInput}
                  value={form.confirmPassword}
                  className="input-field"
                  style={{
                    width: "100%",
                    padding: 16,
                    paddingLeft: form.confirmPassword && !errors.confirmPassword && touched.confirmPassword ? '40px' : '16px',
                    borderRadius: 12,
                    border: `2px solid ${errors.confirmPassword && touched.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                    fontSize: 15,
                    background: BRAND.light,
                    outline: 'none',
                    fontFamily: 'inherit',
                    transition: 'all 0.3s ease',
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : BRAND.accent;
                    e.target.style.background = '#fff';
                    e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
                  }}
                  onBlur={e => {
                    handleBlur(e);
                    e.target.style.borderColor = errors.confirmPassword && touched.confirmPassword ? '#ef4444' : '#e5e7eb';
                    e.target.style.background = BRAND.light;
                    e.target.style.boxShadow = 'none';
                  }}
                />
                {form.confirmPassword && !errors.confirmPassword && touched.confirmPassword && form.password === form.confirmPassword && (
                  <div style={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: BRAND.accent,
                    fontSize: 18
                  }}>✓</div>
                )}
              </div>
              {errors.confirmPassword && touched.confirmPassword && (
                <div style={{
                  color: '#ef4444',
                  fontSize: 13,
                  marginTop: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6
                }}>
                  <span>⚠️</span>
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>
          )}
          
          {!isSignUp && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: BRAND.dark }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 18,
                    height: 18,
                    cursor: 'pointer',
                    accentColor: BRAND.accent
                  }}
                />
                <span>تذكرني</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: BRAND.accent,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'underline',
                  padding: '4px 8px',
                  borderRadius: 6,
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => e.target.style.color = BRAND.primary}
                onMouseOut={e => e.target.style.color = BRAND.accent}
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading || isLoading}
            className="submit-btn"
            style={{
              width: "100%",
              background: BRAND.gradientLight,
              color: "#fff",
              padding: 18,
              border: "none",
              fontSize: 18,
              borderRadius: 14,
              cursor: (loading || isLoading) ? "not-allowed" : "pointer",
              marginBottom: 16,
              fontWeight: 700,
              boxShadow: '0 8px 30px rgba(42, 157, 143, 0.4)',
              opacity: (loading || isLoading) ? 0.7 : 1,
            }}
          >
            {(loading || isLoading) ? '⏳ جاري المعالجة...' : (isSignUp ? '✓ إنشاء الحساب' : '🚀 تسجيل الدخول')}
          </button>

          {/* Google OAuth Button */}
          {!isSignUp && (
            <button
              type="button"
              onClick={async () => {
                try {
                  setIsLoading(true);
                  // Save role for callback
                  if (role) {
                    localStorage.setItem('selectedRole', role);
                  }
                  const response = await authAPI.getGoogleAuthUrl();
                  // Redirect to Google OAuth
                  window.location.href = response.authUrl;
                } catch (error) {
                  alert(`❌ ${error.message || 'فشل الاتصال بخدمة Google'}`);
                  setIsLoading(false);
                }
              }}
              disabled={loading || isLoading}
              style={{
                width: "100%",
                background: "#fff",
                color: "#4285F4",
                padding: 16,
                border: "2px solid #4285F4",
                fontSize: 16,
                borderRadius: 14,
                cursor: (loading || isLoading) ? "not-allowed" : "pointer",
                marginBottom: 16,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                boxShadow: '0 4px 15px rgba(66, 133, 244, 0.2)',
                opacity: (loading || isLoading) ? 0.7 : 1,
                transition: 'all 0.3s ease'
              }}
              onMouseOver={e => {
                if (!loading && !isLoading) {
                  e.currentTarget.style.background = '#f8f9fa';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(66, 133, 244, 0.3)';
                }
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(66, 133, 244, 0.2)';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>تسجيل الدخول عبر Google</span>
            </button>
          )}

          <div style={{ 
            textAlign: "center", 
            marginTop: 24,
            paddingTop: 24,
            borderTop: '2px solid ' + BRAND.light
          }}>
            <div style={{ 
              color: BRAND.muted, 
              fontSize: 14, 
              marginBottom: 12 
            }}>
              {isSignUp ? 'لديك حساب بالفعل؟' : 'ليس لديك حساب؟'}
            </div>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setTouched({});
                if (isSignUp) {
                  setForm({ ...form, name: "", confirmPassword: "" });
                }
              }}
              style={{
                background: BRAND.light,
                color: BRAND.primary,
                border: `2px solid ${BRAND.accent}40`,
                padding: '12px 32px',
                borderRadius: 12,
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 700,
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = BRAND.accent;
                e.currentTarget.style.color = '#fff';
                e.currentTarget.style.borderColor = BRAND.accent;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = BRAND.light;
                e.currentTarget.style.color = BRAND.primary;
                e.currentTarget.style.borderColor = `${BRAND.accent}40`;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>{isSignUp ? '←' : '+'}</span>
              <span>{isSignUp ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}</span>
            </button>
          </div>
          
          <div style={{ textAlign: "center", marginTop: 20 }}>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setIsSignUp(false);
                setForm({ email: "", password: "", name: "", confirmPassword: "" });
                setErrors({});
                setTouched({});
                setShowForgotPassword(false);
              }}
              style={{
                background: 'none',
                color: BRAND.muted,
                border: 'none',
                textDecoration: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseOver={e => {
                e.target.style.background = BRAND.light;
                e.target.style.color = BRAND.primary;
              }}
              onMouseOut={e => {
                e.target.style.background = 'transparent';
                e.target.style.color = BRAND.muted;
              }}
            >
              ← الرجوع لاختيار الدور
            </button>
          </div>
        </form>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 20,
            padding: 32,
            maxWidth: 400,
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'slideUp 0.4s'
          }}>
            <h3 style={{ color: BRAND.primary, marginBottom: 16, fontSize: 24, fontWeight: 700 }}>
              نسيت كلمة المرور؟
            </h3>
            <p style={{ color: BRAND.muted, marginBottom: 24, fontSize: 14 }}>
              أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور
            </p>
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={forgotPasswordEmail}
              onChange={(e) => setForgotPasswordEmail(e.target.value)}
              style={{
                width: "100%",
                padding: 14,
                borderRadius: 12,
                border: `2px solid #e5e7eb`,
                fontSize: 15,
                marginBottom: 20,
                outline: 'none',
                fontFamily: 'inherit'
              }}
              onFocus={e => {
                e.target.style.borderColor = BRAND.accent;
                e.target.style.boxShadow = `0 0 0 4px ${BRAND.accent}20`;
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={async () => {
                  if (!forgotPasswordEmail) {
                    alert('⚠️ يرجى إدخال البريد الإلكتروني');
                    return;
                  }
                  try {
                    setIsLoading(true);
                    const response = await authAPI.forgotPassword(forgotPasswordEmail);
                    alert(`✅ ${response.message}`);
                    if (response.resetUrl) {
                      alert(`🔗 رابط إعادة التعيين: ${response.resetUrl}`);
                    }
                    setShowForgotPassword(false);
                    setForgotPasswordEmail('');
                  } catch (error) {
                    alert(`❌ ${error.message || 'حدث خطأ'}`);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                style={{
                  flex: 1,
                  background: BRAND.gradientLight,
                  color: "#fff",
                  padding: 14,
                  border: "none",
                  fontSize: 16,
                  borderRadius: 12,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? '⏳ جاري الإرسال...' : 'إرسال'}
              </button>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordEmail('');
                }}
                style={{
                  flex: 1,
                  background: BRAND.light,
                  color: BRAND.primary,
                  padding: 14,
                  border: `2px solid ${BRAND.accent}40`,
                  fontSize: 16,
                  borderRadius: 12,
                  cursor: "pointer",
                  fontWeight: 700
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      <style>{`
       @keyframes fadeIn {from{opacity: 0; transform: translateY(80px);} to {opacity: 1; transform: none;}}
      `}</style>
    </div>
  );
}

